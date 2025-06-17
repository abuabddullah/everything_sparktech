import mongoose from 'mongoose';
import { IReview, IReviewsWithMeta } from './review.interface';
import { Review } from './review.model';
import { StatusCodes } from 'http-status-codes';
import { ClientModel } from '../client_modules/client.model';
import ApiError from '../../../../errors/ApiError';
import QueryBuilder from '../../../builder/QueryBuilder';

const createReviewToDB = async (payload: IReview): Promise<IReview> => {
     // check payload.rating range
     if (payload.rating < 1 || payload.rating > 5) {
          throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid rating value. Try give rating between 1 to 5');
     }
     // check if its not client throw error
     const clientExists = await ClientModel.findOne({ email: payload.clientEmail });
     if (!clientExists) {
          throw new ApiError(StatusCodes.NOT_FOUND, 'Client not found for the provided email');
     }
     // Check if a review already exists for the given client email
     const existingReview = await Review.findOne({ clientEmail: payload.clientEmail });
     console.log(existingReview)
     let result;
     if (existingReview) {
          // Update the existing review
          result = await Review.findOneAndUpdate(
               { clientEmail: payload.clientEmail },
               payload,
               { new: true }
          );
     } else {
          // Create a new review
          result = await Review.create(payload);
     }

     if (!result) {
          throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed To create or update Review');
     }
     return result;
};


const getAllReviewsFromDB = async (query: Record<string, unknown>) => {

     // Fetch reviews and let the pre('find') hook calculate rating stats
     const reviewsQueryBuilder = new QueryBuilder(Review.find(), query)
          .filter()
          .sort()
          .paginate()
          .fields();

     const reviews = await reviewsQueryBuilder.modelQuery;
     const meta = await reviewsQueryBuilder.getPaginationInfo();

     const ratingValues = reviews.map(r => Number(r.rating)).filter(r => !isNaN(r));
     const totalRating = ratingValues.reduce((sum, r) => sum + r, 0);
     const ratingCount = ratingValues.length;
     const averageRating = ratingCount > 0 ? Number((totalRating / ratingCount).toFixed(1)) : 0;

     const reviewsMetaData = {
          ratingCount,
          averageRating,
     };
     // You can return reviewsMetaData if needed, or just reviews
     return { reviews, reviewsMetaData, meta };
};

const deleteReviewByIdToDB = async (id: string) => {
     const result = await Review.findByIdAndDelete(id)
     return result
};

export const ReviewService = { createReviewToDB, getAllReviewsFromDB, deleteReviewByIdToDB };
