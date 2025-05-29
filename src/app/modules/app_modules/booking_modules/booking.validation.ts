import { z } from "zod";
import { BOOKING_PAYMENT_METHOD, BOOKING_STATUS } from "../../../../enums/booking";

// Helper for MongoDB ObjectId validation (24 hex chars)
const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, { message: "Invalid ObjectId" });
const validEmailSchema = z.string().regex(
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    { message: "Invalid email address" }
);

export const createBookingValidationSchema = z.object({
    body: z.object({
        pickupDate: z.string().min(1, "pickupDate is required"),
        pickupTime: z.string().min(1, "pickupTime is required"),
        pickupLocation: objectIdSchema,
        returnDate: z.string().min(1, "returnDate is required"),
        returnTime: z.string().min(1, "returnTime is required"),
        returnLocation: objectIdSchema,
        vehicle: objectIdSchema,
        extraServices: z.array(objectIdSchema).optional(),
        clientDetails: z.object({
            firstName: z.string().min(1, "firstName is required"),
            lastName: z.string().min(1, "lastName is required"),
            email: z.string().email("Invalid email"),
            phone: z.string().min(1, "phone is required"),
            parmanentAddress: z.string().min(1, "parmanentAddress is required").optional(),
            country: z.string().min(1, "country is required").optional(),
            presentAddress: z.string().min(1, "presentAddress is required").optional(),
            State: z.string().min(1, "State is required").optional(),
            postCode: z.string().min(1, "postCode is required").optional(),
        }),
        paymentMethod: z.enum([...(Object.values(BOOKING_PAYMENT_METHOD) as [string, ...string[]])]).default(BOOKING_PAYMENT_METHOD.BANK),
        paymentId: z.string().min(1, "paymentId is required").optional(),
        // ammount: z.number().positive("ammount must be positive").optional(),
        status: z.enum([...(Object.values(BOOKING_STATUS) as [string, ...string[]])]).default(BOOKING_STATUS.NOT_CONFIRMED),
    })
});

const getAvailableDriversValidationSchema = z.object({
    body: z.object({
        pickupDateAndTime: z.string().min(1, "pickupDate is required"),
        returnDateAndTime: z.string().min(1, "pickupDate is required"),
    })
})

const updateDriverValidationSchema = z.object({
    body: z.object({ driverID: objectIdSchema, })
})

const getABookingSchemaValidation = z.object({
    query: z.object({
        clientEmail: z.string(),
    }),
});


export const BookingValidation = {
    createBookingValidationSchema,
    updateDriverValidationSchema,
    getAvailableDriversValidationSchema,
    getABookingSchemaValidation
}