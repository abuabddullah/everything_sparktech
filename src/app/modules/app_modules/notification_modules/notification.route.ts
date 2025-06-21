import express from 'express';
import auth from '../../../middlewares/auth';
import { USER_ROLES } from '../../../../enums/user';
import { NotificationController } from './notification.controller';
const router = express.Router();

router.get('/',
    auth(USER_ROLES.USER),
    NotificationController.getNotificationFromDB
);
router.get('/admin',
    auth(USER_ROLES.ADMIN,USER_ROLES.MANAGER, USER_ROLES.SUPER_ADMIN),
    NotificationController.adminNotificationFromDB
);

router.get('/admin/count-read-unread',
    auth(USER_ROLES.ADMIN,USER_ROLES.MANAGER, USER_ROLES.SUPER_ADMIN),
    NotificationController.notificationReadUnreadCount
);
router.patch('/admin',
    auth(USER_ROLES.ADMIN,USER_ROLES.MANAGER, USER_ROLES.SUPER_ADMIN),
    NotificationController.adminReadNotification
);
router.patch('/admin/:id',
    auth(USER_ROLES.ADMIN,USER_ROLES.MANAGER, USER_ROLES.SUPER_ADMIN),
    NotificationController.readNotification
);

export const NotificationRoutes = router;
