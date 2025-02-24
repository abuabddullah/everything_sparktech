import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { ApplicantService } from './applicant.service';

const createApplicant = catchAsync(async (req: Request, res: Response) => {
  req.body.user = req.user.id;
  const result = await ApplicantService.createApplicant(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Applicant created successfully',
    data: result,
  });
});

const getAllApplicants = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await ApplicantService.getAllApplicants(query);
  sendResponse(res, {
    pagination: {
      limit: Number(query.limit) || 10,
      page: Number(query.page) || 1,
      total: result.length,
      totalPage: Math.ceil(result.length / (Number(query.limit) || 10)),
    },

    statusCode: StatusCodes.OK,
    success: true,
    message: 'Applicants fetched successfully',
    data: result,
  });
});

const getApplicantById = catchAsync(async (req: Request, res: Response) => {
  const result = await ApplicantService.getApplicantById(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Applicant fetched successfully',
    data: result,
  });
});

const updateApplicant = catchAsync(async (req: Request, res: Response) => {
  const result = await ApplicantService.updateApplicant(
    req.params.id,
    req.body
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Applicant updated successfully',
    data: result,
  });
});

const deleteApplicant = catchAsync(async (req: Request, res: Response) => {
  const result = await ApplicantService.deleteApplicant(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Applicant deleted successfully',
    data: result,
  });
});

export const ApplicantController = {
  createApplicant,
  getAllApplicants,
  getApplicantById,
  updateApplicant,
  deleteApplicant,
};
