import { StatusCodes } from 'http-status-codes'
import { Types } from 'mongoose'
import AppError from '../../../errors/AppError'
import QueryBuilder from '../../builder/QueryBuilder'
import { IWishlist, IWishlistItem } from './wishlist.interface'
import { Wishlist } from './wishlist.model'

const addToWishlist = async (
  userId: string,
  lessonId: string,
): Promise<IWishlist> => {
  let wishlist = await Wishlist.findOne({ user: userId })

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: userId,
      items: [{ lessonId: lessonId }],
    })
  } else {
    const itemExists = wishlist.items.some(
      (item: IWishlistItem) => item.lessonId.toString() === lessonId,
    )

    if (itemExists) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Lesson already in wishlist')
    }

    wishlist.items.push({ lessonId: new Types.ObjectId(lessonId) })
    await wishlist.save()
  }

  return wishlist.populate('items.lessonId')
}

const removeFromWishlist = async (
  userId: string,
  lessonId: string,
): Promise<IWishlist | null> => {
  const wishlist = await Wishlist.findOneAndUpdate(
    { user: userId },
    { $pull: { items: { lessonId: lessonId } } },
    { new: true },
  ).populate('items.lessonId')

  return wishlist
}

const getWishlist = async (userId: string, query: any) => {
  const querBuilder = new QueryBuilder(
    Wishlist.find({ user: userId }).populate('items.lessonId'),
    query,
  )

  const result = await querBuilder
    .fields()
    .sort()
    .paginate()
    .filter()
    .search([
      'items.lessonId.name',
      'items.lessonId.description',
      'items.lessonId.price',
    ]).modelQuery // Final query model

  const meta = await querBuilder.getPaginationInfo()
  return { result: result[0], meta }
}

const isLessonInWishlist = async (
  userId: string,
  lessonId: string,
): Promise<boolean> => {
  return Wishlist.isLessonInWishlist(
    new Types.ObjectId(userId),
    new Types.ObjectId(lessonId),
  )
}

export const WishlistService = {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  isLessonInWishlist,
}
