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
import mongoose from 'mongoose';
import { BookingModel } from '../app_modules/booking_modules/booking.model';
import { BOOKING_STATUS } from '../../../enums/booking';
import QueryBuilder from '../../builder/QueryBuilder';

const createUserToDB = async (payload: Partial<IUser>) => {
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
    expireAt: new Date(Date.now() + Number(config.generic.otp_time) * 60000),
  };
  await User.findOneAndUpdate(
    { _id: createUser._id },
    { $set: { authentication } }
  );

  return createUser;
};

const createTeamMemberToDB = async (payload: Partial<IUser>) => {
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

const updateTeamMemberByIdToDB = async (
  id: string,
  payload: Partial<IUser>
): Promise<Partial<IUser | null>> => {
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  const updateDoc = await User.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return updateDoc;
};

const deleteTeamMemberByIdFromDB = async (
  userId: string,
  id: string
): Promise<unknown> => {
  // Prevent self-delete
  if (userId === id) {
    throw new ApiError(StatusCodes.FORBIDDEN, "You cannot delete your own account!");
  }

  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  if (isExistUser.role !== USER_ROLES.TEAM_MEMBER) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User is not a team member!");
  }

  const result = await User.findByIdAndDelete(id);
  return result;
};

const getTeamMemberByIdFromDB = async (
  id: string
): Promise<Partial<IUser>> => {
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  if (isExistUser.role !== USER_ROLES.TEAM_MEMBER) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User is not a team member!");
  }
  return isExistUser;
};

const createAdminToDB = async (payload: Partial<IUser>) => {
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

const getAllAdminFromDB = async () => {
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
  userId: string,
  id: string
): Promise<unknown> => {
  // Prevent self-delete
  if (userId === id) {
    throw new ApiError(StatusCodes.FORBIDDEN, "You cannot delete your own account!");
  }

  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  const result = await User.findByIdAndDelete(id);
  return result;
};


const updateAnAdminByIdToDB = async (
  id: string,
  payload: Partial<IUser>
): Promise<Partial<IUser | null>> => {
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  const updateDoc = await User.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return updateDoc;
};


const createDriverToDB = async (payload: Partial<IUser>) => {
  //set role
  payload.role = USER_ROLES.DRIVER;
  payload.verified = true;
  if (!payload.password) {
    payload.password = config.company.default_password; // Use default password if not provided
  }
  // is alerady exist as driver check via lic
  const isExistDriver = await User.findOne({ licenseNumber: payload.licenseNumber })
  if (isExistDriver) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "The licenseNumber must be unique for each driver")
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

const getAllDriverFromDB = async () => {
  const allDriverArray = await User.find({
    role: "DRIVER"
  });
  if (!allDriverArray) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Driver Not Available!");
  }

  return allDriverArray;
};



const getADriverFromDB = async (
  id: string
): Promise<Partial<IUser>> => {
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  return isExistUser;
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

const deleteADriverFromDB = async (
  userId: string,
  id: string
): Promise<unknown> => {
  // Prevent self-delete
  if (userId === id) {
    throw new ApiError(StatusCodes.FORBIDDEN, "You cannot delete your own account!");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const isExistUser = await User.isExistUserById(id);
    if (!isExistUser) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }

    if (isExistUser.role !== USER_ROLES.DRIVER) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "User is not a driver!");
    }


    // Prevent deleting if any bookings are in ONRIDE
    const onRideBooking = await BookingModel.findOne({
      driverId: id,
      status: BOOKING_STATUS.ON_RIDE
    }).session(session);
    console.log({ onRideBooking })
    if (onRideBooking) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Cannot delete driver with active ONRIDE bookings.");
    }

    // Set driver to null for all pending bookings assigned to this driver
    await BookingModel.updateMany(
      { driverId: id, status: { $in: [BOOKING_STATUS.CANCELLED, BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.NOT_CONFIRMED] } },
      { $set: { driverId: null } },
      { session }
    );

    const result = await User.findByIdAndDelete(id, { session });

    await session.commitTransaction();
    session.endSession();

    return result;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getAllTeamMemberFromDB = async (query: Record<string, unknown>) => {
  const allTeamMembersQueryBuilder = new QueryBuilder(User.find({
    role: USER_ROLES.TEAM_MEMBER
  }), query)
    .search([
      'name',
      'designation'
    ])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await allTeamMembersQueryBuilder.modelQuery;
  const meta = await allTeamMembersQueryBuilder.getPaginationInfo();

  return {
    meta,
    result,
  };
};

export const UserService = {
  createUserToDB,
  createTeamMemberToDB,
  updateTeamMemberByIdToDB,
  deleteTeamMemberByIdFromDB,
  getTeamMemberByIdFromDB,
  createAdminToDB,
  getAllAdminFromDB,
  getAnAdminFromDB,
  deleteAnAdminFromDB,
  updateAnAdminByIdToDB,
  createDriverToDB,
  getAllDriverFromDB,
  getADriverFromDB,
  getUserProfileFromDB,
  updateProfileToDB,
  deleteADriverFromDB,
  getAllTeamMemberFromDB
};
