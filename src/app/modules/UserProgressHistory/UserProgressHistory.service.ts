import { StatusCodes } from 'http-status-codes'
import AppError from '../../../errors/AppError'
import QueryBuilder from '../../builder/QueryBuilder'
import { Examination } from '../Examination/Examination.model'
import { IUserProgressHistory } from './UserProgressHistory.interface'
import { UserProgressHistory } from './UserProgressHistory.model'

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
  const queryBuilder = new QueryBuilder(
    UserProgressHistory.find().populate('question'),
    query,
  )
  const result = await queryBuilder.filter().sort().paginate().fields()
    .modelQuery
  const meta = await queryBuilder.getPaginationInfo()
  return { meta, result }
}

const previewUserExamHistorys = async (
  query: Record<string, any>,
  userId: string,
): Promise<{
  meta: { total: number; page: number; limit: number }
  result: IUserProgressHistory[]
}> => {
  const queryBuilder = new QueryBuilder(
    UserProgressHistory.find({ user: userId }).populate([
      // populate top-level question
      { path: 'question' },
      // populate questionSet and, inside it, prompts (and questions if you want)
      {
        path: 'questionSet',
        populate: [{ path: 'prompts' }],
      },
    ]),
    query,
  )
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

const getTotalProgressHistory = async (userId: string) => {
  // {totalAttemptedQuestionsCount,correctlyAnsweredQuestionsCount,incorrectlyAnsweredQuestionsCount,correctlyAnsweredPercentage,incorrectlyAnsweredPercentage}
  const totalAttemptedQuestionsCount = await UserProgressHistory.countDocuments(
    { user: userId },
  )
  const correctlyAnsweredQuestionsCount =
    await UserProgressHistory.countDocuments({
      user: userId,
      isCorrectlyAnswered: true,
    })
  const incorrectlyAnsweredQuestionsCount =
    await UserProgressHistory.countDocuments({
      user: userId,
      isCorrectlyAnswered: false,
    })
  const correctlyAnsweredPercentage =
    (correctlyAnsweredQuestionsCount / totalAttemptedQuestionsCount) * 100
  const incorrectlyAnsweredPercentage =
    (incorrectlyAnsweredQuestionsCount / totalAttemptedQuestionsCount) * 100

  return {
    totalAttemptedQuestionsCount,
    correctlyAnsweredQuestionsCount,
    incorrectlyAnsweredQuestionsCount,
    correctlyAnsweredPercentage,
    incorrectlyAnsweredPercentage,
  }
}

const getUserExamHistory = async (examinationId: string, userId: string) => {
  // {totalQuestionCountOfExamination, totalAttemptedQuestionCount}
  const isExistExamination =
    await Examination.findById(examinationId).select('questionSetsCount')
  if (!isExistExamination) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Examination not found.')
  }

  const totalAttemptedQuestionsCountOfExam =
    await UserProgressHistory.countDocuments({
      user: userId,
      examination: examinationId,
    })

  const totalCorrectAnsweredByUserOnExamCount =
    await UserProgressHistory.countDocuments({
      user: userId,
      examination: examinationId,
      isCorrectlyAnswered: true,
    })
  return {
    totalQuestionCountOfExamination: isExistExamination.questionSetsCount,
    totalAttemptedQuestionsCountOfExam,
    totalCorrectAnsweredByUserOnExamCount,
  }
}

const getUsersQuestionHistory = async (questionId: string, userId: string) => {
  // {userAnswer, isCorrectlyAnswered, timeSpentInSecond}
  const result = await UserProgressHistory.findOne({
    user: userId,
    question: questionId,
  })
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'UserProgressHistory not found.')
  }
  return result
}

const resetExaminationProgressHistory = async (
  examinationId: string,
  userId: string,
) => {
  const result = await UserProgressHistory.deleteMany({
    user: userId,
    examination: examinationId,
  })
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'UserProgressHistory not found.')
  }
  await Examination.updateOne(
    { _id: examinationId },
    { $pull: { completedBy: userId } },
  )
  return result
}

const completeExam = async (
  examinationId: string,
  userId: string,
  timeSpentInSecond: number,
) => {
  const isExistExam =
    await Examination.findById(examinationId).select('questionSetsCount')
  if (!isExistExam) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Examination not found.')
  }
  const totalAttemptedQuestionsCountOfExam =
    await UserProgressHistory.countDocuments({
      user: userId,
      examination: examinationId,
    })

  if (!totalAttemptedQuestionsCountOfExam) {
    throw new AppError(StatusCodes.NOT_FOUND, 'UserProgressHistory not found.')
  }
  if (totalAttemptedQuestionsCountOfExam !== isExistExam.questionSetsCount) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Exam not completed yet.')
  }
  const result = await UserProgressHistory.updateMany(
    {
      user: userId,
      examination: examinationId,
      isExamCompleted: false,
    },
    { isExamCompleted: true, timeSpentInSecond },
  )
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'UserProgressHistory not found.')
  }
  await Examination.updateOne(
    { _id: examinationId },
    { $push: { completedBy: userId } },
  )
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
  getTotalProgressHistory,
  getUserExamHistory,
  getUsersQuestionHistory,
  resetExaminationProgressHistory,
  completeExam,
  previewUserExamHistorys,
}
