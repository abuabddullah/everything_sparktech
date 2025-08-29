import { Types } from 'mongoose'
import { IUserProgressHistoryRefType } from './UserProgressHistory.enum'

export interface IUserProgressHistory {
  user: Types.ObjectId
  refId: Types.ObjectId
  refType: IUserProgressHistoryRefType
  // if refType is Question
  questionHistory?: {
    question: Types.ObjectId
    userAnswer: string // userSelected option / short answer
    isCorrectlyAnswered: boolean
  }[]
  // if refType is Examination
  examinationHistory?: {
    examination: Types.ObjectId
    timeSpent: number
  }[]
  timeSpent?: number // for userProgressHistory
  createdAt: Date
  updatedAt: Date
  isDeleted: boolean
  deletedAt?: Date
}

export type IUserProgressHistoryFilters = {
  searchTerm?: string
}
