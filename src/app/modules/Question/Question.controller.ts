import { Request, Response } from 'express'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { IQuestion } from './Question.interface'
import { QuestionService } from './Question.service'
import { IJwtPayload } from '../auth/auth.interface'

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

const validateQuestionAnswer = catchAsync(
  async (req: Request, res: Response) => {
    const result = await QuestionService.validateQuestionAnswer(
      req.params.questionId,
      req.body.userAnswer,
    )

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Question retrieved successfully',
      data: result.toString(),
    })
  },
)

const upsertUserProgressHistoryTrackingOnAnsweringQuestion = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await QuestionService.upsertUserProgressHistoryTrackingOnAnsweringQuestion(
        (req.user as any)?.authId,
        req.body.test,
        req.body.examinationId,
        req.body.questionId,
        req.body.userAnswer,
      )

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'User progress history tracking updated successfully',
      data: result,
    })
  },
)

const validateQuestionsAnswers = catchAsync(
  async (req: Request, res: Response) => {
    const result = await QuestionService.validateQuestionsAnswers(
      req.body,
      (req.user as any)?.authId,
    )

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Questions answers validated successfully',
      data: result,
    })
  },
)

export const QuestionController = {
  createQuestion,
  getAllQuestions,
  getAllUnpaginatedQuestions,
  updateQuestion,
  deleteQuestion,
  hardDeleteQuestion,
  getQuestionById,
  validateQuestionAnswer,
  upsertUserProgressHistoryTrackingOnAnsweringQuestion,
  validateQuestionsAnswers,
}
