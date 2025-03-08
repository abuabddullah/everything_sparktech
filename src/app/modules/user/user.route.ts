import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import validateRequest from '../../middlewares/validateRequest';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
import { WishlistRoutes } from './wishlist/wishlist.route';
import { StatusRoutes } from './status/status.route';
import { UserService } from './user.service';

const router = express.Router();

router.get(
  '/profile',
  auth(USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.CREATOR),
  UserController.getUserProfile
);
router.get(
  '/status',
  auth(USER_ROLES.CREATOR),
  UserController.getCreatorStatus
);
router.get('/home', auth(USER_ROLES.ADMIN), UserController.getAdminStatus);
router.get(
  '/home/earnings',
  auth(USER_ROLES.ADMIN),
  UserController.getAdminEarnings
);
router.get(
  '/events',
  auth(...Object.values(USER_ROLES)),
  UserController.getEventStatus
);
router.get('/all', auth(USER_ROLES.ADMIN), UserController.getAllUsers);
router.get(
  '/earnings',
  auth(USER_ROLES.CREATOR),
  UserController.getEarningStatus
);
router.post(
  '/payment-account-setup',
  auth(USER_ROLES.CREATOR),
  fileUploadHandler(),
  UserController.setUpCreatorPayment
);
router.get('/:id', auth(USER_ROLES.ADMIN), UserController.getOneUser);

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
