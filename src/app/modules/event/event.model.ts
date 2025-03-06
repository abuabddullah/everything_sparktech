import { Schema, model } from 'mongoose';
import { IEvent, EventModel } from './event.interface';

const eventSchema = new Schema<IEvent, EventModel>(
  {
    thumbnailImage: { type: String, required: true },
    introMedia: { type: String, required: true },
    name: { type: String, required: true },
    time: { type: Date, required: true },
    description: { type: String, required: true },
    tags: { type: [String], required: true },
    price: { type: Number, required: false },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    address: { type: String, required: true },
    coordinate: { type: [Number], required: true },
  },
  { timestamps: true }
);

export const Event = model<IEvent, EventModel>('Event', eventSchema);
