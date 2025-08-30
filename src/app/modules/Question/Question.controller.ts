import { Request, Response } from 'express'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { IQuestion } from './Question.interface'
import { QuestionService } from './Question.service'

const createQuestion = catchAsync(async (req: Request, res: Response) => {
  const result = await QuestionService.createQuestion(req.body)

  sendResponse<IQuestion>(res, {
    statusCode: 200,
    success: true,
    message: 'Question created successfully',
    data: result,
  })
})

const getAllQuestions = catchAsync(async (req: Request, res: Response) => {
  const result = await QuestionService.getAllQuestions(req.query)

  sendResponse<{
    meta: { total: number; page: number; limit: number }
    result: IQuestion[]
  }>(res, {
    statusCode: 200,
    success: true,
    message: 'Questions retrieved successfully',
    data: result,
  })
})

const getAllUnpaginatedQuestions = catchAsync(
  async (req: Request, res: Response) => {
    const result = await QuestionService.getAllUnpaginatedQuestions()

    sendResponse<IQuestion[]>(res, {
      statusCode: 200,
      success: true,
      message: 'Questions retrieved successfully',
      data: result,
    })
  },
)

const updateQuestion = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await QuestionService.updateQuestion(id, req.body)

  sendResponse<IQuestion>(res, {
    statusCode: 200,
    success: true,
    message: 'Question updated successfully',
    data: result || undefined,
  })
})

const deleteQuestion = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await QuestionService.deleteQuestion(id)

  sendResponse<IQuestion>(res, {
    statusCode: 200,
    success: true,
    message: 'Question deleted successfully',
    data: result || undefined,
  })
})

const hardDeleteQuestion = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await QuestionService.hardDeleteQuestion(id)

  sendResponse<IQuestion>(res, {
    statusCode: 200,
    success: true,
    message: 'Question deleted successfully',
    data: result || undefined,
  })
})

const getQuestionById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await QuestionService.getQuestionById(id)

  sendResponse<IQuestion>(res, {
    statusCode: 200,
    success: true,
    message: 'Question retrieved successfully',
    data: result || undefined,
  })
})

export const QuestionController = {
  createQuestion,
  getAllQuestions,
  getAllUnpaginatedQuestions,
  updateQuestion,
  deleteQuestion,
  hardDeleteQuestion,
  getQuestionById,
}
