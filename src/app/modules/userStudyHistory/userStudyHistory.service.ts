import { StatusCodes } from 'http-status-codes'
import ApiError from '../../../errors/ApiError'
import { Types } from 'mongoose'
import { IPaginationOptions } from '../../../interfaces/pagination'
import { paginationHelper } from '../../../helpers/paginationHelper'
import { UserStudyHistory } from './userStudyHistory.model'
import {
  IUserStudyHistory,
  IUserStudyHistoryFilter,
  IStudyStatsQuery,
  IQuestionAttempt,
  IExamAttempt,
} from './userStudyHistory.interface'

// Record a question attempt for a lesson
const recordLessonQuestionAttempt = async (
  userId: string,
  lessonId: string,
  questionId: string,
  isCorrect: boolean,
  timeSpent: number,
  selectedAnswer?: string | string[],
) => {
  let userHistory = await UserStudyHistory.findOne({ userId })

  if (!userHistory) {
    userHistory = new UserStudyHistory({
      userId: new Types.ObjectId(userId),
      lessonHistory: [],
      examHistory: [],
      dailyStats: [],
    })
  }

  const questionAttempt: IQuestionAttempt = {
    questionId: new Types.ObjectId(questionId),
    isCorrect,
    timeSpent,
    attemptedAt: new Date(),
    selectedAnswer,
  }

  // Find or create lesson history
  let lessonHistory = userHistory.lessonHistory.find(
    lh => lh.lessonId.toString() === lessonId,
  )

  if (!lessonHistory) {
    lessonHistory = {
      lessonId: new Types.ObjectId(lessonId),
      questionsAttempted: [],
      totalQuestionsAnswered: 0,
      correctAnswers: 0,
      totalTimeSpent: 0,
      accuracy: 0,
      lastAttemptedAt: new Date(),
      completionStatus: 'in_progress',
    }
    userHistory.lessonHistory.push(lessonHistory)
  }

  // Add question attempt
  lessonHistory.questionsAttempted.push(questionAttempt)
  lessonHistory.totalQuestionsAnswered += 1
  lessonHistory.totalTimeSpent += timeSpent
  lessonHistory.lastAttemptedAt = new Date()

  if (isCorrect) {
    lessonHistory.correctAnswers += 1
    userHistory.totalCorrectAnswers += 1
  }

  // Calculate accuracy
  lessonHistory.accuracy =
    (lessonHistory.correctAnswers / lessonHistory.totalQuestionsAnswered) * 100

  // Update overall stats
  userHistory.totalQuestionsAnswered += 1
  userHistory.totalStudyTime += timeSpent
  userHistory.overallAccuracy =
    (userHistory.totalCorrectAnswers / userHistory.totalQuestionsAnswered) * 100
  userHistory.lastStudyDate = new Date()

  // Update daily stats
  await updateDailyStats(
    userHistory,
    timeSpent,
    1,
    isCorrect ? 1 : 0,
    true,
    false,
  )

  // Update study streak
  await updateStudyStreak(userHistory)

  return await userHistory.save()
}

// Start an exam attempt
const startExamAttempt = async (
  userId: string,
  examId: string,
  totalQuestions: number,
  passMark?: number,
) => {
  let userHistory = await UserStudyHistory.findOne({ userId })

  if (!userHistory) {
    userHistory = new UserStudyHistory({
      userId: new Types.ObjectId(userId),
      lessonHistory: [],
      examHistory: [],
      dailyStats: [],
    })
  }

  // Find or create exam history
  let examHistory = userHistory.examHistory.find(
    eh => eh.examId.toString() === examId,
  )

  if (!examHistory) {
    examHistory = {
      examId: new Types.ObjectId(examId),
      attempts: [],
      bestScore: 0,
      averageScore: 0,
      totalAttempts: 0,
      totalTimeSpent: 0,
      lastAttemptedAt: new Date(),
    }
    userHistory.examHistory.push(examHistory)
  }

  const attemptNumber = examHistory.totalAttempts + 1

  const examAttempt: IExamAttempt = {
    attemptNumber,
    questionsAttempted: [],
    totalQuestions,
    correctAnswers: 0,
    score: 0,
    timeSpent: 0,
    startedAt: new Date(),
    completedAt: new Date(), // Will be updated when exam is completed
    isPassed: false,
    passMark,
  }

  examHistory.attempts.push(examAttempt)
  examHistory.totalAttempts += 1
  examHistory.lastAttemptedAt = new Date()

  return await userHistory.save()
}

