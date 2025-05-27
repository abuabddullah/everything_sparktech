"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientModel = void 0;
const mongoose_1 = require("mongoose");
const ClientSchema = new mongoose_1.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    phone: { type: String },
    parmanentAddress: { type: String, required: false },
    country: { type: String, required: false },
    presentAddress: { type: String, required: false },
    state: { type: String, required: false },
    postCode: { type: String, required: false },
    bookings: [{ type: mongoose_1.Types.ObjectId, ref: "Booking" }],
    role: { type: String, enum: ["CLIENT"], default: "CLIENT" }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
ClientSchema.virtual("totalBookings").get(function () {
    return this.bookings ? this.bookings.length : 0;
});
ClientSchema.virtual("totalSpend").get(function () {
    if (!this.bookings || this.bookings.length === 0)
        return 0;
    // If Booking documents are populated with 'amount' field
    if (typeof this.bookings[0] === "object" && this.bookings[0] !== null && "amount" in this.bookings[0]) {
        return this.bookings.reduce((sum, booking) => sum + (booking.amount || 0), 0);
    }
    // If not populated, can't calculate totalSpend
    return 0;
});
ClientSchema.virtual("fullName").get(function () {
    return `${this.firstName} ${this.lastName}`;
});
exports.ClientModel = (0, mongoose_1.model)("Client", ClientSchema);
