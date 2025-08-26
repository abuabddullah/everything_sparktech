import { StatusCodes } from 'http-status-codes'
import ApiError from '../../../errors/ApiError'
import { JwtPayload } from 'jsonwebtoken'
import { IPaginationOptions } from '../../../interfaces/pagination'
import { paginationHelper } from '../../../helpers/paginationHelper'
import mongoose, { Types } from 'mongoose'
import { IStudyprogress } from './studyprogress.interface'
import { Studyprogress } from './studyprogress.model'
import { Exam, Question } from '../exam/exam.model'
import { Lesson } from '../lesson/lesson.model'

const startSession = async (
  studentId: string,
  examId: string,
  topics: string[] = [],
) => {
  const session = {
    startTime: new Date(),
    endTime: null,
    durationMinutes: 0,
    topics,
    notes: '',
    completedQuestionId: null,
    questionNotes: '',
  }

  let progress = await Studyprogress.findOne({ studentId, examId })

  if (!progress) {
    progress = new Studyprogress({
      studentId: new Types.ObjectId(studentId),
      examId: new Types.ObjectId(examId),
      sessions: [session],
      status: 'active',
    })
  } else {
    progress.sessions.push(session)
    progress.status = 'active'
  }

  progress.lastStudied = new Date()
  return await progress.save()
}

const endSession = async (studentId: string, examId: string) => {
  const progress = await Studyprogress.findOne({ studentId, examId })
  if (!progress || progress.sessions.length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No active session found')
  }

  const currentSession = progress.sessions[progress.sessions.length - 1]
  const endTime = new Date()
  const durationMinutes = Math.round(
    (endTime.getTime() - currentSession.startTime.getTime()) / (1000 * 60),
  )

  currentSession.endTime = endTime
  currentSession.durationMinutes = durationMinutes

  progress.totalStudyTime += durationMinutes
  progress.lastStudied = endTime

  return await progress.save()
}

const completeQuestion = async (
  studentId: string,
  examId: string,
  questionId: string,
  isCorrect: boolean,
  notes: string = '',
) => {
  const progress = await Studyprogress.findOne({ studentId, examId })
  if (!progress || progress.sessions.length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No active session found')
  }

  const currentSession = progress.sessions[progress.sessions.length - 1]
  currentSession.completedQuestionId = new Types.ObjectId(questionId)
  currentSession.questionNotes = notes

  // Update weak topics if answer was incorrect
  if (!isCorrect) {
    await updateWeakTopics(progress, questionId)
  }

  return await progress.save()
}

const updateWeakTopics = async (
  progress: IStudyprogress,
  questionId: string,
) => {
  const question = await Question.findById(questionId).select('tags')
  if (!question || !question.tags || question.tags.length === 0) return

  question.tags.forEach((tag: string) => {
    const existingTopic = progress.weakTopics.find(wt => wt.topic === tag)

    if (existingTopic) {
      existingTopic.totalAttempts += 1
      existingTopic.accuracy =
        (existingTopic.accuracy * (existingTopic.totalAttempts - 1) + 0) /
        existingTopic.totalAttempts
    } else {
      progress.weakTopics.push({
        topic: tag,
        accuracy: 0,
        totalAttempts: 1,
      })
    }
  })
}

const addBookmark = async (
  studentId: string,
  examId: string,
  questionId: string,
) => {
  const progress = await Studyprogress.findOne({ studentId, examId })
  if (!progress) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Progress not found')
  }

  const questionObjectId = new Types.ObjectId(questionId)
  if (!progress.bookmarks.includes(questionObjectId)) {
    progress.bookmarks.push(questionObjectId)
  }

  return await progress.save()
}

const removeBookmark = async (
  studentId: string,
  examId: string,
  questionId: string,
) => {
  const progress = await Studyprogress.findOne({ studentId, examId })
  if (!progress) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Progress not found')
  }

  progress.bookmarks = progress.bookmarks.filter(
    (id: any) => id.toString() !== questionId,
  )

  return await progress.save()
}

const getBookmarks = async (studentId: string, examId: string) => {
  const progress = await Studyprogress.findOne({ studentId, examId }).populate({
    path: 'bookmarks',
    populate: {
      path: 'stems',
      model: 'Stem',
    },
  })

  return progress?.bookmarks || []
}

const getStats = async (studentId: string, examId: string) => {
  const progress = await Studyprogress.findOne({ studentId, examId })

  console.log(examId)

  const totalQuestion = await Lesson.findById(examId).estimatedDocumentCount()

  if (!progress) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Progress not found')
  }

  return {
    totalStudyTime: progress.totalStudyTime,
    totalSessions: progress.sessions.length,
    weakTopics: progress.weakTopics,
    bookmarksCount: progress.bookmarks.length,
    lastStudied: progress.lastStudied,
    totalQuestion,
    progress: progress.sessions.length,
  }
}

const getStudyProgress = async (
  studentId: string,
  examId: string,
  pagination: IPaginationOptions,
) => {
  const progress = await Studyprogress.findOne({ studentId, examId })
  if (!progress) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Study progress not found')
  }

  const { page, skip, limit, sortBy, sortOrder } =
    paginationHelper.calculatePagination(pagination)

  // Get sessions with pagination
  const sessions = progress.sessions
    .sort(
      (a: any, b: any) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
    )
    .slice(skip, skip + limit)

  return {
    meta: {
      page,
      limit,
      total: progress.sessions.length,
      totalPages: Math.ceil(progress.sessions.length / limit),
    },
    data: {
      progress,
      sessions,
    },
  }
}

export const StudyProgressServices = {
  startSession,
  endSession,
  completeQuestion,
  addBookmark,
  removeBookmark,
  getBookmarks,
  getStats,
  getStudyProgress,
}
