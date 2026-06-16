import { z } from "zod";

export const workerProfileInputValidation = z.object({
  skill: z.string().min(2).max(60),
  district: z.string().min(2).max(60),
  upazila: z.string().max(60).optional(),
  area: z.string().max(100).optional(),
  experienceYears: z.number().int().min(0).max(60).default(0),
  availability: z.enum(["AVAILABLE", "NOT_AVAILABLE"]).default("AVAILABLE"),
});

export const workerSearchValidation = z.object({
  skill: z.string().optional(),
  district: z.string().optional(),
  limit: z.number().int().min(1).max(50).default(20),
});
