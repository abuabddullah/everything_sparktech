import { StatusCodes } from 'http-status-codes'
import { ICourse } from './Course.interface'
import { Course } from './Course.model'
import QueryBuilder from '../../builder/QueryBuilder'
import unlinkFile from '../../../shared/unlinkFile'
import AppError from '../../../errors/AppError'
import { StudyLesson } from '../StudyLesson/StudyLesson.model'
import mongoose from 'mongoose'

const createCourse = async (payload: ICourse): Promise<ICourse> => {
  const result = await Course.create(payload)
  if (!result) {
    unlinkFile(payload.image!)
    throw new AppError(StatusCodes.BAD_REQUEST, 'Course not created.')
  }
  return result
}

const getAllCourses = async (
  query: Record<string, any>,
): Promise<{
  meta: { total: number; page: number; limit: number }
  result: ICourse[]
}> => {
  const queryBuilder = new QueryBuilder(Course.find(), query)
  const result = await queryBuilder.filter().sort().paginate().fields()
    .modelQuery
  const meta = await queryBuilder.getPaginationInfo()
  return { meta, result }
}

const getAllUnpaginatedCourses = async (): Promise<ICourse[]> => {
  const result = await Course.find()
  return result
}

const updateCourse = async (
  id: string,
  payload: Partial<ICourse>,
): Promise<ICourse | null> => {
  const isExist = await Course.findById(id)
  if (!isExist) {
    unlinkFile(payload.image!)
    throw new AppError(StatusCodes.NOT_FOUND, 'Course not found.')
  }

  unlinkFile(isExist.image!) // Unlink the old image
  return await Course.findByIdAndUpdate(id, payload, { new: true })
}

const deleteCourse = async (id: string): Promise<ICourse | null> => {
  const result = await Course.findById(id)
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Course not found.')
  }

  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    result.isDeleted = true
    result.deletedAt = new Date()
    await result.save({ session })
    // make null of those studyLessons
    const updatedStudyLessonsResult = await StudyLesson.updateMany(
      { course: id },
      { course: null },
      { session },
    )
    if (!updatedStudyLessonsResult) {
      throw new AppError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Course not deleted.',
      )
    }

    await session.commitTransaction()
    session.endSession()

    return result
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Course not deleted.')
  }
}

const hardDeleteCourse = async (id: string): Promise<ICourse | null> => {
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    const result = await Course.findByIdAndDelete(id, { session })
    if (!result) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Course not found.')
    }
    unlinkFile(result.image!)
    // make null of those studyLessons
    const updatedStudyLessonsResult = await StudyLesson.updateMany(
      { course: id },
      { course: null },
      { session },
    )
    if (!updatedStudyLessonsResult) {
      throw new AppError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Course not deleted.',
      )
    }

    await session.commitTransaction()
    session.endSession()

    return result
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Course not deleted.')
  }
}

const getCourseById = async (id: string): Promise<ICourse | null> => {
  const result = await Course.findById(id)
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Course not found.')
  }
  return result
}

export const CourseService = {
  createCourse,
  getAllCourses,
  getAllUnpaginatedCourses,
  updateCourse,
  deleteCourse,
  hardDeleteCourse,
  getCourseById,
}
