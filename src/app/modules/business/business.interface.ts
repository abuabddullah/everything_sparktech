import { Schema } from "mongoose";
import { BUSINESS_TYPES } from "./business.enums";

interface ITimeSlot {
    start: string; // e.g., "09:00"
    end: string;   // e.g., "17:00"
}

interface IBusinessHours {
    monday: ITimeSlot[];
    tuesday: ITimeSlot[];
    wednesday: ITimeSlot[];
    thursday: ITimeSlot[];
    friday: ITimeSlot[];
    saturday: ITimeSlot[];
    sunday: ITimeSlot[];
}

export interface IGeoLocation {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
}

export interface IBusinessSearchParams {
    latitude?: number;
    longitude?: number;
    radius?: number; 
    searchByLocationText?: string;
}

export interface IBusiness  {
    b_name: string;
    b_type: BUSINESS_TYPES;
    b_email: string;
    b_phone: string;
    b_description: string;
    b_address?: {
        province: string;
        city: string;
        territory: string;
        country?: string;
        detail_address?: string;
    };
    b_location: IGeoLocation;
    b_service: string;
    b_working_hours: IBusinessHours;
    b_logo: string;
    b_cover_photo: string;
    b_promot_banner: string;
    b_reviews: Schema.Types.ObjectId[];
}


