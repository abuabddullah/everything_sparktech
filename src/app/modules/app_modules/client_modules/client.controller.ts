import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../../shared/catchAsync";
import sendResponse from "../../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { ClientService } from "./client.service";

const createClient = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ...clientData } = req.body; 
    const result = await ClientService.createClientToDB(clientData);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Client created successfully',
      data: result,
    });
  }
);

const getAllClients = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await ClientService.getAllClientsFromDB(req.query);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Clients retrieved successfully',
      data: result,
    });
  }
);

const getClientById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const result = await ClientService.getClientByIdFromDB(id);

    if (!result) {
      return next(new Error('Client not found'));
    }

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Client retrieved successfully',
      data: result,
    });
  }
);

const getClientByEmail = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.params;
    const result = await ClientService.getClientByEmailFromDB(email);

    if (!result) {
      return next(new Error('Client not found'));
    }

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Client retrieved successfully',
      data: result,
    });
  }
);

export const ClientController = {
        createClient,
        getAllClients,
        getClientById,
        getClientByEmail
};