/* eslint-disable @typescript-eslint/no-this-alias */
import { Schema, model } from 'mongoose';
import { TOTP } from '../Interfaces/schema.interface';

const otpSchema = new Schema<TOTP>(
  {
    email: {
      type: String,
      required: true, // can be email or phone number
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    }
  },
  {
    timestamps: true,
  },
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete after expiration

export const OTP = model<TOTP>('OTP', otpSchema);
