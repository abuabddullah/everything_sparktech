import { Types } from 'mongoose'
import { IQTypes } from './Question.enum'

export interface IQuestion {
  questionType: IQTypes
  query: string
  options: string[] // for true false option will be max 2,for short answer will be no options

  // radio + true + dropdown + short answer false
  correctAnswer: string | number // number will be used if type is "short answer"
  // mcq + rearrange
  correctAnswers: string[]
  description: string
  title: string
  createdAt: Date
  updatedAt: Date
  isDeleted: boolean
  deletedAt?: Date
}

export type IQuestionFilters = {
  searchTerm?: string
}
