import QueryBuilder from "../../../builder/QueryBuilder";
import { VehicleSearchableFields } from "./vehicle.constants";
import { IVehicle } from "./vehicle.interface";
import { Vehicle } from "./vehicle.model";

const createVehicleToDB = async (payload: Partial<IVehicle>): Promise<IVehicle> => {
    const vehicle = await Vehicle.create(payload);
    if (!vehicle) {
        throw new Error('Failed to create vehicle');
    }
    return vehicle;
};

const getAllVehiclesFromDB = async (query: Record<string, unknown>) => {
    const vehicleQuery = new QueryBuilder(
        Vehicle.find(),
        query,
    )
        .search(VehicleSearchableFields)
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await vehicleQuery.modelQuery;
    const meta = await vehicleQuery.getPaginationInfo();

    return {
        meta,
        result,
    };
};
export const VehicleService = {
    createVehicleToDB,
    getAllVehiclesFromDB
}