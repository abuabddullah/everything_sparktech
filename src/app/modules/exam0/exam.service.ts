import { StatusCodes } from 'http-status-codes'
import ApiError from '../../../errors/ApiError'
import { IExam, IExamFilter, IQuestion, IStem } from './exam.interface'
import { JwtPayload } from 'jsonwebtoken'
import { IPaginationOptions } from '../../../interfaces/pagination'
import { paginationHelper } from '../../../helpers/paginationHelper'
import { examSearchableFields } from './exam.constants'
import mongoose, { Types } from 'mongoose'
import { Exam, Question, Stem } from './exam.model'
import { ConfirmStatus, ExamType } from '../../../enum/exam'
import { S3Helper } from '../../../helpers/image/s3helper'
// Create Stem
export const createStem = async (payload: IStem[]) => {
  if (!Array.isArray(payload) || payload.length === 0) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Stem data')
  }

  const createdStems = await Stem.insertMany(payload)
  if (!createdStems) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create Stem')
  }

  const stemIds = createdStems.map(stem => stem._id)
  return stemIds
}

// Create Question
export const createQuestion = async (payload: IQuestion, user: JwtPayload) => {
  if (!Array.isArray(payload) || payload.length === 0) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Question data')
  }

  const status = ConfirmStatus.IN_PROGRESS
  const in_progress = `${user.authId}_${status}`
  payload.map(p => {
    p.refId = in_progress
  })
  const question = await Question.insertMany(payload)

  // const refId = `${user.authId}_${ConfirmStatus.IN_PROGRESS}`

  const allQuestions = await Question.find({ refId: in_progress })
  if (!question) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create Question')
  }
  const ids = allQuestions.map(q => q._id)
  return ids
}

const createExam = async (user: JwtPayload, payload: IExam) => {
  const session = await Exam.startSession()
  session.startTransaction()

  try {
    // in-progress
    const refId = `${user.authId}_${ConfirmStatus.IN_PROGRESS}`
    const questions = await Question.find({ refId }).session(session)

    if (questions.length === 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'No questions available for this exam. Please create questions first before creating the exam.',
      )
    }

    const ids = questions.map(q => q._id.toString())
    const [readinessExams, standaloneExams] = await Promise.all([
      Exam.find({ isPublished: true, category: 'readiness' })
        .session(session)
        .countDocuments(),
      Exam.find({ isPublished: true, category: 'standalone' })
        .session(session)
        .countDocuments(),
    ])

    const defaultName =
      payload.category === ExamType.READINESS
        ? `${ExamType.READINESS} exam - ${readinessExams + 1}`
        : `${ExamType.STANDALONE} exam - ${standaloneExams + 1}`

    payload.questions = ids
    payload.name = payload.name || defaultName

    // Create Exam
    const result = await Exam.create([payload], { session })
    if (!result || result.length === 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Failed to create Exam, please try again with valid data.',
      )
    }

    const confirm_refId = `${user.authId}_${ConfirmStatus.CONFIRMED}`

    // Update all question statuses after exam creation
    await Question.updateMany(
      { _id: { $in: ids } },
      { $set: { refId: confirm_refId } },
      { session },
    )

    // Publish the exam
    const Published = await Exam.findByIdAndUpdate(
      result[0]._id,
      { $set: { isPublished: true } },
      { new: true, session },
    )

    // Commit transaction
    await session.commitTransaction()
    session.endSession()

    return Published
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw error
  }
}

const getAllExams = async (
  user: JwtPayload,
  filterables: IExamFilter,
  pagination: IPaginationOptions,
) => {
  const { searchTerm, ...filterData } = filterables
  const { page, skip, limit, sortBy, sortOrder } =
    paginationHelper.calculatePagination(pagination)
  const andConditions = []

  // 🔍 Search functionality
  if (searchTerm) {
    andConditions.push({
      $or: examSearchableFields.map(field => ({
        [field]: {
          $regex: searchTerm,
          $options: 'i',
        },
      })),
    })
  }

  // 🔎 Filter functionality
  if (Object.keys(filterData).length) {
    andConditions.push({
      $and: Object.entries(filterData).map(([key, value]) => ({
        [key]: value,
      })),
    })
  }

  const whereConditions = andConditions.length ? { $and: andConditions } : {}

  const [result, total] = await Promise.all([
    Exam.find(whereConditions)
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder })
      .populate({
        path: 'questions',
        populate: {
          path: 'stems',
          model: 'Stem',
        },
      }),
    Exam.countDocuments(whereConditions),
  ])

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: result,
  }
}

const getReadinessExam = async () => {
  const ReadinessExams = await Exam.find({
    isPublished: true,
    category: 'readiness',
  }).select('-questions -stats')
  if (!ReadinessExams || ReadinessExams.length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No readiness exams found')
  }
  return ReadinessExams
}
const getStandaloneExam = async () => {
  const StandaloneExams = await Exam.find({
    isPublished: true,
    category: 'standalone',
  }).select('-questions -stats')
  if (!StandaloneExams || StandaloneExams.length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No standalone exams found')
  }
  return StandaloneExams
}

