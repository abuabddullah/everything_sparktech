import { model, Schema, Query } from 'mongoose';
import { IReview, ReviewModel } from './review.interface';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../../errors/ApiError';
import { ClientModel } from '../client_modules/client.model';

const reviewSchema = new Schema<IReview, ReviewModel>(
     {
          clientEmail: {
               type: String,
               required: true,
          },
          comment: {
               type: String,
               required: true,
          },
          rating: {
               type: Number,
               required: true,
          },
     },
     { timestamps: true },
);

//check user
reviewSchema.post('save', async function () {
     const review = this as IReview;

     if (review.rating < 1 || review.rating > 5) {
          throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid rating value. Try give rating between 1 to 5');
     }

     // Check if client exists using clientEmail
     const clientExists = await ClientModel.findOne({ email: review.clientEmail });
     if (!clientExists) {
          throw new ApiError(StatusCodes.NOT_FOUND, 'Client not found for the provided email');
     }
});
export const Review = model<IReview, ReviewModel>('Review', reviewSchema);
