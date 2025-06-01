
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
    const { userId } = req.user;

    req.body.customerId = userId;

    const result = await paymentService.createPaymentService(req.body);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Court booking successfully',
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

    // send notification to the admins with booking details

    // get booking details
    const booking = await BookingModel.findById(bookingId)
        .populate({ path: 'clientId', select: 'firstName lastName' })
        .populate({ path: 'vehicle', select: 'name' })
        .lean();
    if (booking) {
        // get client details
        const clientDetails = booking.clientId as any;
        // get vehicle details
        const isExistingVehicle = booking.vehicle as any;

        // get all the admin users from the database
        const adminUsers = await User.find({ role: { $in: [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN] } });
        const adminUserIds = adminUsers.map(user => user._id);

        // create notification data
        const notificationData = {
            text: `New booking created by ${clientDetails.firstName} ${clientDetails.lastName} for vehicle ${isExistingVehicle.name}. Booking ID: ${booking._id}`,
            receiver: adminUserIds, // Send to all admin users
            read: false,
            referenceId: (booking as IBooking & { _id: mongoose.Types.ObjectId })._id.toString(),
            category: NOTIFICATION_CATEGORIES.RESERVATION,
            type: NOTIFICATION_TYPE.ADMIN,
        };
        await sendNotifications(notificationData);
    }
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
