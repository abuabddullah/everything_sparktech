import { z } from 'zod'
import { objectIdSchemaMendatory } from '../Reviews/Reviews.utils'

// const createUserProgressHistoryZodSchema = z.object({
//   body: z.object({
//     user: z.string({ required_error: 'User is required' }),
//     answeredQuestions: z.array(
//       z.object({
//         examination: z.string({ required_error: 'Examination is required' }),
//         question: z.string({ required_error: 'Question is required' }),
//         userAnswer: z.number({ required_error: 'User answer is required' }),
//         isCorrectlyAnswered: z.boolean({
//           required_error: 'Is correctly answered is required',
//         }),
//       }),
//     ),
//     completedExaminations: z.array(
//       z.object({
//         examination: z.string({ required_error: 'Examination is required' }),
//         timeSpentInSecond: z.number({ required_error: 'Time spent is required' }),
//       }),
//     ),
//   }),
// })
const createUserProgressHistoryZodSchema = z.object({
  test: z.string({ required_error: 'Test is required' }),
  examination: z.string({ required_error: 'Examination is required' }),
  question: z.string({ required_error: 'Question is required' }),
  userAnswer: z.union([z.number(), z.array(z.number())]),
  timeSpentInSecond: z.number().optional(),
})

// const updateUserProgressHistoryZodSchema = z.object({
//   body: z.object({
//     user: z.string().optional(),
//     answeredQuestions: z.array(
//       z.object({
//         examination: z.string().optional(),
//         question: z.string().optional(),
//         userAnswer: z.number().optional(),
//         isCorrectlyAnswered: z.boolean().optional(),
//       }),
//     ),
//     completedExaminations: z.array(
//       z.object({
//         examination: z.string().optional(),
//         timeSpentInSecond: z.number().optional(),
//       }),
//     ),
//   }),
// })

const updateUserProgressHistoryZodSchema = z.object({
  test: z.string().optional(),
  examination: z.string().optional(),
  question: z.string().optional(),
  userAnswer: z.union([z.number(), z.array(z.number())]).optional(),
  timeSpentInSecond: z.number().optional(),
})

const completeExamZodSchema = z.object({
  params: z.object({
    examinationId: objectIdSchemaMendatory('examinationId'),
  }),
  body: z.object({
    timeSpentInSecond: z.number().optional(),
  }),
})

export const UserProgressHistoryValidation = {
  createUserProgressHistoryZodSchema,
  updateUserProgressHistoryZodSchema,
  completeExamZodSchema,
}
