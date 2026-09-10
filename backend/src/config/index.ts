/**
 * Backend configuration — all values come from environment variables.
 * No secrets are hard-coded. Copy .env.example to .env and fill in real values.
 *
 * In production, required secrets that are missing cause the server to fail
 * fast with a clear error message. In development, missing values fall back
 * to empty strings so the server can still start (e.g. for local testing).
 */

import dotenv from 'dotenv';
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

function required(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback ?? '';
  if (!value && isProduction) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config = {
  port: parseInt(process.env.PORT ?? '4000', 10),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV ?? 'development',

  databaseUrl: required('DATABASE_URL'),
  storageEndpoint: required('STORAGE_ENDPOINT'),
  storageBucket: required('STORAGE_BUCKET'),
  storageRegion: process.env.STORAGE_REGION ?? 'us-east-1',
  storageAccessKey: required('STORAGE_ACCESS_KEY'),
  storageSecretKey: required('STORAGE_SECRET_KEY'),
  storagePublicUrl: required('STORAGE_PUBLIC_URL'),

  jwtSecret: required('JWT_SECRET'),
  jwtAccessExpires: process.env.JWT_ACCESS_EXPIRES ?? '15m',
  jwtRefreshExpires: process.env.JWT_REFRESH_EXPIRES ?? '30d',
} as const;

export type BackendConfig = typeof config;
