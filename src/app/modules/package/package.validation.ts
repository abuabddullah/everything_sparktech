import { z } from 'zod';

const createPackageZodSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'name is required',
      invalid_type_error: 'name should be type string',
    }),
    allowedJobPost: z.number({
      required_error: 'allowedJobPost is required',
      invalid_type_error: 'allowedJobPost should be type number',
    }),
    allowedEventPost: z.number({
      required_error: 'allowedEventPost is required',
      invalid_type_error: 'allowedEventPost should be type number',
    }),
    features: z.array(
      z.string({
        required_error: 'features is required',
        invalid_type_error: 'features array item should have type string',
      })
    ),
    price: z.number({
      required_error: 'price is required',
      invalid_type_error: 'price should be type number',
    }),
  }),
});

const updatePackageZodSchema = z.object({
  body: z.object({
    name: z
      .string({
        invalid_type_error: 'name should be type string',
      })
      .optional(),
    allowedJobPost: z
      .number({
        invalid_type_error: 'allowedJobPost should be type number',
      })
      .optional(),
    allowedEventPost: z
      .number({
        invalid_type_error: 'allowedEventPost should be type number',
      })
      .optional(),
    features: z
      .array(
        z.string({
          invalid_type_error: 'features array item should have type string',
        })
      )
      .optional(),
    price: z
      .number({
        invalid_type_error: 'price should be type number',
      })
      .optional(),
  }),
});

export const PackageValidation = {
  createPackageZodSchema,
  updatePackageZodSchema,
};
