import { Request, Response } from 'express';
import { StudymaterialServices } from './studymaterial.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import pick from '../../../shared/pick';
import { studymaterialFilterables } from './studymaterial.constants';
import { paginationFields } from '../../../interfaces/pagination';
import { S3Helper } from '../../../helpers/image/s3helper';
import ApiError from '../../../errors/ApiError';
import { StudyMaterialCategory } from '../../../enum/studyMaterial';

const createStudymaterial = catchAsync(async (req: Request, res: Response) => {
  const studymaterialData = req.body;

  const {name, category} = studymaterialData

  if(!name || !category) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'All fields are required');
  }

  const docFiles = (req.files as any).doc as Express.Multer.File[];
  if (!docFiles || docFiles.length === 0) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'No document file provided');
  }

  // Take the first file only
  const docFile = docFiles[0];

  // Upload single doc to S3
  const uploadedDocUrl = await S3Helper.uploadToS3(docFile, 'pdf');

  if (!uploadedDocUrl) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to upload document');
  }

  // Save in DB
  const result = await StudymaterialServices.createStudymaterial(req.user!, {
    ...studymaterialData,
    fileUrl: uploadedDocUrl,
    size: docFile.size,
  });

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Document uploaded successfully',
    data: result,
  });
});


const getSingleStudymaterial = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await StudymaterialServices.getSingleStudymaterial(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Studymaterial retrieved successfully',
    data: result,
  });
});

const getAllStudymaterials = catchAsync(async (req: Request, res: Response) => {
  const filterables = pick(req.query, studymaterialFilterables);
  const pagination = pick(req.query, paginationFields);

  const result = await StudymaterialServices.getAllStudymaterials(
    req.user!,
    filterables,
    pagination
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Studymaterials retrieved successfully',
    data: result,
  });
});

const getAllStudyGuides = catchAsync(async (req: Request, res: Response) => {
  const filterables = pick(req.query, studymaterialFilterables);
  const pagination = pick(req.query, paginationFields);

  const category = StudyMaterialCategory.STUDY_GUIDE;

  const result = await StudymaterialServices.getAllStudyGuides(
    req.user!,
    filterables,
    pagination,
    category
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'StudyGuides retrieved successfully',
    data: result,
  });
});

const deleteStudymaterial = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await StudymaterialServices.deleteStudymaterial(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Studymaterial deleted successfully',
    data: result,
  });
});

export const StudymaterialController = {
  createStudymaterial,
  getSingleStudymaterial,
  getAllStudymaterials,
  deleteStudymaterial,
  getAllStudyGuides
};
