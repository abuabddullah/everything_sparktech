import { Types } from 'mongoose'
import { IQSetRefType, IQSetTypes } from './QuestionSet.enum'

export interface IQuestionSet {
  description?: string
  prompts?: Types.ObjectId[] // description only | img+description | table
  questions: Types.ObjectId[] // minimum 1 question
  refId?: Types.ObjectId | null // initial value will be null
  refType: IQSetRefType
  explanation?: string
  title?: string // Welcome to NCLEX ...... Exam 01
  questionSetType: IQSetTypes
  createdAt: Date
  updatedAt: Date
  isDeleted: boolean
  deletedAt?: Date
}

export type IQuestionSetFilters = {
  searchTerm?: string
}
