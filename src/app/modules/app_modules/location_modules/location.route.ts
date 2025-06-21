import express from 'express';
import { LocationController } from './location.Controller';
import auth from '../../../middlewares/auth';
import { USER_ROLES } from '../../../../enums/user';
import validateRequest from '../../../middlewares/validateRequest';
import { LocationValidation } from './location.validation';
const router = express.Router();


router.route('/').post(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN,USER_ROLES.MANAGER),validateRequest(LocationValidation.createLocationValidation), LocationController.createLocation);
router.route('/').get(LocationController.getAllLocations);

export const LocationRoutes = router;