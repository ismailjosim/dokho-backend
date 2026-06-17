import jwt, { type SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import HttpStatus from 'http-status';

import { envVars } from '@/config/env.js';
import AppError from '@/helpers/AppError.js';
import { User } from '@/modules/User/user.model.js';
import { UserService } from '@/modules/User/user.service.js';

import { AuthOtp } from './authOtp.model.js';
import {
  adminLoginValidation,
  requestOtpValidation,
  verifyOtpValidation,
} from './auth.validation.js';

const OTP_EXPIRES_IN_SECONDS = 300;
const OTP_ALLOWED_ATTEMPTS = 3;
const OTP_REQUEST_WINDOW_MINUTES = 10;
const OTP_MAX_REQUESTS_PER_WINDOW = 3;

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

function createOtpCode() {
  if (envVars.NODE_ENV === 'development') {
    return envVars.MOCK_OTP;
  }

  return String(Math.floor(100000 + Math.random() * 900000));
}

export const AuthService = {
  async requestOtp(payload: unknown) {
    const data = requestOtpValidation.parse(payload);
    const user = await User.findOne({ phone: data.phone });

    if (!user) {
      throw new AppError(Number(HttpStatus.NOT_FOUND), 'No account found for this phone number');
    }

    const recentOtpCount = await AuthOtp.countDocuments({
      phone: data.phone,
      createdAt: { $gte: new Date(Date.now() - OTP_REQUEST_WINDOW_MINUTES * 60 * 1000) },
    });

    if (recentOtpCount >= OTP_MAX_REQUESTS_PER_WINDOW) {
      throw new AppError(429, 'Too many OTP requests. Please try again later');
    }

    const otp = createOtpCode();
    const codeHash = await bcrypt.hash(otp, 12);
    const expiresAt = new Date(Date.now() + OTP_EXPIRES_IN_SECONDS * 1000);

    await AuthOtp.updateMany(
      { phone: data.phone, consumedAt: { $exists: false } },
      { consumedAt: new Date() }
    );

    await AuthOtp.create({
      phone: data.phone,
      codeHash,
      expiresAt,
    });

    return {
      phone: data.phone,
      expiresInSeconds: OTP_EXPIRES_IN_SECONDS,
      developmentOtp: envVars.NODE_ENV === 'development' ? otp : null,
    };
  },

  async verifyOtp(payload: unknown) {
    const data = verifyOtpValidation.parse(payload);
    const otpRecord = await AuthOtp.findOne({
      phone: data.phone,
      consumedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      throw new AppError(Number(HttpStatus.UNAUTHORIZED), 'OTP expired or not requested');
    }

    if (otpRecord.attempts >= OTP_ALLOWED_ATTEMPTS) {
      otpRecord.consumedAt = new Date();
      await otpRecord.save();
      throw new AppError(Number(HttpStatus.FORBIDDEN), 'Too many OTP attempts');
    }

    const isOtpMatched = await bcrypt.compare(data.otp, otpRecord.codeHash);

    if (!isOtpMatched) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      throw new AppError(Number(HttpStatus.UNAUTHORIZED), 'Invalid OTP');
    }

    otpRecord.consumedAt = new Date();
    await otpRecord.save();

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
