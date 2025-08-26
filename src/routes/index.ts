import { UserRoutes } from '../app/modules/user/user.route'
import { AuthRoutes } from '../app/modules/auth/auth.route'
import express, { Router } from 'express'
import { NotificationRoutes } from '../app/modules/notifications/notifications.route'
import { PublicRoutes } from '../app/modules/public/public.route'
import { SupportRoutes } from '../app/modules/support/support.route'
import { OnboardingscreenRoutes } from '../app/modules/onboardingscreen/onboardingscreen.route'
import { CommunityRoutes } from '../app/modules/community/community.route'
import { ReviewRoutes } from '../app/modules/review/review.route'
import { StudymaterialRoutes } from '../app/modules/studymaterial/studymaterial.route'
import { StudyscheduleRoutes } from '../app/modules/studyschedule/studyschedule.route'
import { ExamRoutes } from '../app/modules/exam/exam.route'
import { LessonRoutes } from '../app/modules/lesson/lesson.route'
import { StudyProgressRoutes } from '../app/modules/studyprogress/studyprogress.route'
import { CategoryRoutes } from '../app/modules/category/category.route'
import { MnemonicRoutes } from '../app/modules/mnemonic/mnemonic.route'

const router = express.Router()

const apiRoutes: { path: string; route: Router }[] = [
  { path: '/user', route: UserRoutes },
  { path: '/auth', route: AuthRoutes },

  { path: '/notifications', route: NotificationRoutes },

  { path: '/public', route: PublicRoutes },

  { path: '/support', route: SupportRoutes },
  { path: '/onboardingscreen', route: OnboardingscreenRoutes },
  { path: '/community', route: CommunityRoutes },
  { path: '/review', route: ReviewRoutes },
  { path: '/studymaterial', route: StudymaterialRoutes },
  { path: '/studyschedule', route: StudyscheduleRoutes },
  { path: '/exam', route: ExamRoutes },
  { path: '/lesson', route: LessonRoutes },

  { path: '/studyprogress', route: StudyProgressRoutes },

  { path: '/category', route: CategoryRoutes },
  { path: '/mnemonic', route: MnemonicRoutes },
]

apiRoutes.forEach(route => {
  router.use(route.path, route.route)
})

export default router
