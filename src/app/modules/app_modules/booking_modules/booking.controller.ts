import { NextFunction, Request, response, Response } from "express";
import catchAsync from "../../../../shared/catchAsync"
import { BookingService } from "./booking.service";
import sendResponse from "../../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { BookingModel } from "./booking.model";
import { BOOKING_STATUS } from "../../../../enums/booking";

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

const getRangeBookingsForExport = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const result = await BookingService.getRangeBookingsForExportFromDB(req.query);

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

const assignDriverToBooking = catchAsync(async (req: Request, res: Response) => {
    const { driverId } = req.body;  // Changed from req.body to req.query
    const { id } = req.params;
    const result = await BookingService.assignDriverToBooking(driverId as string, id);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Booking retrieved successfully',
        data: result,
    });
});

const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
    const { status } = req.body;
    const { id } = req.params;

    if (!status) {
        return sendResponse(res, {
            success: false,
            statusCode: StatusCodes.BAD_REQUEST,
            message: 'Status is required',
        });
    }


    if (!Object.values(BOOKING_STATUS).includes(status)) {
        return sendResponse(res, {
            success: false,
            statusCode: StatusCodes.BAD_REQUEST,
            message: `Status must be one of: ${Object.values(BOOKING_STATUS).join(', ')}`,
        });
    }

    const result = await BookingService.updateBookingStatusInDB(id, status);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Booking status updated successfully',
        data: result,
    });
});

const getABookingID = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await BookingService.getABookingByIDFromDB(id);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Booking retrieved successfully',
        data: result,
    });
});

const getBookingByDriverID = catchAsync(async (req: Request, res: Response) => {
    const { driverId } = req.params;
    if (!driverId) {
        return sendResponse(res, {
            success: false,
            statusCode: StatusCodes.BAD_REQUEST,
            message: 'Driver ID is required',
        });
    }

    const result = await BookingService.getBookingByDriverIDFromDB(driverId);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Bookings retrieved successfully',
        data: result,
    });
});

export const BookingController = {
    createBooking,
    getAllBookings,
    getRangeBookingsForExport,
    searchBooking,
    deleteBooking,
    getAvailableDriverForAssignABooking: () => {
        // get pickupDateAndTime and returnDateAndTime from req.body and findMany in the bookingModel get all the assigned driver'sID of those foundManyBookings and then do findMany in userModel based on role DRIVER and no match those assigned driver'sID and retrived the dirverList
        return 0
    },
    getABookingByEmailAndID,
    assignDriverToBooking,
    updateBookingStatus,
    getABookingID,
    getBookingByDriverID
}