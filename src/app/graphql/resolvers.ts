import { AuthService } from '@/modules/Auth/auth.service.js';
import { PaymentService } from '@/modules/Payment/payment.service.js';
import { UploadService } from '@/modules/Upload/upload.service.js';
import { UserService } from '@/modules/User/user.service.js';
import { WorkerProfileService } from '@/modules/WorkerProfile/workerProfile.service.js';

export const resolvers = {
  User: {
    id: (parent: { _id: string }) => parent._id.toString(),
    phone: (
      parent: { _id: string; phone?: string },
      _args: unknown,
      context: { user: { id: string; role: string } | null }
    ) => {
      if (!parent.phone || !context.user) {
        return null;
      }

      if (context.user.role === 'ADMIN' || context.user.id === parent._id.toString()) {
        return parent.phone;
      }

      return null;
    },
    maskedPhone: (parent: { phone?: string }) => {
      if (!parent.phone || parent.phone.length < 5) {
        return null;
      }

      return `${parent.phone.slice(0, 3)}****${parent.phone.slice(-4)}`;
    },
  },
  WorkerProfile: {
    id: (parent: { _id: string }) => parent._id.toString(),
  },
  PaymentRequest: {
    id: (parent: { _id: string }) => parent._id.toString(),
  },
  Query: {
    health: () => 'Dokho GraphQL is running',
    me: (_parent: unknown, _args: unknown, context: { user: { id: string } | null }) =>
      context.user ? UserService.getUserById(context.user.id) : null,
    workers: (_parent: unknown, args: unknown) => WorkerProfileService.searchWorkers(args),
    workerServices: () => WorkerProfileService.getServiceNames(),
    workerProfile: (_parent: unknown, args: { id: string }) =>
      WorkerProfileService.getApprovedWorkerById(args.id),
    myWorkerProfile: (
      _parent: unknown,
      _args: unknown,
      context: Parameters<typeof WorkerProfileService.getMyProfile>[0]
    ) => WorkerProfileService.getMyProfile(context),
    pendingWorkerProfiles: (
      _parent: unknown,
      _args: unknown,
      context: Parameters<typeof WorkerProfileService.pendingProfiles>[0]
    ) => WorkerProfileService.pendingProfiles(context),
    contactAccessSummary: (
      _parent: unknown,
      _args: unknown,
      context: Parameters<typeof PaymentService.getContactAccessSummary>[0]
    ) => PaymentService.getContactAccessSummary(context),
    pendingPaymentRequests: (
      _parent: unknown,
      _args: unknown,
      context: Parameters<typeof PaymentService.pendingPaymentRequests>[0]
    ) => PaymentService.pendingPaymentRequests(context),
  },
  Mutation: {
    createUser: (_parent: unknown, args: { input: unknown }) => UserService.createUser(args.input),
    createAdmin: (_parent: unknown, args: { input: unknown }) =>
      UserService.createAdmin(args.input),
    requestOtp: (_parent: unknown, args: { phone: string }) => AuthService.requestOtp(args),
    verifyOtp: (_parent: unknown, args: { phone: string; otp: string }) =>
      AuthService.verifyOtp(args),
    adminLogin: (_parent: unknown, args: { phone: string; password: string }) =>
      AuthService.adminLogin(args),
    uploadImage: (
      _parent: unknown,
      args: { input: unknown },
      context: Parameters<typeof UploadService.uploadImage>[0]
    ) => UploadService.uploadImage(context, args.input),
    upsertMyWorkerProfile: (
      _parent: unknown,
      args: { input: unknown },
      context: Parameters<typeof WorkerProfileService.createMyProfile>[0]
    ) => WorkerProfileService.createMyProfile(context, args.input),
    updateMyAvailability: (
      _parent: unknown,
      args: { availability: 'AVAILABLE' | 'NOT_AVAILABLE' },
      context: Parameters<typeof WorkerProfileService.updateMyAvailability>[0]
    ) => WorkerProfileService.updateMyAvailability(context, args.availability),
    approveWorkerProfile: (
      _parent: unknown,
      args: { id: string },
      context: Parameters<typeof WorkerProfileService.approveProfile>[0]
    ) => WorkerProfileService.approveProfile(context, args.id),
    deactivateWorkerProfile: (
      _parent: unknown,
      args: { id: string },
      context: Parameters<typeof WorkerProfileService.deactivateProfile>[0]
    ) => WorkerProfileService.deactivateProfile(context, args.id),
    createPaymentRequest: (
      _parent: unknown,
      args: { input: unknown },
      context: Parameters<typeof PaymentService.createPaymentRequest>[0]
    ) => PaymentService.createPaymentRequest(context, args.input),
    approvePaymentRequest: (
      _parent: unknown,
      args: { id: string },
      context: Parameters<typeof PaymentService.approvePaymentRequest>[0]
    ) => PaymentService.approvePaymentRequest(context, args),
    rejectPaymentRequest: (
      _parent: unknown,
      args: { id: string },
      context: Parameters<typeof PaymentService.rejectPaymentRequest>[0]
    ) => PaymentService.rejectPaymentRequest(context, args),
    unlockWorkerContact: (
      _parent: unknown,
      args: { workerProfileId: string },
      context: Parameters<typeof PaymentService.unlockWorkerContact>[0]
    ) => PaymentService.unlockWorkerContact(context, args.workerProfileId),
  },
};
