import { z } from 'zod';

const createPromptZodSchema = z.object({
     body: z.object({
          image: z.string({ required_error: 'Image is required' }),
          altText: z.string({ required_error: 'Alt text is required' }),
          title: z.string({ required_error: 'title text is required' }),
          description: z.string({ required_error: 'description text is required' }),
     }),
});

const updatePromptZodSchema = z.object({
     body: z.object({
          image: z.string().optional(),
          altText: z.string().optional(),
          title: z.string().optional(),
          description: z.string().optional(),
     }),
});

export const PromptValidation = {
     createPromptZodSchema,
     updatePromptZodSchema
};