// Complete an exam attempt
const completeExamAttempt = async (
  userId: string,
  examId: string,
  questionsAttempted: IQuestionAttempt[],
  timeSpent: number,
) => {
  const userHistory = await UserStudyHistory.findOne({ userId })

  if (!userHistory) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User study history not found')
  }

  const examHistory = userHistory.examHistory.find(
    eh => eh.examId.toString() === examId,
  )

  if (!examHistory || examHistory.attempts.length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Exam attempt not found')
  }

  // Get the latest attempt
  const currentAttempt = examHistory.attempts[examHistory.attempts.length - 1]

  // Update attempt details
  currentAttempt.questionsAttempted = questionsAttempted
  currentAttempt.correctAnswers = questionsAttempted.filter(
    q => q.isCorrect,
  ).length
  currentAttempt.score =
    (currentAttempt.correctAnswers / currentAttempt.totalQuestions) * 100
  currentAttempt.timeSpent = timeSpent
  currentAttempt.completedAt = new Date()
  currentAttempt.isPassed = currentAttempt.passMark
    ? currentAttempt.score >= currentAttempt.passMark
    : currentAttempt.score >= 70 // Default pass mark

  // Update exam history stats
  examHistory.totalTimeSpent += timeSpent
  examHistory.bestScore = Math.max(examHistory.bestScore, currentAttempt.score)

  const totalScore = examHistory.attempts.reduce(
    (sum, attempt) => sum + attempt.score,
    0,
  )
  examHistory.averageScore = totalScore / examHistory.attempts.length

  // Update overall user stats
  userHistory.totalQuestionsAnswered += questionsAttempted.length
  userHistory.totalCorrectAnswers += currentAttempt.correctAnswers
  userHistory.totalStudyTime += timeSpent
  userHistory.overallAccuracy =
    (userHistory.totalCorrectAnswers / userHistory.totalQuestionsAnswered) * 100
  userHistory.lastStudyDate = new Date()

  // Update daily stats
  await updateDailyStats(
    userHistory,
    timeSpent,
    questionsAttempted.length,
    currentAttempt.correctAnswers,
    false,
    true,
  )

  // Update study streak
  await updateStudyStreak(userHistory)

  return await userHistory.save()
}

// Get user study statistics
const getUserStudyStats = async (query: IStudyStatsQuery) => {
  const { userId, period = 'daily', startDate, endDate } = query

  const userHistory = await UserStudyHistory.findOne({ userId })
    .populate('lessonHistory.lessonId', 'title')
    .populate('examHistory.examId', 'name')

  if (!userHistory) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User study history not found')
  }

  let filteredDailyStats = userHistory.dailyStats

  if (startDate || endDate) {
    filteredDailyStats = userHistory.dailyStats.filter(stat => {
      const statDate = new Date(stat.date)
      if (startDate && statDate < new Date(startDate)) return false
      if (endDate && statDate > new Date(endDate)) return false
      return true
    })
  }

  // Aggregate stats based on period
  const aggregatedStats = aggregateStatsByPeriod(filteredDailyStats, period)

  return {
    overallStats: {
      totalStudyTime: userHistory.totalStudyTime,
      totalQuestionsAnswered: userHistory.totalQuestionsAnswered,
      totalCorrectAnswers: userHistory.totalCorrectAnswers,
      overallAccuracy: userHistory.overallAccuracy,
      studyStreak: userHistory.studyStreak,
      longestStudyStreak: userHistory.longestStudyStreak,
      lastStudyDate: userHistory.lastStudyDate,
    },
    lessonHistory: userHistory.lessonHistory,
    examHistory: userHistory.examHistory,
    periodStats: aggregatedStats,
  }
}

// Get lesson progress for a user
const getLessonProgress = async (userId: string, lessonId?: string) => {
  const userHistory = await UserStudyHistory.findOne({ userId }).populate(
    'lessonHistory.lessonId',
    'title totalQuestions',
  )

  if (!userHistory) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User study history not found')
  }

  if (lessonId) {
    const lessonHistory = userHistory.lessonHistory.find(
      lh => lh.lessonId._id.toString() === lessonId,
    )
    return lessonHistory || null
  }

  return userHistory.lessonHistory
}

// Get exam history for a user
const getExamHistory = async (userId: string, examId?: string) => {
  const userHistory = await UserStudyHistory.findOne({ userId }).populate(
    'examHistory.examId',
    'name totalQuestions passMark',
  )

  if (!userHistory) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User study history not found')
  }

  if (examId) {
    const examHistory = userHistory.examHistory.find(
      eh => eh.examId._id.toString() === examId,
    )
    return examHistory || null
  }

  return userHistory.examHistory
}

