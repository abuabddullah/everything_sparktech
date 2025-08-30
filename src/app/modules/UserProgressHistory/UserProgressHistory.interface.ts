import { Types } from 'mongoose'

export interface IUserProgressHistory {
  user: Types.ObjectId
  answeredQuestions?: {
    examination: Types.ObjectId
    question: Types.ObjectId
    userAnswer: number
    isCorrectlyAnswered: boolean
  }[]
  completedExaminations?: {
    examination: Types.ObjectId
    timeSpent: number
  }[]
  createdAt: Date
  updatedAt: Date
  isDeleted: boolean
  deletedAt?: Date
}

export type IUserProgressHistoryFilters = {
  searchTerm?: string
}
