import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Info } from './info.model';
import { IInfo } from './info.interface';

const createInfo = async (payload: IInfo): Promise<IInfo> => {
  const isExistInfo = await Info.findOne({ name: payload.name });
  if (isExistInfo) {
    const result = await Info.findOneAndUpdate(
      { name: payload.name },
      { $set: { content: payload.content } }
    );
    if (!result) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update info!');
    }
    return result;
  }
  const result = await Info.create(payload);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create info!');
  }
  return result;
};

const getAllInfos = async (
  queryFields: Record<string, any>
): Promise<IInfo[]> => {
  const { search, page, limit } = queryFields;
  const query = search
    ? {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
        ],
      }
    : {};
  let queryBuilder = Info.find(query);

  if (page && limit) {
    queryBuilder = queryBuilder.skip((page - 1) * limit).limit(limit);
  }
  delete queryFields.search;
  delete queryFields.page;
  delete queryFields.limit;
  queryBuilder.find(queryFields);
  return await queryBuilder;
};

const getInfoById = async (id: string): Promise<IInfo | null> => {
  const result = await Info.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Info not found!');
  }
  return result;
};

export const InfoService = {
  createInfo,
  getAllInfos,
  getInfoById,
};
