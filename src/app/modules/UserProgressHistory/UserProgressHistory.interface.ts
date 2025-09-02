import { Types } from 'mongoose'
import { IUserProgressHistoryRefType } from './UserProgressHistory.enum'

// export interface IUserProgressHistory {
//   user: Types.ObjectId
//   answeredQuestions?: {
//     examination: Types.ObjectId
//     question: Types.ObjectId
//     userAnswer: number
//     isCorrectlyAnswered: boolean
//   }[]
//   completedExaminations?: {
//     examination: Types.ObjectId
//     timeSpentInSecond: number
//   }[]
//   createdAt: Date
//   updatedAt: Date
//   isDeleted: boolean
//   deletedAt?: Date
// }

export interface IUserProgressHistory {
  user: Types.ObjectId
  test: Types.ObjectId
  examination: Types.ObjectId
  question: Types.ObjectId
  userAnswer: number | number[]
  isCorrectlyAnswered: boolean
  timeSpentInSecond: number
  createdAt: Date
  updatedAt: Date
  isDeleted: boolean
  deletedAt?: Date
}

export type IUserProgressHistoryFilters = {
  searchTerm?: string
}
