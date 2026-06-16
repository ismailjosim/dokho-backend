import type { Types } from 'mongoose';

export type WorkerAvailability = 'AVAILABLE' | 'NOT_AVAILABLE';
export type WorkerStatus = 'PENDING' | 'APPROVED' | 'DEACTIVATED';

export interface IWorkerProfile {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  skill: string;
  district: string;
  upazila?: string;
  area?: string;
  experienceYears: number;
  availability: WorkerAvailability;
  status: WorkerStatus;
  createdAt: Date;
  updatedAt: Date;
}
