import { Model, Types } from 'mongoose';

export type IReview = {
  organization: Types.ObjectId;
  description: string;
  star: number;
  replyTo?: Types.ObjectId;
  user: Types.ObjectId;
};

export type ReviewModel = Model<IReview>;
