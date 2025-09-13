import { StatusCodes } from 'http-status-codes'
import { IStudyLesson } from './StudyLesson.interface'
import { StudyLesson } from './StudyLesson.model'
import QueryBuilder from '../../builder/QueryBuilder'
import unlinkFile from '../../../shared/unlinkFile'
import AppError from '../../../errors/AppError'
import { QuestionSet } from '../QuestionSet/QuestionSet.model'
import { Course } from '../Course/Course.model'
import { Category } from '../category/category.model'
import { ICourseTitle } from '../Course/Course.enum'
import { IQSetRefType, IQSetTypes } from '../QuestionSet/QuestionSet.enum'
import mongoose from 'mongoose'

const createStudyLesson = async (
  payload: IStudyLesson,
): Promise<IStudyLesson> => {
  const isExistCourse = await Course.findById(payload.course)
  if (!isExistCourse) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid course.')
  }
  // if course is next generation then only one question set is allowed that will be only radio [✅➡️]  which is handled in createQuestionSet service
  if (isExistCourse.title == ICourseTitle.NEXT_GEN_COURSE) {
    if (!payload.image) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'Image is required for next generation course.',
      )
    }
    if (payload.questionSets.length > 1) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'Only one question set is allowed for next generation.',
      )
    }
  }
  //category,questionSets,course
  const isExistCategory = await Category.findById(payload.category)
  const isExistQuestionSets = await QuestionSet.find({
    _id: { $in: payload.questionSets },
    refType: IQSetRefType.STUDY_LESSON,
    questionSetType: {
      $in: [
        IQSetTypes.MULTIPLE_PROMPTS_BUT_ONE_RADIO_Q,
        IQSetTypes.MULTIPLE_RADIO_Q,
      ],
    },
    refId: null,
  }).select('questionSetType prompts')
  console.log(
    '🚀 ~ createStudyLesson ~ isExistQuestionSets:',
    isExistQuestionSets,
  )
  if (
    !isExistCategory ||
    !isExistQuestionSets.length ||
    isExistQuestionSets.length !== payload.questionSets.length
  ) {
    payload.image && unlinkFile(payload.image)
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Invalid category, question set.',
    )
  }
  // if isExistCourse.title is case studies then ensure there must be prompt.length = 3 + question will be radio, [✅➡️] which is handled in createQuestionSet service
  if (isExistCourse.title == ICourseTitle.CASE_STUDIES) {
    const isExistPrompt = isExistQuestionSets.every(
      questionSet => questionSet.prompts?.length == 3,
    )
    if (!isExistPrompt) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'All question set must have 3 prompts for case studies lesson.',
      )
    }
  }
  payload.questionSetsCount = payload.questionSets.length
  // mongoose transaction
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    const result = await StudyLesson.create([payload], { session })
    if (!result) {
      payload.image && unlinkFile(payload.image)
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'Failed to create study lesson.',
      )
    }
    // set result._id as refId of each questionSets of result.questionSets result.questionSetsCount
    const updatedQuestionSetResult = await QuestionSet.updateMany(
      { _id: { $in: result[0].questionSets } },
      {
        refId: result[0]._id,
        questionSetsCount: result[0].questionSets.length,
      },
      { session },
    )
    if (!updatedQuestionSetResult) {
      payload.image && unlinkFile(payload.image)
      throw new AppError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Failed to create study lesson.',
      )
    }
    await session.commitTransaction()
    session.endSession()
    return result[0]
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to create study lesson.',
    )
  }
}

const getAllStudyLessons = async (
  query: Record<string, any>,
): Promise<{
  meta: { total: number; page: number; limit: number }
  result: IStudyLesson[]
}> => {
  const queryBuilder = new QueryBuilder(StudyLesson.find(), query)
  const result = await queryBuilder
    .filter()
    .search(['category', 'course'])
    .sort()
    .paginate()
    .fields()
    .modelQuery.populate('category course questionSets')
  const meta = await queryBuilder.getPaginationInfo()
  return { meta, result }
}

const getAllUnpaginatedStudyLessons = async (): Promise<IStudyLesson[]> => {
  const result = await StudyLesson.find()
  return result
}

