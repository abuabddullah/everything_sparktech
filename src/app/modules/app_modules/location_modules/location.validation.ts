import { z } from "zod";

const createLocationValidation = z.object({
    body: z.object({
        location: z.string({ required_error: 'Location name is required' }),
        postalCode: z.string().optional(),
        country: z.string({ required_error: 'Country is required' }),
        coordinates: z.object({
            lat: z.number().optional(),
            lng: z.number().optional(),
        }).optional(),
    }),
});

export const LocationValidation = {
    createLocationValidation,
};