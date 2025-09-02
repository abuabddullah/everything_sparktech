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

// const createExamination = async (
//   payload: IExamination,
// ): Promise<IExamination> => {
//   // test, questionSets exists or not
//   const isExistTest = await Test.findById(payload.test)
//   if (!isExistTest) {
//     throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid test.')
//   }
//   if (isExistTest.title == ITestTitle.REDINESS_TEST) {
//     if (!payload.description) {
//       throw new AppError(StatusCodes.BAD_REQUEST, 'Description is required.')
//     }
//   }

//   const isExistQuestionSets = await QuestionSet.find({
//     _id: { $in: payload.questionSets },
//     refType: IQSetRefType.EXAMINATION,
//     refId: null,
//   })
//   if (
//     !isExistQuestionSets.length ||
//     isExistQuestionSets.length !== payload.questionSets.length
//   ) {
//     throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid question set.')
//   }
//   payload.questionSetsCount = payload.questionSets.length
//   const result = await Examination.create(payload)
//   // set result._id as refId of each questionSets of result.questionSets and update result.questionSetsCount
//   await QuestionSet.updateMany(
//     { _id: { $in: result.questionSets } },
//     { refId: result._id },
//   )
//   return result
// }

const createExamination = async (
  payload: IExamination,
): Promise<IExamination> => {
  // Check if the test exists
  const isExistTest = await Test.findById(payload.test)
  if (!isExistTest) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid test.')
  }
  if (isExistTest.title == ITestTitle.REDINESS_TEST) {
    if (!payload.description) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Description is required.')
    }
  }

  // Ensure all the questionSets within questionSteps are valid
  if (payload.questionSteps && payload.questionSteps.length > 0) {
    for (const step of payload.questionSteps) {
      const isExistQuestionSet = await QuestionSet.find({
        _id: step.questionSet,
        refType: IQSetRefType.EXAMINATION,
        refId: null,
      })
      if (!isExistQuestionSet.length) {
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          `Invalid question set for step ${step.stepNo}.`,
        )
      }
    }
    payload.questionSetsCount = payload.questionSteps.length
  }

  // Create the examination
  const result = await Examination.create(payload)

  // Update questionSets' refId for each step's questionSets
  for (const step of payload.questionSteps) {
    await QuestionSet.updateMany(
      { _id: step.questionSet },
      { refId: result._id },
    )
  }

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

// const updateExamination = async (
//   id: string,
//   payload: Partial<IExamination>,
// ): Promise<IExamination | null> => {
//   const isExist = await Examination.findById(id)
//   if (!isExist) {
//     throw new AppError(StatusCodes.NOT_FOUND, 'Examination not found.')
//   }
//   // test, questionSets exists or not
//   let isExistTest, isExistQuestionSets
//   if (payload.test) {
//     isExistTest = await Test.findById(payload.test)
//     if (!isExistTest) {
//       throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid test.')
//     }
//   }
//   if (payload.questionSets) {
//     isExistQuestionSets = await QuestionSet.find({
//       _id: { $in: payload.questionSets },
//       refType: IQSetRefType.EXAMINATION,
//       refId: null,
//     })
//     if (
//       !isExistQuestionSets.length ||
//       isExistQuestionSets.length !== payload.questionSets.length
//     ) {
//       throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid question set.')
//     }
//     payload.questionSetsCount = payload.questionSets.length
//   }
//   const updatedExamination = await Examination.findByIdAndUpdate(id, payload, {
//     new: true,
//   })
//   if (!updatedExamination) {
//     throw new AppError(StatusCodes.NOT_FOUND, 'Examination not found.')
//   }
//   // now need to unlink the old questionSets
//   await QuestionSet.updateMany({ refId: id }, { refId: null })
//   // now need to link the new questionSets
//   await QuestionSet.updateMany(
//     { _id: { $in: payload.questionSets } },
//     { refId: id },
//   )
//   return updatedExamination
// }

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
  const updatedExamination = await Examination.findByIdAndUpdate(id, payload, {
    new: true,
  })
  await isExistExamination.save()
  if (!updatedExamination) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Examination not found.')
  }

  // Unlink the old questionSets
  await QuestionSet.updateMany({ refId: id }, { refId: null })

  // Link the new questionSets for each step
  if (payload.questionSteps) {
    for (const step of payload.questionSteps) {
      await QuestionSet.updateMany({ _id: step.questionSet }, { refId: id })
    }
  }

  return updatedExamination
}

const deleteExamination = async (id: string): Promise<IExamination | null> => {
  const result = await Examination.findById(id)
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Examination not found.')
  }
  result.isDeleted = true
  result.deletedAt = new Date()
  await result.save()
  // also need to clean up the refId of questionsSets
  await QuestionSet.updateMany({ refId: id }, { refId: null })
  return result
}

const hardDeleteExamination = async (
  id: string,
): Promise<IExamination | null> => {
  const result = await Examination.findByIdAndDelete(id)
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Examination not found.')
  }
  // also need to clean up the refId of questionsSets
  await QuestionSet.updateMany({ refId: id }, { refId: null })
  return result
}

const getExaminationById = async (id: string): Promise<IExamination | null> => {
  const result = await Examination.findById(id)
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Examination not found.')
  }
  return result
}

const getExaminationsByTestId = async (testId: string) => {
  const queryBuilder = new QueryBuilder(Examination.find(), { test: testId })
  const result = await queryBuilder.filter().sort().paginate().fields()
    .modelQuery
  const meta = await queryBuilder.getPaginationInfo()
  return { meta, result }
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
