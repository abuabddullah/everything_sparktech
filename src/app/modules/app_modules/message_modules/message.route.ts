import express from 'express';
import fileUploadHandler from '../../../middlewares/fileUploadHandler';
import { USER_ROLES } from '../../../../enums/user';
import { MessageController } from './message.controller';
import auth from '../../../middlewares/auth';
import validateRequest from '../../../middlewares/validateRequest';
import { MessageValidation } from './message.validation';
const router = express.Router();

router.post(
  '/',
  fileUploadHandler(),
  auth(USER_ROLES.USER, USER_ROLES.DRIVER),
  validateRequest(MessageValidation.createMessageValidationSchema),
  MessageController.sendMessage
);
router.get(
  '/:id',
  auth(USER_ROLES.USER, USER_ROLES.DRIVER),
  MessageController.getMessage
);

export const MessageRoutes = router;