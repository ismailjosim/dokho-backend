import { model, Schema } from 'mongoose';

import type { IAuthOtp } from './authOtp.interface.js';

const authOtpSchema = new Schema<IAuthOtp>(
  {
    phone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    codeHash: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
    consumedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

authOtpSchema.index({ phone: 1, consumedAt: 1, expiresAt: -1 });

export const AuthOtp = model<IAuthOtp>('AuthOtp', authOtpSchema);
