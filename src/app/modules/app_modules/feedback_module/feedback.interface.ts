import { Types } from "mongoose";

// only client can give feedback
export interface Feedback {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  content: string;
  rating: number; // e.g., 1 to 5 stars
  createdAt: Date;
  updatedAt?: Date;
}