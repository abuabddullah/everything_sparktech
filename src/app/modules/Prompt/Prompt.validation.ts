import { z } from 'zod'
import { IPromptType } from './Prompt.enum'
import { objectIdSchemaOptional } from '../Reviews/Reviews.utils'

const createPromptZodSchema = z.object({
  body: z.object({
    image: z.string().optional(),
    title: z.string({ required_error: 'title text is required' }),
    description: z.string({ required_error: 'description text is required' }),
    questionSetId: objectIdSchemaOptional,
    promptTable: z
      .array(
        z.object({
          slNo: z.number({ required_error: 'Sl no is required' }),
          properties: z.string({ required_error: 'Properties is required' }),
          values: z.string({ required_error: 'Values is required' }),
        }),
      )
      .optional(),
    promptType: z.nativeEnum(IPromptType, {
      required_error: 'Type is required',
    }),
  }),
})

const updatePromptZodSchema = z.object({
  body: z.object({
    image: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    questionSetId: objectIdSchemaOptional,
    promptTable: z
      .array(
        z.object({
          slNo: z.number({ required_error: 'Sl no is required' }),
          properties: z.string({ required_error: 'Properties is required' }),
          values: z.string({ required_error: 'Values is required' }),
        }),
      )
      .optional(),
    promptType: z.nativeEnum(IPromptType, {
      required_error: 'Type is required',
    }),
  }),
})

export const PromptValidation = {
  createPromptZodSchema,
  updatePromptZodSchema,
}
