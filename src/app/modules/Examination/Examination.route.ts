import express from 'express'
import { ExaminationController } from './Examination.controller'
import auth from '../../middleware/auth'
import { FOLDER_NAMES } from '../../../enums/files'
import validateRequest from '../../middleware/validateRequest'
import { ExaminationValidation } from './Examination.validation'
import { USER_ROLES } from '../../../enum/user'

const router = express.Router()

/**
 * getQuestionsSetByExaminationId
 */

router.post(
  '/',
  auth(USER_ROLES.ADMIN),
  validateRequest(ExaminationValidation.createExaminationZodSchema),
  ExaminationController.createExamination,
)

router.get('/', ExaminationController.getAllExaminations)

router.get('/unpaginated', ExaminationController.getAllUnpaginatedExaminations)

router.delete(
  '/hard-delete/:id',
  auth(USER_ROLES.ADMIN),
  ExaminationController.hardDeleteExamination,
)

// get all examinations by test id
router.get(
  '/test/:id',
  auth(USER_ROLES.STUDENT),
  ExaminationController.getExaminationsByTestId,
)

router.patch(
  '/:id',
  auth(USER_ROLES.ADMIN),
  validateRequest(ExaminationValidation.updateExaminationZodSchema),
  ExaminationController.updateExamination,
)

router.delete(
  '/:id',
  auth(USER_ROLES.ADMIN),
  ExaminationController.deleteExamination,
)

router.get('/:id', ExaminationController.getExaminationById)

export const ExaminationRoutes = router
