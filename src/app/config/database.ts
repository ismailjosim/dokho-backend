import mongoose from 'mongoose';

import { envVars } from './env.js';

export async function connectDB() {
  await mongoose.connect(envVars.DATABASE_URL);
  console.log('Database connected successfully');
}

export async function disconnectDB() {
  await mongoose.disconnect();
  console.log('Database connection closed');
}
