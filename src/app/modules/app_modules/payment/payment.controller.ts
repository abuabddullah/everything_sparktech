
import { Request, Response } from 'express';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { paymentService } from './payment.service';
import { BookingModel } from '../booking_modules/booking.model';
import { BookingService } from '../booking_modules/booking.service';
import mongoose from 'mongoose';
import { IBooking } from '../booking_modules/booking.interface';
import { User } from '../../user/user.model';
import { USER_ROLES } from '../../../../enums/user';
import { NOTIFICATION_CATEGORIES, NOTIFICATION_TYPE } from '../notification_modules/notification.constant';
import { sendNotifications } from '../../../../helpers/notificationsHelper';

// Create Field
const createPayment = catchAsync(async (req: Request, res: Response) => {
    const result = await paymentService.createPaymentService(req.body);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Payment successfully',
        data: result,
    });
});

const getPaymentByCustomer = catchAsync(async (req, res) => {
    const { userId, role }: any = req.user;

    const { result } = await paymentService.getAllPaymentByUserId(
        userId,
        role,
        req.query,
    );

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        data: result,
        message: ' All payment get successful!!',
    });
});
const getAllPaymentByOwnerId = catchAsync(async (req, res) => {
    const { userId }: any = req.user;
    // console.log({ userId });
    const result = await paymentService.getAllPaymentByOwnerIdService(userId);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        data: result,
        message: ' All payment get successful!!',
    });
});

const getLast12MonthsEarnings = catchAsync(async (req, res) => {
    const { userId, role }: any = req.user;
    // console.log({ userId });
    const result = await paymentService.getLast12MonthsEarningsService(
        userId,
        role,
    );

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        data: result,
        message: 'Last 12MonthsEarnings get successful!!',
    });
});

const successPage = catchAsync(async (req, res) => {
    const { bookingId } = req.query;
    await BookingService.updateBookingIsPaid(bookingId as string, true);
    res.render('success.ejs');
});

const cancelPage = catchAsync(async (req, res) => {
    res.render('cancel.ejs');
});

export const paymenController = {
    createPayment,
    getPaymentByCustomer,
    getAllPaymentByOwnerId,
    getLast12MonthsEarnings,
    successPage,
    cancelPage,
};
