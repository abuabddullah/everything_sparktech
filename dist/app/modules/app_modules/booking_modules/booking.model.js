"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingModel = void 0;
const mongoose_1 = require("mongoose");
const booking_1 = require("../../../../enums/booking");
// type BookingDocument = IBooking & Document;
const BookingSchema = new mongoose_1.Schema({
    pickupDate: { type: Date, required: true },
    pickupTime: { type: Date, required: true },
    pickupLocation: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Location', required: true },
    returnDate: { type: Date, required: true },
    returnTime: { type: Date, required: true },
    returnLocation: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Location', required: true },
    vehicle: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    extraServices: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'ExtraService' }],
    clientId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Client', required: false },
    driverId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: false },
    paymentMethod: { type: String, enum: Object.values(booking_1.BOOKING_PAYMENT_METHOD), required: true },
    status: { type: String, enum: Object.values(booking_1.BOOKING_STATUS), default: booking_1.BOOKING_STATUS.NOT_CONFIRMED, required: true },
    amount: { type: Number, required: true },
    carRentedForInDays: { type: Number, required: true },
    paymentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Transaction', required: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});
exports.BookingModel = (0, mongoose_1.model)('Booking', BookingSchema);
