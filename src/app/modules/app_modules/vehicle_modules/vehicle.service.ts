import { IVehicle } from "./vehicle.interface";
import { Vehicle } from "./vehicle.model";

const createVehicleToDB = async (payload: Partial<IVehicle>): Promise<IVehicle> => {
    const vehicle = await Vehicle.create(payload);
    if (!vehicle) {
        throw new Error('Failed to create vehicle');
    }
    return vehicle;
};
export const VehicleService = {
    createVehicleToDB
}