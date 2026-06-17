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
    experienceYears: Int!
    availability: WorkerAvailability!
    status: WorkerStatus!
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
    experienceYears: Int = 0
    availability: WorkerAvailability = AVAILABLE
  }

  type Query {
    health: String!
    me: User
    workers(skill: String, district: String, limit: Int = 20): [WorkerProfile!]!
    workerProfile(id: ID!): WorkerProfile!
    myWorkerProfile: WorkerProfile
    pendingWorkerProfiles: [WorkerProfile!]!
  }

  type Mutation {
    createUser(input: CreateUserInput!): User!
    createAdmin(input: CreateAdminInput!): User!
    requestOtp(phone: String!): OtpResponse!
    verifyOtp(phone: String!, otp: String!): AuthPayload!
    adminLogin(phone: String!, password: String!): AuthPayload!
    upsertMyWorkerProfile(input: WorkerProfileInput!): WorkerProfile!
    updateMyAvailability(availability: WorkerAvailability!): WorkerProfile!
    approveWorkerProfile(id: ID!): WorkerProfile!
    deactivateWorkerProfile(id: ID!): WorkerProfile!
  }
`;
