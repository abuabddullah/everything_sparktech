
// booking.interface.ts
import { Document, Model, Types } from 'mongoose';
import { BOOKING_PAYMENT_METHOD, BOOKING_STATUS } from '../../../../enums/booking';
import { VEHICLE_TYPES } from '../../../../enums/vehicle';

export interface IExtraServiceDetails {
    serviceId: Types.ObjectId; // Reference to the ExtraService model
    quantity?: number; // Quantity of this extra service being booked
}


export interface IBooking extends Document {
    pickupDate: Date;
    pickupTime: Date;
    pickupLocation: Types.ObjectId; // Assuming this is a reference to a location model
    returnDate: Date;
    returnTime: Date;
    returnLocation: Types.ObjectId; // Assuming this is a reference to a location model
    vehicle: Types.ObjectId; // Reference to the vehicle being booked
    vehicleType: VEHICLE_TYPES;
    extraServices: IExtraServiceDetails[];// Array of extra services
    clientId: Types.ObjectId; // Reference to the client making the booking
    driverId?: Types.ObjectId; // Reference to the driver assigned to the booking
    paymentMethod: BOOKING_PAYMENT_METHOD; // Payment method used for the booking
    status: BOOKING_STATUS; // Status of the booking (e.g., PENDING, CONFIRMED, CANCELLED, COMPLETED)
    amount: number; // Total amount for the booking
    carRentedForInDays: number; // Total carRentedForInDays for the booking
    paymentId?: Types.ObjectId; // Reference to the payment transaction
    isPaid: boolean;
    createdAt?: Date; // Automatically managed by Mongoose
    updatedAt?: Date; // Automatically managed by Mongoose

}

export interface IBookingRequestBody {
    pickupDate: Date;
    pickupTime: Date;
    pickupLocation: Types.ObjectId;
    returnDate: Date;
    returnTime: Date;
    returnLocation: Types.ObjectId;
    vehicle: Types.ObjectId | {
        vehicleId: Types.ObjectId;
        vehicleType: VEHICLE_TYPES;
        rate?: number;
    };
    extraServices?: IExtraServiceDetails[];
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
    paymentMethod: BOOKING_PAYMENT_METHOD; // STRIPE | BANK
    // amount?: number; // Positive number
    status: BOOKING_STATUS; // NOT_CONFIRMED | CONFIRMED | CANCELED | COMPLETED

}


export interface ISearchBookingParams {
    searchTerm: string;
    limit?: number | string | undefined | unknown;
    page?: number | string | undefined | unknown;
}

export interface BookingModel extends Model<IBooking> {
    // Define any custom static methods here if needed
    findByClientId(clientId: Types.ObjectId): Promise<IBooking[]>;
    findByVehicleId(vehicleId: Types.ObjectId): Promise<IBooking[]>;
}
