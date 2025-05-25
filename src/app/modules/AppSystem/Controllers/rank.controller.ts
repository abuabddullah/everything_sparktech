import httpStatus from 'http-status';
import sendResponse from '../../../utils/sendResponse';
import catchAsync from '../../../utils/catchAsync';
import { RankServices } from '../Services/rank.service';

const getUsersByRank = catchAsync(async (req, res) => {
  const result = await RankServices.getUsersByRank(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users are retrieved successfully!',
    data: result,
  });
});

const getUsersByRaisedRank = catchAsync(async (req, res) => {
  const result = await RankServices.getUsersByRaisedRank(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users are retrieved successfully!',
    data: result,
  });
});

export const RankControllers = {
  getUsersByRank,
  getUsersByRaisedRank
};
