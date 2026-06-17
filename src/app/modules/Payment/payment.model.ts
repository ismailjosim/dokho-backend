import { model, Schema } from 'mongoose';

import type { IContactUnlock, IPaymentRequest } from './payment.interface.js';

const paymentRequestSchema = new Schema<IPaymentRequest>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    method: {
      type: String,
      enum: ['BKASH', 'NAGAD', 'SSLCOMMERZ'],
      required: true,
    },
    plan: {
      type: String,
      enum: ['SINGLE_CONTACT', 'BULK_10_CONTACTS'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    credits: {
      type: Number,
      required: true,
      min: 0,
    },
    senderPhone: {
      type: String,
      trim: true,
    },
    transactionId: {
      type: String,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: Date,
  },
  { timestamps: true }
);

const contactUnlockSchema = new Schema<IContactUnlock>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    workerProfile: {
      type: Schema.Types.ObjectId,
      ref: 'WorkerProfile',
      required: true,
      index: true,
    },
    paymentRequest: {
      type: Schema.Types.ObjectId,
      ref: 'PaymentRequest',
    },
  },
  { timestamps: true }
);

paymentRequestSchema.index({ status: 1, createdAt: -1 });
contactUnlockSchema.index({ user: 1, workerProfile: 1 }, { unique: true });

export const PaymentRequest = model<IPaymentRequest>('PaymentRequest', paymentRequestSchema);
export const ContactUnlock = model<IContactUnlock>('ContactUnlock', contactUnlockSchema);
