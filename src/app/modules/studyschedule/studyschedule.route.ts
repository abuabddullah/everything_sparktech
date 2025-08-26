import express from 'express'
import { StudyscheduleController } from './studyschedule.controller'
import { StudyscheduleValidations } from './studyschedule.validation'
import validateRequest from '../../middleware/validateRequest'
import auth from '../../middleware/auth'
import { USER_ROLES } from '../../../enum/user'

const router = express.Router()

router.get(
  '/by-date',
  auth(USER_ROLES.ADMIN, USER_ROLES.STUDENT),
  StudyscheduleController.getSchedulesByDate,
)

router.get(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.STUDENT),
  StudyscheduleController.getAllStudyschedules,
)

router.get(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.STUDENT),
  StudyscheduleController.getSingleStudyschedule,
)

router.post(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.STUDENT),

  validateRequest(StudyscheduleValidations.create),
  StudyscheduleController.createStudyschedule,
)

router.patch(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.STUDENT),

  validateRequest(StudyscheduleValidations.update),
  StudyscheduleController.updateStudyschedule,
)

router.delete(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.STUDENT),
  StudyscheduleController.deleteStudyschedule,
)



export const StudyscheduleRoutes = router
