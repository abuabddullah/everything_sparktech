"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationValidation = void 0;
const zod_1 = require("zod");
const createLocationValidation = zod_1.z.object({
    body: zod_1.z.object({
        location: zod_1.z.string({ required_error: 'Location name is required' }),
        postalCode: zod_1.z.string().optional(),
        country: zod_1.z.string({ required_error: 'Country is required' }),
        coordinates: zod_1.z.object({
            lat: zod_1.z.number().optional(),
            lng: zod_1.z.number().optional(),
        }).optional(),
    }),
});
exports.LocationValidation = {
    createLocationValidation,
};
