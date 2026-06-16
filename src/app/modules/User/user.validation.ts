import { z } from 'zod';

export const createUserValidation = z.object({
  name: z.string().min(2).max(80),
  phone: z.string().min(10).max(16),
  role: z.enum(['CLIENT', 'WORKER', 'ADMIN']).default('CLIENT'),
});

export const userIdValidation = z.string().min(1);
