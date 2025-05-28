"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vehicle = void 0;
const mongoose_1 = require("mongoose");
const vehicle_1 = require("../../../../enums/vehicle");
const vehicleSchema = new mongoose_1.Schema({
    carType: { type: String, enum: Object.values(vehicle_1.VEHICLE_TYPES), required: true },
    name: { type: String, required: true },
    model: { type: String, required: true },
    brand: { type: String },
    transmissionType: { type: String, enum: Object.values(vehicle_1.TRANSMISSION_TYPES), required: true },
    shortDescription: { type: String, required: true },
    licenseNumber: { type: String, required: true, unique: true },
    vin: { type: String },
    fuelType: { type: String, enum: Object.values(vehicle_1.FUEL_TYPES) },
    noOfSeats: { type: Number, required: true, max: 7, min: 2 },
    noOfDoors: { type: Number, required: true },
    noOfLuggages: { type: Number, required: true },
    image: { type: String },
    dailyRate: { type: Number, required: true },
    status: { type: String, enum: Object.values(vehicle_1.VEHICLE_STATUS), default: vehicle_1.VEHICLE_STATUS.AVAILABLE, required: true },
    lastMaintenanceDate: { type: Date },
    avgRating: { type: Number, min: 1, max: 5, default: 1 },
    reviews: [
        {
            user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: false },
            comment: { type: String, required: false },
            rating: { type: Number, min: 1, max: 5, required: false, default: 1 },
        },
    ],
    bookings: [
        { type: mongoose_1.Schema.Types.ObjectId, ref: "Booking", required: false },
    ],
    // unavailable_slots: [
    //     {
    //         start: { type: Date, required: true },
    //         end: { type: Date, required: true },
    //     },
    // ],
}, {
    timestamps: true,
    strict: false, // Allows additional properties
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// Add a virtual field `reviewsCount` that returns the length of the `reviews` array
vehicleSchema.virtual('reviewsCount').get(function () {
    return this.reviews ? this.reviews.length : 0; // Return 0 if no reviews exist
});
exports.Vehicle = (0, mongoose_1.model)("Vehicle", vehicleSchema);
