import { Schema, model } from 'mongoose';
import { IMessage, MessageModel } from './message.interface';

const messageSchema = new Schema<IMessage, MessageModel>(
  {
    from: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    to: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    group: { type: Schema.Types.ObjectId, ref: 'Group', required: false },
    replyTo: { type: Schema.Types.ObjectId, ref: 'Message', required: false },
    message: { type: String, required: true },
    images: {
      type: [String],
      required: false,
    },
  },
  { timestamps: true }
);

export const Message = model<IMessage, MessageModel>('Message', messageSchema);
