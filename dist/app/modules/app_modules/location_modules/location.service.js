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
exports.LocationService = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../../errors/ApiError"));
const location_model_1 = require("./location.model");
const QueryBuilder_1 = __importDefault(require("../../../builder/QueryBuilder"));
const location_constant_1 = require("./location.constant");
const getAllLocations = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const locationQueryBuilder = new QueryBuilder_1.default(location_model_1.Location.find(), query)
        .search(location_constant_1.LocationSearchableFields)
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = yield locationQueryBuilder.modelQuery;
    const meta = yield locationQueryBuilder.getPaginationInfo();
    return {
        meta,
        result,
    };
});
const createLocationToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const createLocation = yield location_model_1.Location.create(payload);
    if (!createLocation) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create location');
    }
    return createLocation;
});
exports.LocationService = {
    getAllLocations,
    createLocationToDB
};
