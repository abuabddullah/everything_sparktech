import { Schema, model } from 'mongoose';
import { INotification, NotificationModel } from './notification.interface';

const notificationSchema = new Schema<INotification, NotificationModel>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    description: { type: String, required: true },
    title: { type: String, required: true },
  },
  { timestamps: true }
);

export const Notification = model<INotification, NotificationModel>(
  'Notification',
  notificationSchema
);
