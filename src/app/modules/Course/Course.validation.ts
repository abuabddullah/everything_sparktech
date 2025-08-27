import { z } from 'zod'
import { ICourseAudience } from './Course.enum'

const createCourseZodSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Title is required' }),
    description: z.string({ required_error: 'Description is required' }),
    image: z.string({ required_error: 'Image is required' }),
    accessibleTo: z.nativeEnum(ICourseAudience, {
      required_error: 'Accessible to is required',
    }),
  }),
})

const updateCourseZodSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    accessibleTo: z.nativeEnum(ICourseAudience).optional(),
  }),
})

export const CourseValidation = {
  createCourseZodSchema,
  updateCourseZodSchema,
}
