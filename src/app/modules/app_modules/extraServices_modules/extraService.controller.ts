import { NextFunction, Request, Response } from 'express';
import ExtraServiceModel from './extraService.model';
import { createExtraServiceZodSchema, ExtraServiceValidation, IExtraServiceInput } from './extraService.validation';
import catchAsync from '../../../../shared/catchAsync';
import { getSingleFilePath } from '../../../../shared/getFilePath';
import sendResponse from '../../../../shared/sendResponse';
import { ExtraService } from './ExtraService.service';
import { StatusCodes } from 'http-status-codes';
import { EXTRA_SERVICE_STATUS } from '../../../../enums/extraService';
import ApiError from '../../../../errors/ApiError';

export const createExtraService = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        let image = getSingleFilePath(req.files, 'image');
        const serviceData = {
            ...req.body,
            image,
        };
        const result = await ExtraService.createExtraServiceToDB(serviceData);

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: 'Extra Service created successfully',
            data: result,
        });
    }
);

export const getAllExtraServices = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const result = await ExtraService.getAllExtraServicesFromDB(req.query);

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: 'Extra services retrieved successfully',
            data: result,
        });
    }
);

export const getAllProtectionExtraServices = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const result = await ExtraService.getAllProtectionExtraServicesFromDB(req.query);

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: 'Extra services retrieved successfully',
            data: result,
        });
    }
);

export const getAllNonProtectionExtraServices = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const result = await ExtraService.getAllNonProtectionExtraServicesFromDB(req.query);

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: 'Extra non-protection services retrieved successfully',
            data: result,
        });
    }
);

export const updateExtraService = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        if (req.body.data) {
            req.body = ExtraServiceValidation.createExtraServiceZodSchema.parse(
                JSON.parse(req.body.data)
            );
        }
        const { id } = req.params;

        let image = getSingleFilePath(req.files, 'image');
        const serviceData = {
            ...req.body,
            image,
        };
        const result = await ExtraService.updateExtraServiceInDB(id, serviceData);

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: 'Extra Service updated successfully',
            data: result,
        });
    }
);

export const deleteExtraService = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const result = await ExtraService.deleteExtraServiceFromDB(id);

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: 'Extra Service deleted successfully',
            data: result,
        });
    }
);

export const updateExtraServiceStatus = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const { status } = req.body;
        const result = await ExtraService.updateExtraServiceStatusInDB(id, status);

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: 'Extra Service status updated successfully',
            data: result,
        });
    }
);

export const getExtraServiceById = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const result = await ExtraService.getExtraServiceByIdFromDB(id);

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: 'Extra Service retrieved successfully',
            data: result,
        });
    }
);

export const ExtraServiceController = { createExtraService, getAllExtraServices,getAllProtectionExtraServices,getAllNonProtectionExtraServices, updateExtraService, deleteExtraService, updateExtraServiceStatus, getExtraServiceById }