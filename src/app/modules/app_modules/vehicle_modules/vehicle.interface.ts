import { FUEL_TYPES, TRANSMISSION_TYPES, VEHICLE_TYPES } from "../../../../enums/vehicle";

export type IVehicle = {
    carType: VEHICLE_TYPES;
    name: string;
    model: string;
    transmissionType: TRANSMISSION_TYPES;
    shortDescription: string;
    licensePlate: string;
    vin?: string; // Optional field for Vehicle Identification Number
    fuelType?: FUEL_TYPES; // Optional field for fuel type
    noOfSeats: number;
    noOfDoors: number;
    noOfLuggages: number;
    image?: string; // Optional field for vehicle image
    dailyRate: number;
    [key: string]: any; // Allow additional properties
};