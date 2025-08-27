import { StatusCodes } from 'http-status-codes'
import mongoose, { Types } from 'mongoose'
import QueryBuilder from '../../builder/QueryBuilder'
import { IJwtPayload } from '../auth/auth.interface'
import Settings from '../settings/settings.model'
import { ReviewsType } from './Reviews.enum'
import { IReviews } from './Reviews.interface'
import { Reviews } from './Reviews.model'
import AppError from '../../../errors/AppError'
import { USER_ROLES } from '../../../enum/user'

const createReviews = async (
  payload: IReviews,
  user: IJwtPayload,
): Promise<IReviews> => {
  // if payload.type = Settings then refferenceId is the id of setting
  if (payload.type === ReviewsType.SETTINGS) {
    const isExistSetting = await Settings.findOne().select('_id')
    if (!isExistSetting) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid referenceId.')
    }
    payload.refferenceId = isExistSetting._id as Types.ObjectId
  }
  // step 0: check if review already exists for this refferenceId and type by the user
  const isExistReview = await Reviews.findOne({
    refferenceId: payload.refferenceId,
    type: payload.type,
    createdBy: user.id,
  })
  if (isExistReview) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'You have already reviewed this. Can only update the review.',
    )
  }

  // Step 1: Check if the referenced document exists based on `type` and `refferenceId`
  const isExistRefference = await mongoose
    .model(payload.type)
    .findById(payload.refferenceId) // Booking | User | Settings

  if (!isExistRefference) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid referenceId.')
  }

  // Step 2: Create the FAQ document
  payload.createdBy = new mongoose.Types.ObjectId(user.id)
  const result = await Reviews.create(payload)

  // Step 3: Update the referenced document (add the newly created FAQ to `faqs` array)
  const updatedRefference = await mongoose
    .model(payload.type)
    .findByIdAndUpdate(
      payload.refferenceId,
      { $push: { reviews: result._id } },
      { new: true },
    )
  if (!updatedRefference) {
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to update referenced document',
    )
  }

  return result // Return the newly created FAQ document
}

const getAllReviewsByTypes = async (
  type: string,
  query: Record<string, any>,
): Promise<{
  meta: { total: number; page: number; limit: number }
  result: IReviews[]
}> => {
  const queryBuilder = new QueryBuilder(
    Reviews.find({ type }).populate('createdBy', 'image full_name'),
    query,
  )
  const result = await queryBuilder.filter().sort().paginate().fields()
    .modelQuery
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Reviews not found.')
  }
  const meta = await queryBuilder.getPaginationInfo()
  return { meta, result }
}

const getAllUnpaginatedReviewsByType = async (
  type: string,
): Promise<IReviews[]> => {
  const result = await Reviews.find({ type }).populate(
    'createdBy',
    'image full_name',
  )
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Reviews not found.')
  }
  return result
}

const updateReviews = async (
  id: string,
  payload: Partial<IReviews>,
  user: IJwtPayload,
): Promise<IReviews | null> => {
  const isExist = await Reviews.findOne({ _id: id, createdBy: user.id })
  if (!isExist) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      'Review not found or you are not authorized to update this review.',
    )
  }

  return await Reviews.findByIdAndUpdate(id, payload, { new: true })
}

const deleteReviews = async (
  id: string,
  user: IJwtPayload,
): Promise<IReviews | null> => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    let result
    if (user.role === USER_ROLES.STUDENT || user.role === USER_ROLES.TEACHER) {
      result = await Reviews.findOne({ _id: id, createdBy: user.id }).session(
        session,
      )
    } else {
      result = await Reviews.findById(id).session(session)
    }
    if (!result) {
      throw new AppError(
        StatusCodes.NOT_FOUND,
        'Review not found or you are not authorized to delete this review.',
      )
    }

    result.isDeleted = true
    result.deletedAt = new Date()
    result.deletedBy = new mongoose.Types.ObjectId(user.id)
    await result.save({ session })

    if (result.refferenceId) {
      const refModel = mongoose.model(result.type)
      const isExistRefference = await refModel
        .findById(result.refferenceId)
        .session(session)

      if (isExistRefference) {
        isExistRefference.reviews.pull(id)
        await isExistRefference.save({ session })
      }
    }

    await session.commitTransaction()
    session.endSession()

    return result
  } catch (err) {
    await session.abortTransaction()
    session.endSession()
    throw err
  }
}

const hardDeleteReviews = async (id: string): Promise<IReviews | null> => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const result = await Reviews.findByIdAndDelete(id).session(session)
    if (!result) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Review not found.')
    }

    if (result.refferenceId) {
      const refModel = mongoose.model(result.type)
      const isExistRefference = await refModel
        .findById(result.refferenceId)
        .session(session)

      if (isExistRefference) {
        isExistRefference.reviews.pull(id)
        await isExistRefference.save({ session })
      }
    }

    await session.commitTransaction()
    session.endSession()

    return result
  } catch (err) {
    await session.abortTransaction()
    session.endSession()
    throw err
  }
}

const getReviewsById = async (id: string): Promise<IReviews | null> => {
  const result = await Reviews.findById(id)
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Review not found.')
  }
  return result
}

export const ReviewsService = {
  createReviews,
  getAllReviewsByTypes,
  getAllUnpaginatedReviewsByType,
  updateReviews,
  deleteReviews,
  hardDeleteReviews,
  getReviewsById,
}
