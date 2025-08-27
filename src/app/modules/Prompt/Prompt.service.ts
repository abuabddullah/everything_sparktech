import { StatusCodes } from 'http-status-codes'
import { IPrompt } from './Prompt.interface'
import { Prompt } from './Prompt.model'
import QueryBuilder from '../../builder/QueryBuilder'
import unlinkFile from '../../../shared/unlinkFile'
import AppError from '../../../errors/AppError'

const createPrompt = async (payload: IPrompt): Promise<IPrompt> => {
  const result = await Prompt.create(payload)
  return result
}

const getAllPrompts = async (
  query: Record<string, any>,
): Promise<{
  meta: { total: number; page: number; limit: number }
  result: IPrompt[]
}> => {
  const queryBuilder = new QueryBuilder(Prompt.find(), query)
  const result = await queryBuilder.filter().sort().paginate().fields()
    .modelQuery
  const meta = await queryBuilder.getPaginationInfo()
  return { meta, result }
}

const getAllUnpaginatedPrompts = async (): Promise<IPrompt[]> => {
  const result = await Prompt.find()
  return result
}

const updatePrompt = async (
  id: string,
  payload: Partial<IPrompt>,
): Promise<IPrompt | null> => {
  const isExist = await Prompt.findById(id)
  if (!isExist) {
    unlinkFile(payload.image!)
    throw new AppError(StatusCodes.NOT_FOUND, 'Prompt not found.')
  }

  unlinkFile(isExist.image!) // Unlink the old image
  return await Prompt.findByIdAndUpdate(id, payload, { new: true })
}

const deletePrompt = async (id: string): Promise<IPrompt | null> => {
  const result = await Prompt.findById(id)
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Prompt not found.')
  }
  result.isDeleted = true
  result.deletedAt = new Date()
  await result.save()
  return result
}

const hardDeletePrompt = async (id: string): Promise<IPrompt | null> => {
  const result = await Prompt.findByIdAndDelete(id)
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Prompt not found.')
  }
  unlinkFile(result.image!)
  return result
}

const getPromptById = async (id: string): Promise<IPrompt | null> => {
  const result = await Prompt.findById(id)
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Prompt not found.')
  }
  return result
}

export const PromptService = {
  createPrompt,
  getAllPrompts,
  getAllUnpaginatedPrompts,
  updatePrompt,
  deletePrompt,
  hardDeletePrompt,
  getPromptById,
}
