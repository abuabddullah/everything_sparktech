import { Schema, model, Document } from "mongoose";
import { FUEL_TYPES, TRANSMISSION_TYPES, VEHICLE_TYPES } from "../../../../enums/vehicle";
import { IVehicle } from "./vehicle.interface";


const vehicleSchema = new Schema<IVehicle>(
  {
    carType: { type: String, enum: Object.values(VEHICLE_TYPES), required: true },
    name: { type: String, required: true },
    model: { type: String, required: true },
    transmissionType: { type: String, enum: Object.values(TRANSMISSION_TYPES), required: true },
    shortDescription: { type: String, required: true },
    licensePlate: { type: String, required: true, unique: true },
    vin: { type: String },
    fuelType: { type: String, enum: Object.values(FUEL_TYPES) },
    noOfSeats: { type: Number, required: true },
    noOfDoors: { type: Number, required: true },
    noOfLuggages: { type: Number, required: true },
    image: { type: String },
    dailyRate: { type: Number, required: true },
  },
  {
    timestamps: true,
    strict: false, // Allows additional properties
  }
);

export const Vehicle = model<IVehicle>("Vehicle", vehicleSchema);