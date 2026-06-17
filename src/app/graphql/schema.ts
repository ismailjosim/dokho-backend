export const typeDefs = /* GraphQL */ `
  enum UserRole {
    CLIENT
    WORKER
    ADMIN
  }

  enum WorkerAvailability {
    AVAILABLE
    NOT_AVAILABLE
  }

  enum WorkerStatus {
    PENDING
    APPROVED
    DEACTIVATED
  }

  enum UploadFolder {
    PROFILE_PHOTOS
    NID_DOCUMENTS
  }

  enum PaymentMethod {
    BKASH
    NAGAD
    SSLCOMMERZ
  }

  enum PaymentPlan {
    SINGLE_CONTACT
    BULK_10_CONTACTS
  }

  enum PaymentStatus {
    PENDING
    APPROVED
    REJECTED
  }

  type User {
    id: ID!
    name: String!
    phone: String
    maskedPhone: String
    role: UserRole!
    isOtpVerified: Boolean!
  }

  type WorkerProfile {
    id: ID!
    user: User!
    skill: String!
    district: String!
    upazila: String
    area: String
    profilePhotoUrl: String
    profilePhotoPublicId: String
    nidFrontUrl: String
    nidFrontPublicId: String
    nidBackUrl: String
    nidBackPublicId: String
    experienceYears: Int!
    availability: WorkerAvailability!
    status: WorkerStatus!
  }

  type UploadedImage {
    url: String!
    publicId: String!
  }

  type PaymentRequest {
    id: ID!
    user: User!
    method: PaymentMethod!
    plan: PaymentPlan!
    amount: Int!
    credits: Int!
    senderPhone: String
    transactionId: String
    status: PaymentStatus!
    createdAt: String!
  }

  type ContactAccessSummary {
    availableCredits: Int!
    unlockedWorkerProfileIds: [ID!]!
  }

  type ContactUnlockPayload {
    workerProfileId: ID!
    phone: String!
    availableCredits: Int!
  }

  type OtpResponse {
    phone: String!
    expiresInSeconds: Int!
    developmentOtp: String
  }

  type AuthPayload {
    accessToken: String!
    user: User!
  }

  input CreateUserInput {
    name: String!
    phone: String!
    role: UserRole = CLIENT
  }

  input CreateAdminInput {
    name: String!
    phone: String!
    password: String!
    setupSecret: String
  }

  input WorkerProfileInput {
    skill: String!
    district: String!
    upazila: String
    area: String
    profilePhotoUrl: String
    profilePhotoPublicId: String
    nidFrontUrl: String
    nidFrontPublicId: String
    nidBackUrl: String
    nidBackPublicId: String
    experienceYears: Int = 0
    availability: WorkerAvailability = AVAILABLE
  }

  input UploadImageInput {
    file: String!
    folder: UploadFolder = PROFILE_PHOTOS
  }

  input CreatePaymentRequestInput {
    method: PaymentMethod!
    plan: PaymentPlan!
    senderPhone: String
    transactionId: String
  }

  type Query {
    health: String!
    me: User
    workers(skill: String, district: String, limit: Int = 20): [WorkerProfile!]!
    workerServices: [String!]!
    workerProfile(id: ID!): WorkerProfile!
    myWorkerProfile: WorkerProfile
    pendingWorkerProfiles: [WorkerProfile!]!
    contactAccessSummary: ContactAccessSummary!
    pendingPaymentRequests: [PaymentRequest!]!
  }

  type Mutation {
    createUser(input: CreateUserInput!): User!
    createAdmin(input: CreateAdminInput!): User!
    requestOtp(phone: String!): OtpResponse!
    verifyOtp(phone: String!, otp: String!): AuthPayload!
    adminLogin(phone: String!, password: String!): AuthPayload!
    uploadImage(input: UploadImageInput!): UploadedImage!
    upsertMyWorkerProfile(input: WorkerProfileInput!): WorkerProfile!
    updateMyAvailability(availability: WorkerAvailability!): WorkerProfile!
    approveWorkerProfile(id: ID!): WorkerProfile!
    deactivateWorkerProfile(id: ID!): WorkerProfile!
    createPaymentRequest(input: CreatePaymentRequestInput!): PaymentRequest!
    approvePaymentRequest(id: ID!): PaymentRequest!
    rejectPaymentRequest(id: ID!): PaymentRequest!
    unlockWorkerContact(workerProfileId: ID!): ContactUnlockPayload!
  }
`;
