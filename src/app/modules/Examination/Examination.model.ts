import { Schema, model } from 'mongoose'
import { IExamination } from './Examination.interface'

const ExaminationSchema = new Schema<IExamination>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    test: { type: Schema.Types.ObjectId, ref: 'Test', required: true },
    questionSetsCount: { type: Number, required: false, default: 0 },
    questionSets: {
      type: [Schema.Types.ObjectId],
      ref: 'QuestionSet',
      required: false,
      default: [],
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true },
)

ExaminationSchema.pre('find', function (next) {
  this.find({ isDeleted: false })
  next()
})

ExaminationSchema.pre('findOne', function (next) {
  this.findOne({ isDeleted: false })
  next()
})

ExaminationSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } })
  next()
})

export const Examination = model<IExamination>('Examination', ExaminationSchema)
