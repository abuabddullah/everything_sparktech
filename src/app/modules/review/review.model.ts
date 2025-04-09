import { Schema, model } from 'mongoose';
import { IReview, ReviewModel } from './review.interface';

const reviewSchema = new Schema<IReview, ReviewModel>(
  {
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organizations',
      required: true,
    },
    description: { type: String, required: true },
    // replyTo: { type: Schema.Types.ObjectId, ref: 'Review', required: false },
    star: { type: Number, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Review = model<IReview, ReviewModel>('Review', reviewSchema);
