import { AuthService } from '@/modules/Auth/auth.service.js';
import { UserService } from '@/modules/User/user.service.js';
import { WorkerProfileService } from '@/modules/WorkerProfile/workerProfile.service.js';

export const resolvers = {
  User: {
    id: (parent: { _id: string }) => parent._id.toString(),
  },
  WorkerProfile: {
    id: (parent: { _id: string }) => parent._id.toString(),
  },
  Query: {
    health: () => 'Dokho GraphQL is running',
    workers: (_parent: unknown, args: unknown) => WorkerProfileService.searchWorkers(args),
    pendingWorkerProfiles: (
      _parent: unknown,
      _args: unknown,
      context: Parameters<typeof WorkerProfileService.pendingProfiles>[0]
    ) => WorkerProfileService.pendingProfiles(context),
  },
  Mutation: {
    createUser: (_parent: unknown, args: { input: unknown }) => UserService.createUser(args.input),
    requestOtp: (_parent: unknown, args: { phone: string }) => AuthService.requestOtp(args),
    verifyOtp: (_parent: unknown, args: { phone: string; otp: string }) =>
      AuthService.verifyOtp(args),
    upsertMyWorkerProfile: (
      _parent: unknown,
      args: { input: unknown },
      context: Parameters<typeof WorkerProfileService.createMyProfile>[0]
    ) => WorkerProfileService.createMyProfile(context, args.input),
    approveWorkerProfile: (
      _parent: unknown,
      args: { id: string },
      context: Parameters<typeof WorkerProfileService.approveProfile>[0]
    ) => WorkerProfileService.approveProfile(context, args.id),
  },
};
