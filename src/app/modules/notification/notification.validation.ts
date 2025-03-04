import { z } from 'zod';

const createNotificationZodSchema = z.object({
  body: z.object({
    user: z
      .string({
        invalid_type_error: 'user should be type objectID or string',
      })
      .optional(),
    description: z.string({
      required_error: 'description is required',
      invalid_type_error: 'description should be type string',
    }),
    title: z.string({
      required_error: 'title is required',
      invalid_type_error: 'title should be type string',
    }),
  }),
});

const updateNotificationZodSchema = z.object({
  body: z.object({
    user: z
      .string({
        invalid_type_error: 'user should be type objectID or string',
      })
      .optional(),
    description: z
      .string({
        invalid_type_error: 'description should be type string',
      })
      .optional(),
    title: z
      .string({
        invalid_type_error: 'title should be type string',
      })
      .optional(),
  }),
});

export const NotificationValidation = {
  createNotificationZodSchema,
  updateNotificationZodSchema,
};
