import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import unlinkFile from '../../../shared/unlinkFile';
import generateOTP from '../../../util/generateOTP';
import { IUser } from './user.interface';
import { User } from './user.model';
import config from '../../../config';

const createUserToDB = async (payload: Partial<IUser>): Promise<IUser> => {
  //set role
  payload.role = USER_ROLES.USER;
  const createUser = await User.create(payload);
  if (!createUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
  }

  //send email
  const otp = generateOTP();
  const values = {
    name: createUser.name,
    otp: otp,
    email: createUser.email!,
  };
  const createAccountTemplate = emailTemplate.createAccount(values);
  emailHelper.sendEmail(createAccountTemplate);

  //save to DB
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 3 * 60000),
  };
  await User.findOneAndUpdate(
    { _id: createUser._id },
    { $set: { authentication } }
  );

  return createUser;
};

const createAdminToDB = async (payload: Partial<IUser>): Promise<IUser> => {
  //set role
  payload.role = USER_ROLES.ADMIN;
  payload.verified = true;
  const createAdmin = await User.create(payload); // name, user, password
  if (!createAdmin) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
  }

  
  const values = {
    name: createAdmin.name,
    email: createAdmin.email!,
    password: payload.password!,
  };
  const createAccountTemplate = emailTemplate.createAdminAccount(values);
  emailHelper.sendEmail(createAccountTemplate);

  return createAdmin;
};

const getAllAdminFromDB = async (): Promise<Partial<IUser[]>> => {
  const allAdminArray = await User.find({
    role: "ADMIN"
  });
  if (!allAdminArray) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Admin Not Available!");
  }

  return allAdminArray;
};

const getAnAdminFromDB = async (
  id: string
): Promise<Partial<IUser>> => {
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  return isExistUser;
};

const deleteAnAdminFromDB = async (
  id: string
): Promise<unknown> => {
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  const result = await User.findByIdAndDelete(id)
  return result
};


const createDriverToDB = async (payload: Partial<IUser>): Promise<IUser> => {
  //set role
  payload.role = USER_ROLES.DRIVER;
  payload.verified = true;
  const createDriver = await User.create(payload); // name,dob,image,phone, email , password,licenseNumber
  if (!createDriver) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
  }

  const values = {
    name: createDriver.name,
    email: createDriver.email!,
    password: payload.password!,
  };
  const createAccountTemplate = emailTemplate.createDriverAccount(values);
  emailHelper.sendEmail(createAccountTemplate);

  return createDriver;
};

const getUserProfileFromDB = async (
  user: JwtPayload
): Promise<Partial<IUser>> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  return isExistUser;
};

const updateProfileToDB = async (
  user: JwtPayload,
  payload: Partial<IUser>
): Promise<Partial<IUser | null>> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //unlink file here
  if (payload.image) {
    unlinkFile(isExistUser.image);
  }

  const updateDoc = await User.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return updateDoc;
};

export const UserService = {
  createUserToDB,
  createAdminToDB,
  getAllAdminFromDB,
  getAnAdminFromDB,
  deleteAnAdminFromDB,
  createDriverToDB,
  getUserProfileFromDB,
  updateProfileToDB,
};
