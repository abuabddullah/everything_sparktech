import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import validateRequest from '../../middlewares/validateRequest';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
import { WishlistRoutes } from './wishlist/wishlist.route';
import { StatusRoutes } from './status/status.route';

const router = express.Router();

router.get(
  '/profile',
  auth(USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.CREATOR),
  UserController.getUserProfile
);

router
  .route('/')
  .post(
    validateRequest(UserValidation.createUserZodSchema),
    UserController.createUser
  )
  .patch(
    auth(USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.CREATOR),
    fileUploadHandler(),
    UserController.updateProfile
  )
  .delete(auth(...Object.values(USER_ROLES)), UserController.deleteUser);
router.use('/wishlist', WishlistRoutes);
router.use('/status', StatusRoutes);
export const UserRoutes = router;
