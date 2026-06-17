import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  FRONTEND_URL: string;
  JWT: {
    ACCESS_SECRET: string;
    ACCESS_EXPIRES: string;
  };
  MOCK_OTP: string;
  ADMIN_SETUP_SECRET?: string;
  CLOUDINARY: {
    CLOUD_NAME?: string;
    API_KEY?: string;
    API_SECRET?: string;
  };
}

const requiredEnvVars = [
  'PORT',
  'DATABASE_URL',
  'FRONTEND_URL',
  'JWT_ACCESS_SECRET',
  'JWT_ACCESS_EXPIRES',
];

const loadEnvVars = (): EnvConfig => {
  requiredEnvVars.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable ${key}`);
    }
  });

  return {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: Number(process.env.PORT),
    DATABASE_URL: process.env.DATABASE_URL as string,
    FRONTEND_URL: process.env.FRONTEND_URL as string,
    JWT: {
      ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
      ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES as string,
    },
    MOCK_OTP: process.env.MOCK_OTP || '123456',
    ADMIN_SETUP_SECRET: process.env.ADMIN_SETUP_SECRET,
    CLOUDINARY: {
      CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
      API_KEY: process.env.CLOUDINARY_API_KEY,
      API_SECRET: process.env.CLOUDINARY_API_SECRET,
    },
  };
};

export const envVars = loadEnvVars();
