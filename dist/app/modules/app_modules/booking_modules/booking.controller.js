"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingController = void 0;
const catchAsync_1 = __importDefault(require("../../../../shared/catchAsync"));
const booking_service_1 = require("./booking.service");
const sendResponse_1 = __importDefault(require("../../../../shared/sendResponse"));
const http_status_codes_1 = require("http-status-codes");
const createBooking = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const bookingData = req.body;
    const createdBooking = yield booking_service_1.BookingService.createBookingToDB(bookingData);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        message: 'Booking created successfully',
        data: createdBooking,
    });
}));
const getAllBookings = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield booking_service_1.BookingService.getAllBookingsFromDB(req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Bookings retrieved successfully',
        data: result,
    });
}));
const searchBooking = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { searchTerm, page, limit } = req.query;
    if (!searchTerm) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_codes_1.StatusCodes.BAD_REQUEST,
            message: 'Search term is required',
        });
    }
    const result = yield booking_service_1.BookingService.searchBookingFromDB({ searchTerm: searchTerm, page, limit });
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Bookings retrieved successfully',
        data: result,
    });
}));
const deleteBooking = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield booking_service_1.BookingService.deleteBookingFromDB(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Booking deleted successfully',
        data: result,
    });
}));
exports.BookingController = {
    createBooking,
    getAllBookings,
    searchBooking,
    deleteBooking,
    getAvailableDriverForAssignABooking: () => {
        // get pickupDateAndTime and returnDateAndTime from req.body and findMany in the bookingModel get all the assigned driver'sID of those foundManyBookings and then do findMany in userModel based on role DRIVER and no match those assigned driver'sID and retrived the dirverList
        return 0;
    },
    assignDriverToBooking: () => {
        // ekhane driver assign korar jonno booking er id vehicle.driverId  + driver.bookings.push(booking id) change korte hobe
        // also must Booking e jokhon driver assign korben tokhon driver change service e vehicle er driver id o change hobe
        // must remove the booking and unavailable slots from the driver-user model for this booking
        return 0;
    }
};
