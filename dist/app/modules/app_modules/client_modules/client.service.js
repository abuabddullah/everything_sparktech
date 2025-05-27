"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientService = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../../errors/ApiError"));
const client_model_1 = require("./client.model");
const QueryBuilder_1 = __importDefault(require("../../../builder/QueryBuilder"));
const client_constants_1 = require("./client.constants");
const createClientToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const createClient = yield client_model_1.ClientModel.create(payload);
    if (!createClient) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create user');
    }
    console.log('Client created successfully:', createClient);
    return createClient;
});
const getAllClientsFromDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const clientQuery = new QueryBuilder_1.default(client_model_1.ClientModel.find(), query)
        .populate(['bookings'], { bookings: ['_id', 'amount', 'status'] })
        .search(client_constants_1.ClientSearchableFields)
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = yield clientQuery.modelQuery;
    const meta = yield clientQuery.getPaginationInfo();
    return {
        meta,
        result,
    };
});
const getClientByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield client_model_1.ClientModel.findById(id).populate('bookings');
    if (!client) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Client not found');
    }
    return client;
});
const getClientByEmailFromDB = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield client_model_1.ClientModel.findOne({ email }).populate('bookings');
    if (!client) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Client not found');
    }
    return client;
});
exports.ClientService = {
    createClientToDB,
    getAllClientsFromDB,
    getClientByIdFromDB,
    getClientByEmailFromDB
};
