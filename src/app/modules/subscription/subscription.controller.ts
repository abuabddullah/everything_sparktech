import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { SubscriptionService } from './subscription.service';
import { IJwtPayload } from '../auth/auth.interface';

const createSubscription = catchAsync(async (req: Request, res: Response) => {
  const {id,email} = req.user as IJwtPayload;
  const result = await SubscriptionService.createSubscription({
    ...req.body,
    user:id,
    email
  });
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Subscription created successfully',
    data: result,
  });
});

const getAllSubscriptions = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await SubscriptionService.getAllSubscriptions(query);
  sendResponse(res, {
    pagination: {
      limit: Number(query.limit) || 10,
      page: Number(query.page) || 1,
      total: result.length,
      totalPage: Math.ceil(result.length / (Number(query.limit) || 10)),
    },

    statusCode: StatusCodes.OK,
    success: true,
    message: 'Subscriptions fetched successfully',
    data: result,
  });
});

const getSubscriptionById = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionService.getSubscriptionById(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Subscription fetched successfully',
    data: result,
  });
});

const updateSubscription = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionService.updateSubscription(
    req.params.id,
    req.body
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Subscription updated successfully',
    data: result,
  });
});

const deleteSubscription = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionService.deleteSubscription(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Subscription deleted successfully',
    data: result,
  });
});

const getMySubscriptions = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionService.getMySubscriptions(req.user.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Subscription fetched successfully',
    data: result,
  });
});

export const SubscriptionController = {
  createSubscription,
  getAllSubscriptions,
  getSubscriptionById,
  updateSubscription,
  deleteSubscription,
  getMySubscriptions,
};
