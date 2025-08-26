import express from 'express'
import auth from '../../middleware/auth'
import { USER_ROLES } from '../../../enum/user'
import { StudyProgressControllers } from './studyprogress.controller'

const router = express.Router()

// Session management
router
  .route('/:studentId/:examId/session/start')
  .post(auth(USER_ROLES.STUDENT), StudyProgressControllers.startSession)

router
  .route('/:studentId/:examId/session/end')
  .post(auth(USER_ROLES.STUDENT), StudyProgressControllers.endSession)

// Question tracking
router
  .route('/:studentId/:examId/question/:questionId/complete')
  .post(auth(USER_ROLES.STUDENT), StudyProgressControllers.completeQuestion)

// Bookmarks
router
  .route('/:studentId/:examId/bookmarks')
  .get(auth(USER_ROLES.STUDENT), StudyProgressControllers.getBookmarks)

router
  .route('/:studentId/:examId/bookmark/:questionId')
  .post(auth(USER_ROLES.STUDENT), StudyProgressControllers.addBookmark)
  .delete(auth(USER_ROLES.STUDENT), StudyProgressControllers.removeBookmark)

// Statistics
router
  .route('/:studentId/:examId/stats')
  .get(auth(USER_ROLES.STUDENT), StudyProgressControllers.getStats)

// Progress overview
router
  .route('/:studentId/:examId')
  .get(auth(USER_ROLES.STUDENT), StudyProgressControllers.getStudyProgress)

export const StudyProgressRoutes = router
