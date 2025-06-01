import { Schema, model, Types, Document } from "mongoose";
import { IClient } from "./client.interface";


const ClientSchema = new Schema<IClient>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    phone: { type: String },
    parmanentAddress: { type: String, required: false },
    country: { type: String, required: false },
    presentAddress: { type: String, required: false },
    state: { type: String, required: false },
    postCode: { type: String, required: false },
    bookings: [{ type: Types.ObjectId, ref: "Booking" }],
    stripeCustomerId: { type: String, required: false },
    role: { type: String, enum: ["CLIENT"], default: "CLIENT" }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

ClientSchema.virtual("totalBookings").get(function (this: IClient) {
  return this.bookings ? this.bookings.length : 0;
});

ClientSchema.virtual("totalSpend").get(function (this: IClient) {
  if (!this.bookings || this.bookings.length === 0) return 0;
  // If Booking documents are populated with 'amount' field
  if (typeof this.bookings[0] === "object" && this.bookings[0] !== null && "amount" in this.bookings[0]) {
    return this.bookings.reduce((sum: number, booking: any) => sum + (booking.amount || 0), 0);
  }
  // If not populated, can't calculate totalSpend
  return 0;
});

ClientSchema.virtual("fullName").get(function (this: IClient) {
  return `${this.firstName} ${this.lastName}`;
});

export const ClientModel = model<IClient>("Client", ClientSchema);