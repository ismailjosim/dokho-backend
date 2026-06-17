import HttpStatus from 'http-status';

import type { GraphQLContext } from '@/graphql/context.js';
import AppError from '@/helpers/AppError.js';
import { WorkerProfile } from '@/modules/WorkerProfile/workerProfile.model.js';

import { ContactUnlock, PaymentRequest } from './payment.model.js';
import {
  createPaymentRequestValidation,
  paymentIdValidation,
  paymentPlans,
} from './payment.validation.js';

async function getAvailableCredits(userId: string) {
  const approvedPayments = await PaymentRequest.find({
    user: userId,
    status: 'APPROVED',
  });
  const usedCredits = await ContactUnlock.countDocuments({ user: userId });
  const totalCredits = approvedPayments.reduce((sum, payment) => sum + payment.credits, 0);

  return Math.max(totalCredits - usedCredits, 0);
}

export const PaymentService = {
  async getContactAccessSummary(context: GraphQLContext) {
    if (!context.user) {
      throw new AppError(Number(HttpStatus.UNAUTHORIZED), 'Login required');
    }

    const [availableCredits, unlockedProfiles] = await Promise.all([
      getAvailableCredits(context.user.id),
      ContactUnlock.find({ user: context.user.id }).select('workerProfile'),
    ]);

    return {
      availableCredits,
      unlockedWorkerProfileIds: unlockedProfiles.map((unlock) => unlock.workerProfile.toString()),
    };
  },

  async createPaymentRequest(context: GraphQLContext, payload: unknown) {
    if (!context.user) {
      throw new AppError(Number(HttpStatus.UNAUTHORIZED), 'Login required');
    }

    const data = createPaymentRequestValidation.parse(payload);
    const plan = paymentPlans[data.plan];

    return PaymentRequest.create({
      ...data,
      user: context.user.id,
      amount: plan.amount,
      credits: plan.credits,
      status: 'PENDING',
    });
  },

  async pendingPaymentRequests(context: GraphQLContext) {
    if (!context.user || context.user.role !== 'ADMIN') {
      throw new AppError(Number(HttpStatus.FORBIDDEN), 'Admin access required');
    }

    return PaymentRequest.find({ status: 'PENDING' })
      .populate({ path: 'user', select: 'name phone role isOtpVerified' })
      .sort({ createdAt: -1 });
  },

  async approvePaymentRequest(context: GraphQLContext, payload: unknown) {
    if (!context.user || context.user.role !== 'ADMIN') {
      throw new AppError(Number(HttpStatus.FORBIDDEN), 'Admin access required');
    }

    const { id } = paymentIdValidation.parse(payload);
    const payment = await PaymentRequest.findOneAndUpdate(
      { _id: id, status: 'PENDING' },
      { status: 'APPROVED', reviewedBy: context.user.id, reviewedAt: new Date() },
      { new: true }
    ).populate({ path: 'user', select: 'name phone role isOtpVerified' });

    if (!payment) {
      throw new AppError(Number(HttpStatus.NOT_FOUND), 'Pending payment request not found');
    }

    return payment;
  },

  async rejectPaymentRequest(context: GraphQLContext, payload: unknown) {
    if (!context.user || context.user.role !== 'ADMIN') {
      throw new AppError(Number(HttpStatus.FORBIDDEN), 'Admin access required');
    }

    const { id } = paymentIdValidation.parse(payload);
    const payment = await PaymentRequest.findOneAndUpdate(
      { _id: id, status: 'PENDING' },
      { status: 'REJECTED', reviewedBy: context.user.id, reviewedAt: new Date() },
      { new: true }
    ).populate({ path: 'user', select: 'name phone role isOtpVerified' });

    if (!payment) {
      throw new AppError(Number(HttpStatus.NOT_FOUND), 'Pending payment request not found');
    }

    return payment;
  },

  async unlockWorkerContact(context: GraphQLContext, workerProfileId: string) {
    if (!context.user) {
      throw new AppError(Number(HttpStatus.UNAUTHORIZED), 'Login required');
    }

    const existingUnlock = await ContactUnlock.findOne({
      user: context.user.id,
      workerProfile: workerProfileId,
    });
    const profile = await WorkerProfile.findOne({
      _id: workerProfileId,
      status: 'APPROVED',
    }).populate({ path: 'user', select: 'name phone role isOtpVerified' });

    if (!profile) {
      throw new AppError(Number(HttpStatus.NOT_FOUND), 'Worker profile not found');
    }

    if (!existingUnlock) {
      const availableCredits = await getAvailableCredits(context.user.id);

      if (availableCredits < 1) {
        throw new AppError(Number(HttpStatus.PAYMENT_REQUIRED), 'Payment credit required');
      }

      await ContactUnlock.create({
        user: context.user.id,
        workerProfile: workerProfileId,
      });
    }

    const user = profile.user as unknown as { phone?: string };

    return {
      workerProfileId,
      phone: user.phone || '',
      availableCredits: await getAvailableCredits(context.user.id),
    };
  },
};
