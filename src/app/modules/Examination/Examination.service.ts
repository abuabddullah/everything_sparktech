import { StatusCodes } from 'http-status-codes'
import AppError from '../../../errors/AppError'
import { IExamination } from './Examination.interface'
import { Examination } from './Examination.model'
import QueryBuilder from '../../builder/QueryBuilder'

const createExamination = async (
  payload: IExamination,
): Promise<IExamination> => {
  const result = await Examination.create(payload)
  return result
}

const getAllExaminations = async (
  query: Record<string, any>,
): Promise<{
  meta: { total: number; page: number; limit: number }
  result: IExamination[]
}> => {
  const queryBuilder = new QueryBuilder(Examination.find(), query)
  const result = await queryBuilder.filter().sort().paginate().fields()
    .modelQuery
  const meta = await queryBuilder.getPaginationInfo()
  return { meta, result }
}

const getAllUnpaginatedExaminations = async (): Promise<IExamination[]> => {
  const result = await Examination.find()
  return result
}

const updateExamination = async (
  id: string,
  payload: Partial<IExamination>,
): Promise<IExamination | null> => {
  const isExist = await Examination.findById(id)
  if (!isExist) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Examination not found.')
  }

  return await Examination.findByIdAndUpdate(id, payload, { new: true })
}

const deleteExamination = async (id: string): Promise<IExamination | null> => {
  const result = await Examination.findById(id)
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Examination not found.')
  }
  result.isDeleted = true
  result.deletedAt = new Date()
  await result.save()
  return result
}

const hardDeleteExamination = async (
  id: string,
): Promise<IExamination | null> => {
  const result = await Examination.findByIdAndDelete(id)
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Examination not found.')
  }
  return result
}

const getExaminationById = async (id: string): Promise<IExamination | null> => {
  const result = await Examination.findById(id)
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Examination not found.')
  }
  return result
}

export const ExaminationService = {
  createExamination,
  getAllExaminations,
  getAllUnpaginatedExaminations,
  updateExamination,
  deleteExamination,
  hardDeleteExamination,
  getExaminationById,
  // // upsert user progress history tracking on answering question
  // upsertUserProgressHistoryTrackingOnAnsweringQuestion,
  // resetExaminationHistoryByUserIdAndExaminationId, // must clear all the questions from the answeredQuestions linked to this examinationId
  // previewExaminationHistoryByUserIdAndExaminationId, // must return the answeredQuestions linked to this examinationId
}
