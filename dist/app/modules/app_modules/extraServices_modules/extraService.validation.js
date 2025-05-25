"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtraServiceValidation = exports.createExtraServiceZodSchema = void 0;
const zod_1 = require("zod");
const extraService_1 = require("../../../../enums/extraService");
exports.createExtraServiceZodSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    description: zod_1.z.string().min(1, 'Description is required'),
    image: zod_1.z.string().min(1, 'Image is required'),
    cost: zod_1.z.number().min(0, 'Cost must be a non-negative number'),
    status: zod_1.z.enum([...Object.values(extraService_1.EXTRA_SERVICE_STATUS)]).default(extraService_1.EXTRA_SERVICE_STATUS.ACTIVE),
});
exports.ExtraServiceValidation = {
    createExtraServiceZodSchema: exports.createExtraServiceZodSchema,
    updateExtraServiceZodSchema: exports.createExtraServiceZodSchema.partial(),
};
