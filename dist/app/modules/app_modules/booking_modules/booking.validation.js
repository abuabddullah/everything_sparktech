"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingValidation = exports.createBookingValidationSchema = void 0;
const zod_1 = require("zod");
const booking_1 = require("../../../../enums/booking");
// Helper for MongoDB ObjectId validation (24 hex chars)
const objectIdSchema = zod_1.z.string().regex(/^[a-f\d]{24}$/i, { message: "Invalid ObjectId" });
exports.createBookingValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        pickupDate: zod_1.z.string().min(1, "pickupDate is required"),
        pickupTime: zod_1.z.string().min(1, "pickupTime is required"),
        pickupLocation: objectIdSchema,
        returnDate: zod_1.z.string().min(1, "returnDate is required"),
        returnTime: zod_1.z.string().min(1, "returnTime is required"),
        returnLocation: objectIdSchema,
        vehicle: objectIdSchema,
        extraServices: zod_1.z.array(objectIdSchema).optional(),
        clientDetails: zod_1.z.object({
            firstName: zod_1.z.string().min(1, "firstName is required"),
            lastName: zod_1.z.string().min(1, "lastName is required"),
            email: zod_1.z.string().email("Invalid email"),
            phone: zod_1.z.string().min(1, "phone is required"),
            parmanentAddress: zod_1.z.string().min(1, "parmanentAddress is required").optional(),
            country: zod_1.z.string().min(1, "country is required").optional(),
            presentAddress: zod_1.z.string().min(1, "presentAddress is required").optional(),
            State: zod_1.z.string().min(1, "State is required").optional(),
            postCode: zod_1.z.string().min(1, "postCode is required").optional(),
        }),
        paymentMethod: zod_1.z.enum([...Object.values(booking_1.BOOKING_PAYMENT_METHOD)]).default(booking_1.BOOKING_PAYMENT_METHOD.BANK),
        paymentId: zod_1.z.string().min(1, "paymentId is required").optional(),
        // ammount: z.number().positive("ammount must be positive").optional(),
        status: zod_1.z.enum([...Object.values(booking_1.BOOKING_STATUS)]).default(booking_1.BOOKING_STATUS.NOT_CONFIRMED),
    })
});
const getAvailableDriversValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        pickupDateAndTime: zod_1.z.string().min(1, "pickupDate is required"),
        returnDateAndTime: zod_1.z.string().min(1, "pickupDate is required"),
    })
});
const updateDriverValidationSchema = zod_1.z.object({
    body: zod_1.z.object({ driverID: objectIdSchema, })
});
exports.BookingValidation = {
    createBookingValidationSchema: exports.createBookingValidationSchema,
    updateDriverValidationSchema,
    getAvailableDriversValidationSchema
};
