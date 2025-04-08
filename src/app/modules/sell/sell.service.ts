import { JwtPayload } from 'jsonwebtoken';
import { ISell, sell_searchable_fields, SellFilters } from './sell.interface';
import { Sell } from './sell.model';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { IPaginationOptions } from '../../../types/pagination';
import { paginationHelper } from '../../../helpers/paginationHelper';

const createSellItem = async (
  user: JwtPayload,
  payload: ISell
): Promise<ISell> => {
  payload.createdBy = user.id;
  const result = await Sell.create(payload);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create Sell Item');
  }
  return result;
};

const updateSellItem = async (
  user: JwtPayload,
  id: string,
  payload: Partial<ISell>
) => {
  const isExist = await Sell.findOne({ _id: id });
  if (!isExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Sell Item not found');
  }
  if (isExist.createdBy.toString() !== user.id) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'You are not authorized to update this Sell Item.'
    );
  }

  const result = await Sell.findOneAndUpdate(
    { _id: id },
    { $set: payload },
    {
      new: true,
    }
  );

  return result;
};

const getSingleItem = async (id: string): Promise<ISell | null> => {
  const result = await Sell.findById(id)
    .populate({
      path: 'createdBy',
      select: { name: 1, email: 1, phone: 1, whatsapp: 1 },
    })
    .lean();
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Sell Item not found');
  }
  return result;
};

const deleteSellItem = async (user: JwtPayload, id: string) => {
  const isExist = await Sell.findOne({ _id: id });
  if (!isExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Sell Item not found');
  }
  if (isExist.createdBy.toString() !== user.id) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'You are not authorized to delete this Sell Item.'
    );
  }
  const result = await Sell.findByIdAndDelete(id);
  return result;
};

const getAllItems = async (
  user: JwtPayload,
  filters: SellFilters,
  pagination: IPaginationOptions
) => {
  const { page, limit, sortBy, sortOrder, skip } =
    paginationHelper.calculatePagination(pagination);
  const { searchTerm, minPrice, maxPrice, ...filtersData } = filters;
  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      $or: sell_searchable_fields.map(field => ({
        [field]: {
          $regex: searchTerm,
          $options: 'i',
        },
      })),
    });
  }

  if (Object.keys(filtersData).length) {
    andConditions.push({
      $and: Object.entries(filtersData).map(([field, value]) => ({
        [field]: value,
      })),
    });
  }

  if (minPrice !== undefined && maxPrice !== undefined) {
    andConditions.push({
      price: {
        $gte: minPrice,
        $lte: maxPrice,
      },
    });
  }

  const whereConditions =
    andConditions.length > 0 ? { $and: andConditions } : {};

  const result = await Sell.find(whereConditions)
    .populate({
      path: 'createdBy',
      select: { name: 1, email: 1, phone: 1, whatsapp: 1 },
    })
    .skip(skip)
    .limit(limit)
    .sort()
    .lean();

  const total = await Sell.countDocuments(whereConditions);
  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: result,
  };
};

const getMyItems = async (user: JwtPayload) => {
  const result = await Sell.find({ createdBy: user.id }).sort().lean();
  return result;
};

export const SellServices = {
  createSellItem,
  updateSellItem,
  getSingleItem,
  deleteSellItem,
  getAllItems,
  getMyItems,
};
