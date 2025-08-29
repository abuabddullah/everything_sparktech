import { z } from 'zod'

const createUserProgressHistoryZodSchema = z.object({
  body: z.object({
    user: z.string({ required_error: 'User is required' }),
    answeredQuestions: z.array(
      z.object({
        question: z.string({ required_error: 'Question is required' }),
        userAnswer: z.number({ required_error: 'User answer is required' }),
        isCorrectlyAnswered: z.boolean({
          required_error: 'Is correctly answered is required',
        }),
      }),
    ),
    completedExaminations: z.array(
      z.object({
        examination: z.string({ required_error: 'Examination is required' }),
        timeSpent: z.number({ required_error: 'Time spent is required' }),
      }),
    ),
  }),
})

const updateUserProgressHistoryZodSchema = z.object({
  body: z.object({
    user: z.string().optional(),
    answeredQuestions: z.array(
      z.object({
        question: z.string().optional(),
        userAnswer: z.number().optional(),
        isCorrectlyAnswered: z.boolean().optional(),
      }),
    ),
    completedExaminations: z.array(
      z.object({
        examination: z.string().optional(),
        timeSpent: z.number().optional(),
      }),
    ),
  }),
})

export const UserProgressHistoryValidation = {
  createUserProgressHistoryZodSchema,
  updateUserProgressHistoryZodSchema,
}
