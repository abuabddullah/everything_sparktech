import { Document, Types } from 'mongoose'

export interface IWeakTopic {
  topic: string
  accuracy: number
  totalAttempts: number
}

export interface ISession {
  startTime: Date
  endTime: Date | null
  durationMinutes: number
  topics: string[]
  notes: string
  completedQuestionId: Types.ObjectId | null
  questionNotes: string
}

export interface IStudyprogress extends Document {
  studentId: Types.ObjectId
  examId: Types.ObjectId
  sessions: ISession[]
  totalStudyTime: number
  lastStudied: Date | null
  bookmarks: Types.ObjectId[]
  weakTopics: IWeakTopic[]
  status: 'active' | 'completed' | 'paused'
  createdAt: Date
  updatedAt: Date
}

export interface IStudyprogressFilter {
  searchTerm?: string
  status?: string
}
