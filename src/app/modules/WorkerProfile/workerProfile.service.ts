import HttpStatus from 'http-status';

import AppError from '@/helpers/AppError.js';
import type { GraphQLContext } from '@/graphql/context.js';

import { WorkerProfile } from './workerProfile.model.js';
import {
  workerProfileInputValidation,
  workerSearchValidation,
} from './workerProfile.validation.js';

export const WorkerProfileService = {
  async searchWorkers(payload: unknown) {
    const filters = workerSearchValidation.parse(payload ?? {});
    const query: Record<string, unknown> = { status: 'APPROVED' };

    if (filters.skill) query.skill = filters.skill;
    if (filters.district) query.district = filters.district;

    return WorkerProfile.find(query).populate('user').sort({ updatedAt: -1 }).limit(filters.limit);
  },

  async getApprovedWorkerById(id: string) {
    const profile = await WorkerProfile.findOne({
      _id: id,
      status: 'APPROVED',
    }).populate('user');

    if (!profile) {
      throw new AppError(Number(HttpStatus.NOT_FOUND), 'Worker profile not found');
    }

    return profile;
  },

  async getMyProfile(context: GraphQLContext) {
    if (!context.user || context.user.role !== 'WORKER') {
      throw new AppError(Number(HttpStatus.FORBIDDEN), 'Worker access required');
    }

    return WorkerProfile.findOne({ user: context.user.id }).populate('user');
  },

  async createMyProfile(context: GraphQLContext, payload: unknown) {
    if (!context.user || context.user.role !== 'WORKER') {
      throw new AppError(Number(HttpStatus.FORBIDDEN), 'Worker access required');
    }

    const data = workerProfileInputValidation.parse(payload);

    return WorkerProfile.findOneAndUpdate(
      { user: context.user.id },
      { ...data, user: context.user.id, status: 'PENDING' },
      { new: true, upsert: true, runValidators: true }
    ).populate('user');
  },

  async updateMyAvailability(context: GraphQLContext, availability: 'AVAILABLE' | 'NOT_AVAILABLE') {
    if (!context.user || context.user.role !== 'WORKER') {
      throw new AppError(Number(HttpStatus.FORBIDDEN), 'Worker access required');
    }

    const profile = await WorkerProfile.findOneAndUpdate(
      { user: context.user.id },
      { availability },
      { new: true, runValidators: true }
    ).populate('user');

    if (!profile) {
      throw new AppError(Number(HttpStatus.NOT_FOUND), 'Worker profile not found');
    }

    return profile;
  },

  async approveProfile(context: GraphQLContext, id: string) {
    if (!context.user || context.user.role !== 'ADMIN') {
      throw new AppError(Number(HttpStatus.FORBIDDEN), 'Admin access required');
    }

    const profile = await WorkerProfile.findByIdAndUpdate(
      id,
      { status: 'APPROVED' },
      { new: true }
    ).populate('user');

    if (!profile) {
      throw new AppError(Number(HttpStatus.NOT_FOUND), 'Worker profile not found');
    }

    console.info('Worker profile approved', {
      profileId: profile._id.toString(),
      adminId: context.user.id,
    });

    return profile;
  },

  async deactivateProfile(context: GraphQLContext, id: string) {
    if (!context.user || context.user.role !== 'ADMIN') {
      throw new AppError(Number(HttpStatus.FORBIDDEN), 'Admin access required');
    }

    const profile = await WorkerProfile.findByIdAndUpdate(
      id,
      { status: 'DEACTIVATED' },
      { new: true }
    ).populate('user');

    if (!profile) {
      throw new AppError(Number(HttpStatus.NOT_FOUND), 'Worker profile not found');
    }

    console.info('Worker profile deactivated', {
      profileId: profile._id.toString(),
      adminId: context.user.id,
    });

    return profile;
  },

  async pendingProfiles(context: GraphQLContext) {
    if (!context.user || context.user.role !== 'ADMIN') {
      throw new AppError(Number(HttpStatus.FORBIDDEN), 'Admin access required');
    }

    return WorkerProfile.find({ status: 'PENDING' }).populate('user').sort({ createdAt: -1 });
  },
};
