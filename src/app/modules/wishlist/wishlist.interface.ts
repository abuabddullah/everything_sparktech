import { Document, Types } from 'mongoose'

export interface IWishlistItem {
  lessonId: Types.ObjectId
  addedAt: Date
}

export interface IWishlist extends Document {
  user: Types.ObjectId
  items: IWishlistItem[]
  createdAt: Date
  updatedAt: Date
}

export type IWishlistModel = {
  isLessonInWishlist(
    userId: Types.ObjectId,
    lessonId: Types.ObjectId,
  ): Promise<boolean>
} & typeof import('mongoose').Model<IWishlist>
