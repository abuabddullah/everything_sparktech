import { z } from 'zod';
        
const createTermsAndConditionsZodSchema = z.object({
  body: z.object({
    description: z.string({
    required_error: "description is required",
    invalid_type_error: "description should be type string"
  })
  }),
});

const updateTermsAndConditionsZodSchema = z.object({
  body: z.object({
    description: z.string({
    invalid_type_error: "description should be type string"
  }).optional()
  }),
});

export const TermsAndConditionsValidation = {
  createTermsAndConditionsZodSchema,
  updateTermsAndConditionsZodSchema
};
