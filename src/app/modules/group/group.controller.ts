import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { GroupService } from './group.service';

const createGroup = catchAsync(async (req: Request, res: Response) => {
  const result = await GroupService.createGroup(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Group created successfully',
    data: result,
  });
});

const getAllGroups = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;

  const result = await GroupService.getAllGroups(query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Groups fetched successfully',
    data: result,
  });
});

const getGroupById = catchAsync(async (req: Request, res: Response) => {
  const result = await GroupService.getGroupById(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Group fetched successfully',
    data: result,
  });
});

const updateGroup = catchAsync(async (req: Request, res: Response) => {
  const result = await GroupService.updateGroup(req.params.id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Group updated successfully',
    data: result,
  });
});

const deleteGroup = catchAsync(async (req: Request, res: Response) => {
  const result = await GroupService.deleteGroup(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Group deleted successfully',
    data: result,
  });
});

const getMyGroup = catchAsync(async (req: Request, res: Response) => {
  const result = await GroupService.getMyGroupFromDB(req.user.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Group fetched successfully',
    data: result,
  });
});
const createPaymentIntent = catchAsync(async (req: Request, res: Response) => {
  const result = await GroupService.createPaymentIntent(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Payment intent created successfully',
    data: result,
  });
});

const joinGroup = catchAsync(async (req: Request, res: Response) => {
  const user = req.user.id;
  const result = await GroupService.joinGroup(req.body, user);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Group joined successfully',
    data: result,
  });
});

const createGroupIndividual = catchAsync(
  async (req: Request, res: Response) => {
    const result = await GroupService.createGroupIndividual(req.body);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Group created successfully',
      data: result,
    });
  }
);

export const GroupController = {
  createGroup,
  getAllGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  getMyGroup,
  createPaymentIntent,
  joinGroup,
  createGroupIndividual,
};
