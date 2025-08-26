import { Model, Types } from 'mongoose';

export interface IStudyscheduleFilterables {
  searchTerm?: string;
  title?: string;
  description?: string;
}

export interface IStudyschedule {
  _id: Types.ObjectId;
  calendar: Date;
  title: string;
  description?: string;
  createdBy: Types.ObjectId;
  isDeleted: boolean;
}

export type StudyscheduleModel = Model<IStudyschedule, {}, {}>;
