import { Schema, model } from 'mongoose'
import { IPrompt } from './Prompt.interface'

const PromptSchema = new Schema<IPrompt>(
  {
    image: { type: String, required: false },
    title: { type: String, required: true },
    description: { type: String, required: true },
    questionSet: {
      type: Schema.Types.ObjectId,
      ref: 'QuestionSet',
      required: false,
      default: null,
    }, // initially লাগবে না কিন্তু পরে যখন এই prompt কোথাও use হবে সেই id এখানে add করতে হবে
    promptTable: {
      type: [
        {
          slNo: { type: Number, required: true },
          properties: { type: String, required: true },
          values: { type: String, required: true },
        },
      ],
      required: false,
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true },
)

PromptSchema.pre('find', function (next) {
  this.find({ isDeleted: false })
  next()
})

PromptSchema.pre('findOne', function (next) {
  this.findOne({ isDeleted: false })
  next()
})

PromptSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } })
  next()
})

export const Prompt = model<IPrompt>('Prompt', PromptSchema)
