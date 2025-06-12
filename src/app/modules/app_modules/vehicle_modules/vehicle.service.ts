import QueryBuilder from "../../../builder/QueryBuilder";
import { VehicleSearchableFields } from "./vehicle.constants";
import { IVehicle } from "./vehicle.interface";
import { Vehicle } from "./vehicle.model";
import { BookingModel } from "../booking_modules/booking.model";
import { VEHICLE_STATUS } from "../../../../enums/vehicle";

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

const getSeatDoorLuggageMetaFromDB = async () => {
    const seatCounts = await Vehicle.distinct('noOfSeats');
    const doorCounts = await Vehicle.distinct('noOfDoors');
    const luggageCounts = await Vehicle.distinct('noOfLuggages');
    const brands = await Vehicle.distinct('brand');
    return {
        seatCounts,
        doorCounts,
        luggageCounts,
        brands
    };
};

const getAVehicleByIdFromDB = async (id: string): Promise<IVehicle | null> => {
    const vehicle = await Vehicle.findById(id);
    return vehicle;
};

const updateAVehicleByIdInDB = async (
    id: string,
    payload: Partial<IVehicle>
): Promise<IVehicle | null> => {
    const updatedVehicle = await Vehicle.findById(id);
    if (!updatedVehicle) return null;
    Object.assign(updatedVehicle, payload);
    await updatedVehicle.save();
    return updatedVehicle;
};

const updateLastMaintenanceDateByIdInDB = async (
    id: string,
    lastMaintenanceDate: Date
): Promise<IVehicle | null> => {
    const updatedVehicle = await Vehicle.findByIdAndUpdate(
        id,
        { lastMaintenanceDate },
        { new: true, runValidators: true }
    );
    return updatedVehicle;
};

const updateVehicleStatusByIdInDB = async (
    id: string,
    status: string | unknown
): Promise<IVehicle | null> => {


    let updateData: any = { status };
    if (status === 'MAINTENANCE' || status === VEHICLE_STATUS?.UNDER_MAINTENANCE) {
        updateData.lastMaintenanceDate = new Date();
    }
    const updatedVehicle = await Vehicle.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
    );
    return updatedVehicle;
};

const deletVehicleByIdFromDB = async (id: string): Promise<IVehicle | null> => {
    const session = await Vehicle.startSession();
    session.startTransaction();
    try {
        const exists = await Vehicle.exists({ _id: id }).session(session);
        if (!exists) {
            throw new Error('Vehicle not found');
        }
        const deletedVehicle = await Vehicle.findByIdAndDelete(id, { session });
        if (deletedVehicle) {
            await BookingModel.updateMany(
                { vehicle: id },
                { $set: { vehicle: null } },
                { session }
            );
        }
        await session.commitTransaction();
        return deletedVehicle;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

export const VehicleService = {
    createVehicleToDB,
    getAllVehiclesFromDB,
    getSeatDoorLuggageMetaFromDB,
    getAVehicleByIdFromDB,
    updateAVehicleByIdInDB,
    updateLastMaintenanceDateByIdInDB,
    updateVehicleStatusByIdInDB,
    deletVehicleByIdFromDB
}