// Get all user study histories with pagination
const getAllUserStudyHistories = async (
  filters: IUserStudyHistoryFilter,
  pagination: IPaginationOptions,
) => {
  const { page, skip, limit, sortBy, sortOrder } =
    paginationHelper.calculatePagination(pagination)

  const query: any = {}

  if (filters.userId) {
    query.userId = new Types.ObjectId(filters.userId)
  }

  if (filters.startDate || filters.endDate) {
    query.lastStudyDate = {}
    if (filters.startDate)
      query.lastStudyDate.$gte = new Date(filters.startDate)
    if (filters.endDate) query.lastStudyDate.$lte = new Date(filters.endDate)
  }

  const sortQuery: any = {}
  if (sortBy && sortOrder) {
    sortQuery[sortBy] = sortOrder === 'desc' ? -1 : 1
  } else {
    sortQuery.lastStudyDate = -1
  }

  const result = await UserStudyHistory.find(query)
    .populate('userId', 'name email')
    .sort(sortQuery)
    .skip(skip)
    .limit(limit)

  const total = await UserStudyHistory.countDocuments(query)

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

// Helper function to update daily stats
const updateDailyStats = async (
  userHistory: IUserStudyHistory,
  timeSpent: number,
  questionsAnswered: number,
  correctAnswers: number,
  isLesson: boolean,
  isExam: boolean,
) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let todayStats = userHistory.dailyStats.find(
    stat => stat.date.getTime() === today.getTime(),
  )

  if (!todayStats) {
    todayStats = {
      date: today,
      totalTimeSpent: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
      lessonsStudied: 0,
      examsAttempted: 0,
    }
    userHistory.dailyStats.push(todayStats)
  }

  todayStats.totalTimeSpent += timeSpent
  todayStats.questionsAnswered += questionsAnswered
  todayStats.correctAnswers += correctAnswers

  if (isLesson) todayStats.lessonsStudied += 1
  if (isExam) todayStats.examsAttempted += 1
}

// Helper function to update study streak
const updateStudyStreak = async (userHistory: IUserStudyHistory) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const lastStudyDate = userHistory.lastStudyDate
    ? new Date(userHistory.lastStudyDate)
    : null

  if (lastStudyDate) {
    lastStudyDate.setHours(0, 0, 0, 0)

    if (lastStudyDate.getTime() === yesterday.getTime()) {
      // Consecutive day
      userHistory.studyStreak += 1
    } else if (lastStudyDate.getTime() !== today.getTime()) {
      // Gap in studying
      userHistory.studyStreak = 1
    }
    // If lastStudyDate is today, don't change streak
  } else {
    userHistory.studyStreak = 1
  }

  userHistory.longestStudyStreak = Math.max(
    userHistory.longestStudyStreak,
    userHistory.studyStreak,
  )
}

// Helper function to aggregate stats by period
const aggregateStatsByPeriod = (dailyStats: any[], period: string) => {
  // Implementation depends on your specific requirements
  // This is a simplified version
  return dailyStats.reduce((acc, stat) => {
    const key =
      period === 'weekly'
        ? getWeekKey(stat.date)
        : period === 'monthly'
          ? getMonthKey(stat.date)
          : period === 'yearly'
            ? getYearKey(stat.date)
            : stat.date.toISOString().split('T')[0]

    if (!acc[key]) {
      acc[key] = {
        totalTimeSpent: 0,
        questionsAnswered: 0,
        correctAnswers: 0,
        lessonsStudied: 0,
        examsAttempted: 0,
      }
    }

    acc[key].totalTimeSpent += stat.totalTimeSpent
    acc[key].questionsAnswered += stat.questionsAnswered
    acc[key].correctAnswers += stat.correctAnswers
    acc[key].lessonsStudied += stat.lessonsStudied
    acc[key].examsAttempted += stat.examsAttempted

    return acc
  }, {})
}

const getWeekKey = (date: Date) => {
  const year = date.getFullYear()
  const week = Math.ceil((date.getDate() - date.getDay()) / 7)
  return `${year}-W${week}`
}

const getMonthKey = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

const getYearKey = (date: Date) => {
  return String(date.getFullYear())
}

export const UserStudyHistoryServices = {
  recordLessonQuestionAttempt,
  startExamAttempt,
  completeExamAttempt,
  getUserStudyStats,
  getLessonProgress,
  getExamHistory,
  getAllUserStudyHistories,
}
