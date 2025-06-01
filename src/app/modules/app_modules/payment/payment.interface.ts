import { Document, Types } from 'mongoose';
import { PAYMENT_STATUS } from '../../../../enums/payment';
import { BOOKING_PAYMENT_METHOD } from '../../../../enums/booking';

// Define the IField interface extending Document
export interface IPayment extends Document {
    bookingId: Types.ObjectId;
    vehicleId: Types.ObjectId;
    clientId: Types.ObjectId;
    amount: number;
    paymentMethod: BOOKING_PAYMENT_METHOD;
    status?: PAYMENT_STATUS;
    paymentIntent?: string;
    stripeCustomerId?: string;
}