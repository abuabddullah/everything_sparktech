import { Model } from 'mongoose'
import { LessonType } from '../../../enum/lesson'

export interface ILessonFilter {
  title?: string
  category?: 'case_study' | 'next_gen'
  lessonType?: 'chart' | 'video' | 'text' | 'simulation'
  searchTerm?: string
}

export interface ILesson {
  _id?: string
  category: LessonType
  name: string
  code?: string
  description?: string
  isPublished?: boolean
  durationMinutes?: number
  passMark?: number
  questions: string[] // ObjectId refs to Question
  stats?: Record<string, any>
  createdBy?: string
  createdAt?: Date
  updatedAt?: Date
}

export type LessonModel = Model<ILesson, {}, {}>
