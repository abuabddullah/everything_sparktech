import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Organizations } from './organizations.model';
import { IOrganizations } from './organizations.interface';

import unlinkFile from '../../../shared/unlinkFile';
import { Review } from '../review/review.model';

const createOrganizations = async (
  payload: IOrganizations
): Promise<IOrganizations> => {
  if (typeof payload.locationCoordinates === 'string')
    payload.locationCoordinates = JSON.parse(payload.locationCoordinates);
  const result = await Organizations.create(payload);
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to create organizations!'
    );
  }
  return result;
};

const getAllOrganizationss = async (
  queryFields: Record<string, any>
): Promise<any[]> => {
  const { search, page, limit } = queryFields;
  const query = search
    ? {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { image: { $regex: search, $options: 'i' } },
          { locationName: { $regex: search, $options: 'i' } },
        ],
      }
    : {};
  let queryBuilder = Organizations.find(query);

  if (page && limit) {
    queryBuilder = queryBuilder.skip((page - 1) * limit).limit(limit);
  } else {
    queryBuilder = queryBuilder.skip(0).limit(10);
  }
  delete queryFields.search;
  delete queryFields.page;
  delete queryFields.limit;

  const result = await queryBuilder.find(queryFields).lean();

  const finalResult = await Promise.all(
    result.map(async organization => {
      const reviews = await Review.find({
        organization: organization._id,
        replyTo: null,
      })
        .populate({
          path: 'user',
          select: 'name email profile',
        })
        .lean();
      return {
        ...organization,
        reviews,
      };
    })
  );

  return finalResult;
};

const getOrganizationsById = async (
  id: string
): Promise<IOrganizations | null> => {
  const result = await Organizations.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Organizations not found!');
  }
  return result;
};

const updateOrganizations = async (
  id: string,
  payload: IOrganizations
): Promise<IOrganizations | null> => {
  if (typeof payload.locationCoordinates === 'string')
    payload.locationCoordinates = JSON.parse(payload.locationCoordinates);
  const isExistOrganizations = await getOrganizationsById(id);
  if (!isExistOrganizations) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Organizations not found!');
  }
  if (
    typeof isExistOrganizations.image === 'string' &&
    typeof payload.image === 'string'
  ) {
    await unlinkFile(isExistOrganizations.image);
  }

  const result = await Organizations.findByIdAndUpdate(id, payload, {
    new: true,
  });
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to update organizations!'
    );
  }
  return result;
};

const deleteOrganizations = async (
  id: string
): Promise<IOrganizations | null> => {
  const isExistOrganizations = await getOrganizationsById(id);
  if (!isExistOrganizations) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Organizations not found!');
  }

  if (typeof isExistOrganizations.image === 'string') {
    await unlinkFile(isExistOrganizations.image);
  }

  const result = await Organizations.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to delete organizations!'
    );
  }
  return result;
};

export const OrganizationsService = {
  createOrganizations,
  getAllOrganizationss,
  getOrganizationsById,
  updateOrganizations,
  deleteOrganizations,
};
