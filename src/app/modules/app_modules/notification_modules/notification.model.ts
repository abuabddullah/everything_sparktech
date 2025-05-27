import { model, Schema } from 'mongoose';
import { INotification, NotificationModel } from './notification.interface';
import { NOTIFICATION_CATEGORIES, NOTIFICATION_TYPE } from './notification.constant';
import { USER_ROLES } from '../../../../enums/user';

const notificationSchema = new Schema<INotification, NotificationModel>(
    {
        text: {
            type: String,
            required: true
        },
        receiver: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }],
        referenceId: {
            type: String,
            required: false
        },
        category: {
            type: String,
            enum: Object.values(NOTIFICATION_CATEGORIES),
            required: false
        },
        read: {
            type: Boolean,
            default: false
        },
        type: {
            type: String,
            enum: Object.values(NOTIFICATION_TYPE),
            required: false
        }
    },
    {
        timestamps: true
    }
);

export const Notification = model<INotification, NotificationModel>(
    'Notification',
    notificationSchema
);
