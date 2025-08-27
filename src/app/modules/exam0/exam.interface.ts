import { Model, Types } from 'mongoose'
import { ExamType, QuestionType } from '../../../enum/exam'

export interface IExamFilter {
  title?: string
  category?: 'case_study' | 'next_gen'
  examType?: 'chart' | 'video' | 'text' | 'simulation'
  searchTerm?: string
}

// Stem model
export interface IStem {
  stemTitle?: string
  stemDescription?: string
  stemPicture?: string | null
  table?: {
    key: string
    value: any
    type: 'text' | 'number' | 'boolean'
  }[]
}

export interface IOption {
  _id?: string
  label: string
  value: string
  isCorrect?: boolean
  explanation?: string
  mediaUrl?: string
}

// Question model
export interface IQuestion {
  _id?: string
  refId?: string
  type: QuestionType
  stems: string[] // ObjectId refs to Stem
  questionText: string
  options?: IOption[]
  allowMultiple?: boolean
  numberAnswer?: number
  rearrangeItems?: string[]
  correctOrder?: number[]
  points?: number
  tags?: string[]
  explanation?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface ExamStats {
  questionCount: number
  attempts: number
  avgHighestScore: number
  avgScore: number
  avgTime: number
  lastAttemptAt?: Date
}

export interface IExam {
  _id?: string
  category: ExamType
  name: string
  code?: string
  description?: string
  isPublished?: boolean
  durationMinutes?: number
  passMark?: number
  questions: string[] // ObjectId refs to Question
  stats?: ExamStats
  createdBy?: string
  createdAt?: Date
  updatedAt?: Date
}

export type ExamModel = Model<IExam, {}, {}>
