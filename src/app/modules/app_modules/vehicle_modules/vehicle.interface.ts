import { Types } from "mongoose";
import { FUEL_TYPES, TRANSMISSION_TYPES, VEHICLE_STATUS, VEHICLE_TYPES } from "../../../../enums/vehicle";

export type IVehicle = {
    _id?: Types.ObjectId;
    carType: VEHICLE_TYPES;
    name: string;
    model: string;
    brand?: string;
    transmissionType: TRANSMISSION_TYPES;
    shortDescription: string;
    licenseNumber: string;
    vin?: string; // Optional field for Vehicle Identification Number
    fuelType?: FUEL_TYPES; // Optional field for fuel type
    noOfSeats: number;
    noOfDoors: number;
    noOfLuggages: number;
    image?: string; // Optional field for vehicle image
    dailyRate: number;
    status: VEHICLE_STATUS; // e.g., 
    lastMaintenanceDate?: Date; // Optional field for last maintenance date
    avgRating?: number; // Optional field for vehicle rating
    reviews?: {
        user: Types.ObjectId; // Reference to User
        comment: string;
        rating: number; // Rating between 1 and 5
    }[];
    [key: string]: any; // Allow additional properties
};