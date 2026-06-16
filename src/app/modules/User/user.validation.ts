import { z } from 'zod';

export const createUserValidation = z.object({
  name: z.string().min(2).max(80),
  phone: z.string().min(10).max(16),
  role: z.enum(['CLIENT', 'WORKER']).default('CLIENT'),
});

export const createAdminValidation = z.object({
  name: z.string().min(2).max(80),
  phone: z.string().min(10).max(16),
  password: z.string().min(8).max(72),
  setupSecret: z.string().min(8).optional(),
});

export const userIdValidation = z.string().min(1);
