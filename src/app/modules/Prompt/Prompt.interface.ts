import { Types } from 'mongoose'
import { IPromptRefType, IPromptType } from './Prompt.enum'

export interface IPromptTable {
  properties: string
  values: string
}

export interface IPrompt {
  title?: string
  description?: string
  image?: string
  refId: Types.ObjectId
  refType: IPromptRefType
  promptType: IPromptType
  promptTable?: IPromptTable[]
  createdAt: Date
  updatedAt: Date
  isDeleted: boolean
  deletedAt?: Date
}

export type IPromptFilters = {
  searchTerm?: string
}
