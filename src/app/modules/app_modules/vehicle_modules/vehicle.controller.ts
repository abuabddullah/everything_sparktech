import catchAsync from "../../../../shared/catchAsync";
import { NextFunction, Request, Response } from 'express';
import sendResponse from "../../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { VehicleService } from "./vehicle.service";
const createVehicle = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await VehicleService.createVehicleToDB(req.body);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'User created successfully',
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

export const VehicleController = {
    createVehicle,
    getAllVehicles,
}