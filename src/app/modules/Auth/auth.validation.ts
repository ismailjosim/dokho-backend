import { z } from 'zod';

export const requestOtpValidation = z.object({
  phone: z.string().min(10).max(16),
});

export const verifyOtpValidation = z.object({
  phone: z.string().min(10).max(16),
  otp: z.string().length(6),
});
