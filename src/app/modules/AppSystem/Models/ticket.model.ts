/* eslint-disable @typescript-eslint/no-this-alias */
import { Schema, model } from 'mongoose';
import { TTicket } from '../Interfaces/schema.interface';

const ticketSchema = new Schema<TTicket>(
  {
    qty: {
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

export const Ticket = model<TTicket>('Ticket', ticketSchema);
