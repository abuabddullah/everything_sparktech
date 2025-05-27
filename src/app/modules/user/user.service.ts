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

const createTeamMemberToDB = async (payload: Partial<IUser>): Promise<IUser> => {
  //set role
  payload.role = USER_ROLES.TEAM_MEMBER;
  payload.verified = true;
  const emailPrefix = payload.name?.trim().replace(/\s+/g, ''); // Removes all spaces
  payload.email = `${emailPrefix}@${config.company.domain}`; // Ensure email is formatted correctly
  if (!payload.password) {
    payload.password = config.company.default_password; // Use default password if not provided
  }
  const createUser = await User.create(payload);
  if (!createUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
  }

  //send email
  const values = {
    name: createUser.name,
    email: createUser.email!,
    password: createUser.password!,
    designation: createUser.designation!,
  };
  const createAccountTemplate = emailTemplate.createTeamMemberAccount(values);
  emailHelper.sendEmail(createAccountTemplate);


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
  if (!payload.password) {
    payload.password = config.company.default_password; // Use default password if not provided
  }
  const createDriver = await User.create(payload); // name,dob,image,phone, email , password,licenseNumber
  if (!createDriver) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
  }

  const values = {
    name: createDriver.name,
    email: createDriver.email!,
    password: createDriver.password!,
  };
  const createAccountTemplate = emailTemplate.createDriverAccount(values);
  emailHelper.sendEmail(createAccountTemplate);

  return createDriver;
};

const getAllDriverFromDB = async (): Promise<Partial<IUser[]>> => {
  const allDriverArray = await User.find({
    role: "DRIVER"
  });
  if (!allDriverArray) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Driver Not Available!");
  }

  // const driversWithVehicles = await Promise.all(
  //   allDriverArray.map(async (user) => {
  //     const userObj = user.toObject(); // Convert to plain object
  //     if (user.role === USER_ROLES.DRIVER) {
  //       const vehicle = await user.getVehicle();
  //       return {
  //         ...userObj,
  //         vehicle, // Add vehicle info only for drivers
  //       };
  //     }
  //     return userObj;
  //   })
  // );

  return allDriverArray;
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
  createTeamMemberToDB,
  createAdminToDB,
  getAllAdminFromDB,
  getAnAdminFromDB,
  deleteAnAdminFromDB,
  createDriverToDB,
  getAllDriverFromDB,
  getUserProfileFromDB,
  updateProfileToDB,
};
