"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vehicle = void 0;
const mongoose_1 = require("mongoose");
const vehicle_1 = require("../../../../enums/vehicle");
const vehicleSchema = new mongoose_1.Schema({
    vehicleType: { type: String, enum: Object.values(vehicle_1.VEHICLE_TYPES), required: true },
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
    image: { type: String, required: true },
    dailyRate: { type: Number, required: true },
    status: { type: String, enum: Object.values(vehicle_1.VEHICLE_STATUS), default: vehicle_1.VEHICLE_STATUS.AVAILABLE, required: true },
    lastMaintenanceDate: { type: Date },
    bookings: [
        { type: mongoose_1.Schema.Types.ObjectId, ref: "Booking", required: false },
    ],
}, {
    timestamps: true,
    strict: false, // Allows additional properties
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
exports.Vehicle = (0, mongoose_1.model)("Vehicle", vehicleSchema);
