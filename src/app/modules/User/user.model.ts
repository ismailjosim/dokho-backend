import { model, Schema } from 'mongoose';

import type { IUser, UserRole } from './user.interface.js';

const userRoles: UserRole[] = ['CLIENT', 'WORKER', 'ADMIN'];

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    role: {
      type: String,
      enum: userRoles,
      default: 'CLIENT',
    },
    passwordHash: {
      type: String,
      select: false,
    },
    isOtpVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });

export const User = model<IUser>('User', userSchema);
