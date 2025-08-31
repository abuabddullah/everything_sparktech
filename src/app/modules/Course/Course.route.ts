import express from 'express'
import { CourseController } from './Course.controller'
import auth from '../../middleware/auth'
import s3fileUploadHandler from '../../middleware/s3fileUploadHandler'
import parseFileData from '../../middleware/parseFileData'
import { FOLDER_NAMES } from '../../../enums/files'
import validateRequest from '../../middleware/validateRequest'
import { CourseValidation } from './Course.validation'
import { USER_ROLES } from '../../../enum/user'

const router = express.Router()

router.post(
  '/',
  auth(USER_ROLES.ADMIN),
  s3fileUploadHandler(),
  parseFileData(FOLDER_NAMES.IMAGE),
  validateRequest(CourseValidation.createCourseZodSchema),
  CourseController.createCourse,
)

router.get('/', CourseController.getAllCourses)

router.get('/unpaginated', CourseController.getAllUnpaginatedCourses)

router.delete(
  '/hard-delete/:id',
  auth(USER_ROLES.ADMIN),
  CourseController.hardDeleteCourse,
)

router.patch(
  '/:id',
  s3fileUploadHandler(),
  parseFileData(FOLDER_NAMES.IMAGE),
  auth(USER_ROLES.ADMIN),
  validateRequest(CourseValidation.updateCourseZodSchema),
  CourseController.updateCourse,
)

router.delete('/:id', auth(USER_ROLES.ADMIN), CourseController.deleteCourse)

router.get('/:id', CourseController.getCourseById)

export const CourseRoutes = router
