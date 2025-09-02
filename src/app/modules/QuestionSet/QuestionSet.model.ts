import { Schema, model } from 'mongoose'
import { IQuestionSet } from './QuestionSet.interface'
import { IQSetRefType, IQSetTypes } from './QuestionSet.enum'

const QuestionSetSchema = new Schema<IQuestionSet>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    prompts: {
      type: [Schema.Types.ObjectId],
      ref: 'Prompt',
      required: false,
      default: [],
    },
    questions: {
      type: [Schema.Types.ObjectId],
      ref: 'Question',
      required: true,
      min: [1, 'at least one question is required'],
      default: [],
    },
    refId: {
      type: Schema.Types.ObjectId,
      refPath: 'refType',
      required: false,
      default: null,
    },
    refType: {
      type: String,
      enum: Object.values(IQSetRefType),
      required: true,
    },
    explanation: { type: String, required: false },
    questionSetType: {
      type: String,
      enum: Object.values(IQSetTypes),
      required: true,
      default: IQSetTypes.MIX,
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true },
)

QuestionSetSchema.pre('find', function (next) {
  this.find({ isDeleted: false })
  next()
})

QuestionSetSchema.pre('findOne', function (next) {
  this.findOne({ isDeleted: false })
  next()
})

QuestionSetSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } })
  next()
})

export const QuestionSet = model<IQuestionSet>('QuestionSet', QuestionSetSchema)
