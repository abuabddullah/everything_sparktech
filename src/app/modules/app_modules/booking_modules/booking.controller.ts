import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../../shared/catchAsync"
import { BookingService } from "./booking.service";
import sendResponse from "../../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

const createBooking = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const bookingData = req.body;

        const createdBooking = await BookingService.createBookingToDB(bookingData);
        console.log({ createBooking })


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

const searchBooking = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { searchTerm, page, limit } = req.query;

        if (!searchTerm) {
            return sendResponse(res, {
                success: false,
                statusCode: StatusCodes.BAD_REQUEST,
                message: 'Search term is required',
            });
        }

        const result = await BookingService.searchBookingFromDB({ searchTerm: searchTerm as string, page, limit });

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
    searchBooking,
    deleteBooking:()=>{
        // must remove the booking and unavailable slots from the vehicle model for this booking
        return 0
    },
    assignDriverToBooking: () => {
        // ekhane driver assign korar jonno booking er vehicle er driver id change korte hobe
        // also must Booking e jokhon driver assign korben tokhon driver change service e vehicle er driver id o change hobe
        return 0
    }
}