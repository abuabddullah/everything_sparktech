import express from 'express'
import { UserProgressHistoryController } from './UserProgressHistory.controller'
import auth from '../../middleware/auth'
import validateRequest from '../../middleware/validateRequest'
import { UserProgressHistoryValidation } from './UserProgressHistory.validation'
import { USER_ROLES } from '../../../enum/user'

const router = express.Router()

/**
 * increaseWtudyLessonQuestionsOnWatchingNewStudyLessonQuestions
 * increaseQuestionCorrectlyAnsweredCountOnAnsweringQuestionCorrectly (depends on : QuestionService.verifyQuestionIsCorrectAndUpdatProgressHistory) and increaseQuestionWatchedCountOnAnsweringQuestion
 * increaseExaminationWatchedCountOnStartingExamination
 *
 *
 */
router.use(auth(USER_ROLES.STUDENT))
// getTotalProgressHistory by user id {totalAttemptedQuestionsCount,correctlyAnsweredQuestionsCount,incorrectlyAnsweredQuestionsCount,correctlyAnsweredPercentage,incorrectlyAnsweredPercentage}
router.get(
  '/total-progress-history',
  UserProgressHistoryController.getTotalProgressHistory,
)
// getUserExamHistory by user id and examination id {totalQuestionCountOfExamination, totalAttemptedQuestionCount}
router.get(
  '/user-exam-history/:examinationId',
  UserProgressHistoryController.getUserExamHistory,
)
// getUsersQuestionHistory by user id and question id {userAnswer, isCorrectlyAnswered, timeSpentInSecond}
router.get(
  '/user-question-history/:questionId',
  UserProgressHistoryController.getUsersQuestionHistory,
)
// reset examination progress history by user id and examination id
router.delete(
  '/reset-examination-progress-history/:examinationId',
  UserProgressHistoryController.resetExaminationProgressHistory,
)

// complete-exam
router.post(
  '/complete-exam/:examinationId',
  validateRequest(UserProgressHistoryValidation.completeExamZodSchema),
  UserProgressHistoryController.completeExam,
)

router.post(
  '/',
  auth(USER_ROLES.ADMIN),
  validateRequest(
    UserProgressHistoryValidation.createUserProgressHistoryZodSchema,
  ),
  UserProgressHistoryController.createUserProgressHistory,
)

router.get('/', UserProgressHistoryController.getAllUserProgressHistorys)

router.get(
  '/unpaginated',
  UserProgressHistoryController.getAllUnpaginatedUserProgressHistorys,
)

router.delete(
  '/hard-delete/:id',
  auth(USER_ROLES.ADMIN),
  UserProgressHistoryController.hardDeleteUserProgressHistory,
)

router.patch(
  '/:id',
  auth(USER_ROLES.ADMIN),
  validateRequest(
    UserProgressHistoryValidation.updateUserProgressHistoryZodSchema,
  ),
  UserProgressHistoryController.updateUserProgressHistory,
)

router.delete(
  '/:id',
  auth(USER_ROLES.ADMIN),
  UserProgressHistoryController.deleteUserProgressHistory,
)

router.get('/:id', UserProgressHistoryController.getUserProgressHistoryById)

export const UserProgressHistoryRoutes = router
