import { model, Schema, Types } from 'mongoose'
import { defaultStats } from './lesson.constants'
import { LessonType } from '../../../enum/lesson'
import { ILesson } from './lesson.interface'

const lessonSchema = new Schema<ILesson>(
  {
    category: { type: String, enum: Object.values(LessonType), required: true },
    name: { type: String },
    code: { type: String },
    description: { type: String },
    isPublished: { type: Boolean, default: false },
    durationMinutes: { type: Number, default: 100 },
    passMark: { type: Number, default: 40 },
    questions: [{ type: Types.ObjectId, ref: 'Question' }],
    stats: { type: Schema.Types.Mixed, default: defaultStats },
    createdBy: { type: Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
)

export const Lesson = model<ILesson>('Lesson', lessonSchema)
