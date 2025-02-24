import { Request, Response } from 'express';
import catchAsync from '../../../../../shared/catchAsync';
import sendResponse from '../../../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { JobService } from './job.service';

const addJobToWishList = catchAsync(async (req: Request, res: Response) => {
  const jobId = req.params.id;
  const userId = req.user.id;
  const result = await JobService.addJobToWishListToDB(jobId, userId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Job Added To WishList successfully',
    data: result,
  });
});
const removeJobFromWishList = catchAsync(
  async (req: Request, res: Response) => {
    const jobId = req.params.id;
    const userId = req.user.id;
    const result = await JobService.removeJobFromWishListFromDB(jobId, userId);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Job Removed From WishList successfully',
      data: result,
    });
  }
);

export const JobController = {
  addJobToWishList,
  removeJobFromWishList,
};
