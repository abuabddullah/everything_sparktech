import { Model } from 'mongoose';
import { USER_ROLES } from '../../../enums/user';
import { IVehicle } from '../app_modules/vehicle_modules/vehicle.interface';

export type IUser = {
  name: string;
  designation?: string;
  dateOfBirth?: Date;
  licenseNumber?: string;
  phone?: string;
  address?: string;
  role: USER_ROLES;
  contact?: string;
  email: string;
  password: string;
  location?: string;
  image?: string;
  status: 'active' | 'delete';
  verified: boolean;
  authentication?: {
    isResetPassword: boolean;
    oneTimeCode: number;
    expireAt: Date;
  };
};


// must for mongoose instance methods
export interface IUserMethods {
  getVehicle(): Promise<IVehicle | null>;
}


// Attach static + instance methods
export type UserModal = Model<IUser, {}, IUserMethods> & {
  isExistUserById(id: string): any;
  isExistUserByEmail(email: string): any;
  isMatchPassword(password: string, hashPassword: string): boolean;
};
