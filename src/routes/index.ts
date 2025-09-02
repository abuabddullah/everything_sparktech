import { UserRoutes } from '../app/modules/user/user.route'
import { AuthRoutes } from '../app/modules/auth/auth.route'
import express, { Router } from 'express'
import { NotificationRoutes } from '../app/modules/notifications/notifications.route'
import { PublicRoutes } from '../app/modules/public/public.route'
import { SupportRoutes } from '../app/modules/support/support.route'
import { OnboardingscreenRoutes } from '../app/modules/onboardingscreen/onboardingscreen.route'
import { CommunityRoutes } from '../app/modules/community/community.route'
import { StudyscheduleRoutes } from '../app/modules/studyschedule/studyschedule.route'
import { CategoryRoutes } from '../app/modules/category/category.route'
import { MnemonicRoutes } from '../app/modules/mnemonic/mnemonic.route'
import { CourseRoutes } from '../app/modules/Course/Course.route'
import { StudyLessonRoutes } from '../app/modules/StudyLesson/StudyLesson.route'
import { QuestionRoutes } from '../app/modules/Question/Question.route'
import { QuestionSetRoutes } from '../app/modules/QuestionSet/QuestionSet.route'
import { PromptRoutes } from '../app/modules/Prompt/Prompt.route'
import { TestRoutes } from '../app/modules/Test/Test.route'
import { ExaminationRoutes } from '../app/modules/Examination/Examination.route'
const router = express.Router()

const apiRoutes: { path: string; route: Router }[] = [
  { path: '/user', route: UserRoutes },
  { path: '/auth', route: AuthRoutes },

  { path: '/notifications', route: NotificationRoutes },

  { path: '/public', route: PublicRoutes },

  { path: '/support', route: SupportRoutes },
  { path: '/onboardingscreen', route: OnboardingscreenRoutes },
  { path: '/community', route: CommunityRoutes },
  { path: '/studyschedule', route: StudyscheduleRoutes },

  { path: '/category', route: CategoryRoutes },
  { path: '/mnemonic', route: MnemonicRoutes },
  // asif routes
  { path: '/course', route: CourseRoutes },
  { path: '/studyLesson', route: StudyLessonRoutes },
  { path: '/questions', route: QuestionRoutes },
  { path: '/questionSet', route: QuestionSetRoutes },
  { path: '/prompt', route: PromptRoutes },
  { path: '/test', route: TestRoutes },
  { path: '/examination', route: ExaminationRoutes },
]

apiRoutes.forEach(route => {
  router.use(route.path, route.route)
})

export default router
