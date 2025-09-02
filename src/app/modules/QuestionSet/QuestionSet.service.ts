import { StatusCodes } from 'http-status-codes'
import { IQuestionSet } from './QuestionSet.interface'
import { QuestionSet } from './QuestionSet.model'
import QueryBuilder from '../../builder/QueryBuilder'
import AppError from '../../../errors/AppError'
import mongoose from 'mongoose'
import { Prompt } from '../Prompt/Prompt.model'
import { Question } from '../Question/Question.model'
import cron from 'node-cron'
import { IQSetRefType, IQSetTypes } from './QuestionSet.enum'
import { IQTypes } from '../Question/Question.enum'

const createQuestionSet = async (
  payload: IQuestionSet,
): Promise<IQuestionSet> => {
  // we need to ensure refId,questions,prompts, already exits
  const isExistRef = await mongoose
    .model(payload.refType)
    .findOne({ refId: payload.refId })
  if (!isExistRef) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'RefId does not exist.')
  }
  // questions,prompts are array need to check all the elements exists in the database
  const isExistQuestions = await Question.find({
    _id: { $in: payload.questions },
    questionSet: null,
  }).select('questionType')
  if (
    !isExistQuestions.length ||
    isExistQuestions.length !== payload.questions.length
  ) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Some Questions do not exist.')
  }

  // if refType is STUDY_LESSON then only question type allowed is RadioQ [⬅️✅]+ question set type will be either MULTIPLE_RADIO_Q or MULTIPLE_PROMPTS_BUT_ONE_RADIO_Q
  if (payload.refType == IQSetRefType.STUDY_LESSON) {
    if (
      payload.questionSetType !== IQSetTypes.MULTIPLE_RADIO_Q &&
      payload.questionSetType !== IQSetTypes.MULTIPLE_PROMPTS_BUT_ONE_RADIO_Q
    ) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'Question set type is not valid for Study Lesson. MULTIPLE RADIO Question or MULTIPLE PROMPTS BUT ONE RADIO Question is required.',
      )
    }
    const isExistRadioQ = isExistQuestions.every(
      question => question.questionType === IQTypes.RadioQ,
    )
    if (!isExistRadioQ) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'Some Questions type is not RadioQ.',
      )
    }
  }
  if (payload.prompts && payload.prompts.length) {
    const isExistPrompts = await Prompt.find({
      _id: { $in: payload.prompts },
      questionSetId: null,
    })
    if (
      !isExistPrompts.length ||
      isExistPrompts.length !== payload.prompts.length
    ) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Some Prompts do not exist.')
    }
  }
  const result = await QuestionSet.create(payload)
  // put result._id as refId of each questions of result.questions and if paylaod.prompts is exist put result._id as refId of each prompts of result.prompts
  await Question.updateMany(
    { _id: { $in: result.questions } },
    { questionSet: result._id },
  )
  if (payload.prompts && payload.prompts.length) {
    await Prompt.updateMany(
      { _id: { $in: payload.prompts } },
      { questionSetId: result._id },
    )
  }
  return result
}

const getAllQuestionSets = async (
  query: Record<string, any>,
): Promise<{
  meta: { total: number; page: number; limit: number }
  result: IQuestionSet[]
}> => {
  const queryBuilder = new QueryBuilder(QuestionSet.find(), query)
  const result = await queryBuilder
    .filter()
    .search(['refId'])
    .sort()
    .paginate()
    .fields().modelQuery
  const meta = await queryBuilder.getPaginationInfo()
  return { meta, result }
}

const getAllUnpaginatedQuestionSets = async (): Promise<IQuestionSet[]> => {
  const result = await QuestionSet.find()
  return result
}

const updateQuestionSet = async (
  id: string,
  payload: Partial<IQuestionSet>,
) => {
  // if want to change refId,questions,prompts then need to check if the refId,questions,prompts are exist
  let isExistRef
  if (payload.refId) {
    if (!payload.refType) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'RefType is required to update refId.',
      )
    }
    isExistRef = await mongoose
      .model(payload.refType)
      .findOne({
        refId: payload.refId,
      })
      .select('_id refId refType questions prompts')
    if (!isExistRef) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'RefId does not exist.')
    }
  }
  if (payload.questions) {
    const isExistQuestions = await Question.find({
      _id: { $in: payload.questions },
    })
    if (
      !isExistQuestions.length ||
      isExistQuestions.length !== payload.questions.length
    ) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'Some Questions do not exist.',
      )
    }
    // nullify all the questions of isExistRef
    await Question.updateMany(
      { _id: { $in: isExistRef?.questions } },
      { questionSet: null },
    )
  }
  if (payload.prompts) {
    const isExistPrompts = await Prompt.find({
      _id: { $in: payload.prompts },
    })
    if (
      !isExistPrompts.length ||
      isExistPrompts.length !== payload.prompts.length
    ) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Some Prompts do not exist.')
    }
    // nullify all the prompts of isExistRef
    await Prompt.updateMany(
      { _id: { $in: isExistRef?.prompts } },
      { questionSetId: null },
    )
  }
  const updatedReference = await mongoose
    .model(isExistRef?.refType)
    .findByIdAndUpdate(isExistRef?._id, payload, { new: true })
  if (!updatedReference) {
    throw new AppError(StatusCodes.NOT_FOUND, 'QuestionSet not found.')
  }
  return updatedReference
}

const deleteQuestionSet = async (id: string): Promise<IQuestionSet | null> => {
  const result = await QuestionSet.findById(id)
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'QuestionSet not found.')
  }
  result.isDeleted = true
  result.deletedAt = new Date()
  await result.save()
  // also need to clean up the questions and prompts
  await Question.updateMany({ questionSet: id }, { questionSet: null })
  await Prompt.updateMany({ questionSetId: id }, { questionSetId: null })

  if (result.refId) {
    await mongoose
      .model(result.refType)
      .updateOne({ _id: result.refId }, { $pull: { questionSet: id } })
  }
  return result
}

const hardDeleteQuestionSet = async (
  id: string,
): Promise<IQuestionSet | null> => {
  const result = await QuestionSet.findByIdAndDelete(id)
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'QuestionSet not found.')
  }
  // also need to clean up the questions and prompts
  await Question.updateMany({ questionSet: id }, { questionSet: null })
  await Prompt.updateMany({ questionSetId: id }, { questionSetId: null })

  if (result.refId) {
    await mongoose
      .model(result.refType)
      .updateOne({ _id: result.refId }, { $pull: { questionSet: id } })
  }
  return result
}

const getQuestionSetById = async (id: string): Promise<IQuestionSet | null> => {
  const result = await QuestionSet.findById(id).populate('questions prompts')
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'QuestionSet not found.')
  }
  return result
}

// Function to deactivate expired coupons
const autoDeleteUnReferencedQuestionSet = async () => {
  try {
    console.log('deleting un-referenced questionSet..started..')
    // Find coupons where endDate is in the past and isActive is true
    await QuestionSet.deleteMany({
      refId: null,
    })
  } catch (error) {
    console.error('Error deleting un-referenced questionSet:', error)
  }
}

// Function to initialize the cron job
export const scheduleAutoDeleteUnReferencedQuestionSet = () => {
  cron.schedule('0 * * * *', autoDeleteUnReferencedQuestionSet)
}

export const QuestionSetService = {
  createQuestionSet,
  getAllQuestionSets,
  getAllUnpaginatedQuestionSets,
  updateQuestionSet,
  deleteQuestionSet,
  hardDeleteQuestionSet,
  getQuestionSetById,
}
