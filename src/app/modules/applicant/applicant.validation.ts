import { z } from 'zod';

const createApplicantZodSchema = z.object({
  body: z.object({
    QNA: z.array(
      z.object({
        question: z.string({ required_error: 'Question is required' }),
        answer: z.string({ required_error: 'Answer is required' }),
      })
    ),
    job: z.string({
      required_error: 'job is required',
      invalid_type_error: 'job should be type objectID or string',
    }),
  }),
});

const updateApplicantZodSchema = z.object({
  body: z.object({
    QNA: z
      .array(
        z.object({
          question: z
            .string({ invalid_type_error: 'Question should be type string' })
            .optional(),
          answer: z
            .string({ invalid_type_error: 'Answer should be type string' })
            .optional(),
        })
      )
      .optional(),
    job: z
      .string({
        invalid_type_error: 'job should be type objectID or string',
      })
      .optional(),
  }),
});

export const ApplicantValidation = {
  createApplicantZodSchema,
  updateApplicantZodSchema,
};
