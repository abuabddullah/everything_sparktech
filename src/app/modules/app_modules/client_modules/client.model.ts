import { Schema, model, Types, Document } from "mongoose";
import { IClient } from "./client.interface";


const ClientSchema = new Schema<IClient>(
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String },
        phone: { type: String },
        parmanentAddress: { type: String, required: true },
        country: { type: String, required: true },
        presentAddress: { type: String, required: true },
        state: { type: String, required: true },
        postCode: { type: String, required: true },
        bookings: [{ type: Types.ObjectId, ref: "Booking" }]
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

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

export const ClientModel = model<IClient>("Client", ClientSchema);