import { Types } from 'mongoose'

export interface ITest {
  title: 'Rediness Test' | 'Standalone Test' // পরে string type দিয়ে flexible করা যাবে
  description: string
  examinations: Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
  isDeleted: boolean
  deletedAt?: Date
}

export type ITestFilters = {
  searchTerm?: string
}
