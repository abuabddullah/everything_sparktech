import { Request, Response } from 'express';
import { ReviewService } from './review.service';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';

const createReview = catchAsync(async (req: Request, res: Response) => {
     const result = await ReviewService.createReviewToDB(req.body);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Review Created Successfully',
          data: result,
     });
});

const getAllReviews = catchAsync(async (req: Request, res: Response) => {
     const result = await ReviewService.getAllReviewsFromDB();

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Reviews retrieved successfully',
          data: result,
     });
});


const createReiviewByAdmin = catchAsync(async (req: Request, res: Response) => {
     const result = await ReviewService.createReviewToDB(req.body);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Review Created by Admin Successfully',
          data: result,
     });
});


export const ReviewController = { createReview,getAllReviews,createReiviewByAdmin };
