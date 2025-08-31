import express from 'express'
import { QuestionController } from './Question.controller'
import auth from '../../middleware/auth'
import validateRequest from '../../middleware/validateRequest'
import { QuestionValidation } from './Question.validation'
import { USER_ROLES } from '../../../enum/user'

const router = express.Router()

/**
 * verifyQuestionIsCorrectAndUpdatProgressHistory
 */

router.post(
  '/',
  auth(USER_ROLES.ADMIN),
  validateRequest(QuestionValidation.createQuestionZodSchema),
  QuestionController.createQuestion,
)

router.get('/', QuestionController.getAllQuestions)

router.get('/unpaginated', QuestionController.getAllUnpaginatedQuestions)

router.delete(
  '/hard-delete/:id',
  auth(USER_ROLES.ADMIN),
  QuestionController.hardDeleteQuestion,
)

router.post(
  '/validate-question-answer/:questionId',
  auth(USER_ROLES.STUDENT),
  validateRequest(QuestionValidation.validateQuestionAnswer),
  QuestionController.validateQuestionAnswer,
)
router.patch(
  '/:id',
  auth(USER_ROLES.ADMIN),
  validateRequest(QuestionValidation.updateQuestionZodSchema),
  QuestionController.updateQuestion,
)

router.delete('/:id', auth(USER_ROLES.ADMIN), QuestionController.deleteQuestion)

router.get('/:id', QuestionController.getQuestionById)

export const QuestionRoutes = router
