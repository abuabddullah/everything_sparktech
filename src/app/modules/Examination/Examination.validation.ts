import { z } from 'zod'
import {
  objectIdSchemaMendatory,
  objectIdSchemaOptional,
} from '../Reviews/Reviews.utils'

const createExaminationZodSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'title text is required' }),
    description: z.string().optional(),
    test: objectIdSchemaMendatory('test'),
    questionSteps: z.array(
      z.object({
        stepNo: z.number().min(1, 'Step number must be at least 1'),
        questionSets: objectIdSchemaOptional,
      }),
    ),
  }),
})

const updateExaminationZodSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    test: objectIdSchemaOptional,
    questionSteps: z
      .array(
        z.object({
          stepNo: z.number().optional(),
          questionSet: objectIdSchemaOptional,
        }),
      )
      .optional(),
  }),
})

export const ExaminationValidation = {
  createExaminationZodSchema,
  updateExaminationZodSchema,
}
