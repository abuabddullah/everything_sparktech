import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../../shared/catchAsync"
import sendResponse from "../../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { LocationService } from "./location.service";

const getAllLocations = catchAsync(async (req: Request, res: Response) => {
  const result = await LocationService.getAllLocations(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Locations retrieved successfully',
    data: result,
  });
});


const createLocation = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ...locationData } = req.body;
    const result = await LocationService.createLocationToDB(locationData);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Location created successfully',
      data: result,
    });
  }
);

export const LocationController = {
    getAllLocations,
    createLocation
}