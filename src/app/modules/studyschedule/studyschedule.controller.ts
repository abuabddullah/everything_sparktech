import { Request, Response } from 'express'
import { StudyscheduleServices } from './studyschedule.service'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { StatusCodes } from 'http-status-codes'
import pick from '../../../shared/pick'
import { studyscheduleFilterables } from './studyschedule.constants'
import { paginationFields } from '../../../interfaces/pagination'

const createStudyschedule = catchAsync(async (req: Request, res: Response) => {
  const studyscheduleData = { ...req.body }

  if (
    studyscheduleData.calendar &&
    typeof studyscheduleData.calendar === 'string'
  ) {
    // accept YYYY-MM-DD or ISO
    const d = new Date(studyscheduleData.calendar)
    d.setHours(0, 0, 0, 0)
    studyscheduleData.calendar = d
  }

  const result = await StudyscheduleServices.createStudyschedule(
    req.user!,
    studyscheduleData as any,
  )

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Studyschedule created successfully',
    data: result,
  })
})

const updateStudyschedule = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const studyscheduleData = { ...req.body }

  if (
    studyscheduleData.calendar &&
    typeof studyscheduleData.calendar === 'string'
  ) {
    const d = new Date(studyscheduleData.calendar)
    d.setHours(0, 0, 0, 0)
    studyscheduleData.calendar = d
  }

  const result = await StudyscheduleServices.updateStudyschedule(
    id,
    studyscheduleData as any,
  )

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Studyschedule updated successfully',
    data: result,
  })
})

const getSingleStudyschedule = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params
    const result = await StudyscheduleServices.getSingleStudyschedule(id)

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Studyschedule retrieved successfully',
      data: result,
    })
  },
)

const getAllStudyschedules = catchAsync(async (req: Request, res: Response) => {
  const filterables = pick(req.query, studyscheduleFilterables)
  const pagination = pick(req.query, paginationFields)

  const result = await StudyscheduleServices.getAllStudyschedules(
    req.user!,
    filterables,
    pagination,
  )

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Studyschedules retrieved successfully',
    data: result,
  })
})

const deleteStudyschedule = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await StudyscheduleServices.deleteStudyschedule(id, req.user!)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Studyschedule deleted successfully',
    data: result,
  })
})

export const getSchedulesByDate = catchAsync(
  async (req: Request, res: Response) => {
    const { date } = req.query as { date: string }

    const result = await StudyscheduleServices.getSchedulesByDate(
      req.user,
      date,
    )

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Study schedules fetched successfully',
      data: result,
    })
  },
)

export const StudyscheduleController = {
  createStudyschedule,
  updateStudyschedule,
  getSingleStudyschedule,
  getAllStudyschedules,
  deleteStudyschedule,
  getSchedulesByDate,
}
