import { User } from '../user/user.model'
import {
  IDashboardStats,
  IUserEngagementData,
  IDashboardResponse,
} from './dashboard.interface'
import { USER_STATUS } from '../../../enum/user'
import { Question } from '../Question/Question.model'
import { StudyLesson } from '../StudyLesson/StudyLesson.model'
import { UserProgressHistory } from '../UserProgressHistory/UserProgressHistory.model'

const getDashboardStats = async (): Promise<IDashboardStats> => {
  // Get total active users
  const totalUsers = await User.countDocuments({
    status: { $in: [USER_STATUS.ACTIVE, USER_STATUS.INACTIVE] },
  })

  // Get total questions
  const totalQuestions = await Question.countDocuments({
    isDeleted: false,
  })

  // Get total study lessons
  const totalStudyLessons = await StudyLesson.countDocuments({
    isDeleted: false,
  })

  return {
    totalUsers,
    totalQuestions,
    totalStudyLessons,
  }
}

const getUserEngagementByYear = async (
  year: number = new Date().getFullYear(),
): Promise<IUserEngagementData[]> => {
  const startDate = new Date(year, 0, 1) // January 1st of the year
  const endDate = new Date(year + 1, 0, 1) // January 1st of next year

  // Aggregate user engagement data by month
  const engagementData = await UserProgressHistory.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lt: endDate,
        },
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: {
          month: { $month: '$createdAt' },
          year: { $year: '$createdAt' },
        },
        activeUsers: { $addToSet: '$user' },
        questionsAnswered: { $sum: 1 },
        completedExams: {
          $sum: {
            $cond: [{ $eq: ['$isExamCompleted', true] }, 1, 0],
          },
        },
      },
    },
    {
      $project: {
        month: '$_id.month',
        year: '$_id.year',
        activeUsers: { $size: '$activeUsers' },
        questionsAnswered: 1,
        lessonsCompleted: '$completedExams',
        _id: 0,
      },
    },
    {
      $sort: { month: 1 },
    },
  ])

  // Get monthly user registration data
  const userRegistrationData = await User.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lt: endDate,
        },
        status: { $in: [USER_STATUS.ACTIVE, USER_STATUS.INACTIVE] },
      },
    },
    {
      $group: {
        _id: {
          month: { $month: '$createdAt' },
          year: { $year: '$createdAt' },
        },
        userCount: { $sum: 1 },
      },
    },
    {
      $project: {
        month: '$_id.month',
        year: '$_id.year',
        userCount: 1,
        _id: 0,
      },
    },
  ])

  // Create a map for easy lookup
  const userRegMap = new Map()
  userRegistrationData.forEach(item => {
    userRegMap.set(item.month, item.userCount)
  })

  // Month names for better readability
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  // Fill in missing months and format data
  const result: IUserEngagementData[] = []
  for (let month = 1; month <= 12; month++) {
    const engagementForMonth = engagementData.find(item => item.month === month)
    const userCountForMonth = userRegMap.get(month) || 0

    result.push({
      month: monthNames[month - 1],
      year,
      userCount: userCountForMonth,
      activeUsers: engagementForMonth?.activeUsers || 0,
      questionsAnswered: engagementForMonth?.questionsAnswered || 0,
      lessonsCompleted: engagementForMonth?.lessonsCompleted || 0,
    })
  }

  return result
}

const getDashboardData = async (year?: number): Promise<IDashboardResponse> => {
  const currentYear = year || new Date().getFullYear()

  const [stats, userEngagement] = await Promise.all([
    getDashboardStats(),
    getUserEngagementByYear(currentYear),
  ])

  return {
    stats,
    userEngagement,
  }
}

export const DashboardService = {
  getDashboardStats,
  getUserEngagementByYear,
  getDashboardData,
}
