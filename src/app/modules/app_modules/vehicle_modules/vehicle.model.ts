import { Schema, model, Document } from "mongoose";
import { FUEL_TYPES, PRICING_CHART, TRANSMISSION_TYPES, VEHICLE_STATUS, VEHICLE_TYPES } from "../../../../enums/vehicle";
import { IVehicle } from "./vehicle.interface";



const vehicleRateSchema = new Schema({
  vehicleType: { type: String, enum: Object.values(VEHICLE_TYPES), required: true },
  rate: { type: Number, required: true },
}, { _id: false });

const vehicleSchema = new Schema<IVehicle>(
  {
    vehicleType: { type: String, enum: Object.values(VEHICLE_TYPES), required: true },
    name: { type: String, required: true },
    model: { type: String, required: true },
    brand: { type: String },
    transmissionType: { type: String, enum: Object.values(TRANSMISSION_TYPES), required: true },
    shortDescription: { type: String, required: true },
    licenseNumber: { type: String, required: true, unique: true },
    vin: { type: String },
    fuelType: { type: String, enum: Object.values(FUEL_TYPES) },
    noOfSeats: { type: Number, required: true, max: 7, min: 2 },
    noOfDoors: { type: Number, required: true },
    noOfLuggages: { type: Number, required: true },
    image: { type: String, required: false },
    dailyRate: { type: Number, required: true },
    dailyRates: { type: [vehicleRateSchema], required: true },
    status: { type: String, enum: Object.values(VEHICLE_STATUS), default: VEHICLE_STATUS.AVAILABLE, required: true },
    lastMaintenanceDate: { type: Date },
    bookings: [
      { type: Schema.Types.ObjectId, ref: "Booking", required: false },
    ],
  },
  {
    timestamps: true,
    strict: false, // Allows additional properties
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);


vehicleSchema.pre("save", function (next) {
  const baseDailyRate = this.dailyRate;
  const vehicleType = this.vehicleType;

  if (!baseDailyRate) return next(new Error("dailyRate is required"));
  if (!vehicleType) return next(new Error("vehicleType is required"));

  // Get vehicle multiplier for the incoming vehicleType
  const vehicleTypeMultiplier = PRICING_CHART[vehicleType as keyof typeof PRICING_CHART];
  if (!vehicleTypeMultiplier) return next(new Error(`Unknown vehicleType multiplier for ${vehicleType}`));

  // Calculate the base rate (multiplier = 1.0) by dividing incoming rate by vehicleType multiplier
  const standardBaseRate = baseDailyRate / vehicleTypeMultiplier;

  // Filter string keys only from enum (due to TS enum key/value duality)
  const vehicleTypes = Object.keys(PRICING_CHART).filter(key => isNaN(Number(key)));

  // Generate dailyRates array based on calculated base rate
  const dailyRates = vehicleTypes.map(type => {
    const multiplier = PRICING_CHART[type as keyof typeof PRICING_CHART];
    const rate = parseFloat((standardBaseRate * multiplier).toFixed(2));
    return { vehicleType: type as VEHICLE_TYPES, rate };
  });

  this.dailyRates = dailyRates;

  next();
});




export const Vehicle = model<IVehicle>("Vehicle", vehicleSchema);