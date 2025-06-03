import catchAsync from "../../../../shared/catchAsync";
import { NextFunction, Request, Response } from 'express';
import sendResponse from "../../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { VehicleService } from "./vehicle.service";
import { getSingleFilePath } from "../../../../shared/getFilePath";
import { VehicleZodValidation } from "./vehicle.validation";
const createVehicle = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await VehicleService.createVehicleToDB(req.body);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Vehicle created successfully',
      data: result,
    });
  }
);
const getAllVehicles = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await VehicleService.getAllVehiclesFromDB(req.query);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Vehicles retrieved successfully',
      data: result,
    });
  }
);

const getSeatDoorLuggageMeta = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await VehicleService.getSeatDoorLuggageMetaFromDB();

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Vehicle Seat Door Luggage data retrieved successfully',
      data: result,
    });
  }
);

const getAVehicleById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const result = await VehicleService.getAVehicleByIdFromDB(id);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Vehicle retrieved successfully',
      data: result,
    });
  }
);

const updateAVehicleById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.data) {
      throw new Error('No data found to update');
    }

    const { id } = req.params;
    const parsedData = JSON.parse(req.body.data);

    // Attach image path or filename to parsed data
    if (req.files) {
      let image = getSingleFilePath(req.files, 'image');
      parsedData.image = image;
    }


    // Validate and assign req.body data to req.body
    req.body = VehicleZodValidation.createVehicleZodSchema.parse(parsedData);


    const result = await VehicleService.updateAVehicleByIdInDB(id, req.body);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Vehicle updated successfully',
      data: result,
    });
  }
);


const updateLastMaintenanceDateById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { lastMaintenanceDate } = req.body;
    const result = await VehicleService.updateLastMaintenanceDateByIdInDB(id, lastMaintenanceDate);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Last maintenance date updated successfully',
      data: result,
    });
  }
);

const updateVehicleStatusById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { status } = req.body;
    const result = await VehicleService.updateVehicleStatusByIdInDB(id, status);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Vehicle status updated successfully',
      data: result,
    });
  }
);

const deletVehicleById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const result = await VehicleService.deletVehicleByIdFromDB(id);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Vehicle deleted successfully',
      data: result,
    });
  }
);

export const VehicleController = {
  createVehicle,
  getAllVehicles,
  getSeatDoorLuggageMeta,
  getAVehicleById,
  updateAVehicleById,
  updateLastMaintenanceDateById,
  updateVehicleStatusById,
  deletVehicleById
}