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
      questionSet: null,
    })
    if (
      !isExistPrompts.length ||
      isExistPrompts.length !== payload.prompts.length
    ) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Some Prompts do not exist.')
    }
  }

  // mongoose transaction
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    const result = await QuestionSet.create([payload], { session })
    // put result._id as refId of each questions of result.questions and if paylaod.prompts is exist put result._id as refId of each prompts of result.prompts
    const updateQuestionResult = await Question.updateMany(
      { _id: { $in: result[0].questions } },
      { questionSet: result[0]._id },
      { session },
    )
    if (!updateQuestionResult) {
      throw new AppError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Questions not updated.',
      )
    }
    if (payload.prompts && payload.prompts.length) {
      const updatePromptResult = await Prompt.updateMany(
        { _id: { $in: payload.prompts } },
        { questionSet: result[0]._id },
        { session },
      )
      if (!updatePromptResult) {
        throw new AppError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          'Prompts not updated.',
        )
      }
    }
    await session.commitTransaction()
    session.endSession()
    return result[0]
  } catch (error) {
    await session.abortTransaction()
    session.endSession()

    // If it's a known AppError, bubble it up as-is; otherwise include the original message
    if (error instanceof AppError) throw error

    const reason = (error as any)?.message || 'Unknown error'
    throw new AppError(
      StatusCodes.BAD_REQUEST, // likely a validation problem, not a server crash
      `QuestionSet not created: ${reason}`,
    )
  }
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
      { questionSet: null },
    )
  }

  // mongoose transaction
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    const updatedReference = await mongoose
      .model(isExistRef?.refType)
      .findByIdAndUpdate(isExistRef?._id, payload, { new: true, session })
    if (!updatedReference) {
      throw new AppError(StatusCodes.NOT_FOUND, 'QuestionSet not found.')
    }
    // update questions and prompts of updatedReference
    if (payload.questions) {
      // unlin old questions
      await Question.updateMany(
        { _id: { $in: isExistRef.questions } },
        { questionSet: null },
        { session },
      )
      // link new questions
      const updateQuestionResult = await Question.updateMany(
        { _id: { $in: updatedReference.questions } },
        { questionSet: updatedReference._id },
        { session },
      )
      if (!updateQuestionResult) {
        throw new AppError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          'Questions not updated.',
        )
      }
    }
    if (payload.prompts && payload.prompts.length) {
      // unlin old prompts
      const unlinkPromptResult = await Prompt.updateMany(
        { _id: { $in: isExistRef.prompts } },
        { questionSet: null },
        { session },
      )
      if (!unlinkPromptResult) {
        throw new AppError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          'Prompts not updated.',
        )
      }
      // link new prompts
      const updatePromptResult = await Prompt.updateMany(
        { _id: { $in: payload.prompts } },
        { questionSet: updatedReference._id },
        { session },
      )
      if (!updatePromptResult) {
        throw new AppError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          'Prompts not updated.',
        )
      }
    }
    await session.commitTransaction()
    session.endSession()
    return updatedReference
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'QuestionSet not updated.',
    )
  }
}

const deleteQuestionSet = async (id: string): Promise<IQuestionSet | null> => {
  const result = await QuestionSet.findById(id)
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'QuestionSet not found.')
  }

  // mongoose transaction
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    result.isDeleted = true
    result.deletedAt = new Date()
    await result.save({ session })
    // also need to clean up the questions and prompts
    const unlinkQuestionResult = await Question.updateMany(
      { questionSet: id },
      { questionSet: null },
      { session },
    )
    if (!unlinkQuestionResult) {
      throw new AppError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Questions not updated.',
      )
    }
    const unlinkPromptResult = await Prompt.updateMany(
      { questionSet: id },
      { questionSet: null },
      { session },
    )
    if (!unlinkPromptResult) {
      throw new AppError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Prompts not updated.',
      )
    }
    if (result.refId && result.refType !== IQSetRefType.EXAMINATION) {
      const updateResult = await mongoose
        .model(result.refType)
        .updateOne(
          { _id: result.refId },
          { $pull: { questionSet: id }, $inc: { questionSetsCount: -1 } },
          { session },
        )
      if (!updateResult) {
        throw new AppError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          'QuestionSet not deleted.',
        )
      }
    }
    if (result.refId && result.refType === IQSetRefType.EXAMINATION) {
      // pull the step in the examination.questionSteps that has this questionSet
      const updateResult = await mongoose.model(result.refType).updateOne(
        { _id: result.refId },
        {
          $pull: { questionSteps: { questionSets: id } },
          $inc: { questionSetsCount: -1 },
        },
        { session },
      )
      if (!updateResult) {
        throw new AppError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          'QuestionSet not deleted.',
        )
      }
    }
    await session.commitTransaction()
    session.endSession()
    return result
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw error
  }
}

const hardDeleteQuestionSet = async (
  id: string,
): Promise<IQuestionSet | null> => {
  // mongoose transaction
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    const result = await QuestionSet.findByIdAndDelete(id, { session })
    if (!result) {
      throw new AppError(StatusCodes.NOT_FOUND, 'QuestionSet not found.')
    }
    // also need to clean up the questions and prompts
    await Question.updateMany(
      { questionSet: id },
      { questionSet: null },
      { session },
    )
    await Prompt.updateMany(
      { questionSet: id },
      { questionSet: null },
      { session },
    )

    if (result.refId && result.refType !== IQSetRefType.EXAMINATION) {
      const updateResult = await mongoose
        .model(result.refType)
        .updateOne(
          { _id: result.refId },
          { $pull: { questionSet: id }, $inc: { questionSetsCount: -1 } },
          { session },
        )
      if (!updateResult) {
        throw new AppError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          'QuestionSet not deleted.',
        )
      }
    }
    if (result.refId && result.refType === IQSetRefType.EXAMINATION) {
      const updateResult = await mongoose.model(result.refType).updateOne(
        { _id: result.refId },
        {
          $pull: { questionSteps: { questionSets: id } },
          $inc: { questionSetsCount: -1 },
        },
        { session },
      )
      if (!updateResult) {
        throw new AppError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          'QuestionSet not deleted.',
        )
      }
    }
    await session.commitTransaction()
    session.endSession()
    return result
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw error
  }
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
