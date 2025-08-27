import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { IExamination } from './Examination.interface';
import { ExaminationService } from './Examination.service';

const createExamination = catchAsync(async (req: Request, res: Response) => {
     const result = await ExaminationService.createExamination(req.body);

     sendResponse<IExamination>(res, {
          statusCode: 200,
          success: true,
          message: 'Examination created successfully',
          data: result,
     });
});

const getAllExaminations = catchAsync(async (req: Request, res: Response) => {
     const result = await ExaminationService.getAllExaminations(req.query);

     sendResponse<{ meta: { total: number; page: number; limit: number; }; result: IExamination[]; }>(res, {
          statusCode: 200,
          success: true,
          message: 'Examinations retrieved successfully',
          data: result,
     });
});

const getAllUnpaginatedExaminations = catchAsync(async (req: Request, res: Response) => {
     const result = await ExaminationService.getAllUnpaginatedExaminations();

     sendResponse<IExamination[]>(res, {
          statusCode: 200,
          success: true,
          message: 'Examinations retrieved successfully',
          data: result,
     });
});

const updateExamination = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await ExaminationService.updateExamination(id, req.body);

     sendResponse<IExamination>(res, {
          statusCode: 200,
          success: true,
          message: 'Examination updated successfully',
          data: result || undefined,
     });
});

const deleteExamination = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await ExaminationService.deleteExamination(id);

     sendResponse<IExamination>(res, {
          statusCode: 200,
          success: true,
          message: 'Examination deleted successfully',
          data: result || undefined,
     });
});

const hardDeleteExamination = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await ExaminationService.hardDeleteExamination(id);

     sendResponse<IExamination>(res, {
          statusCode: 200,
          success: true,
          message: 'Examination deleted successfully',
          data: result || undefined,
     });
});

const getExaminationById = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await ExaminationService.getExaminationById(id);

     sendResponse<IExamination>(res, {
          statusCode: 200,
          success: true,
          message: 'Examination retrieved successfully',
          data: result || undefined,
     });
});

export const ExaminationController = {
     createExamination,
     getAllExaminations,
     getAllUnpaginatedExaminations,
     updateExamination,
     deleteExamination,
     hardDeleteExamination,
     getExaminationById
};
