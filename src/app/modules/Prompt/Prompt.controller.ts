import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { IPrompt } from './Prompt.interface';
import { PromptService } from './Prompt.service';

const createPrompt = catchAsync(async (req: Request, res: Response) => {
     const result = await PromptService.createPrompt(req.body);

     sendResponse<IPrompt>(res, {
          statusCode: 200,
          success: true,
          message: 'Prompt created successfully',
          data: result,
     });
});

const getAllPrompts = catchAsync(async (req: Request, res: Response) => {
     const result = await PromptService.getAllPrompts(req.query);

     sendResponse<{ meta: { total: number; page: number; limit: number; }; result: IPrompt[]; }>(res, {
          statusCode: 200,
          success: true,
          message: 'Prompts retrieved successfully',
          data: result,
     });
});

const getAllUnpaginatedPrompts = catchAsync(async (req: Request, res: Response) => {
     const result = await PromptService.getAllUnpaginatedPrompts();

     sendResponse<IPrompt[]>(res, {
          statusCode: 200,
          success: true,
          message: 'Prompts retrieved successfully',
          data: result,
     });
});

const updatePrompt = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await PromptService.updatePrompt(id, req.body);

     sendResponse<IPrompt>(res, {
          statusCode: 200,
          success: true,
          message: 'Prompt updated successfully',
          data: result || undefined,
     });
});

const deletePrompt = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await PromptService.deletePrompt(id);

     sendResponse<IPrompt>(res, {
          statusCode: 200,
          success: true,
          message: 'Prompt deleted successfully',
          data: result || undefined,
     });
});

const hardDeletePrompt = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await PromptService.hardDeletePrompt(id);

     sendResponse<IPrompt>(res, {
          statusCode: 200,
          success: true,
          message: 'Prompt deleted successfully',
          data: result || undefined,
     });
});

const getPromptById = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await PromptService.getPromptById(id);

     sendResponse<IPrompt>(res, {
          statusCode: 200,
          success: true,
          message: 'Prompt retrieved successfully',
          data: result || undefined,
     });
});

export const PromptController = {
     createPrompt,
     getAllPrompts,
     getAllUnpaginatedPrompts,
     updatePrompt,
     deletePrompt,
     hardDeletePrompt,
     getPromptById
};
