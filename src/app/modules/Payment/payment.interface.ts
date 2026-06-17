import type { Types } from 'mongoose';

export type PaymentMethod = 'BKASH' | 'NAGAD' | 'SSLCOMMERZ';
export type PaymentPlan = 'SINGLE_CONTACT' | 'BULK_10_CONTACTS';
export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface IPaymentRequest {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  method: PaymentMethod;
  plan: PaymentPlan;
  amount: number;
  credits: number;
  senderPhone?: string;
  transactionId?: string;
  status: PaymentStatus;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IContactUnlock {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  workerProfile: Types.ObjectId;
  paymentRequest?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
