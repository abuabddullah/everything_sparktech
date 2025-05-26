import { StatusCodes } from "http-status-codes";
import { IExtraService } from "./extraService.interface";
import ExtraServiceModel from "./extraService.model";
import ApiError from "../../../../errors/ApiError";
import QueryBuilder from "../../../builder/QueryBuilder";
import { ExtraServiceSearchableFields } from "./extraService.constant";

const createExtraServiceToDB = async (payload: Partial<IExtraService>): Promise<IExtraService> => {
  const createdExtraService = await ExtraServiceModel.create(payload);
  if (!createdExtraService) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create extra service');
  }
  return createdExtraService;
};

const getAllExtraServicesFromDB = async (query: Record<string, unknown>) => {

  const extraServicesQuery = new QueryBuilder(
    ExtraServiceModel.find(),
    query,
  )
    .search(ExtraServiceSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await extraServicesQuery.modelQuery;
  const meta = await extraServicesQuery.getPaginationInfo();

  return {
    meta,
    result,
  };
};

export const ExtraService = {
  createExtraServiceToDB,
  getAllExtraServicesFromDB
}