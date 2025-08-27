import { Types } from 'mongoose'
import { IUserProgressHistoryRefType } from './UserProgressHistory.enum'

export interface IUserProgressHistory {
  user: Types.ObjectId
  refId: Types.ObjectId
  refType: IUserProgressHistoryRefType
  // if refType is StudyLesson
  studyLessonHistory?: {
    studyLessonQuestions: Types.ObjectId[]
    studyLessonQuestionSetsCount: number
    studyLessonQuestionSetsWatchedCount: number
  }
  // if refType is Question
  questionHistory?: {
    questions: Types.ObjectId[]
    questionCorrectlyAnsweredCount: number
    questionWatchedCount: number
  }
  // if refType is Examination
  examinationHistory?: {
    examinations: Types.ObjectId[]
    completedExaminations: Types.ObjectId[]
    examinationWatchedCount: number
  }
  timeSpent?: number // for userProgressHistory
  createdAt: Date
  updatedAt: Date
  isDeleted: boolean
  deletedAt?: Date
}

export type IUserProgressHistoryFilters = {
  searchTerm?: string
}
