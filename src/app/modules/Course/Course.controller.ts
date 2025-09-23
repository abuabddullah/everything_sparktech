import { Request, Response } from 'express'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { ICourse } from './Course.interface'
import { CourseService } from './Course.service'
import { getOrSetRedisCache } from '../../../helpers/getOrSetRedisCache'

const createCourse = catchAsync(async (req: Request, res: Response) => {
  const result = await CourseService.createCourse(req.body)

  sendResponse<ICourse>(res, {
    statusCode: 200,
    success: true,
    message: 'Course created successfully',
    data: result,
  })
})

const getAllCourses = catchAsync(async (req: Request, res: Response) => {
  const result = await getOrSetRedisCache(
    'all-courses',
    async () => await CourseService.getAllCourses(req.query),
    3600,
  )

  sendResponse<{
    meta: { total: number; page: number; limit: number }
    result: ICourse[]
  }>(res, {
    statusCode: 200,
    success: true,
    message: 'Courses retrieved successfully',
    data: result,
  })
})

const getAllUnpaginatedCourses = catchAsync(
  async (req: Request, res: Response) => {
    const result = await getOrSetRedisCache(
      'all-unpaginated-courses',
      async () => await CourseService.getAllUnpaginatedCourses(),
      3600,
    )

    sendResponse<ICourse[]>(res, {
      statusCode: 200,
      success: true,
      message: 'Courses retrieved successfully',
      data: result,
    })
  },
)

const updateCourse = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await CourseService.updateCourse(id, req.body)

  sendResponse<ICourse>(res, {
    statusCode: 200,
    success: true,
    message: 'Course updated successfully',
    data: result || undefined,
  })
})

const deleteCourse = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await CourseService.deleteCourse(id)

  sendResponse<ICourse>(res, {
    statusCode: 200,
    success: true,
    message: 'Course deleted successfully',
    data: result || undefined,
  })
})

const hardDeleteCourse = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await CourseService.hardDeleteCourse(id)

  sendResponse<ICourse>(res, {
    statusCode: 200,
    success: true,
    message: 'Course deleted successfully',
    data: result || undefined,
  })
})

const getCourseById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await CourseService.getCourseById(id)

  sendResponse<ICourse>(res, {
    statusCode: 200,
    success: true,
    message: 'Course retrieved successfully',
    data: result || undefined,
  })
})

export const CourseController = {
  createCourse,
  getAllCourses,
  getAllUnpaginatedCourses,
  updateCourse,
  deleteCourse,
  hardDeleteCourse,
  getCourseById,
}
