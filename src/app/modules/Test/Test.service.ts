import { StatusCodes } from 'http-status-codes'
import AppError from '../../../errors/AppError'
import { ITest } from './Test.interface'
import { Test } from './Test.model'
import QueryBuilder from '../../builder/QueryBuilder'
import { Examination } from '../Examination/Examination.model'
import mongoose from 'mongoose'

const createTest = async (payload: ITest): Promise<ITest> => {
  const result = await Test.create(payload)
  return result
}

const getAllTests = async (
  query: Record<string, any>,
): Promise<{
  meta: { total: number; page: number; limit: number }
  result: ITest[]
}> => {
  const queryBuilder = new QueryBuilder(Test.find(), query)
  const result = await queryBuilder.filter().sort().paginate().fields()
    .modelQuery
  const meta = await queryBuilder.getPaginationInfo()
  return { meta, result }
}

const getAllUnpaginatedTests = async (): Promise<ITest[]> => {
  const result = await Test.find()
  return result
}

const updateTest = async (
  id: string,
  payload: Partial<ITest>,
): Promise<ITest | null> => {
  const isExist = await Test.findById(id)
  if (!isExist) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Test not found.')
  }

  return await Test.findByIdAndUpdate(id, payload, { new: true })
}

const deleteTest = async (id: string): Promise<ITest | null> => {
  const result = await Test.findById(id)
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Test not found.')
  }

  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    result.isDeleted = true
    result.deletedAt = new Date()
    await result.save({ session })
    // make null of those studyLessons
    const updatedExaminationsResult = await Examination.updateMany(
      { test: id },
      { test: null },
      { session },
    )
    if (!updatedExaminationsResult) {
      throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Test not deleted.')
    }

    await session.commitTransaction()
    session.endSession()

    return result
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Test not deleted.')
  }
}

const hardDeleteTest = async (id: string): Promise<ITest | null> => {
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    const result = await Test.findByIdAndDelete(id, { session })
    if (!result) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Test not found.')
    }
    // unlike examination as refid
    // make null of those studyLessons
    const updatedExaminationsResult = await Examination.updateMany(
      { test: id },
      { test: null },
      { session },
    )
    if (!updatedExaminationsResult) {
      throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Test not deleted.')
    }

    await session.commitTransaction()
    session.endSession()

    return result
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Test not deleted.')
  }
}

const getTestById = async (id: string): Promise<ITest | null> => {
  const result = await Test.findById(id)
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Test not found.')
  }
  return result
}

export const TestService = {
  createTest,
  getAllTests,
  getAllUnpaginatedTests,
  updateTest,
  deleteTest,
  hardDeleteTest,
  getTestById,
}
