import { Schema, model } from 'mongoose'
import { ITest } from './Test.interface'

const TestSchema = new Schema<ITest>(
  {
    examinations: {
      type: [Schema.Types.ObjectId],
      ref: 'Examination',
      required: false,
      default: [],
    },
    title: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true },
)

TestSchema.pre('find', function (next) {
  this.find({ isDeleted: false })
  next()
})

TestSchema.pre('findOne', function (next) {
  this.findOne({ isDeleted: false })
  next()
})

TestSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } })
  next()
})

export const Test = model<ITest>('Test', TestSchema)
