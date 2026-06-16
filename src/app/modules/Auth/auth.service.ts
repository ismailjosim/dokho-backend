import jwt, { type SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import HttpStatus from 'http-status';

import { envVars } from '@/config/env.js';
import AppError from '@/helpers/AppError.js';
import { User } from '@/modules/User/user.model.js';
import { UserService } from '@/modules/User/user.service.js';

import {
  adminLoginValidation,
  requestOtpValidation,
  verifyOtpValidation,
} from './auth.validation.js';

function createAccessToken(user: { _id: { toString(): string }; phone: string; role: string }) {
  const signOptions: SignOptions = {
    expiresIn: envVars.JWT.ACCESS_EXPIRES as SignOptions['expiresIn'],
  };

  return jwt.sign(
    {
      id: user._id.toString(),
      phone: user.phone,
      role: user.role,
    },
    envVars.JWT.ACCESS_SECRET,
    signOptions
  );
}

export const AuthService = {
  async requestOtp(payload: unknown) {
    const data = requestOtpValidation.parse(payload);

    return {
      phone: data.phone,
      expiresInSeconds: 300,
      developmentOtp: envVars.NODE_ENV === 'development' ? envVars.MOCK_OTP : null,
    };
  },

  async verifyOtp(payload: unknown) {
    const data = verifyOtpValidation.parse(payload);

    if (data.otp !== envVars.MOCK_OTP) {
      throw new Error('Invalid OTP');
    }

    const user = await UserService.markOtpVerified(data.phone);

    return {
      accessToken: createAccessToken(user),
      user,
    };
  },

  async adminLogin(payload: unknown) {
    const data = adminLoginValidation.parse(payload);
    const user = await User.findOne({ phone: data.phone, role: 'ADMIN' }).select('+passwordHash');

    if (!user?.passwordHash) {
      throw new AppError(Number(HttpStatus.UNAUTHORIZED), 'Invalid admin credentials');
    }

    const isPasswordMatched = await bcrypt.compare(data.password, user.passwordHash);

    if (!isPasswordMatched) {
      throw new AppError(Number(HttpStatus.UNAUTHORIZED), 'Invalid admin credentials');
    }

    return {
      accessToken: createAccessToken(user),
      user,
    };
  },
};
