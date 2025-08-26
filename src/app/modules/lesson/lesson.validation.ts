import { z } from 'zod'
import { defaultStats } from './lesson.constants'
import { LessonType } from '../../../enum/lesson'
import { OptionSchema } from '../exam/exam.validation'

// Enums
export const LessonQuestionTypeEnum = z.enum(['chart_based', 'image_based'])

export const LessonQuestionSchema = z.object({
  body: z.object({
    questions: z.array(
      z.object({
        type: LessonQuestionTypeEnum,
        stems: z
          .array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId'))
          .optional(),
        questionText: z.string().min(1, 'Question text is required'),
        options: z.array(OptionSchema).optional(),
        allowMultiple: z.boolean().optional().default(false),
        numberAnswer: z.number().optional(),
        correctAnswer: z.number().optional(),
        rearrangeItems: z.array(z.string()).optional(),
        correctOrder: z.array(z.number()).optional(),
        points: z.number().optional().default(1),
        tags: z.array(z.string()).optional(),
        explanation: z.string().optional(),
      }),
    ),
  }),
})

// Lesson schema (main)
export const LessonSchema = z.object({
  body: z.object({
    category: z.enum(Object.values(LessonType) as [string, ...string[]]),
    name: z.string().optional(),
    code: z.string().optional(),
    description: z.string().optional(),
    isPublished: z.boolean().optional().default(false),
    durationMinutes: z.number().optional().default(100),
    passMark: z.number().optional().default(40),
    stats: z.record(z.any()).default(defaultStats),
    createdBy: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid User ObjectId')
      .optional(),
  }),
})

export type LessonBody = z.infer<typeof LessonSchema>
