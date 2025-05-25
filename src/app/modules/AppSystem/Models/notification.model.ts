/* eslint-disable @typescript-eslint/no-this-alias */
import { Schema, model } from 'mongoose';
import { TNotification } from '../Interfaces/schema.interface';

const notificationSchema = new Schema<TNotification>(
  {
    title: {
      type: String,
      required: true,
    },
    subTitle: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['global', 'single','forAdmin'],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  },
);

export const Notification = model<TNotification>(
  'Notification',
  notificationSchema,
);
