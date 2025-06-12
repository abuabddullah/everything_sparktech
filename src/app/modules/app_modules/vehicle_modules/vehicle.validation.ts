import { z } from 'zod';
import { FUEL_TYPES, TRANSMISSION_TYPES, VEHICLE_STATUS, VEHICLE_TYPES } from '../../../../enums/vehicle';

export const createVehicleZodSchema = z.object({
  vehicleType: z.enum([...(Object.values(VEHICLE_TYPES) as [string, ...string[]])]),
  name: z.string(),
  model: z.string(),
  brand: z.string().optional(),
  transmissionType: z.enum([...(Object.values(TRANSMISSION_TYPES) as [string, ...string[]])]),
  shortDescription: z.string(),
  licenseNumber: z.string(),
  vin: z.string().optional(),
  fuelType: z.enum([...(Object.values(FUEL_TYPES) as [string, ...string[]])]).optional(),
  noOfSeats: z.number(),
  noOfDoors: z.number(),
  noOfLuggages: z.number(),
  image: z.string().optional(),
  dailyRate: z.number(),
  status: z.enum([...(Object.values(VEHICLE_STATUS) as [string, ...string[]])]).default(VEHICLE_STATUS.AVAILABLE),
});

const lastMaintenanceDate = z.object({
  body: z.object({
    lastMaintenanceDate: z.string().refine(
      (date) => !isNaN(Date.parse(date)),
      { message: "Invalid date format for lastMaintenanceDate" }
    )
  })
})

const updateVehicleStatus = z.object({
  body: z.object({
    status: z.enum([...(Object.values(VEHICLE_STATUS) as [string, ...string[]])]).default(VEHICLE_STATUS.AVAILABLE),
  })
})

export const updateVehicleZodSchema = createVehicleZodSchema.partial();

export const VehicleZodValidation = {
  createVehicleZodSchema,
  updateVehicleZodSchema,
  lastMaintenanceDate,
  updateVehicleStatus
}
