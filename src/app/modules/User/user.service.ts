import HttpStatus from 'http-status';
import bcrypt from 'bcryptjs';

import { envVars } from '@/config/env.js';
import AppError from '@/helpers/AppError.js';

import { createAdminValidation, createUserValidation } from './user.validation.js';
import { User } from './user.model.js';

export const UserService = {
  async createUser(payload: unknown) {
    const data = createUserValidation.parse(payload);
    const exists = await User.findOne({ phone: data.phone });

    if (exists) {
      throw new AppError(Number(HttpStatus.CONFLICT), 'Phone number already exists');
    }

    return User.create(data);
  },

  async createAdmin(payload: unknown) {
    const data = createAdminValidation.parse(payload);

    if (envVars.NODE_ENV !== 'development' && !envVars.ADMIN_SETUP_SECRET) {
      throw new AppError(Number(HttpStatus.FORBIDDEN), 'Admin setup is disabled');
    }

    if (envVars.ADMIN_SETUP_SECRET && data.setupSecret !== envVars.ADMIN_SETUP_SECRET) {
      throw new AppError(Number(HttpStatus.FORBIDDEN), 'Invalid admin setup secret');
    }

    const exists = await User.findOne({ phone: data.phone });

    if (exists) {
      throw new AppError(Number(HttpStatus.CONFLICT), 'Phone number already exists');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    return User.create({
      name: data.name,
      phone: data.phone,
      role: 'ADMIN',
      isOtpVerified: true,
      passwordHash,
    });
  },

  async getUserById(id: string) {
    const user = await User.findById(id);

    if (!user) {
      throw new AppError(Number(HttpStatus.NOT_FOUND), 'User not found');
    }

    return user;
  },

  async markOtpVerified(phone: string) {
    const user = await User.findOneAndUpdate({ phone }, { isOtpVerified: true }, { new: true });

    if (!user) {
      throw new AppError(Number(HttpStatus.NOT_FOUND), 'User not found');
    }

    return user;
  },
};
