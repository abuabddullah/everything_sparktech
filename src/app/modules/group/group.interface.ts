import { Model, Types } from 'mongoose';

export type IGroup = {
  _id?: Types.ObjectId;
  name: string;
  members?: [Types.ObjectId];
  is2Message?: boolean;
  event?: Types.ObjectId;
};

export type GroupModel = Model<IGroup>;
