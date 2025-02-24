import { z } from 'zod';

const createInfoZodSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'name is required',
      invalid_type_error: 'name should be type string',
    }),
    content: z.string({
      required_error: 'content is required',
      invalid_type_error: 'content should be type string',
    }),
  }),
});

const updateInfoZodSchema = z.object({
  body: z.object({
    name: z
      .string({ invalid_type_error: 'name should be type string' })
      .optional(),
    content: z
      .string({ invalid_type_error: 'content should be type string' })
      .optional(),
  }),
});

export const InfoValidation = {
  createInfoZodSchema,
  updateInfoZodSchema,
};
