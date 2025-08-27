import { ICourseAudience } from './Course.enum'
import { Types } from 'mongoose'

export interface ICourse {
  image: string
  title: 'Next Gen Course' | 'Case Studies' // পরে string type দিয়ে flexible করা যাবে
  description: string
  accessibleTo: ICourseAudience
  studyLessons?: Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
  isDeleted: boolean
  deletedAt?: Date
}

export type ICourseFilters = {
  searchTerm?: string
}
