import express from 'express'
import { TestController } from './Test.controller'
import auth from '../../middleware/auth'
import validateRequest from '../../middleware/validateRequest'
import { TestValidation } from './Test.validation'
import { USER_ROLES } from '../../../enum/user'

const router = express.Router()

router.post(
  '/',
  auth(USER_ROLES.ADMIN),
  validateRequest(TestValidation.createTestZodSchema),
  TestController.createTest,
)

router.get('/', TestController.getAllTests)

router.get('/unpaginated', TestController.getAllUnpaginatedTests)

router.delete(
  '/hard-delete/:id',
  auth(USER_ROLES.ADMIN),
  TestController.hardDeleteTest,
)

router.patch(
  '/:id',
  auth(USER_ROLES.ADMIN),
  validateRequest(TestValidation.updateTestZodSchema),
  TestController.updateTest,
)

router.delete('/:id', auth(USER_ROLES.ADMIN), TestController.deleteTest)

router.get('/:id', TestController.getTestById)

export const TestRoutes = router
