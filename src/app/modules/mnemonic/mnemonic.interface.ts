import { Model, Types } from 'mongoose'

export interface IMnemonicItem {
  _id : Types.ObjectId
  letter: string
  meaning: string
}

export interface IMnemonicFilterables {
  searchTerm?: string
  title?: string
  description?: string
  category?: string
}

export interface IMnemonic {
  _id: Types.ObjectId
  title?: string
  description?: string
  category: Types.ObjectId
  items: IMnemonicItem[]
}

export type MnemonicModel = Model<IMnemonic, {}, {}>
