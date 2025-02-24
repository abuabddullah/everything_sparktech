import { z } from 'zod';

const createGroupZodSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'name is required',
      invalid_type_error: 'name should be type string',
    }),

    event: z
      .string({ invalid_type_error: 'event should be type objectID or string' })
      .optional(),
  }),
});

const updateGroupZodSchema = z.object({
  body: z.object({
    name: z
      .string({ invalid_type_error: 'name should be type string' })
      .optional(),
    members: z
      .array(
        z.string({
          invalid_type_error: 'members array item should have type string',
        })
      )
      .optional(),
    event: z
      .string({ invalid_type_error: 'event should be type string' })
      .optional(),
  }),
});

export const GroupValidation = {
  createGroupZodSchema,
  updateGroupZodSchema,
};
