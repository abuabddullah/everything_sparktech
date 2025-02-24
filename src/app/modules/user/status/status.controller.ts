import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { StatusService } from './status.service';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';
const getAllStatus = catchAsync(async (req: Request, res: Response) => {
  const year = req.query.year;
  const result = await StatusService.getAllStatusFromDB(Number(year));
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Status fetched successfully',
    data: result,
  });
});

export const StatusController = {
  getAllStatus,
};
