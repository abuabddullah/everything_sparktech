import { z } from 'zod';

const reviewZodSchema = z.object({
     body: z.object({
          rating: z.number({ required_error: 'Rating is required' }),
          comment: z.string({ required_error: 'Comment is required' }),
     }),
});

const reviewByAdminZodSchema = z.object({
     body: z.object({
          rating: z.number({ required_error: 'Rating is required' }),
          comment: z.string({ required_error: 'Comment is required' }),
          clientEmail: z.string({ required_error: 'clientEmail is required' }),
     }),
});

export const ReviewValidation = { reviewZodSchema,reviewByAdminZodSchema };
