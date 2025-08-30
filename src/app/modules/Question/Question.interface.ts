import { Types } from 'mongoose'
import { IQTypes } from './Question.enum'

export interface IQuestion {
  questionType: IQTypes
  questionSet?: Types.ObjectId // initially লাগবে না কিন্তু পরে যখন এই question set কোথাও use হবে সেই id এখানে add করতে হবে
  query: string
  options?: {
    slNo: number
    value: string
  }[] // for true false option will be max 2(values: true,false),for short answer will be no options

  // radio + true + dropdown + short answer false
  correctAnswerOption?: number // string will be used if type is "short answer"
  // mcq + rearrange
  slNoOfCorrectAnswers?: number[] // if type is "rearrange" then the answer must match the sequence of correctAnswers[] but if type is "mcq" then sequence of options is flexible
  description?: string
  title?: string
  createdAt: Date
  updatedAt: Date
  isDeleted: boolean
  deletedAt?: Date
}

export type IQuestionFilters = {
  searchTerm?: string
}
