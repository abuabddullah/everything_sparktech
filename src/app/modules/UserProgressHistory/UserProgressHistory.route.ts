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
