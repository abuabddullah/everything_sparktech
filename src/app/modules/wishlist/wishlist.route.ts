import express from 'express'
import { WishlistController } from './wishlist.controller'
import auth from '../../middleware/auth'
import { USER_ROLES } from '../../../enum/user'

const router = express.Router()

router.post('/', auth(USER_ROLES.STUDENT), WishlistController.addToWishlist)

router.delete(
  '/:productId',
  auth(USER_ROLES.STUDENT),
  WishlistController.removeFromWishlist,
)

router.get('/', auth(USER_ROLES.STUDENT), WishlistController.getWishlist)

router.get(
  '/check/:productId',
  auth(USER_ROLES.STUDENT),
  WishlistController.checkProductInWishlist,
)

export const WishlistRoutes = router
