import { z } from 'zod';

export const createMessageValidationSchema = z.object({
    chatId: z.string().min(1, 'chatId is required'),
    text: z.string().min(1, 'text is required'),
});

export const MessageValidation = {
    createMessageValidationSchema,
};