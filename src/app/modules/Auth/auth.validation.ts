import { z } from 'zod';

const phoneValidation = z.string().trim().min(10).max(16);

export const requestOtpValidation = z.object({
  phone: phoneValidation,
});

export const verifyOtpValidation = z.object({
  phone: phoneValidation,
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'OTP must be 6 digits'),
});

export const adminLoginValidation = z.object({
  phone: phoneValidation,
  password: z.string().min(8).max(72),
});
