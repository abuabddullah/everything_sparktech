import { Schema, model } from 'mongoose'
import { IQuestion } from './Question.interface'

const QuestionSchema = new Schema<IQuestion>(
  {
    questionSet: {
      type: Schema.Types.ObjectId,
      ref: 'QuestionSet',
      required: true,
    },
    query: { type: String, required: true },
    options: {
      type: [
        {
          slNo: { type: Number, required: true },
          value: { type: String, required: true },
        },
      ],
      required: false,
    },
    slNoOfCorrectAnswer: { type: Number, required: false },
    slNoOfCorrectAnswers: { type: [Number], required: false },
    title: { type: String, required: true },
    description: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true },
)

QuestionSchema.pre('find', function (next) {
  this.find({ isDeleted: false })
  next()
})

QuestionSchema.pre('findOne', function (next) {
  this.findOne({ isDeleted: false })
  next()
})

QuestionSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } })
  next()
})

export const Question = model<IQuestion>('Question', QuestionSchema)
