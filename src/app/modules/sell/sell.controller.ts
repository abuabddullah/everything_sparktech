import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { Sell } from './sell.model';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { SellServices } from './sell.service';
import pick from '../../../shared/pick';
import { sell_filterable_fields } from './sell.interface';

const createSellItem = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  if (req.files && 'image' in req.files && req.files.image[0]) {
    req.body.image = '/images/' + req.files.image[0].filename;
  }

  const result = await SellServices.createSellItem(user, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Sell Item created successfully',
    data: result,
  });
});

const updateSellItem = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const id = req.params.id;
  if (req.files && 'image' in req.files && req.files.image[0]) {
    req.body.image = '/images/' + req.files.image[0].filename;
  }
  const payload = req.body;
  const result = await SellServices.updateSellItem(user, id, payload);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Sell Item updated successfully',
    data: result,
  });
});

const getSingleItem = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await SellServices.getSingleItem(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Sell Item fetched successfully',
    data: result,
  });
});

const getAllItems = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const filters = pick(req.query, sell_filterable_fields);
  const pagination = pick(req.query, [
    'page',
    'limit',
    'sortBy',
    'sortOrder',
    'skip',
  ]);

  const result = await SellServices.getAllItems(user, filters, pagination);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Sell Items fetched successfully',
    data: result,
  });
});

const deleteSellItem = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await SellServices.deleteSellItem(req.user, id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Sell Item deleted successfully',
    data: result,
  });
});

const getMyItems = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await SellServices.getMyItems(user);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'My Sell Items fetched successfully',
    data: result,
  });
});

export const sellController = {
  createSellItem,
  updateSellItem,
  getSingleItem,
  getAllItems,
  deleteSellItem,
  getMyItems,
};
