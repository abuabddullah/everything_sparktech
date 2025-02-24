import { Model, Types } from 'mongoose';

export type IInfo = {
  name: string;
  content: string;
};

export type InfoModel = Model<IInfo>;
