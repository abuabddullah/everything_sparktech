import { StatusCodes } from 'http-status-codes'
import { IUserProgressHistory } from './UserProgressHistory.interface'
import { UserProgressHistory } from './UserProgressHistory.model'
import QueryBuilder from '../../builder/QueryBuilder'
import unlinkFile from '../../../shared/unlinkFile'
import AppError from '../../../errors/AppError'

const createUserProgressHistory = async (
  payload: IUserProgressHistory,
): Promise<IUserProgressHistory> => {
  const result = await UserProgressHistory.create(payload)
  return result
}

const getAllUserProgressHistorys = async (
  query: Record<string, any>,
): Promise<{
  meta: { total: number; page: number; limit: number }
  result: IUserProgressHistory[]
}> => {
  const queryBuilder = new QueryBuilder(UserProgressHistory.find(), query)
  const result = await queryBuilder.filter().sort().paginate().fields()
    .modelQuery
  const meta = await queryBuilder.getPaginationInfo()
  return { meta, result }
}

const getAllUnpaginatedUserProgressHistorys = async (): Promise<
  IUserProgressHistory[]
> => {
  const result = await UserProgressHistory.find()
  return result
}

const updateUserProgressHistory = async (
  id: string,
  payload: Partial<IUserProgressHistory>,
): Promise<IUserProgressHistory | null> => {
  const isExist = await UserProgressHistory.findById(id)
  if (!isExist) {
    throw new AppError(StatusCodes.NOT_FOUND, 'UserProgressHistory not found.')
  }

  return await UserProgressHistory.findByIdAndUpdate(id, payload, { new: true })
}

const deleteUserProgressHistory = async (
  id: string,
): Promise<IUserProgressHistory | null> => {
  const result = await UserProgressHistory.findById(id)
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'UserProgressHistory not found.')
  }
  result.isDeleted = true
  result.deletedAt = new Date()
  await result.save()
  return result
}

const hardDeleteUserProgressHistory = async (
  id: string,
): Promise<IUserProgressHistory | null> => {
  const result = await UserProgressHistory.findByIdAndDelete(id)
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'UserProgressHistory not found.')
  }
  return result
}

const getUserProgressHistoryById = async (
  id: string,
): Promise<IUserProgressHistory | null> => {
  const result = await UserProgressHistory.findById(id)
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'UserProgressHistory not found.')
  }
  return result
}

export const UserProgressHistoryService = {
  createUserProgressHistory,
  getAllUserProgressHistorys,
  getAllUnpaginatedUserProgressHistorys,
  updateUserProgressHistory,
  deleteUserProgressHistory,
  hardDeleteUserProgressHistory,
  getUserProgressHistoryById,
}
