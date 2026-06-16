import jwt, { type SignOptions } from 'jsonwebtoken';

import { envVars } from '@/config/env.js';
import { UserService } from '@/modules/User/user.service.js';

import { requestOtpValidation, verifyOtpValidation } from './auth.validation.js';

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
    const signOptions: SignOptions = {
      expiresIn: envVars.JWT.ACCESS_EXPIRES as SignOptions['expiresIn'],
    };
    const accessToken = jwt.sign(
      {
        id: user._id.toString(),
        phone: user.phone,
        role: user.role,
      },
      envVars.JWT.ACCESS_SECRET,
      signOptions
    );

    return {
      accessToken,
      user,
    };
  },
};
