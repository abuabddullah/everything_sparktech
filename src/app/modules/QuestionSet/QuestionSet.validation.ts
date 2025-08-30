import { z } from 'zod'
import {
  objectIdSchemaMendatory,
  objectIdSchemaOptional,
} from '../Reviews/Reviews.utils'
import { IQSetRefType, IQSetTypes } from './QuestionSet.enum'

const createQuestionSetZodSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'title text is required' }),
    description: z.string({ required_error: 'description text is required' }),
    prompts: z.array(objectIdSchemaOptional).optional(),
    questions: z
      .array(objectIdSchemaOptional)
      .min(1, 'at least one question is required'),
    refId: objectIdSchemaOptional,
    explanation: z.string().optional(),
    refType: z.nativeEnum(IQSetRefType, {
      required_error: 'Type is required',
    }),
    questionSetType: z.nativeEnum(IQSetTypes, {
      required_error: 'questionSetType is required',
    }),
  }),
})

const updateQuestionSetZodSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    prompts: z.array(objectIdSchemaOptional).optional(),
    questions: z.array(objectIdSchemaOptional).optional(),
    refId: objectIdSchemaOptional,
    refType: z.nativeEnum(IQSetRefType).optional(),
    explanation: z.string().optional(),
    questionSetType: z.nativeEnum(IQSetTypes).optional(),
  }),
})

export const QuestionSetValidation = {
  createQuestionSetZodSchema,
  updateQuestionSetZodSchema,
}
