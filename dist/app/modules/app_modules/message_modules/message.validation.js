"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageValidation = exports.createMessageValidationSchema = void 0;
const zod_1 = require("zod");
exports.createMessageValidationSchema = zod_1.z.object({
    chatId: zod_1.z.string().min(1, 'chatId is required'),
    text: zod_1.z.string().min(1, 'text is required'),
});
exports.MessageValidation = {
    createMessageValidationSchema: exports.createMessageValidationSchema,
};
