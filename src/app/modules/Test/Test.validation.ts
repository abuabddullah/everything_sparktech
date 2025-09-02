import { z } from 'zod'
import { ITestTitle } from './Test.enum'

const createTestZodSchema = z.object({
  body: z.object({
    title: z.nativeEnum(ITestTitle, {
      required_error: 'title text is required',
    }),
    description: z.string({ required_error: 'description text is required' }),
  }),
})

const updateTestZodSchema = z.object({
  body: z.object({
    title: z.nativeEnum(ITestTitle).optional(),
    description: z.string().optional(),
  }),
})

export const TestValidation = {
  createTestZodSchema,
  updateTestZodSchema,
}
