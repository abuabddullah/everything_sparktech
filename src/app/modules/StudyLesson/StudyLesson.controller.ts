import { Request, Response } from 'express'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { IStudyLesson } from './StudyLesson.interface'
import { StudyLessonService } from './StudyLesson.service'

const createStudyLesson = catchAsync(async (req: Request, res: Response) => {
  const result = await StudyLessonService.createStudyLesson(req.body)

  sendResponse<IStudyLesson>(res, {
    statusCode: 200,
    success: true,
    message: 'StudyLesson created successfully',
    data: result,
  })
})

const getAllStudyLessons = catchAsync(async (req: Request, res: Response) => {
  const result = await StudyLessonService.getAllStudyLessons(req.query)

  sendResponse<{
    meta: { total: number; page: number; limit: number }
    result: IStudyLesson[]
  }>(res, {
    statusCode: 200,
    success: true,
    message: 'StudyLessons retrieved successfully',
    data: result,
  })
})

const getAllUnpaginatedStudyLessons = catchAsync(
  async (req: Request, res: Response) => {
    const result = await StudyLessonService.getAllUnpaginatedStudyLessons()

    sendResponse<IStudyLesson[]>(res, {
      statusCode: 200,
      success: true,
      message: 'StudyLessons retrieved successfully',
      data: result,
    })
  },
)

const updateStudyLesson = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await StudyLessonService.updateStudyLesson(id, req.body)

  sendResponse<IStudyLesson>(res, {
    statusCode: 200,
    success: true,
    message: 'StudyLesson updated successfully',
    data: result || undefined,
  })
})

const deleteStudyLesson = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await StudyLessonService.deleteStudyLesson(id)

  sendResponse<IStudyLesson>(res, {
    statusCode: 200,
    success: true,
    message: 'StudyLesson deleted successfully',
    data: result || undefined,
  })
})

const hardDeleteStudyLesson = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params
    const result = await StudyLessonService.hardDeleteStudyLesson(id)

    sendResponse<IStudyLesson>(res, {
      statusCode: 200,
      success: true,
      message: 'StudyLesson deleted successfully',
      data: result || undefined,
    })
  },
)

const getStudyLessonById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await StudyLessonService.getStudyLessonById(id)

  sendResponse<IStudyLesson>(res, {
    statusCode: 200,
    success: true,
    message: 'StudyLesson retrieved successfully',
    data: result || undefined,
  })
})

const getStudyLessonsByCourseId = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params
    const result = await StudyLessonService.getStudyLessonsByCourseId(id)

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'StudyLessons retrieved successfully',
      data: result,
    })
  },
)

export const StudyLessonController = {
  createStudyLesson,
  getAllStudyLessons,
  getAllUnpaginatedStudyLessons,
  updateStudyLesson,
  deleteStudyLesson,
  hardDeleteStudyLesson,
  getStudyLessonById,
  getStudyLessonsByCourseId,
}
