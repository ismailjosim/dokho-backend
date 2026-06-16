import type { Types } from "mongoose";

export type UserRole = "CLIENT" | "WORKER" | "ADMIN";

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  phone: string;
  role: UserRole;
  isOtpVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
