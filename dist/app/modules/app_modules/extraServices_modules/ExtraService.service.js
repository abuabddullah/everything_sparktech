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
exports.ExtraService = void 0;
const http_status_codes_1 = require("http-status-codes");
const extraService_model_1 = __importDefault(require("./extraService.model"));
const ApiError_1 = __importDefault(require("../../../../errors/ApiError"));
const QueryBuilder_1 = __importDefault(require("../../../builder/QueryBuilder"));
const extraService_constant_1 = require("./extraService.constant");
const createExtraServiceToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const createdExtraService = yield extraService_model_1.default.create(payload);
    if (!createdExtraService) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create extra service');
    }
    return createdExtraService;
});
const getAllExtraServicesFromDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const extraServicesQuery = new QueryBuilder_1.default(extraService_model_1.default.find(), query)
        .search(extraService_constant_1.ExtraServiceSearchableFields)
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = yield extraServicesQuery.modelQuery;
    const meta = yield extraServicesQuery.getPaginationInfo();
    return {
        meta,
        result,
    };
});
exports.ExtraService = {
    createExtraServiceToDB,
    getAllExtraServicesFromDB
};
