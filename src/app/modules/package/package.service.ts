import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Package } from './package.model';
import { IPackage } from './package.interface';
import { createSubscriptionPackage } from '../../../helpers/stripeHelper';

const createPackage = async (payload: IPackage): Promise<any> => {
  const subscriptionPackage = await createSubscriptionPackage(payload);
  const result = await Package.create({
    ...payload,
    priceId: subscriptionPackage.priceId,
    url: subscriptionPackage.paymentLink,
    stripeProductId: subscriptionPackage.subscription,
  });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create package!');
  }
  return result;
};

const getAllPackages = async (
  queryFields: Record<string, any>
): Promise<IPackage[]> => {
  const { search, page, limit } = queryFields;
  const query = search
    ? {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { features: { $regex: search, $options: 'i' } },
        ],
      }
    : {};
  let queryBuilder = Package.find(query);

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

const getPackageById = async (id: string): Promise<IPackage | null> => {
  const result = await Package.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Package not found!');
  }
  return result;
};

const updatePackage = async (
  id: string,
  payload: IPackage
): Promise<IPackage | null> => {
  const isExistPackage = await getPackageById(id);
  if (!isExistPackage) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Package not found!');
  }

  const result = await Package.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update package!');
  }
  return result;
};

const deletePackage = async (id: string): Promise<IPackage | null> => {
  const isExistPackage = await getPackageById(id);
  if (!isExistPackage) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Package not found!');
  }

  const result = await Package.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete package!');
  }
  return result;
};

export const PackageService = {
  createPackage,
  getAllPackages,
  getPackageById,
  updatePackage,
  deletePackage,
};
