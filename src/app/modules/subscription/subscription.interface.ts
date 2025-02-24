import { Model, Types } from 'mongoose';

export type ISubscription = {
  email: string;
  user: Types.ObjectId;
  package: Types.ObjectId;
  subscriptionId: string;
  trxId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

export type SubscriptionModel = Model<ISubscription>;
