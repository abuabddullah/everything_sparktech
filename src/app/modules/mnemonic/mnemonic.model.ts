import { Schema, model } from 'mongoose'
import { IMnemonic, IMnemonicItem, MnemonicModel } from './mnemonic.interface'

const itemsItemSchema = new Schema<IMnemonicItem>(
  {
    _id: { type: Schema.Types.ObjectId },
    letter: { type: String },
    meaning: { type: String },
  },
  { _id: false },
)

const mnemonicSchema = new Schema<IMnemonic, MnemonicModel>(
  {
    title: { type: String },
    description: { type: String },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    items: [itemsItemSchema],
  },
  {
    timestamps: true,
  },
)

export const Mnemonic = model<IMnemonic, MnemonicModel>(
  'Mnemonic',
  mnemonicSchema,
)
