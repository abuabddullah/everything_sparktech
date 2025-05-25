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
exports.VehicleService = void 0;
const QueryBuilder_1 = __importDefault(require("../../../builder/QueryBuilder"));
const vehicle_constants_1 = require("./vehicle.constants");
const vehicle_model_1 = require("./vehicle.model");
const createVehicleToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const vehicle = yield vehicle_model_1.Vehicle.create(payload);
    if (!vehicle) {
        throw new Error('Failed to create vehicle');
    }
    return vehicle;
});
const getAllVehiclesFromDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const vehicleQuery = new QueryBuilder_1.default(vehicle_model_1.Vehicle.find(), query)
        .search(vehicle_constants_1.VehicleSearchableFields)
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = yield vehicleQuery.modelQuery;
    const meta = yield vehicleQuery.getPaginationInfo();
    return {
        meta,
        result,
    };
});
exports.VehicleService = {
    createVehicleToDB,
    getAllVehiclesFromDB
};
