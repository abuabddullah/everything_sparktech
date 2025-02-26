import { Model, Types } from 'mongoose';
import { USER_ROLES } from '../../../enums/user';

export type IUser = {
  name: string;
  role: USER_ROLES;
  contact?: string;
  email: string;
  password: string;
  location: string;
  profile?: string;
  status: 'active' | 'delete';
  eventWishList: Array<Types.ObjectId>;
  jobWishList: Array<Types.ObjectId>;
  verified: boolean;
  isSubscribed: boolean;
  allowedEventPost: number;
  allowedJobPost: number;
  accountInformation?: {
    bankAccountNumber?: string;
    stripeAccountId?: string;
    externalAccountId?: string;
    status?: string;
  };
  stripeAccountInfo?: {
    stripeCustomerId?: string;
    loginUrl?: string;
  } | null;
  authentication?: {
    isResetPassword: boolean;
    oneTimeCode: number;
    expireAt: Date;
  };
};

export type UserModal = {
  isExistUserById(id: string): any;
  isExistUserByEmail(email: string): any;
  isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<IUser>;
