import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';

const successPage = catchAsync(async (req: Request, res: Response) => {
  res.render('success.ejs');
});

const cancelPage = catchAsync(async (req: Request, res: Response) => {
  res.render('cancel.ejs');
});

export const PaymentController = {
  successPage,
  cancelPage,
};
