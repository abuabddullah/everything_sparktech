import { Schema, model } from 'mongoose'
import { IWishlist, IWishlistModel } from './wishlist.interface'

const wishlistItemSchema = new Schema({
  lessonId: {
    type: Schema.Types.ObjectId,
    ref: 'StudyLesson',
    required: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
})

const wishlistSchema = new Schema<IWishlist, IWishlistModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [wishlistItemSchema],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
)

// Check if lessonId is in user's wishlist
wishlistSchema.statics.isLessonInWishlist = async function (
  userId: string,
  lessonId: string,
): Promise<boolean> {
  const wishlist = await this.findOne({
    user: userId,
    'items.lessonId': lessonId,
  })
  return !!wishlist
}

export const Wishlist = model<IWishlist, IWishlistModel>(
  'Wishlist',
  wishlistSchema,
)
