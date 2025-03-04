import { Model, Types } from 'mongoose';
  
  export type IReview = {
    organization: Types.ObjectId;
  description: string;
  star: number;
  user: Types.ObjectId
  };
  
  export type ReviewModel = Model<IReview>;
