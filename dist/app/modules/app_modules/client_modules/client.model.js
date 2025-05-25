"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientModel = void 0;
const mongoose_1 = require("mongoose");
const ClientSchema = new mongoose_1.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    parmanentAddress: { type: String, required: true },
    country: { type: String, required: true },
    presentAddress: { type: String, required: true },
    state: { type: String, required: true },
    postCode: { type: String, required: true },
    bookings: [{ type: mongoose_1.Types.ObjectId, ref: "Booking" }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
ClientSchema.virtual("totalBookings", {
    ref: "Booking",
    localField: "_id",
    foreignField: "clientId",
    count: true,
});
ClientSchema.virtual("totalSpend", {
    ref: "Booking",
    localField: "_id",
    foreignField: "clientId",
    count: true,
    options: { select: "amount" }, // Assuming 'amount' is a field in Booking
});
exports.ClientModel = (0, mongoose_1.model)("Client", ClientSchema);
