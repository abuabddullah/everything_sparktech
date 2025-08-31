import { z } from 'zod'
import {
  objectIdSchemaMendatory,
  objectIdSchemaOptional,
} from '../Reviews/Reviews.utils'
import { IQTypes } from './Question.enum'

const createQuestionZodSchema = z.object({
  body: z.object({
    questionType: z.nativeEnum(IQTypes),
    title: z.string().optional(),
    description: z.string().optional(),
    query: z.string({ required_error: 'query text is required' }),
    options: z
      .array(
        z.object({
          slNo: z.number({ required_error: 'Sl no is required' }),
          value: z.string({ required_error: 'Value is required' }),
        }),
      )
      .optional(),
    correctAnswerOption: z.number().optional(),
    slNoOfCorrectAnswers: z.array(z.number()).optional(),
    questionSet: objectIdSchemaOptional,
  }),
})

const updateQuestionZodSchema = z.object({
  body: z.object({
    questionType: z.nativeEnum(IQTypes).optional(),
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
    correctAnswerOption: z.number().optional(),
    slNoOfCorrectAnswers: z.array(z.number()).optional(),
    questionSet: objectIdSchemaOptional,
  }),
})

const validateQuestionAnswer = z.object({
  body: z.object({
    userAnswer: z.union([z.number(), z.array(z.number())]).optional(),
  }),
})

export const QuestionValidation = {
  createQuestionZodSchema,
  updateQuestionZodSchema,
  validateQuestionAnswer,
}
