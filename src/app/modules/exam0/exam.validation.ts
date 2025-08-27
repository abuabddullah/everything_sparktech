import { z } from 'zod'
import { defaultStats } from './exam.constants'

// Enums
export const QuestionTypeEnum = z.enum([
  'checkbox',
  'radio',
  'box',
  'chart_box',
  'dropdown',
  'number',
  'rearrange',
])

export const ExamTypeEnum = z.enum(['readiness', 'standalone'])

// Stem schema
export const StemSchema = z.object({
  body: z.object({
    stems: z.array(
      z.object({
        stemTitle: z.string().optional(),
        stemDescription: z.string().optional(),
        stemPicture: z.string().url().nullable().optional(),
        table: z
          .array(
            z.object({
              key: z.string(),
              value: z.union([z.string(), z.number(), z.boolean(), z.null()]),
              type: z.enum(['text', 'number', 'boolean']).default('text'),
            }),
          )
          .optional(),
      }),
    ),
  }),
})

// Option schema
export const OptionSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  value: z.string().min(1, 'Value is required'),
  explanation: z.string().optional(),
  mediaUrl: z.string().url().optional(),
})

// Question schema
export const QuestionSchema = z.object({
  body: z.object({
    questions: z.array(
      z.object({
        type: QuestionTypeEnum,
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

// ExamStats schema
export const ExamStatsSchema = z.object({
  questionCount: z.number().optional().default(0),
  attempts: z.number().optional().default(0),
  avgHighestScore: z.number().optional().default(0),
  avgScore: z.number().optional().default(0),
  lastAttemptAt: z.string().datetime().optional(),
})

// Exam schema (main)
export const ExamSchema = z.object({
  body: z.object({
    category: ExamTypeEnum,
    name: z.string().optional(),
    code: z.string().optional(),
    description: z.string().optional(),
    isPublished: z.boolean().optional().default(false),
    durationMinutes: z.number().optional().default(100),
    passMark: z.number().optional().default(40),
    stats: ExamStatsSchema.optional(),
    createdBy: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid User ObjectId')
      .optional(),
  }),
})

export type ExamBody = z.infer<typeof ExamSchema>
