"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientValidation = exports.createClientSchema = void 0;
// validation.ts
const zod_1 = require("zod");
// Define the validation schema using Zod
exports.createClientSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1, 'First name is required'),
    lastName: zod_1.z.string().min(1, 'Last name is required'),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().optional(),
    parmanentAddress: zod_1.z.string().min(1, 'Permanent address is required'),
    country: zod_1.z.string().min(1, 'Country is required'),
    presentAddress: zod_1.z.string().min(1, 'Present address is required'),
    state: zod_1.z.string().min(1, 'State is required'),
    postCode: zod_1.z.string().min(1, 'Postcode is required'),
    bookings: zod_1.z.array(zod_1.z.string()).optional() // Assuming bookings are ObjectIds, but it can be an array of strings
});
// Export the validation schema
exports.ClientValidation = {
    createClientSchema: exports.createClientSchema
};
