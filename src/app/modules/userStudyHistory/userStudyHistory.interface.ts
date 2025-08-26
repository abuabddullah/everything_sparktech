import { Document, Types } from 'mongoose'

export interface IQuestionAttempt {
  questionId: Types.ObjectId
  isCorrect: boolean
  timeSpent: number // in seconds
  attemptedAt: Date
  selectedAnswer?: string | string[]
  explanation?: string
}

export interface ILessonHistory {
  lessonId: Types.ObjectId
  questionsAttempted: IQuestionAttempt[]
  totalQuestionsAnswered: number
  correctAnswers: number
  totalTimeSpent: number // in seconds
  accuracy: number // percentage
  lastAttemptedAt: Date
  completionStatus: 'not_started' | 'in_progress' | 'completed'
}

export interface IExamHistory {
  examId: Types.ObjectId
  attempts: IExamAttempt[]
  bestScore: number
  averageScore: number
  totalAttempts: number
  totalTimeSpent: number // in seconds
  lastAttemptedAt: Date
}

export interface IExamAttempt {
  attemptNumber: number
  questionsAttempted: IQuestionAttempt[]
  totalQuestions: number
  correctAnswers: number
  score: number // percentage
  timeSpent: number // in seconds
  startedAt: Date
  completedAt: Date
  isPassed: boolean
  passMark?: number
}

export interface IDailyStudyStats {
  date: Date
  totalTimeSpent: number // in seconds
  questionsAnswered: number
  correctAnswers: number
  lessonsStudied: number
  examsAttempted: number
}

export interface IUserStudyHistory extends Document {
  userId: Types.ObjectId
  lessonHistory: ILessonHistory[]
  examHistory: IExamHistory[]
  dailyStats: IDailyStudyStats[]
  totalStudyTime: number // in seconds
  totalQuestionsAnswered: number
  totalCorrectAnswers: number
  overallAccuracy: number // percentage
  studyStreak: number // consecutive days
  longestStudyStreak: number
  lastStudyDate: Date
  createdAt: Date
  updatedAt: Date
}

export interface IUserStudyHistoryFilter {
  userId?: string
  startDate?: Date
  endDate?: Date
  lessonId?: string
  examId?: string
  searchTerm?: string
}

export interface IStudyStatsQuery {
  userId: string
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  startDate?: Date
  endDate?: Date
}
