import { Schema, model } from 'mongoose'
import {
  IUserStudyHistory,
  IQuestionAttempt,
  ILessonHistory,
  IExamHistory,
  IExamAttempt,
  IDailyStudyStats,
} from './userStudyHistory.interface'

const questionAttemptSchema = new Schema<IQuestionAttempt>({
  questionId: {
    type: Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
  },
  isCorrect: {
    type: Boolean,
    required: true,
  },
  timeSpent: {
    type: Number,
    required: true,
    min: 0,
  },
  attemptedAt: {
    type: Date,
    default: Date.now,
  },
  selectedAnswer: {
    type: Schema.Types.Mixed,
  },
  explanation: {
    type: String,
  },
})

const lessonHistorySchema = new Schema<ILessonHistory>({
  lessonId: {
    type: Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true,
  },
  questionsAttempted: [questionAttemptSchema],
  totalQuestionsAnswered: {
    type: Number,
    default: 0,
    min: 0,
  },
  correctAnswers: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalTimeSpent: {
    type: Number,
    default: 0,
    min: 0,
  },
  accuracy: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  lastAttemptedAt: {
    type: Date,
    default: Date.now,
  },
  completionStatus: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started',
  },
})

const examAttemptSchema = new Schema<IExamAttempt>({
  attemptNumber: {
    type: Number,
    required: true,
    min: 1,
  },
  questionsAttempted: [questionAttemptSchema],
  totalQuestions: {
    type: Number,
    required: true,
    min: 0,
  },
  correctAnswers: {
    type: Number,
    required: true,
    min: 0,
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  timeSpent: {
    type: Number,
    required: true,
    min: 0,
  },
  startedAt: {
    type: Date,
    required: true,
  },
  completedAt: {
    type: Date,
    required: true,
  },
  isPassed: {
    type: Boolean,
    required: true,
  },
  passMark: {
    type: Number,
    min: 0,
    max: 100,
  },
})

const examHistorySchema = new Schema<IExamHistory>({
  examId: {
    type: Schema.Types.ObjectId,
    ref: 'Exam',
    required: true,
  },
  attempts: [examAttemptSchema],
  bestScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  averageScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  totalAttempts: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalTimeSpent: {
    type: Number,
    default: 0,
    min: 0,
  },
  lastAttemptedAt: {
    type: Date,
    default: Date.now,
  },
})

const dailyStatsSchema = new Schema<IDailyStudyStats>({
  date: {
    type: Date,
    required: true,
  },
  totalTimeSpent: {
    type: Number,
    default: 0,
    min: 0,
  },
  questionsAnswered: {
    type: Number,
    default: 0,
    min: 0,
  },
  correctAnswers: {
    type: Number,
    default: 0,
    min: 0,
  },
  lessonsStudied: {
    type: Number,
    default: 0,
    min: 0,
  },
  examsAttempted: {
    type: Number,
    default: 0,
    min: 0,
  },
})

const userStudyHistorySchema = new Schema<IUserStudyHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    lessonHistory: [lessonHistorySchema],
    examHistory: [examHistorySchema],
    dailyStats: [dailyStatsSchema],
    totalStudyTime: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalQuestionsAnswered: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalCorrectAnswers: {
      type: Number,
      default: 0,
      min: 0,
    },
    overallAccuracy: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    studyStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    longestStudyStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastStudyDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for better query performance
userStudyHistorySchema.index({ userId: 1 })
userStudyHistorySchema.index({ 'lessonHistory.lessonId': 1 })
userStudyHistorySchema.index({ 'examHistory.examId': 1 })
userStudyHistorySchema.index({ 'dailyStats.date': 1 })
userStudyHistorySchema.index({ lastStudyDate: -1 })

export const UserStudyHistory = model<IUserStudyHistory>(
  'UserStudyHistory',
  userStudyHistorySchema,
)
