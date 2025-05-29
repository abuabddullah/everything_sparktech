import { NextFunction, Request, response, Response } from "express";
import catchAsync from "../../../../shared/catchAsync"
import { BookingService } from "./booking.service";
import sendResponse from "../../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { BookingModel } from "./booking.model";

const createBooking = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const bookingData = req.body;

        const createdBooking = await BookingService.createBookingToDB(bookingData);


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

const deleteBooking = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await BookingService.deleteBookingFromDB(id);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Booking deleted successfully',
        data: result,
    });
});

const getABookingByEmailAndID = catchAsync(async (req: Request, res: Response) => {
    const { clientEmail } = req.query;  // Changed from req.body to req.query
    const { id } = req.params;
    const result = await BookingService.getABookingByEmailAndIDFromDB(clientEmail as string, id);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Booking retrieved successfully',
        data: result,
    });
});


export const BookingController = {
    createBooking,
    getAllBookings,
    searchBooking,
    deleteBooking,
    getAvailableDriverForAssignABooking: () => {
        // get pickupDateAndTime and returnDateAndTime from req.body and findMany in the bookingModel get all the assigned driver'sID of those foundManyBookings and then do findMany in userModel based on role DRIVER and no match those assigned driver'sID and retrived the dirverList
        return 0
    },
    assignDriverToBooking: () => {
        // ekhane driver assign korar jonno booking er id vehicle.driverId  + driver.bookings.push(booking id) change korte hobe
        // also must Booking e jokhon driver assign korben tokhon driver change service e vehicle er driver id o change hobe
        // must remove the booking and unavailable slots from the driver-user model for this booking
        return 0
    },
    getABookingByEmailAndID,
}