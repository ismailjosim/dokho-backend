import HttpStatus from 'http-status';

import AppError from '@/helpers/AppError.js';

import { createUserValidation } from './user.validation.js';
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
