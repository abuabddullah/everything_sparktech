import express from 'express';
import { NotificationController } from './notification.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { NotificationValidation } from './notification.validation';

const router = express.Router();
const rolesOfAccess = [USER_ROLES.ADMIN];
router.post(
  '/create',
  auth(...rolesOfAccess),
  validateRequest(NotificationValidation.createNotificationZodSchema),
  NotificationController.createNotification
);
router.get('/', NotificationController.getAllNotifications);
router.get('/:id', NotificationController.getNotificationById);
router.patch(
  '/:id',
  auth(...rolesOfAccess),
  validateRequest(NotificationValidation.updateNotificationZodSchema),
  NotificationController.updateNotification
);
router.delete(
  '/:id',
  auth(...rolesOfAccess),
  NotificationController.deleteNotification
);

export const NotificationRoutes = router;
