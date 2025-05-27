"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Location = void 0;
const mongoose_1 = require("mongoose");
const LocationSchema = new mongoose_1.Schema({
    location: { type: String, required: true },
    postalCode: { type: String },
    country: { type: String, required: false },
    state: { type: String, required: false },
    coordinates: {
        lat: { type: Number },
        lng: { type: Number },
    },
}, { timestamps: true });
exports.Location = (0, mongoose_1.model)('Location', LocationSchema);
