import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { InfoService } from './info.service';

const createInfo = catchAsync(async (req: Request, res: Response) => {
  const result = await InfoService.createInfo(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Info created successfully',
    data: result,
  });
});

const getAllInfos = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await InfoService.getAllInfos(query);
  sendResponse(res, {
    pagination: {
      limit: Number(query.limit) || 10,
      page: Number(query.page) || 1,
      total: result.length,
      totalPage: Math.ceil(result.length / (Number(query.limit) || 10)),
    },

    statusCode: StatusCodes.OK,
    success: true,
    message: 'Infos fetched successfully',
    data: result,
  });
});

const getInfoById = catchAsync(async (req: Request, res: Response) => {
  const result = await InfoService.getInfoById(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Info fetched successfully',
    data: result,
  });
});

export const InfoController = {
  createInfo,
  getAllInfos,
  getInfoById,
};
