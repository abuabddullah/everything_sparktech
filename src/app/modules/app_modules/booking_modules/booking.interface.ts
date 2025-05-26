// req.body should be of type BookingRequest

// booking.json.body = {
//     pickupDate:
//     pickupTime:
//     pickupLocation: objectId
//     returnDate:
//     returnTime:
//     returnLocation: objectId,
//     vehicle: objectId,
//     extraServices: [objectId],
//     userDetails:{
//         firstName:
//         lastName:
//         email:
//         phone:
//         parmanentAddress:
//         country,
//         presentAddress,
//         State,
//         postCode,
//     },
//     paymentMethod: STRIP | BANK
//     ammount:
//     status: 'NOT CONFRIMED|  CONFIRMED| CANCELED | COMPLETED'

// }

// booking.interface.ts
import { Document, Model, Types } from 'mongoose';
import { BOOKING_PAYMENT_METHOD, BOOKING_STATUS } from '../../../../enums/booking';
export interface IBooking extends Document {
    pickupDate: Date;
    pickupTime: string;
    pickupLocation: Types.ObjectId; // Assuming this is a reference to a location model
    returnDate: Date;
    returnTime: string;
    returnLocation: Types.ObjectId; // Assuming this is a reference to a location model
    vehicle: Types.ObjectId; // Reference to the vehicle being booked
    extraServices: Types.ObjectId[]; // Array of extra services
    clientId: Types.ObjectId; // Reference to the client making the booking
    driverId?: Types.ObjectId; // Reference to the driver assigned to the booking
    paymentMethod: BOOKING_PAYMENT_METHOD; // Payment method used for the booking
    status: BOOKING_STATUS; // Status of the booking (e.g., PENDING, CONFIRMED, CANCELLED, COMPLETED)
    amount: number; // Total amount for the booking
    paymentId?: Types.ObjectId; // Reference to the payment transaction
    createdAt?: Date; // Automatically managed by Mongoose
    updatedAt?: Date; // Automatically managed by Mongoose

}

export interface IBookingRequestBody {
    pickupDate: Date;
    pickupTime: string;
    pickupLocation: Types.ObjectId;
    returnDate: Date;
    returnTime: string;
    returnLocation: Types.ObjectId;
    vehicle: Types.ObjectId;
    extraServices?: Types.ObjectId[];
    clientId?: Types.ObjectId; // Optional, if client already exists
    clientDetails: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        parmanentAddress?: string;
        country?: string;
        presentAddress?: string;
        state?: string;
        postCode?: string;
    };
    paymentMethod: BOOKING_PAYMENT_METHOD; // STRIP | BANK
    // amount?: number; // Positive number
    status: BOOKING_STATUS; // NOT CONFIRMED | CONFIRMED | CANCELED | COMPLETED

}

export interface BookingModel extends Model<IBooking> {
    // Define any custom static methods here if needed
    findByClientId(clientId: Types.ObjectId): Promise<IBooking[]>;
    findByVehicleId(vehicleId: Types.ObjectId): Promise<IBooking[]>;
}
