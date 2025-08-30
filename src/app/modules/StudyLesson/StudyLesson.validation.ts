import { z } from 'zod'
import {
  objectIdSchemaMendatory,
  objectIdSchemaOptional,
} from '../Reviews/Reviews.utils'

const createStudyLessonZodSchema = z.object({
  body: z.object({
    image: z.string({ required_error: 'Image is required' }),
    altText: z.string({ required_error: 'Alt text is required' }),
    title: z.string({ required_error: 'title text is required' }),
    description: z.string({ required_error: 'description text is required' }),
    course: objectIdSchemaMendatory('course'),
    category: objectIdSchemaMendatory('category'),
    questionSets: z
      .array(objectIdSchemaMendatory('question set'))
      .min(1, 'at least one question set is required'),
  }),
})

const updateStudyLessonZodSchema = z.object({
  body: z.object({
    image: z.string().optional(),
    altText: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    course: objectIdSchemaOptional,
    category: objectIdSchemaOptional,
    questionSets: z.array(z.string()).optional(),
  }),
})

export const StudyLessonValidation = {
  createStudyLessonZodSchema,
  updateStudyLessonZodSchema,
}
