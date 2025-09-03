import { Schema, model } from 'mongoose'
import { IExamination } from './Examination.interface'

const ExaminationSchema = new Schema<IExamination>(
  {
    title: { type: String, required: true },
    description: { type: String, required: false },
    test: { type: Schema.Types.ObjectId, ref: 'Test', required: true },
    questionSetsCount: { type: Number, required: false, default: 0 },
    questionSteps: {
      type: [
        {
          stepNo: {
            type: Number,
            required: true,
            min: [1, 'Step number must be at least 1'],
          },
          questionSet: {
            type: Schema.Types.ObjectId,
            ref: 'QuestionSet',
          },
        },
        { _id: false },
      ],
      required: false,
      default: [],
    },
    completedBy: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
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

// on save make questionSteps sorted based on stepNo
ExaminationSchema.pre('save', function (next) {
  this.questionSteps.sort((a, b) => a.stepNo - b.stepNo)
  next()
})

export const Examination = model<IExamination>('Examination', ExaminationSchema)
