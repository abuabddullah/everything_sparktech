import { StatusCodes } from "http-status-codes";
import ApiError from "../../../../errors/ApiError";
import { Location } from "./location.model";
import { ILocation } from "./location.interface";
import QueryBuilder from "../../../builder/QueryBuilder";
import { LocationSearchableFields } from "./location.constant";

const getAllLocations = async (query: Record<string, unknown>) => {
    const locationQueryBuilder = new QueryBuilder(Location.find(), query)
        .search(LocationSearchableFields)
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await locationQueryBuilder.modelQuery;
    const meta = await locationQueryBuilder.getPaginationInfo();

    return {
        meta,
        result,
    };
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