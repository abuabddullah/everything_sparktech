import express from 'express';
import { USER_ROLES } from '../../../../enums/user';
import auth from '../../../middlewares/auth';
import { GroupController } from '../group.controller';

const router = express.Router();
const rolesOfAccess = [USER_ROLES.ADMIN];
router.post(
  '/paymentIntent/:event',
  auth(...Object.values(USER_ROLES)),
  GroupController.createPaymentIntent
);
router.post('/:event', auth(...Object.values(USER_ROLES)), GroupController.joinGroup);
export const JoinRoutes = router;