const getQuestionByExam = async (
  examId: string,
  pagination: IPaginationOptions,
) => {
  if (!Types.ObjectId.isValid(examId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Exam ID')
  }

  const exam = await Exam.findById(examId)
  if (!exam) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Exam not found')
  }

  // Calculate pagination
  const { page, skip, limit, sortBy, sortOrder } =
    paginationHelper.calculatePagination(pagination)

  // ✅ Use the question IDs from the exam document with pagination
  const [questions, total] = await Promise.all([
    Question.find({
      _id: { $in: exam.questions },
    })
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder })
      .populate('stems'),
    Question.countDocuments({
      _id: { $in: exam.questions },
    }),
  ])

  if (!questions.length) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'No questions found for this exam',
    )
  }

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: questions,
  }
}

const getSingleExam = async (id: string): Promise<IExam> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Exam ID')
  }

  const result = await Exam.findById(id).populate({
    path: 'questions',
    populate: {
      path: 'stems',
      model: 'Stem',
    },
  })

  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Requested exam not found, please try again with valid id',
    )
  }

  return result
}

// const deleteExam = async (id: string) => {
//   const session = await mongoose.startSession()
//   session.startTransaction()

//   try {
//     const isExamExist = await Exam.findById(id).session(session)

//     if (!isExamExist) {
//       throw new ApiError(StatusCodes.NOT_FOUND, 'Exam not found')
//     }

//     // ✅ Step 1: Aggregate exam with questions + stems
//     const examAgg = await Exam.aggregate([
//       { $match: { _id: new mongoose.Types.ObjectId(id) } },
//       {
//         $lookup: {
//           from: 'questions',
//           localField: 'questions',
//           foreignField: '_id',
//           as: 'questions',
//         },
//       },
//       {
//         $lookup: {
//           from: 'stems',
//           localField: 'questions.stems',
//           foreignField: '_id',
//           as: 'stems',
//         },
//       },
//     ]).session(session)

//     if (!examAgg.length) {
//       throw new ApiError(StatusCodes.NOT_FOUND, 'Exam not found')
//     }

//     const exam = examAgg[0]

//     //  Step 2: Collect Question IDs & Stem IDs
//     const questionIds = exam.questions.map((q: any) => q._id)
//     const stemIds = exam.stems.map((s: any) => s._id)

//     //  Step 3: Delete stems
//     if (stemIds.length) {
//       await Stem.deleteMany({ _id: { $in: stemIds } }, { session })
//     }

//     //  Step 4: Delete questions
//     if (questionIds.length) {
//       await Question.deleteMany({ _id: { $in: questionIds } }, { session })
//     }
//     await Exam.findByIdAndDelete(id, { session })

//     const stems = await Stem.find({ _id: { $in: stemIds } }, { session })

//     stems.forEach(async stem => {
//       if (stem.stemPicture) {
//         const url = new URL(stem.stemPicture)
//         const key = url.pathname.substring(1)
//         await S3Helper.deleteFromS3(key)
//       }
//     })

//     await session.commitTransaction()
//     session.endSession()

//     return exam
//   } catch (err) {
//     await session.abortTransaction()
//     session.endSession()
//     throw err
//   }
// }

const deleteExam = async (id: string) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const isExamExist = await Exam.findById(id).session(session)
    if (!isExamExist) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Exam not found')
    }

    // ✅ FIXED: Use Aggregate() constructor with session
    const examAgg = await Exam.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: 'questions',
          localField: 'questions',
          foreignField: '_id',
          as: 'questions',
        },
      },
      {
        $lookup: {
          from: 'stems',
          localField: 'questions.stems',
          foreignField: '_id',
          as: 'stems',
        },
      },
    ]).session(session) // ← This is the correct way

    if (!examAgg.length) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Exam not found')
    }
    const exam = examAgg[0]

    // Rest of your code remains the same...
    const questionIds = exam.questions.map((q: any) => q._id)
    const stemIds = exam.stems.map((s: any) => s._id)

    if (stemIds.length) {
      const stems = await Stem.find({ _id: { $in: stemIds } }).session(session)

      // Use Promise.all for parallel deletion from S3
      await Promise.all(
        stems.map(async stem => {
          if (stem.stemPicture) {
            const url = new URL(stem.stemPicture)
            const key = url.pathname.substring(1)
            await S3Helper.deleteFromS3(key)
          }
        }),
      )

      await Stem.deleteMany({ _id: { $in: stemIds } }, { session })
    }

    if (questionIds.length) {
      await Question.deleteMany({ _id: { $in: questionIds } }, { session })
    }
    await Exam.findByIdAndDelete(id, { session })

    await session.commitTransaction()
    await session.endSession()

    return exam
  } catch (err) {
    await session.abortTransaction()
    await session.endSession()
    throw err
  }
}

export const ExamServices = {
  createExam,
  getAllExams,
  getSingleExam,
  deleteExam,

  getReadinessExam,
  getStandaloneExam,
  getQuestionByExam,
}