const updateStudyLesson = async (
  id: string,
  payload: Partial<IStudyLesson>,
): Promise<IStudyLesson | null> => {
  const isExist = await StudyLesson.findById(id)
  if (!isExist) {
    payload.image && unlinkFile(payload.image!)
    throw new AppError(StatusCodes.NOT_FOUND, 'StudyLesson not found.')
  }
  // category questionSets course all exists or not
  let isExistCourse, isExistCategory
  let isExistQuestionSets = []
  if (payload.category) {
    isExistCategory = await Category.findById(payload.category)
    if (!isExistCategory) {
      payload.image && unlinkFile(payload.image)
      throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid category.')
    }
  }
  if (payload.course) {
    isExistCourse = await Course.findById(payload.course)
    if (!isExistCourse) {
      payload.image && unlinkFile(payload.image)
      throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid course.')
    }
  }
  if (payload.questionSets) {
    isExistQuestionSets = await QuestionSet.find({
      _id: {
        $in: payload.questionSets,
        refId: null,
        refType: IQSetRefType.STUDY_LESSON,
        questionSetType: {
          $in: [
            IQSetTypes.MULTIPLE_PROMPTS_BUT_ONE_RADIO_Q,
            IQSetTypes.MULTIPLE_RADIO_Q,
          ],
        },
      },
    })
    if (
      !isExistQuestionSets?.length ||
      isExistQuestionSets?.length !== payload.questionSets?.length
    ) {
      payload.image && unlinkFile(payload.image)
      throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid question set.')
    }
    payload.questionSetsCount = payload.questionSets.length
  }

  // mongoose transaction
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    const updatedStudyLesson = await StudyLesson.findByIdAndUpdate(
      id,
      payload,
      {
        new: true,
        session,
      },
    )
    if (!updatedStudyLesson) {
      payload.image && unlinkFile(payload.image)
      throw new AppError(StatusCodes.NOT_FOUND, 'StudyLesson not found.')
    }
    payload.image && isExist.image && unlinkFile(isExist.image) // Unlink the old image
    // now need to unlink the old questionSets
    if (payload.questionSets) {
      const unlinkQuestionSetResult = await QuestionSet.updateMany(
        { refId: id },
        { refId: null },
        { session },
      )
      if (!unlinkQuestionSetResult) {
        payload.image && unlinkFile(payload.image)
        throw new AppError(StatusCodes.NOT_FOUND, 'StudyLesson not found.')
      }
      // now need to link the new questionSets
      const linkQuestionSetResult = await QuestionSet.updateMany(
        { _id: { $in: payload.questionSets } },
        { refId: id },
        { session },
      )
      if (!linkQuestionSetResult) {
        payload.image && unlinkFile(payload.image)
        throw new AppError(StatusCodes.NOT_FOUND, 'StudyLesson not found.')
      }
    }
    await session.commitTransaction()
    session.endSession()
    return updatedStudyLesson
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw error
  }
}

const deleteStudyLesson = async (id: string): Promise<IStudyLesson | null> => {
  const result = await StudyLesson.findById(id)
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'StudyLesson not found.')
  }
  // mongoose transaction
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    result.isDeleted = true
    result.deletedAt = new Date()
    await result.save({ session })
    // also need to clean up the refId of questionsSets
    const unlinkQuestionSetResult = await QuestionSet.updateMany(
      { refId: id },
      { refId: null },
      { session },
    )
    if (!unlinkQuestionSetResult) {
      throw new AppError(StatusCodes.NOT_FOUND, 'StudyLesson not found.')
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

const hardDeleteStudyLesson = async (
  id: string,
): Promise<IStudyLesson | null> => {
  // mongoose transaction
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    const result = await StudyLesson.findByIdAndDelete(id, { session })
    if (!result) {
      throw new AppError(StatusCodes.NOT_FOUND, 'StudyLesson not found.')
    }
    result.image && unlinkFile(result.image)
    // also need to clean up the refId of questionsSets
    const unlinkQuestionSetResult = await QuestionSet.updateMany(
      { refId: id },
      { refId: null },
      { session },
    )
    if (!unlinkQuestionSetResult) {
      throw new AppError(StatusCodes.NOT_FOUND, 'StudyLesson not found.')
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

const getStudyLessonById = async (id: string): Promise<IStudyLesson | null> => {
  const result = await StudyLesson.findById(id)
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'StudyLesson not found.')
  }
  return result
}

const getStudyLessonsByCourseId = async (id: string) => {
  const queryBuilder = new QueryBuilder(StudyLesson.find(), { course: id })
  const result = await queryBuilder.filter().sort().paginate().fields()
    .modelQuery
  const meta = await queryBuilder.getPaginationInfo()
  return { meta, result }
}

export const StudyLessonService = {
  createStudyLesson,
  getAllStudyLessons,
  getAllUnpaginatedStudyLessons,
  updateStudyLesson,
  deleteStudyLesson,
  hardDeleteStudyLesson,
  getStudyLessonById,
  getStudyLessonsByCourseId,
}
