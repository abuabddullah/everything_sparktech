import { z } from 'zod'
import { IPromptRefType } from './Prompt.enum'
import {
  objectIdSchemaMendatory,
  objectIdSchemaOptional,
} from '../Reviews/Reviews.utils'

const createPromptZodSchema = z.object({
  body: z.object({
    image: z.string({ required_error: 'Image is required' }),
    title: z.string({ required_error: 'title text is required' }),
    description: z.string({ required_error: 'description text is required' }),
    refType: z.nativeEnum(IPromptRefType, {
      required_error: 'Type is required',
    }),
    refId: objectIdSchemaMendatory('reference id'),
    promptTable: z
      .array(
        z.object({
          slNo: z.number({ required_error: 'Sl no is required' }),
          properties: z.string({ required_error: 'Properties is required' }),
          values: z.string({ required_error: 'Values is required' }),
        }),
      )
      .optional(),
  }),
})

const updatePromptZodSchema = z.object({
  body: z.object({
    image: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    refType: z.nativeEnum(IPromptRefType).optional(),
    refId: objectIdSchemaOptional,
    promptTable: z
      .array(
        z.object({
          slNo: z.number({ required_error: 'Sl no is required' }),
          properties: z.string({ required_error: 'Properties is required' }),
          values: z.string({ required_error: 'Values is required' }),
        }),
      )
      .optional(),
  }),
})

export const PromptValidation = {
  createPromptZodSchema,
  updatePromptZodSchema,
}
