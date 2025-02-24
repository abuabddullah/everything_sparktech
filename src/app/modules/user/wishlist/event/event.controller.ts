import { Request, Response } from 'express';
import catchAsync from '../../../../../shared/catchAsync';
import sendResponse from '../../../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { EventService } from './event.service';

const addEventToWishList = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const eventId = req.params.id;
  const result = await EventService.addEventToWishListToDB(userId, eventId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Event Added To WishList successfully',
    data: result,
  });
});
const removeEventFromWishList = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user.id;
    const eventId = req.params.id;
    const result = await EventService.removeEventFromWishListFromDB(
      userId,
      eventId
    );
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Event Removed From WishList successfully',
      data: result,
    });
  }
);

export const EventController = {
  addEventToWishList,
  removeEventFromWishList,
};
