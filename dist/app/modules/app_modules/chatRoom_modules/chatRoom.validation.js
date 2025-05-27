"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatValidation = exports.createChatValidationSchema = void 0;
const zod_1 = require("zod");
// Mongoose ObjectId regex (24 hex chars)
const mongooseIdSchema = zod_1.z.string().regex(/^[a-f\d]{24}$/i, {
    message: "Invalid Mongoose ObjectId",
});
exports.createChatValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        participants: zod_1.z
            .array(mongooseIdSchema)
            .min(1, { message: "At least one participant is required" }),
    }),
});
exports.ChatValidation = {
    createChatValidationSchema: exports.createChatValidationSchema,
};
