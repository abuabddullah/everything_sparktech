import { Request, Response } from 'express'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { StatusCodes } from 'http-status-codes'
import { StudyProgressServices } from './studyprogress.service'

const startSession = catchAsync(async (req: Request, res: Response) => {
  const { studentId, examId } = req.params
  const { topics } = req.body

  const result = await StudyProgressServices.startSession(
    studentId,
    examId,
    topics,
  )

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Study session started successfully',
    data: result,
  })
})

const endSession = catchAsync(async (req: Request, res: Response) => {
  const { studentId, examId } = req.params

  const result = await StudyProgressServices.endSession(studentId, examId)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Study session ended successfully',
    data: result,
  })
})

const completeQuestion = catchAsync(async (req: Request, res: Response) => {
  const { studentId, examId, questionId } = req.params
  const { isCorrect, notes } = req.body

  const result = await StudyProgressServices.completeQuestion(
    studentId,
    examId,
    questionId,
    isCorrect,
    notes,
  )

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Question completion recorded successfully',
    data: result,
  })
})

const addBookmark = catchAsync(async (req: Request, res: Response) => {
  const { studentId, examId, questionId } = req.params

  const result = await StudyProgressServices.addBookmark(
    studentId,
    examId,
    questionId,
  )

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Question bookmarked successfully',
    data: result,
  })
})

const removeBookmark = catchAsync(async (req: Request, res: Response) => {
  const { studentId, examId, questionId } = req.params

  const result = await StudyProgressServices.removeBookmark(
    studentId,
    examId,
    questionId,
  )

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Bookmark removed successfully',
    data: result,
  })
})

const getBookmarks = catchAsync(async (req: Request, res: Response) => {
  const { studentId, examId } = req.params

  const result = await StudyProgressServices.getBookmarks(studentId, examId)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Bookmarks retrieved successfully',
    data: result,
  })
})

const getStats = catchAsync(async (req: Request, res: Response) => {
  const { studentId, examId } = req.params

  const result = await StudyProgressServices.getStats(studentId, examId)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Study statistics retrieved successfully',
    data: result,
  })
})

const getStudyProgress = catchAsync(async (req: Request, res: Response) => {
  const { studentId, examId } = req.params
  const pagination = req.query

  const result = await StudyProgressServices.getStudyProgress(
    studentId,
    examId,
    pagination,
  )

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Study progress retrieved successfully',
    data: result,
  })
})

export const StudyProgressControllers = {
  startSession,
  endSession,
  completeQuestion,
  addBookmark,
  removeBookmark,
  getBookmarks,
  getStats,
  getStudyProgress,
}
