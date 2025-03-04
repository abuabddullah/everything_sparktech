import { z } from 'zod';

const createReviewZodSchema = z.object({
  body: z.object({
    organization: z.string({
      required_error: 'organization is required',
      invalid_type_error: 'organization should be type objectID or string',
    }),
    description: z.string({
      required_error: 'description is required',
      invalid_type_error: 'description should be type string',
    }),
    replyTo: z
      .string({
        invalid_type_error: 'replyTo should be type objectID or string',
      })
      .optional(),
    star: z.number({
      required_error: 'star is required',
      invalid_type_error: 'star should be type number',
    }),
  }),
});

const updateReviewZodSchema = z.object({
  body: z.object({
    organization: z
      .string({
        invalid_type_error: 'organization should be type objectID or string',
      })
      .optional(),
    description: z
      .string({
        invalid_type_error: 'description should be type string',
      })
      .optional(),
    star: z
      .number({
        invalid_type_error: 'star should be type number',
      })
      .optional(),
    user: z
      .string({
        invalid_type_error: 'user should be type objectID or string',
      })
      .optional(),
  }),
});

export const ReviewValidation = {
  createReviewZodSchema,
  updateReviewZodSchema,
};
