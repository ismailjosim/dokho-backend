import { z } from 'zod';

export const paymentPlans = {
  SINGLE_CONTACT: {
    amount: 20,
    credits: 1,
  },
  BULK_10_CONTACTS: {
    amount: 100,
    credits: 10,
  },
} as const;

export const createPaymentRequestValidation = z.object({
  method: z.enum(['BKASH', 'NAGAD', 'SSLCOMMERZ']),
  plan: z.enum(['SINGLE_CONTACT', 'BULK_10_CONTACTS']),
  senderPhone: z.string().trim().max(20).optional(),
  transactionId: z.string().trim().max(80).optional(),
});

export const paymentIdValidation = z.object({
  id: z.string().min(1),
});
