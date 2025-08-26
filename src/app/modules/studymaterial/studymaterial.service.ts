import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IStudymaterialFilterables, IStudymaterial } from './studymaterial.interface';
import { Studymaterial } from './studymaterial.model';
import { JwtPayload } from 'jsonwebtoken';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { studymaterialSearchableFields } from './studymaterial.constants';
import { Types } from 'mongoose';
import { deleteFromS3 } from '../../../helpers/image/s3helper';
import { logger } from '../../../shared/logger';
import { StudyMaterialCategory } from '../../../enum/studyMaterial';


const createStudymaterial = async (
  user: JwtPayload,
  payload: IStudymaterial
): Promise<IStudymaterial> => {
  try {
    const data = { ...payload, uploadedBy: user.authId };
    const result = await Studymaterial.create(data);
    if (!result) {

      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Failed to create Studymaterial, please try again with valid data.'
      );
    }

    return result;
  } catch (error: any) {

    if (error.code === 11000) {
      throw new ApiError(StatusCodes.CONFLICT, 'Duplicate entry found');
    }
    throw error;
  }
};

const getAllStudymaterials = async (
  user: JwtPayload,
  filterables: IStudymaterialFilterables,
  pagination: IPaginationOptions
) => {
  const { searchTerm, ...filterData } = filterables;
  const { page, skip, limit, sortBy, sortOrder } = paginationHelper.calculatePagination(pagination);

  const andConditions = [];

  // Search functionality
  if (searchTerm) {
    andConditions.push({
      $or: studymaterialSearchableFields.map((field) => ({
        [field]: {
          $regex: searchTerm,
          $options: 'i',
        },
      })),
    });
  }

  // Filter functionality
  if (Object.keys(filterData).length) {
    andConditions.push({
      $and: Object.entries(filterData).map(([key, value]) => ({
        [key]: value,
      })),
    });
  }

  const whereConditions = andConditions.length ? { $and: andConditions } : {};

  const [result, total] = await Promise.all([
    Studymaterial
      .find(whereConditions)
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder }).populate('uploadedBy'),
    Studymaterial.countDocuments(whereConditions),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: result,
  };
};
const getAllStudyGuides = async (
  user: JwtPayload,
  filterables: IStudymaterialFilterables,
  pagination: IPaginationOptions,
  category: StudyMaterialCategory.STUDY_GUIDE
) => {
  const { searchTerm, ...filterData } = filterables;
  const { page, skip, limit, sortBy, sortOrder } =
    paginationHelper.calculatePagination(pagination);

  const andConditions: any[] = [];

  // ✅ Always filter by category
  if (category) {
    andConditions.push({ category });
  }

  // Search functionality
  if (searchTerm) {
    andConditions.push({
      $or: studymaterialSearchableFields.map((field) => ({
        [field]: {
          $regex: searchTerm,
          $options: "i",
        },
      })),
    });
  }

  // Other filters
  if (Object.keys(filterData).length) {
    andConditions.push({
      $and: Object.entries(filterData).map(([key, value]) => ({
        [key]: value,
      })),
    });
  }

  const whereConditions = andConditions.length ? { $and: andConditions } : {};

  const [result, total] = await Promise.all([
    Studymaterial.find(whereConditions)
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder })
      .populate("uploadedBy"),
    Studymaterial.countDocuments(whereConditions),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: result,
  };
};


const getSingleStudymaterial = async (id: string): Promise<IStudymaterial> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Studymaterial ID');
  }

  const result = await Studymaterial.findById(id).populate('uploadedBy');
  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Requested studymaterial not found, please try again with valid id'
    );
  }

  return result;
};


export const deleteStudymaterial = async (id: string): Promise<void> => {
  // 1️⃣ Validate ID
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Studymaterial ID');
  }

  // 2️⃣ Check if it exists
  const studymaterial = await Studymaterial.findById(id);
  if (!studymaterial) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Studymaterial not found');
  }

  // 3️⃣ Delete file from S3 if exists
  if (studymaterial.fileUrl) {
    try {
      const url = new URL(studymaterial.fileUrl);
      const fileKey = url.pathname.slice(1); // gets full path relative to bucket
      await deleteFromS3(fileKey);
      logger.info(`File deleted from S3: ${fileKey}`);
    } catch (error) {
      logger.error('Failed to delete file from S3', error);
      // optionally, you can continue or throw error depending on your flow
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete file from S3');
    }
  }

  // 4️⃣ Delete from MongoDB
  await Studymaterial.findByIdAndDelete(id);
  logger.info(`Studymaterial deleted from DB: ${id}`);
};

export const StudymaterialServices = {
  createStudymaterial,
  getAllStudymaterials,
  getSingleStudymaterial,
  deleteStudymaterial,
  getAllStudyGuides
};
