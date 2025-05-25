/* eslint-disable @typescript-eslint/no-this-alias */
import { Schema, Types, model } from 'mongoose';

const faqSchema = new Schema<{question: string, answer: string}>(
  {
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const FAQ = model<{question: string, answer: string }>('FAQ', faqSchema);

const TAQSchema = new Schema<{ text: string }>(
  {
    text: {
      type: String,
      required: true,
    }
  },
  {
    timestamps: true,
  },
);

export const TAQ = model<{ text: string }>('TAQ', TAQSchema);

const RPSchema = new Schema<{ text: string, user: Types.ObjectId }>(
  {
    text: {
      type: String,
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

export const Report = model<{ text: string, user: Types.ObjectId }>('Report', RPSchema);
