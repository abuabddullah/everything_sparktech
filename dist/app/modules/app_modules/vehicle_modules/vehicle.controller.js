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
exports.VehicleController = void 0;
const catchAsync_1 = __importDefault(require("../../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../../shared/sendResponse"));
const http_status_codes_1 = require("http-status-codes");
const vehicle_service_1 = require("./vehicle.service");
const createVehicle = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield vehicle_service_1.VehicleService.createVehicleToDB(req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Vehicle created successfully',
        data: result,
    });
}));
const getAllVehicles = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield vehicle_service_1.VehicleService.getAllVehiclesFromDB(req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Vehicles retrieved successfully',
        data: result,
    });
}));
exports.VehicleController = {
    createVehicle,
    getAllVehicles,
};
