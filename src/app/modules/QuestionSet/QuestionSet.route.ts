import express from 'express'
import { QuestionSetController } from './QuestionSet.controller'
import auth from '../../middleware/auth'
import validateRequest from '../../middleware/validateRequest'
import { QuestionSetValidation } from './QuestionSet.validation'
import { USER_ROLES } from '../../../enum/user'

const router = express.Router()

router.post(
  '/',
  auth(USER_ROLES.ADMIN),
  validateRequest(QuestionSetValidation.createQuestionSetZodSchema),
  QuestionSetController.createQuestionSet,
)

router.get('/', QuestionSetController.getAllQuestionSets)

router.get('/unpaginated', QuestionSetController.getAllUnpaginatedQuestionSets)

router.delete(
  '/hard-delete/:id',
  auth(USER_ROLES.ADMIN),
  QuestionSetController.hardDeleteQuestionSet,
)

router.patch(
  '/:id',
  auth(USER_ROLES.ADMIN),
  validateRequest(QuestionSetValidation.updateQuestionSetZodSchema),
  QuestionSetController.updateQuestionSet,
)

router.delete(
  '/:id',
  auth(USER_ROLES.ADMIN),
  QuestionSetController.deleteQuestionSet,
)

router.get('/:id', QuestionSetController.getQuestionSetById)

export const QuestionSetRoutes = router
