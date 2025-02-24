import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { EventService } from './event.service';
import { jwtHelper } from '../../../helpers/jwtHelper';
import config from '../../../config';
import { Secret } from 'jsonwebtoken';

const createEvent = catchAsync(async (req: Request, res: Response) => {
  if (
    req.files &&
    'thumbnailImage' in req.files &&
    req.files.thumbnailImage[0]
  ) {
    req.body.thumbnailImage = '/images/' + req.files.thumbnailImage[0].filename;
  }

  if (req.files && 'introMedia' in req.files && req.files.introMedia[0]) {
    req.body.introMedia = '/medias/' + req.files.introMedia[0].filename;
  }
  console.log(req.body);
  req.body.creator = req.user.id;
  const result = await EventService.createEvent(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Event created successfully',
    data: result,
  });
});

const getAllEvents = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const token = req.headers.authorization?.split(' ')[1] as string | undefined;
  const user = token
    ? jwtHelper.verifyToken(token, config.jwt.jwt_secret as Secret)
    : null;
  const result = await EventService.getAllEvents(query, user);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Events fetched successfully',
    data: result,
  });
});

const getEventById = catchAsync(async (req: Request, res: Response) => {
  const result = await EventService.getEventById(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Event fetched successfully',
    data: result,
  });
});

const updateEvent = catchAsync(async (req: Request, res: Response) => {
  if (
    req.files &&
    'thumbnailImage' in req.files &&
    req.files.thumbnailImage[0]
  ) {
    req.body.thumbnailImage = '/images/' + req.files.thumbnailImage[0].filename;
  }

  if (req.files && 'introMedia' in req.files && req.files.introMedia[0]) {
    req.body.introMedia = '/medias/' + req.files.introMedia[0].filename;
  }

  const result = await EventService.updateEvent(req.params.id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Event updated successfully',
    data: result,
  });
});

const deleteEvent = catchAsync(async (req: Request, res: Response) => {
  const result = await EventService.deleteEvent(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Event deleted successfully',
    data: result,
  });
});

const perticipate = catchAsync(async (req: Request, res: Response) => {
  const result = await EventService.perticipate(req.params.id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Event perticipate successfully',
    data: result,
  });
});

const getEventStatus = catchAsync(async (req: Request, res: Response) => {
  const user = req.user.id;
  const result = await EventService.getEventStatus(user);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Event status fetched successfully',
    data: result,
  });
});
const getEventStatusAll = catchAsync(async (req: Request, res: Response) => {
  const user = req.user.id;
  const result = await EventService.getEventStatusAll(user);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Event status fetched successfully',
    data: result,
  });
});

export const EventController = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  perticipate,
  getEventStatus,
  getEventStatusAll,
};
