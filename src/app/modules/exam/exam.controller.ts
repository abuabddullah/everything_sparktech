import { Request, Response } from 'express'
import { ExamServices } from './exam.service'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { StatusCodes } from 'http-status-codes'
import { createStem, createQuestion } from './exam.service'
import pick from '../../../shared/pick'
import { examFilterables } from './exam.constants'
import { paginationFields } from '../../../interfaces/pagination'

const createExam = catchAsync(async (req: Request, res: Response) => {
  const examData = req.body

  const result = await ExamServices.createExam(req.user!, examData)

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Exam created successfully',
    data: result,
  })
})

const getSingleExam = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await ExamServices.getSingleExam(id)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Exam retrieved successfully',
    data: result,
  })
})

const getAllExams = catchAsync(async (req: Request, res: Response) => {
  const filterables = pick(req.query, examFilterables)
  const pagination = pick(req.query, paginationFields)

  const result = await ExamServices.getAllExams(
    req.user!,
    filterables,
    pagination,
  )

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Exams retrieved successfully',
    data: result,
  })
})

const getReadinessExam = catchAsync(async (req: Request, res: Response) => {
  const result = await ExamServices.getReadinessExam()
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Readiness exams retrieved successfully',
    data: result,
  })
})

const getStandaloneExam = catchAsync(async (req: Request, res: Response) => {
  const result = await ExamServices.getStandaloneExam()
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Standalone exams retrieved successfully',
    data: result,
  })
})

const getQuestionByExam = catchAsync(async (req: Request, res: Response) => {
  const { examId } = req.params

  const pagination = pick(req.query, paginationFields)
  const result = await ExamServices.getQuestionByExam(examId, pagination)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Questions retrieved successfully',
    data: result,
  })
})

const createStemController = catchAsync(async (req: Request, res: Response) => {
  const stemData = req.body

  const result = await createStem(stemData)
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Stem created successfully',
    data: result,
  })
})

const createQuestionController = catchAsync(
  async (req: Request, res: Response) => {
    const questionData = req.body
    const user = req.user!

    const result = await createQuestion(questionData, user)
    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: 'Question created successfully',
      data: result,
    })
  },
)

const deleteExam = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await ExamServices.deleteExam(id)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Exam deleted successfully',
    data: result,
  })
})

export const ExamControllers = {
  createExam,
  getSingleExam,
  getAllExams,
  deleteExam,
  createStem: createStemController,
  createQuestion: createQuestionController,

  getReadinessExam,
  getStandaloneExam,
  getQuestionByExam,
}
