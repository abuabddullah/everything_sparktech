// {
//     createdAt: Date;
//     notificationName: string;
//     notificationDescription: string;
//     notificationStatus: 'ACTIVE' | 'INACTIVE';
//     notificationType: string; // e.g., 'ORDER', 'MESSAGE', 'REMINDER', 'POST'
// }
import { Model, Types } from 'mongoose';
import { USER_ROLES } from '../../../../enums/user';
import { NOTIFICATION_CATEGORIES, NOTIFICATION_TYPE } from './notification.constant';

export type INotification = {
    text: string;
    receiver?: [Types.ObjectId];
    read: boolean;
    referenceId?: string;
    category?: NOTIFICATION_CATEGORIES;
    type?: NOTIFICATION_TYPE;
};

export type NotificationModel = Model<INotification>;