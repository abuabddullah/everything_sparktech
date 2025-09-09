import express from 'express'
import { WishlistController } from './wishlist.controller'
import auth from '../../middleware/auth'
import { USER_ROLES } from '../../../enum/user'

const router = express.Router()

router.post('/', auth(USER_ROLES.STUDENT), WishlistController.addToWishlist)

router.delete(
  '/:lessonId',
  auth(USER_ROLES.STUDENT),
  WishlistController.removeFromWishlist,
)

router.get('/', auth(USER_ROLES.STUDENT), WishlistController.getWishlist)

router.get(
  '/check/:lessonId',
  auth(USER_ROLES.STUDENT),
  WishlistController.checkLessonInWishlist,
)

export const WishlistRoutes = router
