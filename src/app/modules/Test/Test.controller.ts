import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ITest } from './Test.interface';
import { TestService } from './Test.service';

const createTest = catchAsync(async (req: Request, res: Response) => {
     const result = await TestService.createTest(req.body);

     sendResponse<ITest>(res, {
          statusCode: 200,
          success: true,
          message: 'Test created successfully',
          data: result,
     });
});

const getAllTests = catchAsync(async (req: Request, res: Response) => {
     const result = await TestService.getAllTests(req.query);

     sendResponse<{ meta: { total: number; page: number; limit: number; }; result: ITest[]; }>(res, {
          statusCode: 200,
          success: true,
          message: 'Tests retrieved successfully',
          data: result,
     });
});

const getAllUnpaginatedTests = catchAsync(async (req: Request, res: Response) => {
     const result = await TestService.getAllUnpaginatedTests();

     sendResponse<ITest[]>(res, {
          statusCode: 200,
          success: true,
          message: 'Tests retrieved successfully',
          data: result,
     });
});

const updateTest = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await TestService.updateTest(id, req.body);

     sendResponse<ITest>(res, {
          statusCode: 200,
          success: true,
          message: 'Test updated successfully',
          data: result || undefined,
     });
});

const deleteTest = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await TestService.deleteTest(id);

     sendResponse<ITest>(res, {
          statusCode: 200,
          success: true,
          message: 'Test deleted successfully',
          data: result || undefined,
     });
});

const hardDeleteTest = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await TestService.hardDeleteTest(id);

     sendResponse<ITest>(res, {
          statusCode: 200,
          success: true,
          message: 'Test deleted successfully',
          data: result || undefined,
     });
});

const getTestById = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await TestService.getTestById(id);

     sendResponse<ITest>(res, {
          statusCode: 200,
          success: true,
          message: 'Test retrieved successfully',
          data: result || undefined,
     });
});

export const TestController = {
     createTest,
     getAllTests,
     getAllUnpaginatedTests,
     updateTest,
     deleteTest,
     hardDeleteTest,
     getTestById
};
