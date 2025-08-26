import { Schema, model } from 'mongoose';
import { IStudyschedule, StudyscheduleModel } from './studyschedule.interface';

const studyscheduleSchema = new Schema<IStudyschedule, StudyscheduleModel>({
  calendar: { type: Date },
  title: { type: String },
  description: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  isDeleted: { type: Boolean , default: false },
}, {
  timestamps: true
});

export const Studyschedule = model<IStudyschedule, StudyscheduleModel>('Studyschedule', studyscheduleSchema);
