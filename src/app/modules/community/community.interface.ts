import { Model, Types } from 'mongoose';

export interface AnswersItem {
  _id?: Types.ObjectId;
  date: string;
  comments: string
  userId: Types.ObjectId;
  User: string;
}

export interface ICommunityFilterables {
  searchTerm?: string;
  name?: string;
  avatarUrl?: string;
  question?: string;
  details?: string;
}

export interface ICommunity {
  _id: Types.ObjectId;
  userId?: Types.ObjectId;
  avatarUrl?: string;
  question: string;
  details?: string;
  answers?: AnswersItem[];
  answersCount?: number;
  likesCount?: number;
  tags?: string[];
  status?: string;
}

export type CommunityModel = Model<ICommunity, {}, {}>;
