import { model, Schema, Types } from 'mongoose'
import { ExamStats, IExam, IOption, IQuestion, IStem } from './exam.interface'
import { ExamType, QuestionType } from '../../../enum/exam'
import { defaultStats } from './exam.constants'

const stemSchema = new Schema<IStem>(
  {
    stemTitle: { type: String },
    stemDescription: { type: String },
    stemPicture: { type: String || null, default: null },
    table: [{
      key: { type: String, required: true },
      value: { type: Schema.Types.Mixed },
      type: { type: String, enum: ['text', 'number', 'boolean'], default: 'text' }
    }]
  },
  { timestamps: true },
)

export const Stem = model<IStem>('Stem', stemSchema)

const optionSchema = new Schema<IOption>(
  {
    label: { type: String, required: true },
    value: { type: String, required: true },
    isCorrect: { type: Boolean, default: false },
    explanation: { type: String },
    mediaUrl: { type: String },
  },
  { _id: true },
)

const questionSchema = new Schema<IQuestion>(
  {
    type: { type: String, enum: Object.values(QuestionType), required: true },
    refId: { type: String },
    stems: [{ type: Types.ObjectId, ref: 'Stem' }],
    questionText: { type: String, required: true },
    options: [optionSchema],
    allowMultiple: { type: Boolean, default: false },
    numberAnswer: { type: Number },
    rearrangeItems: [{ type: String }],
    correctOrder: [{ type: Number }],
    points: { type: Number, default: 1 },
    tags: [{ type: String }],
    explanation: { type: String },
  },
  { timestamps: true },
)

export const Question = model<IQuestion>('Question', questionSchema)

const examStatsSchema = new Schema<ExamStats>(
  {
    questionCount: { type: Number, default: 0 },
    attempts: { type: Number, default: 0 },
    avgHighestScore: { type: Number, default: 0 },
    avgScore: { type: Number, default: 0 },
    avgTime: { type: Number, default: 0 },
    lastAttemptAt: { type: Date },
  },
  { _id: false },
)

const examSchema = new Schema<IExam>(
  {
    category: { type: String, enum: Object.values(ExamType), required: true },
    name: { type: String },
    code: { type: String },
    description: { type: String },
    isPublished: { type: Boolean, default: false },
    durationMinutes: { type: Number, default: 100 },
    passMark: { type: Number, default: 40 },
    questions: [{ type: Types.ObjectId, ref: 'Question' }],
    stats: { type: examStatsSchema, default: defaultStats },
    createdBy: { type: Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
)

export const Exam = model<IExam>('Exam', examSchema)
