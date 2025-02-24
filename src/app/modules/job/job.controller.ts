import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { JobService } from './job.service';
import { jwtHelper } from '../../../helpers/jwtHelper';
import config from '../../../config';
import { Secret } from 'jsonwebtoken';

const createJob = catchAsync(async (req: Request, res: Response) => {
  if (req.files && 'image' in req.files && req.files.image[0]) {
    req.body.image = '/images/' + req.files.image[0].filename;
  }
  req.body.postedBy = req.user.id;
  const result = await JobService.createJob(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Job created successfully',
    data: result,
  });
});

const getAllJobs = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const token = req.headers.authorization?.split(' ')[1] as string | undefined;
  const user = token
    ? jwtHelper.verifyToken(token, config.jwt.jwt_secret as Secret)
    : null;
  const result = await JobService.getAllJobs(query, user);
  sendResponse(res, {
    pagination: {
      limit: Number(query.limit) || 10,
      page: Number(query.page) || 1,
      total: result.length,
      totalPage: Math.ceil(result.length / (Number(query.limit) || 10)),
    },

    statusCode: StatusCodes.OK,
    success: true,
    message: 'Jobs fetched successfully',
    data: result,
  });
});

const getJobById = catchAsync(async (req: Request, res: Response) => {
  const result = await JobService.getJobById(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Job fetched successfully',
    data: result,
  });
});

const updateJob = catchAsync(async (req: Request, res: Response) => {
  if (req.files && 'image' in req.files && req.files.image[0]) {
    req.body.image = '/images/' + req.files.image[0].filename;
  }

  const result = await JobService.updateJob(req.params.id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Job updated successfully',
    data: result,
  });
});

const deleteJob = catchAsync(async (req: Request, res: Response) => {
  const result = await JobService.deleteJob(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Job deleted successfully',
    data: result,
  });
});

const getJobStatus = catchAsync(async (req: Request, res: Response) => {
  const user = req.user.id;
  const result = await JobService.getJobStatus(user);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Job status fetched successfully',
    data: result,
  });
});
const getAllJobStatus = catchAsync(async (req: Request, res: Response) => {
  const user = req.user.id;
  const result = await JobService.getAllJobStatus(user);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Job status fetched successfully',
    data: result,
  });
});

export const JobController = {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  getJobStatus,
  getAllJobStatus,
};
