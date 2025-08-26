import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { UserStudyHistoryServices } from './userStudyHistory.service'
import pick from '../../../shared/pick'
import { paginationFields } from '../../../interfaces/pagination'
import { IUserStudyHistoryFilter } from './userStudyHistory.interface'

// Record lesson question attempt
const recordLessonQuestionAttempt = catchAsync(
  async (req: Request, res: Response) => {
    const {
      userId,
      lessonId,
      questionId,
      isCorrect,
      timeSpent,
      selectedAnswer,
    } = req.body

    const result = await UserStudyHistoryServices.recordLessonQuestionAttempt(
      userId,
      lessonId,
      questionId,
      isCorrect,
      timeSpent,
      selectedAnswer,
    )

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Lesson question attempt recorded successfully',
      data: result,
    })
  },
)

// Start exam attempt
const startExamAttempt = catchAsync(async (req: Request, res: Response) => {
  const { userId, examId, totalQuestions, passMark } = req.body

  const result = await UserStudyHistoryServices.startExamAttempt(
    userId,
    examId,
    totalQuestions,
    passMark,
  )

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Exam attempt started successfully',
    data: result,
  })
})

// Complete exam attempt
const completeExamAttempt = catchAsync(async (req: Request, res: Response) => {
  const { userId, examId, questionsAttempted, timeSpent } = req.body

  const result = await UserStudyHistoryServices.completeExamAttempt(
    userId,
    examId,
    questionsAttempted,
    timeSpent,
  )

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Exam attempt completed successfully',
    data: result,
  })
})

// Get user study statistics
const getUserStudyStats = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params
  const { period, startDate, endDate } = req.query

  const query = {
    userId,
    period: period as string,
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
  }

  const result = await UserStudyHistoryServices.getUserStudyStats(query)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User study statistics retrieved successfully',
    data: result,
  })
})

// Get lesson progress
const getLessonProgress = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params
  const { lessonId } = req.query

  const result = await UserStudyHistoryServices.getLessonProgress(
    userId,
    lessonId as string,
  )

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Lesson progress retrieved successfully',
    data: result,
  })
})

// Get exam history
const getExamHistory = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params
  const { examId } = req.query

  const result = await UserStudyHistoryServices.getExamHistory(
    userId,
    examId as string,
  )

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Exam history retrieved successfully',
    data: result,
  })
})

// Get all user study histories (admin endpoint)
const getAllUserStudyHistories = catchAsync(
  async (req: Request, res: Response) => {
    const filters: IUserStudyHistoryFilter = pick(req.query, [
      'userId',
      'startDate',
      'endDate',
      'lessonId',
      'examId',
      'searchTerm',
    ])

    const paginationOptions = pick(req.query, paginationFields)

    const result = await UserStudyHistoryServices.getAllUserStudyHistories(
      filters,
      paginationOptions,
    )

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'User study histories retrieved successfully',
      meta: result.meta,
      data: result.data,
    })
  },
)

// Get user's own study history (authenticated user)
const getMyStudyHistory = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.authId || req.params.userId
  const { period, startDate, endDate } = req.query

  const query = {
    userId,
    period: period as string,
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
  }

  const result = await UserStudyHistoryServices.getUserStudyStats(query)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Your study history retrieved successfully',
    data: result,
  })
})

// Get user's lesson progress summary
const getMyLessonProgress = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.authId || req.params.userId

  const result = await UserStudyHistoryServices.getLessonProgress(userId)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Your lesson progress retrieved successfully',
    data: result,
  })
})

// Get user's exam history summary
const getMyExamHistory = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.authId || req.params.userId

  const result = await UserStudyHistoryServices.getExamHistory(userId)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Your exam history retrieved successfully',
    data: result,
  })
})

// Get specific lesson progress for user
const getSpecificLessonProgress = catchAsync(
  async (req: Request, res: Response) => {
    const { userId, lessonId } = req.params

    const result = await UserStudyHistoryServices.getLessonProgress(
      userId,
      lessonId,
    )

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Specific lesson progress retrieved successfully',
      data: result,
    })
  },
)

// Get specific exam history for user
const getSpecificExamHistory = catchAsync(
  async (req: Request, res: Response) => {
    const { userId, examId } = req.params

    const result = await UserStudyHistoryServices.getExamHistory(userId, examId)

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Specific exam history retrieved successfully',
      data: result,
    })
  },
)

export const UserStudyHistoryController = {
  recordLessonQuestionAttempt,
  startExamAttempt,
  completeExamAttempt,
  getUserStudyStats,
  getLessonProgress,
  getExamHistory,
  getAllUserStudyHistories,
  getMyStudyHistory,
  getMyLessonProgress,
  getMyExamHistory,
  getSpecificLessonProgress,
  getSpecificExamHistory,
}
