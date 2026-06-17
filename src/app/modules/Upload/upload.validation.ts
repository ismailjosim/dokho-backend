import { z } from 'zod';

export const uploadImageValidation = z.object({
  file: z
    .string()
    .min(100)
    .refine((value) => value.startsWith('data:image/'), 'Image must be a data URI'),
  folder: z.enum(['PROFILE_PHOTOS', 'NID_DOCUMENTS']).default('PROFILE_PHOTOS'),
});
