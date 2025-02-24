import { z } from 'zod';

const createSubscriptionZodSchema = z.object({
  body: z.object({
    email: z.string({
      required_error: 'email is required',
      invalid_type_error: 'email should be type string',
    }),
    user: z.string({
      required_error: 'user is required',
      invalid_type_error: 'user should be type objectID or string',
    }),
    package: z.string({
      required_error: 'package is required',
      invalid_type_error: 'package should be type objectID or string',
    }),
    status: z.string({
      required_error: 'status is required',
      invalid_type_error: 'status should be type string',
    }),
  }),
});

const updateSubscriptionZodSchema = z.object({
  body: z.object({
    email: z
      .string({
        invalid_type_error: 'email should be type string',
      })
      .optional(),
    user: z
      .string({
        invalid_type_error: 'user should be type objectID or string',
      })
      .optional(),
    package: z
      .string({
        invalid_type_error: 'package should be type objectID or string',
      })
      .optional(),
    status: z
      .string({
        invalid_type_error: 'status should be type string',
      })
      .optional(),
  }),
});

export const SubscriptionValidation = {
  createSubscriptionZodSchema,
  updateSubscriptionZodSchema,
};
