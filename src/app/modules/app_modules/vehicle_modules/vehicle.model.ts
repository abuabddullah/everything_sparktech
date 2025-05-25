import { Schema, model, Document } from "mongoose";
import { FUEL_TYPES, TRANSMISSION_TYPES, VEHICLE_STATUS, VEHICLE_TYPES } from "../../../../enums/vehicle";
import { IVehicle } from "./vehicle.interface";


const vehicleSchema = new Schema<IVehicle>(
  {
    carType: { type: String, enum: Object.values(VEHICLE_TYPES), required: true },
    name: { type: String, required: true },
    model: { type: String, required: true },
    transmissionType: { type: String, enum: Object.values(TRANSMISSION_TYPES), required: true },
    shortDescription: { type: String, required: true },
    licenseNumber: { type: String, required: true, unique: true },
    vin: { type: String },
    fuelType: { type: String, enum: Object.values(FUEL_TYPES) },
    noOfSeats: { type: Number, required: true,max: 7, min: 2 },
    noOfDoors: { type: Number, required: true },
    noOfLuggages: { type: Number, required: true },
    image: { type: String },
    dailyRate: { type: Number, required: true },
    status: { type: String, enum: Object.values(VEHICLE_STATUS), default: VEHICLE_STATUS.AVAILABLE, required: true },
    lastMaintenanceDate: { type: Date },
  },
  {
    timestamps: true,
    strict: false, // Allows additional properties
  }
);

export const Vehicle = model<IVehicle>("Vehicle", vehicleSchema);