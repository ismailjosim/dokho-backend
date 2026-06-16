import { model, Schema } from "mongoose";

import type { IWorkerProfile } from "./workerProfile.interface.js";

const workerProfileSchema = new Schema<IWorkerProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    skill: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    district: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    upazila: {
      type: String,
      trim: true,
    },
    area: {
      type: String,
      trim: true,
    },
    experienceYears: {
      type: Number,
      default: 0,
      min: 0,
    },
    availability: {
      type: String,
      enum: ["AVAILABLE", "NOT_AVAILABLE"],
      default: "AVAILABLE",
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "DEACTIVATED"],
      default: "PENDING",
      index: true,
    },
  },
  { timestamps: true },
);

export const WorkerProfile = model<IWorkerProfile>(
  "WorkerProfile",
  workerProfileSchema,
);
