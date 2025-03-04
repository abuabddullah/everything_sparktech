import { Model, Types } from 'mongoose';

export type INotification = {
  user?: Types.ObjectId;
  description: string;
  title: string;
};

export type NotificationModel = Model<INotification>;
