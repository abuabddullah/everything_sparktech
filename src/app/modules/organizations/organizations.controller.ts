import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { OrganizationsService } from './organizations.service';

const createOrganizations = catchAsync(async (req: Request, res: Response) => {
  if (req.files && 'image' in req.files && req.files.image[0]) {
    req.body.image = '/images/' + req.files.image[0].filename;
  }

  const result = await OrganizationsService.createOrganizations(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Organizations created successfully',
    data: result,
  });
});

const getAllOrganizationss = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await OrganizationsService.getAllOrganizationss(query);
  sendResponse(res, {
    pagination: {
      limit: Number(query.limit) || 10,
      page: Number(query.page) || 1,
      total: result.length,
      totalPage: Math.ceil(result.length / (Number(query.limit) || 10)),
    },

    statusCode: StatusCodes.OK,
    success: true,
    message: 'Organizationss fetched successfully',
    data: result,
  });
});

const getOrganizationsById = catchAsync(async (req: Request, res: Response) => {
  const result = await OrganizationsService.getOrganizationsById(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Organizations fetched successfully',
    data: result,
  });
});

const updateOrganizations = catchAsync(async (req: Request, res: Response) => {
  if (req.files && 'image' in req.files && req.files.image[0]) {
    req.body.image = '/images/' + req.files.image[0].filename;
  }
  const result = await OrganizationsService.updateOrganizations(
    req.params.id,
    req.body
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Organizations updated successfully',
    data: result,
  });
});

const deleteOrganizations = catchAsync(async (req: Request, res: Response) => {
  const result = await OrganizationsService.deleteOrganizations(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Organizations deleted successfully',
    data: result,
  });
});

export const OrganizationsController = {
  createOrganizations,
  getAllOrganizationss,
  getOrganizationsById,
  updateOrganizations,
  deleteOrganizations,
};
