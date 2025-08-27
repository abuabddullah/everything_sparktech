import { Types } from 'mongoose'

export interface IStudyLesson {
  course: Types.ObjectId
  image: string
  prompt: Types.ObjectId // title, description
  questionSets: Types.ObjectId[] // *
  questionSetsCount: number
  altText: string
  title: string
  description: string
  createdAt: Date
  updatedAt: Date
  isDeleted: boolean
  deletedAt?: Date
}

export type IStudyLessonFilters = {
  searchTerm?: string
}
