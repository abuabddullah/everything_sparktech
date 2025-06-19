import { StatusCodes } from "http-status-codes";
import { IExtraService } from "./extraService.interface";
import ExtraServiceModel from "./extraService.model";
import ApiError from "../../../../errors/ApiError";
import QueryBuilder from "../../../builder/QueryBuilder";
import { ExtraServiceSearchableFields } from "./extraService.constant";
import { EXTRA_SERVICE_STATUS } from "../../../../enums/extraService";

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

const getAllProtectionExtraServicesFromDB = async (query: Record<string, unknown>) => {

  const extraServicesQuery = new QueryBuilder(
    ExtraServiceModel.find({ isProtection: true }),
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
const updateExtraServiceInDB = async (
  id: string,
  payload: Partial<IExtraService>
): Promise<IExtraService | null> => {
  const updatedExtraService = await ExtraServiceModel.findByIdAndUpdate(
    id,
    payload,
    { new: true }
  );
  if (!updatedExtraService) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Extra Service not found');
  }
  return updatedExtraService;
};

const deleteExtraServiceFromDB = async (
  id: string
): Promise<IExtraService | null> => {
  const deletedExtraService = await ExtraServiceModel.findByIdAndDelete(id);
  if (!deletedExtraService) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Extra Service not found');
  }
  return deletedExtraService;
};

const updateExtraServiceStatusInDB = async (
  id: string,
  status: string
): Promise<IExtraService | null> => {

  if (!Object.values(EXTRA_SERVICE_STATUS).includes(status as EXTRA_SERVICE_STATUS)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid status value');
  }
  const updatedStatus = await ExtraServiceModel.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );
  if (!updatedStatus) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Extra Service not found');
  }
  return updatedStatus;
};

const getExtraServiceByIdFromDB = async (
  id: string
): Promise<IExtraService | null> => {
  const extraService = await ExtraServiceModel.findById(id);
  if (!extraService) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Extra Service not found');
  }
  return extraService;
};

export const ExtraService = {
  createExtraServiceToDB,
  getAllExtraServicesFromDB,
  getAllProtectionExtraServicesFromDB,
  updateExtraServiceInDB,
  deleteExtraServiceFromDB,
  updateExtraServiceStatusInDB,
  getExtraServiceByIdFromDB,
};