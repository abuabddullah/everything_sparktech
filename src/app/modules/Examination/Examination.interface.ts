import { Types } from 'mongoose'

export interface IExamination {
  title: string
  description?: string
  test: Types.ObjectId
  questionSetsCount: number
  questionSteps: {
    stepNo: number
    questionSet: Types.ObjectId
  }[]
  createdAt: Date
  updatedAt: Date
  isDeleted: boolean
  deletedAt?: Date
}

export type IExaminationFilters = {
  searchTerm?: string
}
