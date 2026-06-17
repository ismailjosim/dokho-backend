import { z } from 'zod';

const bdPhoneValidation = z
  .string()
  .trim()
  .regex(/^01\d{9}$/, 'Phone number must be a valid Bangladeshi mobile number');

export const createUserValidation = z.object({
  name: z.string().trim().min(2).max(80),
  phone: bdPhoneValidation,
  role: z.enum(['CLIENT', 'WORKER']).default('CLIENT'),
});

export const createAdminValidation = z.object({
  name: z.string().trim().min(2).max(80),
  phone: bdPhoneValidation,
  password: z.string().min(8).max(72),
  setupSecret: z.string().min(8).optional(),
});

export const userIdValidation = z.string().min(1);
