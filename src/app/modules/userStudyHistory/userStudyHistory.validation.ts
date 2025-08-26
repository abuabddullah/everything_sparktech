import { z } from 'zod'

const recordLessonQuestionAttempt = z.object({
  body: z.object({
    userId: z.string({
      required_error: 'User ID is required',
    }),
    lessonId: z.string({
      required_error: 'Lesson ID is required',
    }),
    questionId: z.string({
      required_error: 'Question ID is required',
    }),
    isCorrect: z.boolean({
      required_error: 'isCorrect is required',
    }),
    timeSpent: z
      .number({
        required_error: 'Time spent is required',
      })
      .min(0, 'Time spent must be positive'),
    selectedAnswer: z.union([z.string(), z.array(z.string())]).optional(),
  }),
})

const startExamAttempt = z.object({
  body: z.object({
    userId: z.string({
      required_error: 'User ID is required',
    }),
    examId: z.string({
      required_error: 'Exam ID is required',
    }),
    totalQuestions: z
      .number({
        required_error: 'Total questions is required',
      })
      .min(1, 'Total questions must be at least 1'),
    passMark: z.number().min(0).max(100).optional(),
  }),
})

const completeExamAttempt = z.object({
  body: z.object({
    userId: z.string({
      required_error: 'User ID is required',
    }),
    examId: z.string({
      required_error: 'Exam ID is required',
    }),
    questionsAttempted: z.array(
      z.object({
        questionId: z.string({
          required_error: 'Question ID is required',
        }),
        isCorrect: z.boolean({
          required_error: 'isCorrect is required',
        }),
        timeSpent: z
          .number({
            required_error: 'Time spent is required',
          })
          .min(0, 'Time spent must be positive'),
        attemptedAt: z.date().optional(),
        selectedAnswer: z.union([z.string(), z.array(z.string())]).optional(),
        explanation: z.string().optional(),
      }),
    ),
    timeSpent: z
      .number({
        required_error: 'Total time spent is required',
      })
      .min(0, 'Time spent must be positive'),
  }),
})

export const UserStudyHistoryValidation = {
  recordLessonQuestionAttempt,
  startExamAttempt,
  completeExamAttempt,
}
