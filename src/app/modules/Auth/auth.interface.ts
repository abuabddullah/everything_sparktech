import { Types } from 'mongoose';

export type TLoginUser = {
  email: string;
  password: string;
};

export type TToken = {
  userId: Types.ObjectId;
  role: string;
};
