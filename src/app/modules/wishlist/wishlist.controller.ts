import { Request, Response } from 'express'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { WishlistService } from './wishlist.service'
import { StatusCodes } from 'http-status-codes'

const addToWishlist = catchAsync(async (req: Request, res: Response) => {
  const { lessonId } = req.body

  const { authId } = req.user as any

  const result = await WishlistService.addToWishlist(authId, lessonId)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Lesson added to wishlist',
    data: result,
  })
})

const removeFromWishlist = catchAsync(async (req: Request, res: Response) => {
  const { lessonId } = req.params

  const { authId } = req.user as any

  const result = await WishlistService.removeFromWishlist(authId, lessonId)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Lesson removed from wishlist',
    data: result,
  })
})

const getWishlist = catchAsync(async (req: Request, res: Response) => {
  const { authId } = req.user as any

  const result = await WishlistService.getWishlist(authId, req.query)

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

    const { authId } = req.user as any

    const isInWishlist = await WishlistService.isLessonInWishlist(
      authId,
      lessonId,
    )

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
