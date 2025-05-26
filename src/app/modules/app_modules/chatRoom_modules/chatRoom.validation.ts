import { z } from "zod";

// Mongoose ObjectId regex (24 hex chars)
const mongooseIdSchema = z.string().regex(/^[a-f\d]{24}$/i, {
    message: "Invalid Mongoose ObjectId",
});

export const createChatValidationSchema = z.object({
    body: z.object({
        participants: z
            .array(mongooseIdSchema)
            .min(1, { message: "At least one participant is required" }),
    }),
});

export const ChatValidation = {
    createChatValidationSchema,
};