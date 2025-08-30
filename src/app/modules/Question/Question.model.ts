import mongoose, { Schema, model } from 'mongoose'
import { IQuestion } from './Question.interface'
import { IQTypes } from './Question.enum'

const QuestionSchema = new Schema<IQuestion>(
  {
    questionType: {
      type: String,
      enum: Object.values(IQTypes),
      required: true,
    },
    questionSet: {
      type: Schema.Types.ObjectId,
      ref: 'QuestionSet',
      required: false,
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
    correctAnswerOption: { type: Number, required: false },
    slNoOfCorrectAnswers: { type: [Number], required: false },
    title: { type: String, required: false },
    description: { type: String, required: false },
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
//
export const Question = model<IQuestion>('Question', QuestionSchema)
// export const Question =
//   mongoose.models.Question || mongoose.model('Question', QuestionSchema)
