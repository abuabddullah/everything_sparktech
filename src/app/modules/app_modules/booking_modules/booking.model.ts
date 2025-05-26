import { Schema, model, Document } from 'mongoose';
import { IBooking } from './booking.interface';
import { BOOKING_PAYMENT_METHOD, BOOKING_STATUS } from '../../../../enums/booking';

// type BookingDocument = IBooking & Document;

const BookingSchema = new Schema<IBooking>(
    {
        pickupDate: { type: Date, required: true },
        pickupTime: { type: String, required: true },
        pickupLocation: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
        returnDate: { type: Date, required: true },
        returnTime: { type: String, required: true },
        returnLocation: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
        vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
        extraServices: [{ type: Schema.Types.ObjectId, ref: 'ExtraService' }],
        clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: false },
        driverId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
        paymentMethod: { type: String, enum: Object.values(BOOKING_PAYMENT_METHOD), required: true },
        status: { type: String, enum: Object.values(BOOKING_STATUS), default: BOOKING_STATUS.NOT_CONFIRMED, required: true },
        amount: { type: Number, required: true },
        paymentId: { type: Schema.Types.ObjectId, ref: 'Transaction', required: false },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
    },
    {
        timestamps: true
    }
);

export const BookingModel = model<IBooking>('Booking', BookingSchema);