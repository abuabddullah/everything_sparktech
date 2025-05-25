/* eslint-disable @typescript-eslint/no-this-alias */
import { Schema, model } from 'mongoose';
import { TInvest } from '../Interfaces/schema.interface';

const investSchema = new Schema<TInvest>(
  {
    amount: {
      type: Number,
      required: true,
    },
    refferedAmount: {
      type: Number,
    },
    adminAmount: {
      type: Number,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Investment = model<TInvest>('Invesment', investSchema);
