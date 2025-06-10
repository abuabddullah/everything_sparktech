import { Types } from "mongoose";
import { FUEL_TYPES, TRANSMISSION_TYPES, VEHICLE_STATUS, VEHICLE_TYPES } from "../../../../enums/vehicle";


export type DailyRateVariant = {
    vehicleType: VEHICLE_TYPES;
    rate: number;
};

export type IVehicle = {
    _id?: Types.ObjectId;
    vehicleType: VEHICLE_TYPES;
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
    dailyRates?: DailyRateVariant[];
    status: VEHICLE_STATUS; // e.g., 
    lastMaintenanceDate?: Date; // Optional field for last maintenance date
    [key: string]: any; // Allow additional properties
};