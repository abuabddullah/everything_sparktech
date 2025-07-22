import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import path from 'path';

const getDeleteSteps = catchAsync(async (req: Request, res: Response) => {
  const filePath = path.join(process.cwd(), 'cabwiredeletepage.html'); // Root folder থেকে path নেওয়া
  res.sendFile(filePath);
});

export const SettingController = {
  getDeleteSteps,
};
