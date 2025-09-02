import { Types } from 'mongoose'

export interface IPromptTable {
  slNo: number
  properties: string
  values: string
}

export interface IPrompt {
  _id?: Types.ObjectId
  title?: string
  description?: string
  image?: string
  questionSet?: Types.ObjectId | null // initially লাগবে না কিন্তু পরে যখন এই prompt কোথাও use হবে সেই id এখানে add করতে হবে
  promptTable?: IPromptTable[]
  createdAt: Date
  updatedAt: Date
  isDeleted: boolean
  deletedAt?: Date
}

export type IPromptFilters = {
  searchTerm?: string
}
