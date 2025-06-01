import { Types } from "mongoose";

export interface IClient {
    _id?: Types.ObjectId;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    parmanentAddress: string;
    country: string;
    presentAddress: string;
    state: string;
    postCode: string;
    bookings?: Types.ObjectId[]; // it will give me virtual total bookings and total spend
    stripeCustomerId?: string;
    role: "CLIENT";
}