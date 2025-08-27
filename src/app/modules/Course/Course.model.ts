import { Schema, model } from 'mongoose'
import { ICourse } from './Course.interface'
import { ICourseAudience } from './Course.enum'

const CourseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    accessibleTo: {
      type: String,
      enum: Object.values(ICourseAudience),
      required: true,
    },
    studyLessons: [
      {
        type: Schema.Types.ObjectId,
        ref: 'StudyLesson',
        required: false,
        default: [],
      },
    ],

    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true },
)

CourseSchema.pre('find', function (next) {
  this.find({ isDeleted: false })
  next()
})

CourseSchema.pre('findOne', function (next) {
  this.findOne({ isDeleted: false })
  next()
})

CourseSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } })
  next()
})

export const Course = model<ICourse>('Course', CourseSchema)
