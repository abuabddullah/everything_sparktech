import { Schema, model } from 'mongoose'
import { IStudyprogress, StudyprogressModel } from './studyprogress.interface'

const sessionsItemSchema = new Schema(
  {
    startTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    durationMinutes: {
      type: Number,
      min: 0,
      default: 0,
    },
    topics: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
      default: '',
    },
    completedQuestionId: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
    },
    questionNotes: {
      type: String,
      default: '',
    },
  },
  { _id: false },
)

const weakTopicsItemSchema = new Schema(
  {
    topic: {
      type: String,
      required: true,
    },
    accuracy: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    totalAttempts: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { _id: false },
)

const studyprogressSchema = new Schema<IStudyprogress, StudyprogressModel>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    examId: {
      type: Schema.Types.ObjectId,
      ref: 'Exam',
    },
    sessions: {
      type: [sessionsItemSchema],
      default: [],
    },
    totalStudyTime: {
      type: Number,
      min: 0,
      default: 0,
    },
    lastStudied: {
      type: Date,
    },
    bookmarks: {
      type: [Schema.Types.ObjectId],
      ref: 'Question',
      default: [],
    },
    weakTopics: {
      type: [weakTopicsItemSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'paused'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  },
)

// Pre-save middleware to set lastStudied and calculate totalStudyTime

// Index for better query performance
studyprogressSchema.index({ studentId: 1, examId: 1 }, { unique: true })
studyprogressSchema.index({ status: 1 })
studyprogressSchema.index({ lastStudied: -1 })

export const Studyprogress = model<IStudyprogress, StudyprogressModel>(
  'Studyprogress',
  studyprogressSchema,
)
