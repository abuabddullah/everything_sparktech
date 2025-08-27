import { StatusCodes } from 'http-status-codes'
import { IStudyLesson } from './StudyLesson.interface'
import { StudyLesson } from './StudyLesson.model'
import QueryBuilder from '../../builder/QueryBuilder'
import unlinkFile from '../../../shared/unlinkFile'
import AppError from '../../../errors/AppError'

const createStudyLesson = async (
  payload: IStudyLesson,
): Promise<IStudyLesson> => {
  const result = await StudyLesson.create(payload)
  return result
}

const getAllStudyLessons = async (
  query: Record<string, any>,
): Promise<{
  meta: { total: number; page: number; limit: number }
  result: IStudyLesson[]
}> => {
  const queryBuilder = new QueryBuilder(StudyLesson.find(), query)
  const result = await queryBuilder.filter().sort().paginate().fields()
    .modelQuery
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
    unlinkFile(payload.image!)
    throw new AppError(StatusCodes.NOT_FOUND, 'StudyLesson not found.')
  }

  unlinkFile(isExist.image!) // Unlink the old image
  return await StudyLesson.findByIdAndUpdate(id, payload, { new: true })
}

const deleteStudyLesson = async (id: string): Promise<IStudyLesson | null> => {
  const result = await StudyLesson.findById(id)
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'StudyLesson not found.')
  }
  result.isDeleted = true
  result.deletedAt = new Date()
  await result.save()
  return result
}

const hardDeleteStudyLesson = async (
  id: string,
): Promise<IStudyLesson | null> => {
  const result = await StudyLesson.findByIdAndDelete(id)
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'StudyLesson not found.')
  }
  unlinkFile(result.image!)
  return result
}

const getStudyLessonById = async (id: string): Promise<IStudyLesson | null> => {
  const result = await StudyLesson.findById(id)
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'StudyLesson not found.')
  }
  return result
}

export const StudyLessonService = {
  createStudyLesson,
  getAllStudyLessons,
  getAllUnpaginatedStudyLessons,
  updateStudyLesson,
  deleteStudyLesson,
  hardDeleteStudyLesson,
  getStudyLessonById,
}
