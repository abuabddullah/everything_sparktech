import { Model, Types } from 'mongoose';

export type IReview = {
     clientEmail: string;
     comment: string;
     rating: number;
};

export
     interface IReviewsWithMeta {
     reviews: IReview[];
     meta: {
          totalRating?: number;
          ratingCount: number;
          averageRating: number;
     };
}

export type ReviewModel = Model<IReview>;