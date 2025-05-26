import { Types } from "mongoose";

export interface ILocation {
    _id?: Types.ObjectId;
    location: string;
    postalCode?: string;
    state?: string;
    country?: string;
    coordinates?: {lat: number; lng: number}; // [longitude, latitude]
}