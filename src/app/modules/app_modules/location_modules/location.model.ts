import { Schema, model, Document } from 'mongoose';
import { ILocation } from './location.interface';


const LocationSchema = new Schema<ILocation>(
    {
        location: { type: String, required: true },
        postalCode: { type: String },
        country: { type: String, required: true },
        coordinates: {
            lat: { type: Number },
            lng: { type: Number },
        },
    },
    { timestamps: true }
);

export const Location = model<ILocation>('Location', LocationSchema);