import { Types } from 'mongoose'
import { IQSetTypes } from './QuestionSet.enum'

export interface IQuestionSet {
  description?: string
  prompts?: Types.ObjectId[] // description only | img+description | table
  questions: Types.ObjectId[] // minimum 1 question
  studyLesson?: Types.ObjectId // for study so ignore for examination
  examination?: Types.ObjectId // for examination so ignore for study
  //   image: string
  // altText: string
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
