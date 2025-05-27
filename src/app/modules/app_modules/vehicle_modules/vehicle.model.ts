import { Schema, model, Document } from "mongoose";
import { FUEL_TYPES, TRANSMISSION_TYPES, VEHICLE_STATUS, VEHICLE_TYPES } from "../../../../enums/vehicle";
import { IVehicle } from "./vehicle.interface";


const vehicleSchema = new Schema<IVehicle>(
  {
    carType: { type: String, enum: Object.values(VEHICLE_TYPES), required: true },
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
    image: { type: String },
    dailyRate: { type: Number, required: true },
    status: { type: String, enum: Object.values(VEHICLE_STATUS), default: VEHICLE_STATUS.AVAILABLE, required: true },
    lastMaintenanceDate: { type: Date },
    avgRating: { type: Number, min: 1, max: 5, default: 1 },
    reviews: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User", required: false },
        comment: { type: String, required: false },
        rating: { type: Number, min: 1, max: 5, required: false, default: 1 },
      },
    ],
    bookings: [
      { type: Schema.Types.ObjectId, ref: "Booking", required: false },
    ],
    unavailable_slots: [
      {
        start: { type: Date, required: true },
        end: { type: Date, required: true },
      },
    ],
  },
  {
    timestamps: true,
    strict: false, // Allows additional properties
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add a virtual field `reviewsCount` that returns the length of the `reviews` array
vehicleSchema.virtual('reviewsCount').get(function (this: any) {
  return this.reviews ? this.reviews.length : 0; // Return 0 if no reviews exist
});


export const Vehicle = model<IVehicle>("Vehicle", vehicleSchema);