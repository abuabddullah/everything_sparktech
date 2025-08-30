import { Types } from 'mongoose'

export interface IStudyLesson {
  course: Types.ObjectId
  image: string
  questionSets: Types.ObjectId[] // *
  category: Types.ObjectId // Men, Women, Children,Adult
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
