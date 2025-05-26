import express from 'express';
import auth from '../../../middlewares/auth';
import { USER_ROLES } from '../../../../enums/user';
import { ChatController } from './chatRoom.controller';
import { ChatValidation } from './chatRoom.validation';
import validateRequest from '../../../middlewares/validateRequest';
const router = express.Router();

router.post(
    '/:id',
    auth(USER_ROLES.USER,USER_ROLES.DRIVER),
    validateRequest(ChatValidation.createChatValidationSchema),
    ChatController.createChat
);
router.get(
    '/',
    auth(USER_ROLES.USER,USER_ROLES.DRIVER),
    ChatController.getChat
);

export const ChatRoutes = router;