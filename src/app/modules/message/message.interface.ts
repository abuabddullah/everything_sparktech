import { Model, Types } from 'mongoose';

export type IMessage = {
  from: Types.ObjectId;
  to?: Types.ObjectId;
  group?: Types.ObjectId;
  replyTo?: Types.ObjectId;
  message: string;
  images?: [string];
};

export type MessageModel = Model<IMessage>;
