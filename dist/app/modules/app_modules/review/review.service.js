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
exports.ReviewService = void 0;
const review_model_1 = require("./review.model");
const http_status_codes_1 = require("http-status-codes");
const client_model_1 = require("../client_modules/client.model");
const ApiError_1 = __importDefault(require("../../../../errors/ApiError"));
const createReviewToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // check payload.rating range
    if (payload.rating < 1 || payload.rating > 5) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid rating value. Try give rating between 1 to 5');
    }
    // check if its not client throw error
    const clientExists = yield client_model_1.ClientModel.findOne({ email: payload.clientEmail });
    if (!clientExists) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Client not found for the provided email');
    }
    // Check if a review already exists for the given client email
    const existingReview = yield review_model_1.Review.findOne({ clientEmail: payload.clientEmail });
    console.log(existingReview);
    let result;
    if (existingReview) {
        // Update the existing review
        result = yield review_model_1.Review.findOneAndUpdate({ clientEmail: payload.clientEmail }, payload, { new: true });
    }
    else {
        // Create a new review
        result = yield review_model_1.Review.create(payload);
    }
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed To create or update Review');
    }
    return result;
});
const getAllReviewsFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    // Fetch reviews and let the pre('find') hook calculate rating stats
    const reviews = yield review_model_1.Review.find();
    const ratingValues = reviews.map(r => Number(r.rating)).filter(r => !isNaN(r));
    const totalRating = ratingValues.reduce((sum, r) => sum + r, 0);
    const ratingCount = ratingValues.length;
    const averageRating = ratingCount > 0 ? Number((totalRating / ratingCount).toFixed(1)) : 0;
    const reviewsMetaData = {
        ratingCount,
        averageRating,
    };
    // You can return reviewsMetaData if needed, or just reviews
    return { reviews, meta: reviewsMetaData };
});
exports.ReviewService = { createReviewToDB, getAllReviewsFromDB };
