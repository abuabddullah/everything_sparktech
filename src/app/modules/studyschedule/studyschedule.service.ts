import { StatusCodes } from 'http-status-codes'
import ApiError from '../../../errors/ApiError'
import {
  IStudyscheduleFilterables,
  IStudyschedule,
} from './studyschedule.interface'
import { Studyschedule } from './studyschedule.model'
import { Jwt, JwtPayload } from 'jsonwebtoken'
import { IPaginationOptions } from '../../../interfaces/pagination'
import { paginationHelper } from '../../../helpers/paginationHelper'
import { studyscheduleSearchableFields } from './studyschedule.constants'
import { Types } from 'mongoose'

const createStudyschedule = async (
  user: JwtPayload,
  payload: IStudyschedule,
): Promise<IStudyschedule> => {
  try {
    const result = await Studyschedule.create({
      ...payload,
      createdBy: user.authId,
    })
    if (!result) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Failed to create Studyschedule, please try again with valid data.',
      )
    }

    return result
  } catch (error: any) {
    if (error.code === 11000) {
      throw new ApiError(StatusCodes.CONFLICT, 'Duplicate entry found')
    }
    throw error
  }
}

const getAllStudyschedules = async (
  user: JwtPayload,
  filterables: IStudyscheduleFilterables,
  pagination: IPaginationOptions,
) => {
  const { searchTerm, ...filterData } = filterables
  const { page, skip, limit, sortBy, sortOrder } =
    paginationHelper.calculatePagination(pagination)

  const andConditions = []

  // Search functionality
  if (searchTerm) {
    andConditions.push({
      $or: studyscheduleSearchableFields.map(field => ({
        [field]: {
          $regex: searchTerm,
          $options: 'i',
        },
      })),
    })
  }

  // Filter functionality
  if (Object.keys(filterData).length) {
    andConditions.push({
      $and: Object.entries(filterData).map(([key, value]) => ({
        [key]: value,
      })),
    })
  }

  const whereConditions = andConditions.length ? { $and: andConditions } : {}

  const [result, total] = await Promise.all([
    Studyschedule.find(whereConditions)
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder })
      .populate('createdBy'),
    Studyschedule.countDocuments(whereConditions),
  ])

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: result,
  }
}

const getSingleStudyschedule = async (id: string): Promise<IStudyschedule> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Studyschedule ID')
  }

  const result = await Studyschedule.findById(id).populate('createdBy')
  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Requested studyschedule not found, please try again with valid id',
    )
  }

  return result
}

const updateStudyschedule = async (
  id: string,
  payload: Partial<IStudyschedule>,
): Promise<IStudyschedule | null> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Studyschedule ID')
  }

  const result = await Studyschedule.findByIdAndUpdate(
    new Types.ObjectId(id),
    { $set: payload },
    {
      new: true,
      runValidators: true,
    },
  ).populate('createdBy')

  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Requested studyschedule not found, please try again with valid id',
    )
  }

  return result
}

const deleteStudyschedule = async (
  id: string,
  user: JwtPayload,
): Promise<IStudyschedule> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Studyschedule ID')
  }

  const isExistSchedule = await Studyschedule.findById(id)
  if (!isExistSchedule) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Requested studyschedule not found, please try again with valid id',
    )
  }

  if (isExistSchedule.createdBy.toString() !== user?.authId) {
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      'You are not authorized to delete this studyschedule.',
    )
  }

  const result = await Studyschedule.findByIdAndDelete(id)
  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Something went wrong while deleting studyschedule, please try again with valid id.',
    )
  }

  return result
}

const getSchedulesByDate = async (
  user: JwtPayload | undefined,
  date: string,
) => {
  const dayStart = new Date(date)
  dayStart.setHours(0, 0, 0, 0)

  const dayEnd = new Date(date)
  dayEnd.setHours(23, 59, 59, 999)

  return await Studyschedule.find({
    createdBy: user?.authId,
    calendar: { $gte: dayStart, $lte: dayEnd },
    isDeleted: false,
  }).populate('createdBy').lean()
}

export const StudyscheduleServices = {
  createStudyschedule,
  getAllStudyschedules,
  getSingleStudyschedule,
  updateStudyschedule,
  deleteStudyschedule,
  getSchedulesByDate,
}
