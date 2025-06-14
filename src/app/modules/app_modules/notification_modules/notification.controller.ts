import { Request, Response } from 'express';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { NotificationService } from './notification.service';

const getNotificationFromDB = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const result = await NotificationService.getNotificationFromDB(user);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Notifications Retrieved Successfully',
        data: result,
    });
}
);

const adminNotificationFromDB = catchAsync(async (req: Request, res: Response) => {
    const result = await NotificationService.adminNotificationFromDB(req.query);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Notifications Retrieved Successfully',
        data: result
    });
});

const readNotification = catchAsync(async (req: Request, res: Response) => {
    const {id} = req.params;
    const result = await NotificationService.readNotificationToDB(id);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Notification Read Successfully',
        data: result
    });
});

const adminReadNotification = catchAsync(async (req: Request, res: Response) => {
    const result = await NotificationService.adminReadNotificationToDB();

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Notification Read Successfully',
        data: result
    });
});

const notificationReadUnreadCount = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const result = await NotificationService.notificationReadUnreadCount(user);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Notification read/unread count retrieved successfully',
        data: result
    });
});

export const NotificationController = {
    adminNotificationFromDB,
    getNotificationFromDB,
    readNotification,
    adminReadNotification,
    notificationReadUnreadCount
};
