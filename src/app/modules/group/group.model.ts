import { Schema, model } from 'mongoose';
import { IGroup, GroupModel } from './group.interface';

const groupSchema = new Schema<IGroup, GroupModel>(
  {
    name: { type: String, required: true },
    members: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      required: false,
    },
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: false },
  },
  { timestamps: true }
);

export const Group = model<IGroup, GroupModel>('Group', groupSchema);
