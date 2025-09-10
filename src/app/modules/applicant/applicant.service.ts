import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Applicant } from './applicant.model';
import { IApplicant } from './applicant.interface';

const createApplicant = async (payload: IApplicant): Promise<IApplicant> => {
  const result = await Applicant.create(payload);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create applicant!');
  }
  return result;
};

const getAllApplicants = async (
  queryFields: Record<string, any>
): Promise<IApplicant[]> => {
  const { search, page, limit } = queryFields;
  const query = search
    ? { $or: [{ QNA: { $regex: search, $options: 'i' } }] }
    : {};
  let queryBuilder = Applicant.find(query);

  if (page && limit) {
    queryBuilder = queryBuilder.skip((page - 1) * limit).limit(limit);
  } else {
    queryBuilder = queryBuilder.skip(0).limit(10);
  }
  delete queryFields.search;
  delete queryFields.page;
  delete queryFields.limit;
  queryBuilder.find(queryFields);
  return await queryBuilder;
};

const getApplicantById = async (id: string): Promise<IApplicant | null> => {
  const result = await Applicant.findById(id).populate('user job');
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Applicant not found!');
  }
  return result;
};

const updateApplicant = async (
  id: string,
  payload: IApplicant
): Promise<IApplicant | null> => {
  const isExistApplicant = await getApplicantById(id);
  if (!isExistApplicant) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Applicant not found!');
  }

  const result = await Applicant.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update applicant!');
  }
  return result;
};

const deleteApplicant = async (id: string): Promise<IApplicant | null> => {
  const isExistApplicant = await getApplicantById(id);
  if (!isExistApplicant) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Applicant not found!');
  }

  const result = await Applicant.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete applicant!');
  }
  return result;
};

export const ApplicantService = {
  createApplicant,
  getAllApplicants,
  getApplicantById,
  updateApplicant,
  deleteApplicant,
};
