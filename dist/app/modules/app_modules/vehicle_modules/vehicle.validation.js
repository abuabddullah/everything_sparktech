"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleZodValidation = exports.createVehicleZodSchema = void 0;
const zod_1 = require("zod");
const vehicle_1 = require("../../../../enums/vehicle");
exports.createVehicleZodSchema = zod_1.z.object({
    vehicleType: zod_1.z.enum([...Object.values(vehicle_1.VEHICLE_TYPES)]),
    name: zod_1.z.string(),
    model: zod_1.z.string(),
    brand: zod_1.z.string().optional(),
    transmissionType: zod_1.z.enum([...Object.values(vehicle_1.TRANSMISSION_TYPES)]),
    shortDescription: zod_1.z.string(),
    licenseNumber: zod_1.z.string(),
    vin: zod_1.z.string().optional(),
    fuelType: zod_1.z.enum([...Object.values(vehicle_1.FUEL_TYPES)]).optional(),
    noOfSeats: zod_1.z.number(),
    noOfDoors: zod_1.z.number(),
    noOfLuggages: zod_1.z.number(),
    image: zod_1.z.string().optional(),
    dailyRate: zod_1.z.number(),
    status: zod_1.z.enum([...Object.values(vehicle_1.VEHICLE_STATUS)]).default(vehicle_1.VEHICLE_STATUS.AVAILABLE),
});
exports.VehicleZodValidation = {
    createVehicleZodSchema: exports.createVehicleZodSchema,
};
