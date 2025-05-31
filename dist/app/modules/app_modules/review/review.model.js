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
exports.Review = void 0;
const mongoose_1 = require("mongoose");
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../../errors/ApiError"));
const client_model_1 = require("../client_modules/client.model");
const reviewSchema = new mongoose_1.Schema({
    clientEmail: {
        type: String,
        required: true,
    },
    comment: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
    },
}, { timestamps: true });
//check user
reviewSchema.post('save', function () {
    return __awaiter(this, void 0, void 0, function* () {
        const review = this;
        if (review.rating < 1 || review.rating > 5) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid rating value. Try give rating between 1 to 5');
        }
        // Check if client exists using clientEmail
        const clientExists = yield client_model_1.ClientModel.findOne({ email: review.clientEmail });
        if (!clientExists) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Client not found for the provided email');
        }
    });
});
exports.Review = (0, mongoose_1.model)('Review', reviewSchema);
