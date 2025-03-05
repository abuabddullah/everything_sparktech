import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { UserService } from './user.service';
import ApiError from '../../../errors/ApiError';

const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ...userData } = req.body;
    const result = await UserService.createUserToDB(userData);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'User created successfully',
      data: result,
    });
  }
);

const getUserProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await UserService.getUserProfileFromDB(user);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile data retrieved successfully',
    data: result,
  });
});

//update profile
const updateProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    let profile;
    if (req.files && 'profile' in req.files && req.files.profile[0]) {
      profile = `/images/${req.files.profile[0].filename}`;
    }

    const data = {
      profile,
      ...req.body,
    };
    const result = await UserService.updateProfileToDB(user, data);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Profile updated successfully',
      data: result,
    });
  }
);
const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  await UserService.deleteUserFromDB(user);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User deleted successfully',
  });
});

const setUpCreatorPayment = catchAsync(async (req: Request, res: Response) => {
  const data = req.body.data;
  let paths: any[] = [];

  // const paths: any[] = [];
  const ip = req.ip || '0.0.0.0';
  if (req.files && 'KYC' in req.files && req.files.KYC) {
    for (const file of req.files.KYC) {
      paths.push(`/KYCs/${file.filename}`);
    }
  }
  console.log(data);
  const user = req.user;
  if (!req.user.email) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  const result = await UserService.createCreatorStripeAccount(
    data,
    req.files,
    user,
    paths,
    ip
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Connected account created successfully',
    data: result,
  });
});

const getCreatorStatus = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await UserService.getCreatorStatus(user);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Creator status fetched successfully',
    data: result,
  });
});

const getEventStatus = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await UserService.getEventStatus(user);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Event status fetched successfully',
    data: result,
  });
});

const getEarningStatus = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const year = req.query.year || new Date().getFullYear();
  const result = await UserService.getEarningStatus(user, Number(year));
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Earning status fetched successfully',
    data: result,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await UserService.getAllUsers(query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'All Users fetched successfully',
    data: result,
  });
});

export const UserController = {
  createUser,
  getUserProfile,
  updateProfile,
  deleteUser,
  setUpCreatorPayment,
  getCreatorStatus,
  getEventStatus,
  getEarningStatus,
  getAllUsers,
};
