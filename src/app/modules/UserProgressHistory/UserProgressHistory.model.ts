import { Schema, model } from 'mongoose'
import { IUserProgressHistory } from './UserProgressHistory.interface'

// const UserProgressHistorySchema = new Schema<IUserProgressHistory>(
//   {
//     user: {
//       type: Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//       unique: true,
//     },
//     answeredQuestions: [
//       {
//         examination: {
//           type: Schema.Types.ObjectId,
//           ref: 'Examination',
//           required: true,
//           index: true,
//         },
//         question: {
//           type: Schema.Types.ObjectId,
//           ref: 'Question',
//           required: true,
//           index: true,
//         },
//         userAnswer: Number, // userSelected option / short answer
//         isCorrectlyAnswered: Boolean,
//       },
//     ],
//     completedExaminations: [
//       {
//         examination: {
//           type: Schema.Types.ObjectId,
//           ref: 'Examination',
//           required: true,
//           index: true,
//         },
//         timeSpentInSecond: Number,
//       },
//     ],
//     isDeleted: { type: Boolean, default: false },
//     deletedAt: { type: Date },
//   },
//   { timestamps: true },
// )

const UserProgressHistorySchema = new Schema<IUserProgressHistory>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    test: {
      type: Schema.Types.ObjectId,
      ref: 'Test',
      required: true,
    },
    examination: {
      type: Schema.Types.ObjectId,
      ref: 'Examination',
      required: true,
      index: true,
    },
    isExamCompleted: {
      type: Boolean,
      required: true,
      default: false,
    },
    question: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
      index: true,
    },
    userAnswer: [Number], // userSelected option / short answer
    isCorrectlyAnswered: Boolean,
    timeSpentInSecond: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true },
)

UserProgressHistorySchema.pre('find', function (next) {
  this.find({ isDeleted: false })
  next()
})

UserProgressHistorySchema.pre('findOne', function (next) {
  this.findOne({ isDeleted: false })
  next()
})

UserProgressHistorySchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } })
  next()
})

export const UserProgressHistory = model<IUserProgressHistory>(
  'UserProgressHistory',
  UserProgressHistorySchema,
)
