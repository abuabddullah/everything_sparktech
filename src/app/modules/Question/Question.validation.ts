import { z } from 'zod'
import {
  objectIdSchemaMendatory,
  objectIdSchemaOptional,
} from '../Reviews/Reviews.utils'

const createQuestionZodSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'title text is required' }),
    description: z.string({ required_error: 'description text is required' }),
    query: z.string({ required_error: 'query text is required' }),
    options: z
      .array(
        z.object({
          slNo: z.number({ required_error: 'Sl no is required' }),
          value: z.string({ required_error: 'Value is required' }),
        }),
      )
      .optional(),
    slNoOfCorrectAnswer: z.number().optional(),
    slNoOfCorrectAnswers: z.array(z.number()).optional(),
    questionSet: objectIdSchemaMendatory('question set'),
  }),
})

const updateQuestionZodSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    query: z.string().optional(),
    options: z
      .array(
        z.object({
          slNo: z.number({ required_error: 'Sl no is required' }),
          value: z.string({ required_error: 'Value is required' }),
        }),
      )
      .optional(),
    slNoOfCorrectAnswer: z.number().optional(),
    slNoOfCorrectAnswers: z.array(z.number()).optional(),
    questionSet: objectIdSchemaOptional,
  }),
})

export const QuestionValidation = {
  createQuestionZodSchema,
  updateQuestionZodSchema,
}
