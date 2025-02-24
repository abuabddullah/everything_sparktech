import { Model, Types } from 'mongoose';

export type IGroup = {
  _id?: Types.ObjectId;
  name: string;
  members?: [Types.ObjectId];
  event?: Types.ObjectId;
};

export type GroupModel = Model<IGroup>;
