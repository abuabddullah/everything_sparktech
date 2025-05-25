import httpStatus from 'http-status';
import sendResponse from '../../../utils/sendResponse';
import catchAsync from '../../../utils/catchAsync';
import { FameServices } from '../Services/fame.service';

const mostViewed = catchAsync(async (req, res) => {
  const result = await FameServices.mostViewed();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User is retrieved successfully!',
    data: result,
  });
});

const highestInvestor = catchAsync(async (req, res) => {
  const result = await FameServices.highestInvestor();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User is retrieved successfully!',
    data: result,
  });
});

const consecutivelyToper = catchAsync(async (req, res) => {
  const result = await FameServices.consecutivelyToper();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User is retrieved successfully!',
    data: result,
  });
});

export const FameControllers = {
  mostViewed,
  highestInvestor,
  consecutivelyToper
};
