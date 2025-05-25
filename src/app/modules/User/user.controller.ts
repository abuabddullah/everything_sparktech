import httpStatus from 'http-status';
import config from '../../config';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { UserServices } from './user.service';

const createUser = catchAsync(async (req, res) => {
  const token = req.headers.authorization as string;
  const result = await UserServices.createUserIntoDB(token);
  const { refreshToken, accessToken } = result;

  res.cookie('refreshToken', refreshToken, {
    secure: config.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'none',
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User is created in successfully!',
    data: { accessToken },
  });
});

const getMe = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const result = await UserServices.getMe(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User is retrieved successfully',
    data: result,
  });
});

const viewDetailes = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await UserServices.getMe(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User is retrieved successfully',
    data: result,
  });
});

const changeStatus = catchAsync(async (req, res) => {
  const id = req.params.id;

  const result = await UserServices.changeStatus(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Status is updated successfully',
    data: result,
  });
});

const addView = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await UserServices.addView(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'View added successfully',
    data: result,
  });
});

const updateProfileImg = catchAsync(async (req, res) => {
  const result = await UserServices.updateProfileImgInDB(req.file, req.user);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile image is updated successfully',
    data: result,
  });
});

const updateUser = catchAsync(async (req, res) => {
  const id = req.params.id;

  const result = await UserServices.updateUser(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User is updated successfully',
    data: result,
  });
});

const deleteUser = catchAsync(async (req, res) => {
  const id = req.params.id;

  const result = await UserServices.deleteUser(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User is deleted successfully',
    data: result,
  });
});

const getAllUsers = catchAsync(async (req, res) => {
  const result = await UserServices.getAllUsersFromDB(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'users are retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getAllRefferdUsers = catchAsync(async (req, res) => {
  const result = await UserServices.getAllRefferdUsersFromDB(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'users are retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

export const UserControllers = {
  createUser,
  getMe,
  changeStatus,
  updateProfileImg,
  viewDetailes,
  addView,
  updateUser,
  deleteUser,
  getAllUsers,
  getAllRefferdUsers,
};
