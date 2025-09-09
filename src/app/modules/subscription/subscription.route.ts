import express from 'express';
import { SubscriptionController } from './subscription.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { SubscriptionValidation } from './subscription.validation';

const router = express.Router();
const rolesOfAccess = [USER_ROLES.CREATOR];
router.post(
  '/create',
  auth(...rolesOfAccess),
  validateRequest(SubscriptionValidation.createSubscriptionZodSchema),
  SubscriptionController.createSubscription
);
router.get('/', SubscriptionController.getAllSubscriptions);
router.get('/:id', SubscriptionController.getSubscriptionById);
router.patch(
  '/:id',
  auth(...rolesOfAccess),
  validateRequest(SubscriptionValidation.updateSubscriptionZodSchema),
  SubscriptionController.updateSubscription
);
router.delete(
  '/:id',
  auth(...rolesOfAccess),
  SubscriptionController.deleteSubscription
);

export const SubscriptionRoutes = router;
