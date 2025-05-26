import { NextFunction, Request, Response } from 'express';
import ExtraServiceModel from './extraService.model';
import { createExtraServiceZodSchema, IExtraServiceInput } from './extraService.validation';
import catchAsync from '../../../../shared/catchAsync';
import { getSingleFilePath } from '../../../../shared/getFilePath';
import sendResponse from '../../../../shared/sendResponse';
import { ExtraService } from './ExtraService.service';
import { StatusCodes } from 'http-status-codes';

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

export const updateExtraService = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const extraService = await ExtraServiceModel.findByIdAndUpdate(id, req.body, { new: true });

        if (!extraService) {
            return res.status(404).json({ message: 'Extra Service not found' });
        }

        return res.status(200).json(extraService);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const deleteExtraService = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const extraService = await ExtraServiceModel.findByIdAndDelete(id);

        if (!extraService) {
            return res.status(404).json({ message: 'Extra Service not found' });
        }

        return res.status(200).json({ message: 'Extra Service deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};


export const ExtraServiceController = { createExtraService, getAllExtraServices, updateExtraService, deleteExtraService }