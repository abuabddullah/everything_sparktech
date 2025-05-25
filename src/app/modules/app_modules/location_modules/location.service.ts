import { StatusCodes } from "http-status-codes";
import ApiError from "../../../../errors/ApiError";
import { Location } from "./location.model";
import { ILocation } from "./location.interface";

const getAllLocations = async (): Promise<Partial<ILocation[]>> => {
    const allLocations = await Location.find();
    if (!allLocations) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Locations Not Available!");
    }

    return allLocations;
};


const createLocationToDB = async (payload: Partial<ILocation>): Promise<ILocation> => {
    const createLocation = await Location.create(payload);
    if (!createLocation) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create location');
    }

    return createLocation;
};

export const LocationService = {
    getAllLocations,
    createLocationToDB
}