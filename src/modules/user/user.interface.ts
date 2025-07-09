import { Model, Types } from 'mongoose';
import { Role } from '../../middlewares/roles';
import { TAuthProvider, TStatusType, TSubscriptionType } from './user.constant';
import { PaginateOptions, PaginateResult } from '../../types/paginate';

export type TProfileImage = {
  imageUrl: string;
  // file: Record<string, any>;
};

export type TPhotoGallery = {
  imageUrl: string;
  file: Record<string, any>;
};

export type TUser = {
  _userId: undefined | Types.ObjectId;
  user_custom_id: string;
  conversation_restrict_with: string[];
  canMessage? : boolean;
  _id:  undefined; // Types.ObjectId |
  personalize_Journey_Id : Types.ObjectId;
  subscriptionType : TSubscriptionType.free | TSubscriptionType.premium;
  status : TStatusType.active | TStatusType.inactive;
  accessPinCode: string;
  lastProvideAccessPinCode : Date;
  name: string;
  email: string;
  password: string;
  address : string;
  profileImage?: TProfileImage;
  fcmToken : string;
  companyLogoImage: string;
  role: Role;

  isEmailVerified: boolean;
  phoneNumber : string;
  isDeleted: boolean;
  lastPasswordChange: Date;
  isResetPassword: boolean;
  failedLoginAttempts: number;
  lockUntil: Date | undefined;
  
  // -- stripe er customer id .. 
  stripe_customer_id : string;
  // -- google  and apple login 
  googleId: string;
  appleId: string;
  authProvider: TAuthProvider.apple | TAuthProvider.google | TAuthProvider.local;
  googleAccessToken : string;
  appleAccessToken : string;
  isGoogleVerified : boolean;
  isAppleVerified : boolean;
  designation? : string; 
  createdAt: Date;
  updatedAt: Date;
};

export interface IUser  {
  _userId: undefined | Types.ObjectId;
  _id:  undefined; // Types.ObjectId |
  personalize_Journey_Id : Types.ObjectId;
  subscriptionType : TSubscriptionType.free | TSubscriptionType.premium;
  status : TStatusType.active | TStatusType.inactive;
  accessPinCode: string;
  name: string;
  email: string;
  password: string;

  address : string;
  profileImage?: TProfileImage;
  fcmToken : string;
  role: Role;

  isEmailVerified: boolean;
  phoneNumber : string;
  isDeleted: boolean;
  lastPasswordChange: Date;
  isResetPassword: boolean;
  failedLoginAttempts: number;
  lockUntil: Date | undefined;
  // -- stripe er customer id .. 
  stripe_customer_id : string;
  // -- google  and apple login 
  googleId: string;
  appleId: string;
  authProvider: TAuthProvider.apple | TAuthProvider.google | TAuthProvider.local;
  googleAccessToken : string;
  appleAccessToken : string;
  isGoogleVerified : boolean;
  isAppleVerified : boolean;
  designation? : string;
  createdAt: Date;
  updatedAt: Date;
};

export interface UserModal extends Model<TUser> {
  paginate: (
    filter: object,
    options: PaginateOptions,
  ) => Promise<PaginateResult<TUser>>;
  isExistUserById(id: string): Promise<Partial<TUser> | null>;
  isExistUserByEmail(email: string): Promise<Partial<TUser> | null>;
  isMatchPassword(password: string, hashPassword: string): Promise<boolean>;
}
