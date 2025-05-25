import { StatusCodes } from "http-status-codes";
import { IExtraService } from "./extraService.interface";
import ExtraServiceModel from "./extraService.model";
import ApiError from "../../../../errors/ApiError";

const createExtraServiceToDB = async (payload: Partial<IExtraService>): Promise<IExtraService> => {
  const createdExtraService = await ExtraServiceModel.create(payload);
  if (!createdExtraService) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create extra service');
  }
  return createdExtraService;
};

export const ExtraService={
    createExtraServiceToDB
}