import { Types } from 'mongoose'

export interface IQuestion {
  // questionType: IQTypes
  questionSet: Types.ObjectId
  query: string
  options: {
    slNo: number
    value: string
  }[] // for true false option will be max 2,for short answer will be no options

  // radio + true + dropdown + short answer false
  slNoOfCorrectAnswer: number // number will be used if type is "short answer"
  // mcq + rearrange
  slNoOfCorrectAnswers: number[] // if type is "rearrange" then the answer must match the sequence of correctAnswers[] but if type is "mcq" then sequence of options is flexible
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
