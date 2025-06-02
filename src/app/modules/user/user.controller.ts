import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import { getSingleFilePath } from '../../../shared/getFilePath';
import sendResponse from '../../../shared/sendResponse';
import { UserService } from './user.service';

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

const createTeamMember = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let image = getSingleFilePath(req.files, 'image');
    const userData = {
      ...req.body,
      image,
    };
    const result = await UserService.createTeamMemberToDB(userData);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'User created successfully',
      data: result,
    });
  }
);

const updateTeamMemberById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    let image = getSingleFilePath(req.files, 'image');
    const userData = {
      ...req.body,
      image,
    };
    const result = await UserService.updateTeamMemberByIdToDB(id, userData);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Team member updated successfully',
      data: result,
    });
  }
);

const deleteTeamMemberById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user._id;
    const { id } = req.params;
    const result = await UserService.deleteTeamMemberByIdFromDB(userId, id);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Team member deleted successfully',
      data: result,
    });
  }
);

const getTeamMemberById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserService.getTeamMemberByIdFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Team member data retrieved successfully',
    data: result,
  });
});

const createAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ...userData } = req.body; // name, email , password
    const result = await UserService.createAdminToDB(userData);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'User created successfully',
      data: result,
    });
  }
);

const getAllAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllAdminFromDB();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile data retrieved successfully',
    data: result,
  });
});

const getAnAdmin = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserService.getAnAdminFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile data retrieved successfully',
    data: result,
  });
});

const deleteAnAdmin = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user._id
  const { id } = req.params;
  const result = await UserService.deleteAnAdminFromDB(userId, id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Admin deleted successfully',
    data: result,
  });
});

const updateAnAdminById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req?.user?._id
    const { id } = req.params;
    if (userId == id) {
      throw {
        statusCode: StatusCodes.FORBIDDEN,
        message: 'You are not authorized to update this admin',
      };
    }


    const result = await UserService.updateAnAdminByIdToDB(id, req.body);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Admin updated successfully',
      data: result,
    });
  }
);


const createDriver = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserService.createDriverToDB(req.body);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Driver created successfully',
      data: result,
    });
  }
);


const getAllDriver = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllDriverFromDB();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile data retrieved successfully',
    data: result,
  });
});



const getADriver = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserService.getADriverFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile data retrieved successfully',
    data: result,
  });
});

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
    let image = getSingleFilePath(req.files, 'image');

    const data = {
      image,
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

const deleteADriver = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user._id;
  const { id } = req.params;
  const result = await UserService.deleteADriverFromDB(userId, id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Driver deleted successfully',
    data: result,
  });
});

export const UserController = { createUser, createTeamMember, updateTeamMemberById, deleteTeamMemberById,getTeamMemberById, createAdmin, getAllAdmin, getAnAdmin, deleteAnAdmin, updateAnAdminById, createDriver, getAllDriver, getADriver, getUserProfile, updateProfile, deleteADriver };
