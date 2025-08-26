import { StatusCodes } from 'http-status-codes'
import ApiError from '../../../errors/ApiError'
import { JwtPayload } from 'jsonwebtoken'
import { IPaginationOptions } from '../../../interfaces/pagination'
import { paginationHelper } from '../../../helpers/paginationHelper'
import mongoose, { Types } from 'mongoose'
import { LessonType } from '../../../enum/lesson'
import { S3Helper } from '../../../helpers/image/s3helper'
import { ILesson, ILessonFilter } from './lesson.interface'
import { Lesson } from './lesson.model'
import { ConfirmStatus } from '../../../enum/exam'
import { Question, Stem } from '../exam/exam.model'
// Create Stem
// export const createStem = async (payload: IStem[]) => {
//   if (!Array.isArray(payload) || payload.length === 0) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Stem data')
//   }

//   const createdStems = await Stem.insertMany(payload)
//   if (!createdStems) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create Stem')
//   }

//   const stemIds = createdStems.map(stem => stem._id)
//   return stemIds
// }

// // Create Question
// export const createQuestion = async (payload: IQuestion, user: JwtPayload) => {
//   if (!Array.isArray(payload) || payload.length === 0) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Question data')
//   }

//   const status = ConfirmStatus.IN_PROGRESS
//   const in_progress = `${user.authId}_${status}`
//   payload.map(p => {
//     p.refId = in_progress
//   })
//   const question = await Question.insertMany(payload)

//   // const refId = `${user.authId}_${ConfirmStatus.IN_PROGRESS}`

//   const allQuestions = await Question.find({ refId: in_progress })
//   if (!question) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create Question')
//   }
//   const ids = allQuestions.map(q => q._id)
//   return ids
// }

const createLesson = async (user: JwtPayload, payload: ILesson) => {
  const session = await Lesson.startSession()
  session.startTransaction()

  try {
    // in-progress
    const refId = `${user.authId}_${ConfirmStatus.IN_PROGRESS}`
    const questions = await Question.find({ refId }).session(session)

    if (questions.length === 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'No questions available for this lesson. Please create questions first before creating the lesson.',
      )
    }

    const ids = questions.map(q => q._id.toString())
    const [readinessLessons, standaloneLessons] = await Promise.all([
      Lesson.find({ isPublished: true, category: 'readiness' })
        .session(session)
        .countDocuments(),
      Lesson.find({ isPublished: true, category: 'standalone' })
        .session(session)
        .countDocuments(),
    ])

    const defaultName =
      payload.category === LessonType.NEXT_GEN
        ? `${LessonType.NEXT_GEN} lesson - ${readinessLessons + 1}`
        : `${LessonType.CASE_STUDY} lesson - ${standaloneLessons + 1}`

    payload.questions = ids
    payload.name = payload.name || defaultName

    // Create Lesson
    const result = await Lesson.create([payload], { session })
    if (!result || result.length === 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Failed to create Lesson, please try again with valid data.',
      )
    }

    const confirm_refId = `${user.authId}_${ConfirmStatus.CONFIRMED}`

    // Update all question statuses after lesson creation
    await Question.updateMany(
      { _id: { $in: ids } },
      { $set: { refId: confirm_refId } },
      { session },
    )

    // Publish the lesson
    const Published = await Lesson.findByIdAndUpdate(
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

const getAllLessons = async (
  user: JwtPayload,
  filterables: ILessonFilter,
  pagination: IPaginationOptions,
) => {
  const { searchTerm, ...filterData } = filterables
  const { page, skip, limit, sortBy, sortOrder } =
    paginationHelper.calculatePagination(pagination)
  const andConditions = []

  // 🔍 Search functionality
  // if (searchTerm) {
  //   andConditions.push({
  //     $or: lessonSearchableFields.map(field => ({
  //       [field]: {
  //         $regex: searchTerm,
  //         $options: 'i',
  //       },
  //     })),
  //   })
  // }

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
    Lesson.find(whereConditions)
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
    Lesson.countDocuments(whereConditions),
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

const getNextGenLesson = async () => {
  const NextGenLessons = await Lesson.find({
    isPublished: true,
    category: 'next_gen',
  }).select('-questions -stats')
  if (!NextGenLessons || NextGenLessons.length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No next_gen lessons found')
  }
  return NextGenLessons
}
const getCaseStudyLesson = async () => {
  const CaseStudyLessons = await Lesson.find({
    isPublished: true,
    category: 'case_study',
  }).select('-questions -stats')
  if (!CaseStudyLessons || CaseStudyLessons.length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No case_study lessons found')
  }
  return CaseStudyLessons
}

const getQuestionByLesson = async (
  lessonId: string,
  pagination: IPaginationOptions,
) => {
  if (!Types.ObjectId.isValid(lessonId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Lesson ID')
  }

  const lesson = await Lesson.findById(lessonId)
  if (!lesson) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Lesson not found')
  }

  // Calculate pagination
  const { page, skip, limit, sortBy, sortOrder } =
    paginationHelper.calculatePagination(pagination)

  // ✅ Use the question IDs from the lesson document with pagination
  const [questions, total] = await Promise.all([
    Question.find({
      _id: { $in: lesson.questions },
    })
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder })
      .populate('stems'),
    Question.countDocuments({
      _id: { $in: lesson.questions },
    }),
  ])

  if (!questions.length) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'No questions found for this lesson',
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

const getSingleLesson = async (id: string): Promise<ILesson> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Lesson ID')
  }

  const result = await Lesson.findById(id).populate({
    path: 'questions',
    populate: {
      path: 'stems',
      model: 'Stem',
    },
  })

  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Requested lesson not found, please try again with valid id',
    )
  }

  return result
}

const deleteLesson = async (id: string) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const isLessonExist = await Lesson.findById(id).session(session)
    if (!isLessonExist) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Lesson not found')
    }

    // ✅ FIXED: Use Aggregate() constructor with session
    const lessonAgg = await Lesson.aggregate([
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

    if (!lessonAgg.length) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Lesson not found')
    }
    const lesson = lessonAgg[0]

    // Rest of your code remains the same...
    const questionIds = lesson.questions.map((q: any) => q._id)
    const stemIds = lesson.stems.map((s: any) => s._id)

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
    await Lesson.findByIdAndDelete(id, { session })

    await session.commitTransaction()
    await session.endSession()

    return lesson
  } catch (err) {
    await session.abortTransaction()
    await session.endSession()
    throw err
  }
}

export const LessonServices = {
  createLesson,
  getAllLessons,
  getSingleLesson,
  deleteLesson,

  getNextGenLesson,
  getCaseStudyLesson,
  getQuestionByLesson,
}
