import { Request, Response } from 'express'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { WishlistService } from './wishlist.service'
import { StatusCodes } from 'http-status-codes'
import { IJwtPayload } from '../auth/auth.interface'

const addToWishlist = catchAsync(async (req: Request, res: Response) => {
  const { lessonId } = req.body

  const { id } = req.user as IJwtPayload

  const result = await WishlistService.addToWishlist(id, lessonId)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Lesson added to wishlist',
    data: result,
  })
})

const removeFromWishlist = catchAsync(async (req: Request, res: Response) => {
  const { lessonId } = req.params

  const { id } = req.user as IJwtPayload

  const result = await WishlistService.removeFromWishlist(id, lessonId)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Lesson removed from wishlist',
    data: result,
  })
})

const getWishlist = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.user as IJwtPayload

  const result = await WishlistService.getWishlist(id, req.query)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Wishlist retrieved successfully',
    data: result || { items: [] },
  })
})

const checkLessonInWishlist = catchAsync(
  async (req: Request, res: Response) => {
    const { lessonId } = req.params

    const { id } = req.user as IJwtPayload

    const isInWishlist = await WishlistService.isLessonInWishlist(id, lessonId)

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Wishlist status retrieved',
      data: { isInWishlist },
    })
  },
)

export const WishlistController = {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  checkLessonInWishlist,
}
