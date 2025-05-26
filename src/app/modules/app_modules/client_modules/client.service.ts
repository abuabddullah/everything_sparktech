import { StatusCodes } from "http-status-codes";
import ApiError from "../../../../errors/ApiError";
import { IClient } from "./client.interface";
import { ClientModel } from "./client.model";
import QueryBuilder from "../../../builder/QueryBuilder";
import { ClientSearchableFields } from "./client.constants";

const createClientToDB = async (payload: Partial<IClient>): Promise<IClient> => {
    const createClient = await ClientModel.create(payload);
    if (!createClient) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
    }
    console.log('Client created successfully:', createClient);
    return createClient;
};

const getAllClientsFromDB = async (query: Record<string, unknown>) => {
    const clientQuery = new QueryBuilder(
        ClientModel.find(),
        query,
    )
        .populate(['bookings'], { bookings: ['_id', 'amount', 'status'] })
        .search(ClientSearchableFields)
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await clientQuery.modelQuery;
    const meta = await clientQuery.getPaginationInfo();

    return {
        meta,
        result,
    };
};


const getClientByIdFromDB = async (id: string): Promise<IClient | null> => {
    const client = await ClientModel.findById(id).populate('bookings');
    if (!client) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Client not found');
    }
    return client;
};

const getClientByEmailFromDB = async (email: string): Promise<IClient | null> => {
    const client = await ClientModel.findOne({ email }).populate('bookings');
    if (!client) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Client not found');
    }
    return client;
};

export const ClientService = {
    createClientToDB,
    getAllClientsFromDB,
    getClientByIdFromDB,
    getClientByEmailFromDB
}