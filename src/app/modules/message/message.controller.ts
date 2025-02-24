import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { MessageService } from './message.service';
import { MessageValidation } from './message.validation';

const createMessage = catchAsync(async (req: Request, res: Response) => {
  req.body.from = req.user.id;
  let images: string[] = [];
  if (req.files && 'images' in req.files && req.files.images[0]) {
    req.files.images.forEach(file => {
      images?.push('/images/' + file.filename);
    });
  }
  const data = { ...req.body, images };
  const result = await MessageService.createMessage(data);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Message created successfully',
    data: result,
  });
});

const getAllMessages = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;

  const result = await MessageService.getAllMessages(query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Messages fetched successfully',
    data: result,
  });
});

const getMessageById = catchAsync(async (req: Request, res: Response) => {
  const result = await MessageService.getMessageById(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Message fetched successfully',
    data: result,
  });
});

const updateMessage = catchAsync(async (req: Request, res: Response) => {
  req.body.from = req.user.id;
  const id = req.params.id;
  let images: string[] = [];
  if (req.files && 'images' in req.files && req.files.images[0]) {
    req.files.images.forEach(file => {
      images?.push('/images/' + file.filename);
    });
  }
  const data = { ...req.body, ...(images.length > 0 && images) };
  const result = await MessageService.updateMessage(id, data);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Message updated successfully',
    data: result,
  });
});

const deleteMessage = catchAsync(async (req: Request, res: Response) => {
  const result = await MessageService.deleteMessage(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Message deleted successfully',
    data: result,
  });
});

export const MessageController = {
  createMessage,
  getAllMessages,
  getMessageById,
  updateMessage,
  deleteMessage,
};
