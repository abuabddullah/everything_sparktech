import express from 'express'
import auth from '../../middleware/auth'
import validateRequest from '../../middleware/validateRequest'
import { ReviewsController } from './Reviews.controller'
import { ReviewsValidation } from './Reviews.validation'
import { USER_ROLES } from '../../../enum/user'

const router = express.Router()

router.post(
  '/',
  auth(USER_ROLES.STUDENT, USER_ROLES.ADMIN, USER_ROLES.TEACHER),
  validateRequest(ReviewsValidation.createReviewsZodSchema),
  ReviewsController.createReviews,
)

router.get(
  '/unpaginated/:type',
  ReviewsController.getAllUnpaginatedReviewsByType,
)
router.delete(
  '/hard-delete/:id',
  auth(USER_ROLES.ADMIN),
  ReviewsController.hardDeleteReviews,
)
router.get('/:type', ReviewsController.getAllReviewsByType)

router.patch(
  '/:id',
  auth(USER_ROLES.STUDENT, USER_ROLES.ADMIN, USER_ROLES.TEACHER),
  validateRequest(ReviewsValidation.updateReviewsZodSchema),
  ReviewsController.updateReviews,
)

router.delete(
  '/:id',
  auth(USER_ROLES.STUDENT, USER_ROLES.ADMIN, USER_ROLES.TEACHER),
  ReviewsController.deleteReviews,
)
router.get('/:id', ReviewsController.getReviewsById)

export const ReviewsRoutes = router
