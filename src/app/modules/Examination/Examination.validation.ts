import { z } from 'zod'
import {
  objectIdSchemaMendatory,
  objectIdSchemaOptional,
} from '../Reviews/Reviews.utils'

const createExaminationZodSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'title text is required' }),
    description: z.string({ required_error: 'description text is required' }),
    test: objectIdSchemaMendatory('test'),
    rulesAndRegulation: z.string({
      required_error: 'rules and regulation text is required',
    }),
    questionSets: z
      .array(objectIdSchemaMendatory('question set'))
      .min(1, 'at least one question set is required'),
  }),
})

const updateExaminationZodSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    test: objectIdSchemaOptional,
    rulesAndRegulation: z.string().optional(),
    questionSets: z.array(z.string()).optional(),
  }),
})

export const ExaminationValidation = {
  createExaminationZodSchema,
  updateExaminationZodSchema,
}
