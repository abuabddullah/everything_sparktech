import { Schema, model } from 'mongoose'
import { IStudyLesson } from './StudyLesson.interface'

const StudyLessonSchema = new Schema<IStudyLesson>(
  {
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    questionSets: {
      type: [Schema.Types.ObjectId],
      ref: 'QuestionSet',
      required: false,
      default: [],
    },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    questionSetsCount: { type: Number, required: false, default: 0 },
    altText: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true },
)

StudyLessonSchema.pre('find', function (next) {
  this.find({ isDeleted: false })
  next()
})

StudyLessonSchema.pre('findOne', function (next) {
  this.findOne({ isDeleted: false })
  next()
})

StudyLessonSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } })
  next()
})

export const StudyLesson = model<IStudyLesson>('StudyLesson', StudyLessonSchema)
