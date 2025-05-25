import { model, Schema } from "mongoose";

const ruffleSchema = new Schema(
  {
    deadline: {
      type: Date,
      required: true,
    },
    prizeMoney: {
      type: Number,
      required: true,
    },
    ticketButtons: {
      type: [Number],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Ruffles = model('Ruffles', ruffleSchema);