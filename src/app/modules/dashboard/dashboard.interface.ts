export interface IDashboardStats {
  totalUsers: number
  totalQuestions: number
  totalStudyLessons: number
}

export interface IUserEngagementData {
  month: string
  year: number
  userCount: number
  activeUsers: number
  questionsAnswered: number
  lessonsCompleted: number
}

export interface IDashboardResponse {
  stats: IDashboardStats
  userEngagement: IUserEngagementData[]
}

export interface IEngagementQuery {
  year?: number
}
