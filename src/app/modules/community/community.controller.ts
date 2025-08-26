import { Request, Response } from 'express';
import { CommunityServices } from './community.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import pick from '../../../shared/pick';
import { communityFilterables } from './community.constants';
import { paginationFields } from '../../../interfaces/pagination';

const createCommunity = catchAsync(async (req: Request, res: Response) => {
  const communityData = req.body;

  const user = req?.user;

  const result = await CommunityServices.createCommunity(
    user,
    communityData
  );

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Community created successfully',
    data: result,
  });
});

const updateCommunity = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const communityData = req.body;
  const user = req.user;
  const result = await CommunityServices.updateCommunity(id, user, communityData);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Community updated successfully',
    data: result?.question,
  });
});

const getSingleCommunity = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CommunityServices.getSingleCommunity(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Community retrieved successfully',
    data: result,
  });
});

const getAllCommunitys = catchAsync(async (req: Request, res: Response) => {
  const filterables = pick(req.query, communityFilterables);
  const pagination = pick(req.query, paginationFields);

  const result = await CommunityServices.getAllCommunitys(
    req.user!,
    filterables,
    pagination
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Communitys retrieved successfully',
    data: result,
  });
});

const deleteCommunity = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user;

   const result = await CommunityServices.deleteCommunity(id, user);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Community deleted successfully',
    data: result,
  });
});

const addAnswer = catchAsync(async (req: Request, res: Response) => {
  const { communityId } = req.params;
  const user = req.user;
  const answerData = req.body;

  const result = await CommunityServices.addAnswer(communityId, user, answerData);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Answer added successfully',
    data: result,
  });
});




const deleteAnswer = catchAsync(async (req: Request, res: Response) => {
  const { communityId, answerId } = req.params;
  const user = req.user;

  const result  = await CommunityServices.deleteAnswer(communityId, answerId, user);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Answer deleted successfully',
    data: result,
  });
});

const updateAnswer = catchAsync(async (req: Request, res: Response) => {
  const { communityId, answerId } = req.params;
  const user = req.user;
  const answerData = req.body;

  const result = await CommunityServices.updateAnswer(communityId, answerId, user, answerData);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Answer updated successfully',
    data: result,
  });
});

export const CommunityController = {
  createCommunity,
  updateCommunity,
  getSingleCommunity,
  getAllCommunitys,
  deleteCommunity,
  addAnswer,
  deleteAnswer,
  updateAnswer
};