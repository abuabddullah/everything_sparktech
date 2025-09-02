import { Types } from 'mongoose'
import { ITestTitle } from './Test.enum'

export interface ITest {
  title: ITestTitle // পরে string type দিয়ে flexible করা যাবে
  description: string
  examinations?: Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
  isDeleted: boolean
  deletedAt?: Date
}

export type ITestFilters = {
  searchTerm?: string
}
