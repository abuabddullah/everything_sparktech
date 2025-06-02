import { Schema, model, Document, Types } from 'mongoose';
import { IPayment } from './payment.interface';
import { PAYMENT_STATUS } from '../../../../enums/payment';
import { BOOKING_PAYMENT_METHOD } from '../../../../enums/booking';

const PaymentSchema = new Schema<IPayment>({
    bookingId: { type: Schema.Types.ObjectId, required: true, ref: 'Booking' },
    vehicleId: { type: Schema.Types.ObjectId, required: true, ref: 'Vehicle' },
    clientId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    stripeCustomerId: { type: String },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, enum: Object.values(BOOKING_PAYMENT_METHOD), required: true },
    status: { type: String, enum: Object.values(PAYMENT_STATUS), required: true, default: PAYMENT_STATUS.PAID },
    paymentIntent: { type: String },
}, { timestamps: true });

export const PaymentModel = model<IPayment>('Payment', PaymentSchema);