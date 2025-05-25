/* eslint-disable @typescript-eslint/no-this-alias */
import { Schema, Types, model } from 'mongoose';

const StripeAccountSchema = new Schema<{
  user: Types.ObjectId;
  accountId: string;
  isCompleted?: boolean;
}>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    accountId: {
      type: String,
      required: true,
    },
    isCompleted: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  },
);

const StripeWithdrowSchema = new Schema<{
  user: Types.ObjectId;
  amount: number;
  stripePayoutId: string;
  isCompleted: boolean;
}>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {type:Number, required:true},
    stripePayoutId: {
      type: String,
      required: true,
    },
    isCompleted: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  },
);

export const Withdrawal = model<{
  user: Types.ObjectId;
  amount: number;
  stripePayoutId: string;
  isCompleted: boolean;
}>('Withdrawal', StripeWithdrowSchema);

export const StripeAccount = model<{
  user: Types.ObjectId;
  accountId: string;
  isCompleted?: boolean;
}>('StripeAccount', StripeAccountSchema);
