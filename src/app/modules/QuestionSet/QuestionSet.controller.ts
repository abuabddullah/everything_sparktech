import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { IQuestionSet } from './QuestionSet.interface';
import { QuestionSetService } from './QuestionSet.service';

const createQuestionSet = catchAsync(async (req: Request, res: Response) => {
     const result = await QuestionSetService.createQuestionSet(req.body);

     sendResponse<IQuestionSet>(res, {
          statusCode: 200,
          success: true,
          message: 'QuestionSet created successfully',
          data: result,
     });
});

const getAllQuestionSets = catchAsync(async (req: Request, res: Response) => {
     const result = await QuestionSetService.getAllQuestionSets(req.query);

     sendResponse<{ meta: { total: number; page: number; limit: number; }; result: IQuestionSet[]; }>(res, {
          statusCode: 200,
          success: true,
          message: 'QuestionSets retrieved successfully',
          data: result,
     });
});

const getAllUnpaginatedQuestionSets = catchAsync(async (req: Request, res: Response) => {
     const result = await QuestionSetService.getAllUnpaginatedQuestionSets();

     sendResponse<IQuestionSet[]>(res, {
          statusCode: 200,
          success: true,
          message: 'QuestionSets retrieved successfully',
          data: result,
     });
});

const updateQuestionSet = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await QuestionSetService.updateQuestionSet(id, req.body);

     sendResponse<IQuestionSet>(res, {
          statusCode: 200,
          success: true,
          message: 'QuestionSet updated successfully',
          data: result || undefined,
     });
});

const deleteQuestionSet = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await QuestionSetService.deleteQuestionSet(id);

     sendResponse<IQuestionSet>(res, {
          statusCode: 200,
          success: true,
          message: 'QuestionSet deleted successfully',
          data: result || undefined,
     });
});

const hardDeleteQuestionSet = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await QuestionSetService.hardDeleteQuestionSet(id);

     sendResponse<IQuestionSet>(res, {
          statusCode: 200,
          success: true,
          message: 'QuestionSet deleted successfully',
          data: result || undefined,
     });
});

const getQuestionSetById = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await QuestionSetService.getQuestionSetById(id);

     sendResponse<IQuestionSet>(res, {
          statusCode: 200,
          success: true,
          message: 'QuestionSet retrieved successfully',
          data: result || undefined,
     });
});

export const QuestionSetController = {
     createQuestionSet,
     getAllQuestionSets,
     getAllUnpaginatedQuestionSets,
     updateQuestionSet,
     deleteQuestionSet,
     hardDeleteQuestionSet,
     getQuestionSetById
};
