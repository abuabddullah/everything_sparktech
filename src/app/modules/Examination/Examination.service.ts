import { StatusCodes } from 'http-status-codes'
import AppError from '../../../errors/AppError'
import { IExamination } from './Examination.interface'
import { Examination } from './Examination.model'
import QueryBuilder from '../../builder/QueryBuilder'
import { QuestionSet } from '../QuestionSet/QuestionSet.model'
import { Test } from '../Test/Test.model'
import { UserProgressHistory } from '../UserProgressHistory/UserProgressHistory.model'
import { ITestTitle } from '../Test/Test.enum'
import { IQSetRefType, IQSetTypes } from '../QuestionSet/QuestionSet.enum'
import mongoose from 'mongoose'

const createExamination = async (
  payload: IExamination,
): Promise<IExamination> => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    console.log('Creating the examination...')

    // Create the examination
    const [result] = await Examination.create([payload], { session })
    if (!result) {
      console.error('Failed to create examination.')
      throw new AppError(StatusCodes.BAD_REQUEST, 'Examination not created.')
    }

    console.log('Examination created:', result._id)

    // Update the refId for each questionSet related to the examination
    for (const step of payload.questionSteps) {
      console.log(`Updating question set for step ${step.stepNo}...`)
      const updatedQuestionSetResult = await QuestionSet.updateMany(
        { _id: step.questionSet },
        { refId: result._id },
        { session },
      )
      console.log(
        `Updated question set result for step ${step.stepNo}:`,
        updatedQuestionSetResult,
      )

      if (updatedQuestionSetResult.modifiedCount === 0) {
        console.error(`Failed to update question set for step ${step.stepNo}.`)
        throw new AppError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          'Examination not created.',
        )
      }
    }

    // Commit the transaction
    console.log('Committing transaction...')
    await session.commitTransaction()
    session.endSession()

    return result
  } catch (error) {
    console.error('Error occurred during transaction:', error)

    // Abort the transaction on error
    await session.abortTransaction()
    session.endSession()

    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Examination not created.',
    )
  }
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
  const isExistExamination = await Examination.findById(id)
  if (!isExistExamination) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Examination not found.')
  }

  // Test and questionSets validation
  let isExistTest, isExistQuestionSets
  if (payload.test) {
    isExistTest = await Test.findById(payload.test)
    if (!isExistTest) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid test.')
    }
  }

  // Handle questionSets validation
  if (payload.questionSteps) {
    for (const step of payload.questionSteps) {
      isExistQuestionSets = await QuestionSet.find({
        _id: step.questionSet,
        refType: IQSetRefType.EXAMINATION,
        refId: null,
      })
      if (!isExistQuestionSets.length) {
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          `Invalid question set for step ${step.stepNo}.`,
        )
      }
    }
    payload.questionSetsCount = payload.questionSteps.length
  }

  // Update the examination
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    const updatedExamination = await Examination.findByIdAndUpdate(
      id,
      payload,
      {
        new: true,
        session,
      },
    )
    if (!updatedExamination) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Examination not found.')
    }

    // Link the new questionSets for each step
    if (payload.questionSteps) {
      // Unlink the old questionSets
      const updatedQuestionSetsResult = await QuestionSet.updateMany(
        { refId: id },
        { refId: null },
        { session },
      )
      if (!updatedQuestionSetsResult) {
        throw new AppError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          'Examination not updated.',
        )
      }
      for (const step of payload.questionSteps) {
        const updatedQuestionSetResult = await QuestionSet.findByIdAndUpdate(
          step.questionSet,
          { refId: id },
          { session },
        )
        if (!updatedQuestionSetResult) {
          throw new AppError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            'Examination not updated.',
          )
        }
      }
    }

    await session.commitTransaction()
    session.endSession()

    return updatedExamination
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Examination not updated.',
    )
  }
}

const deleteExamination = async (id: string): Promise<IExamination | null> => {
  const result = await Examination.findById(id)
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Examination not found.')
  }

  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    result.isDeleted = true
    result.deletedAt = new Date()
    await result.save({ session })
    // also need to clean up the refId of questionsSets
    const updatedQuestionSetsResult = await QuestionSet.updateMany(
      { refId: id },
      { refId: null },
      { session },
    )
    if (!updatedQuestionSetsResult) {
      throw new AppError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Examination not deleted.',
      )
    }

    await session.commitTransaction()
    session.endSession()

    return result
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Examination not deleted.',
    )
  }
}

const hardDeleteExamination = async (
  id: string,
): Promise<IExamination | null> => {
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    const result = await Examination.findByIdAndDelete(id, { session })
    if (!result) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Examination not found.')
    }
    // also need to clean up the refId of questionsSets
    const updatedQuestionSetsResult = await QuestionSet.updateMany(
      { refId: id },
      { refId: null },
      { session },
    )
    if (!updatedQuestionSetsResult) {
      throw new AppError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Examination not deleted.',
      )
    }

    await session.commitTransaction()
    session.endSession()

    return result
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Examination not deleted.',
    )
  }
}

const getExaminationById = async (id: string): Promise<IExamination | null> => {
  const result = await Examination.findById(id)
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Examination not found.')
  }
  return result
}

// const getExaminationsByTestId = async (testId: string) => {
//   const queryBuilder = new QueryBuilder(Examination.find(), { test: testId })
//   const result = await queryBuilder.filter().sort().paginate().fields()
//     .modelQuery
//   const meta = await queryBuilder.getPaginationInfo()
//   return { meta, result }
// }

const getExaminationsByTestId = async (testId: string, userId: string) => {
  // Build the query using the provided testId
  const queryBuilder = new QueryBuilder(Examination.find(), { test: testId })

  // Fetch the data with pagination and sorting applied
  const result = await queryBuilder
    .filter()
    .sort()
    .paginate()
    .fields()
    .modelQuery.lean() // Use `.lean()` to get plain JavaScript objects

  // Get pagination metadata
  const meta = await queryBuilder.getPaginationInfo()

  // Modify the result to include the `isCompleted` field based on user progress
  const modifiedResult = await Promise.all(
    result.map(async (examination: any) => {
      const isCompletedExamByUser = await UserProgressHistory.findOne({
        user: userId,
        examination: examination._id,
        isExamCompleted: true,
      })

      return {
        ...examination, // Spread the examination data
        isCompleted: !!isCompletedExamByUser, // Add isCompleted field
      }
    }),
  )

  // Return the modified results along with pagination metadata
  return { meta, result: modifiedResult }
}

export const ExaminationService = {
  createExamination,
  getAllExaminations,
  getAllUnpaginatedExaminations,
  updateExamination,
  deleteExamination,
  hardDeleteExamination,
  getExaminationById,
  getExaminationsByTestId,
}
