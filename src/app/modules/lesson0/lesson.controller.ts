import { Request, Response } from 'express'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { StatusCodes } from 'http-status-codes'
import pick from '../../../shared/pick'
import { paginationFields } from '../../../interfaces/pagination'
import { LessonServices } from './lesson.service'
import { lessonFilterables } from './lesson.constants'

const createLesson = catchAsync(async (req: Request, res: Response) => {
  const lessonData = req.body

  const result = await LessonServices.createLesson(req.user!, lessonData)

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Lesson created successfully',
    data: result,
  })
})

const getSingleLesson = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await LessonServices.getSingleLesson(id)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Lesson retrieved successfully',
    data: result,
  })
})

const getAllLessons = catchAsync(async (req: Request, res: Response) => {
  const filterables = pick(req.query, lessonFilterables)
  const pagination = pick(req.query, paginationFields)

  const result = await LessonServices.getAllLessons(
    req.user!,
    filterables,
    pagination,
  )

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Lessons retrieved successfully',
    data: result,
  })
})

const getNextGenLesson = catchAsync(async (req: Request, res: Response) => {
  const result = await LessonServices.getNextGenLesson()
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Next Gen lessons retrieved successfully',
    data: result,
  })
})

const getCaseStudyLesson = catchAsync(async (req: Request, res: Response) => {
  const result = await LessonServices.getCaseStudyLesson()
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'CaseStudy lessons retrieved successfully',
    data: result,
  })
})

const getQuestionByLesson = catchAsync(async (req: Request, res: Response) => {
  const { lessonId } = req.params

  const pagination = pick(req.query, paginationFields)
  const result = await LessonServices.getQuestionByLesson(lessonId, pagination)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Questions retrieved successfully',
    data: result,
  })
})

const deleteLesson = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await LessonServices.deleteLesson(id)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Lesson deleted successfully',
    data: result,
  })
})

export const LessonControllers = {
  createLesson,
  getSingleLesson,
  getAllLessons,
  deleteLesson,

  getNextGenLesson,
  getCaseStudyLesson,
  getQuestionByLesson,
}
