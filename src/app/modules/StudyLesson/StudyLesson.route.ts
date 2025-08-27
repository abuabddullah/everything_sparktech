import express from 'express'
import { StudyLessonController } from './StudyLesson.controller'
import auth from '../../middleware/auth'
import fileUploadHandler from '../../middleware/fileUploadHandler'
import parseFileData from '../../middleware/parseFileData'
import { FOLDER_NAMES } from '../../../enums/files'
import validateRequest from '../../middleware/validateRequest'
import { StudyLessonValidation } from './StudyLesson.validation'
import { USER_ROLES } from '../../../enum/user'

const router = express.Router()
/**
 * getQuestionsSetByStudyLessonId
 */

router.post(
  '/',
  auth(USER_ROLES.ADMIN),
  fileUploadHandler(),
  parseFileData(FOLDER_NAMES.IMAGE),
  validateRequest(StudyLessonValidation.createStudyLessonZodSchema),
  StudyLessonController.createStudyLesson,
)

router.get('/', StudyLessonController.getAllStudyLessons)

router.get('/unpaginated', StudyLessonController.getAllUnpaginatedStudyLessons)

router.delete(
  '/hard-delete/:id',
  auth(USER_ROLES.ADMIN),
  StudyLessonController.hardDeleteStudyLesson,
)

router.patch(
  '/:id',
  fileUploadHandler(),
  parseFileData(FOLDER_NAMES.IMAGE),
  auth(USER_ROLES.ADMIN),
  validateRequest(StudyLessonValidation.updateStudyLessonZodSchema),
  StudyLessonController.updateStudyLesson,
)

router.delete(
  '/:id',
  auth(USER_ROLES.ADMIN),
  StudyLessonController.deleteStudyLesson,
)

router.get('/:id', StudyLessonController.getStudyLessonById)

export const StudyLessonRoutes = router
