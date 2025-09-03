import { Request, Response } from 'express'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { IUserProgressHistory } from './UserProgressHistory.interface'
import { UserProgressHistoryService } from './UserProgressHistory.service'

const createUserProgressHistory = catchAsync(
  async (req: Request, res: Response) => {
    const result = await UserProgressHistoryService.createUserProgressHistory(
      req.body,
    )

    sendResponse<IUserProgressHistory>(res, {
      statusCode: 200,
      success: true,
      message: 'UserProgressHistory created successfully',
      data: result,
    })
  },
)

const getAllUserProgressHistorys = catchAsync(
  async (req: Request, res: Response) => {
    const result = await UserProgressHistoryService.getAllUserProgressHistorys(
      req.query,
    )

    sendResponse<{
      meta: { total: number; page: number; limit: number }
      result: IUserProgressHistory[]
    }>(res, {
      statusCode: 200,
      success: true,
      message: 'UserProgressHistorys retrieved successfully',
      data: result,
    })
  },
)

const getAllUnpaginatedUserProgressHistorys = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await UserProgressHistoryService.getAllUnpaginatedUserProgressHistorys()

    sendResponse<IUserProgressHistory[]>(res, {
      statusCode: 200,
      success: true,
      message: 'UserProgressHistorys retrieved successfully',
      data: result,
    })
  },
)

const updateUserProgressHistory = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params
    const result = await UserProgressHistoryService.updateUserProgressHistory(
      id,
      req.body,
    )

    sendResponse<IUserProgressHistory>(res, {
      statusCode: 200,
      success: true,
      message: 'UserProgressHistory updated successfully',
      data: result || undefined,
    })
  },
)

const deleteUserProgressHistory = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params
    const result =
      await UserProgressHistoryService.deleteUserProgressHistory(id)

    sendResponse<IUserProgressHistory>(res, {
      statusCode: 200,
      success: true,
      message: 'UserProgressHistory deleted successfully',
      data: result || undefined,
    })
  },
)

const hardDeleteUserProgressHistory = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params
    const result =
      await UserProgressHistoryService.hardDeleteUserProgressHistory(id)

    sendResponse<IUserProgressHistory>(res, {
      statusCode: 200,
      success: true,
      message: 'UserProgressHistory deleted successfully',
      data: result || undefined,
    })
  },
)

const getUserProgressHistoryById = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params
    const result =
      await UserProgressHistoryService.getUserProgressHistoryById(id)

    sendResponse<IUserProgressHistory>(res, {
      statusCode: 200,
      success: true,
      message: 'UserProgressHistory retrieved successfully',
      data: result || undefined,
    })
  },
)

const getTotalProgressHistory = catchAsync(
  async (req: Request, res: Response) => {
    const result = await UserProgressHistoryService.getTotalProgressHistory(
      (req.user as any)?.authId,
    )

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'UserProgressHistory retrieved successfully',
      data: result,
    })
  },
)

const getUserExamHistory = catchAsync(async (req: Request, res: Response) => {
  const { examinationId } = req.params
  const result = await UserProgressHistoryService.getUserExamHistory(
    examinationId,
    (req.user as any)?.authId,
  )

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'UserProgressHistory retrieved successfully',
    data: result,
  })
})

const getUsersQuestionHistory = catchAsync(
  async (req: Request, res: Response) => {
    const { questionId } = req.params
    const result = await UserProgressHistoryService.getUsersQuestionHistory(
      questionId,
      (req.user as any)?.authId,
    )

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'UserProgressHistory retrieved successfully',
      data: result,
    })
  },
)

const resetExaminationProgressHistory = catchAsync(
  async (req: Request, res: Response) => {
    const { examinationId } = req.params
    const result =
      await UserProgressHistoryService.resetExaminationProgressHistory(
        examinationId,
        (req.user as any)?.authId,
      )

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'UserProgressHistory retrieved successfully',
      data: result,
    })
  },
)

const completeExam = catchAsync(async (req: Request, res: Response) => {
  const { examinationId } = req.params
  const result = await UserProgressHistoryService.completeExam(
    examinationId,
    (req.user as any)?.authId,
  )

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'UserProgressHistory retrieved successfully',
    data: result,
  })
})

export const UserProgressHistoryController = {
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
}
