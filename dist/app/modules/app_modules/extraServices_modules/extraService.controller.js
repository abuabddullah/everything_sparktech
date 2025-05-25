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
exports.ExtraServiceController = exports.deleteExtraService = exports.updateExtraService = exports.getAllExtraServices = exports.createExtraService = void 0;
const extraService_model_1 = __importDefault(require("./extraService.model"));
const catchAsync_1 = __importDefault(require("../../../../shared/catchAsync"));
const getFilePath_1 = require("../../../../shared/getFilePath");
const sendResponse_1 = __importDefault(require("../../../../shared/sendResponse"));
const ExtraService_service_1 = require("./ExtraService.service");
const http_status_codes_1 = require("http-status-codes");
exports.createExtraService = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let image = (0, getFilePath_1.getSingleFilePath)(req.files, 'image');
    const serviceData = Object.assign(Object.assign({}, req.body), { image });
    const result = yield ExtraService_service_1.ExtraService.createExtraServiceToDB(serviceData);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'User created successfully',
        data: result,
    });
}));
const getAllExtraServices = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const extraServices = yield extraService_model_1.default.find();
        return res.status(200).json(extraServices);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});
exports.getAllExtraServices = getAllExtraServices;
const updateExtraService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const extraService = yield extraService_model_1.default.findByIdAndUpdate(id, req.body, { new: true });
        if (!extraService) {
            return res.status(404).json({ message: 'Extra Service not found' });
        }
        return res.status(200).json(extraService);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});
exports.updateExtraService = updateExtraService;
const deleteExtraService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const extraService = yield extraService_model_1.default.findByIdAndDelete(id);
        if (!extraService) {
            return res.status(404).json({ message: 'Extra Service not found' });
        }
        return res.status(200).json({ message: 'Extra Service deleted successfully' });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});
exports.deleteExtraService = deleteExtraService;
exports.ExtraServiceController = { createExtraService: exports.createExtraService, getAllExtraServices: exports.getAllExtraServices, updateExtraService: exports.updateExtraService, deleteExtraService: exports.deleteExtraService };
