import { Types } from 'mongoose'
import { IPromptRefType } from './Prompt.enum'

export interface IPromptTable {
  slNo: number
  properties: string
  values: string
}

export interface IPrompt {
  title?: string
  description?: string
  image?: string
  refId: Types.ObjectId
  refType: IPromptRefType
  promptTable?: IPromptTable[]
  createdAt: Date
  updatedAt: Date
  isDeleted: boolean
  deletedAt?: Date
}

export type IPromptFilters = {
  searchTerm?: string
}
