import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../../shared/catchAsync"
import { BookingService } from "./booking.service";
import sendResponse from "../../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

const createBooking = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const bookingData = req.body;
        
        const createdBooking = await BookingService.createBookingToDB(bookingData);
        console.log({createBooking})


        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.CREATED,
            message: 'Booking created successfully',
            data: createdBooking,
        });
    }
);

const getAllBookings = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const result = await BookingService.getAllBookingsFromDB(req.query);

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: 'Bookings retrieved successfully',
            data: result,
        });
    }
);

export const BookingController = {
    createBooking,
    getAllBookings,
    assignDriverToBooking:()=>0
}