import { Request, Response } from 'express';
    import catchAsync from '../../../shared/catchAsync';
    import sendResponse from '../../../shared/sendResponse';
    import { StatusCodes } from 'http-status-codes';
    import { TermsAndConditionsService } from './termsAndConditions.service';

    const createTermsAndConditions = catchAsync(async (req: Request, res: Response) => {
      
      const result = await TermsAndConditionsService.createTermsAndConditions(req.body);
      sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: 'TermsAndConditions created successfully',
        data: result,
      });
    });

    const getAllTermsAndConditionss = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;
      const result = await TermsAndConditionsService.getAllTermsAndConditionss(query);
      sendResponse(res, {
        
        pagination: {
          limit: Number(query.limit) || 10,
          page: Number(query.page) || 1,
          total: result.length,
          totalPage: Math.ceil(result.length / (Number(query.limit) || 10)),
        },
        
        statusCode: StatusCodes.OK,
        success: true,
        message: 'TermsAndConditionss fetched successfully',
        data: result,
      });
    });

    const getTermsAndConditionsById = catchAsync(async (req: Request, res: Response) => {
      const result = await TermsAndConditionsService.getTermsAndConditionsById(req.params.id);
      sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'TermsAndConditions fetched successfully',
        data: result,
      });
    });

    const updateTermsAndConditions = catchAsync(async (req: Request, res: Response) => {
    
      const result = await TermsAndConditionsService.updateTermsAndConditions(req.params.id, req.body);
      sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'TermsAndConditions updated successfully',
        data: result,
      });
    });

    const deleteTermsAndConditions = catchAsync(async (req: Request, res: Response) => {
      const result = await TermsAndConditionsService.deleteTermsAndConditions(req.params.id);
      sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'TermsAndConditions deleted successfully',
        data: result,
      });
    });

    export const TermsAndConditionsController = {
      createTermsAndConditions,
      getAllTermsAndConditionss,
      getTermsAndConditionsById,
      updateTermsAndConditions,
      deleteTermsAndConditions,
    };
