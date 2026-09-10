/**
 * Backend configuration — all values come from environment variables.
 * No secrets are hard-coded. Copy .env.example to .env and fill in real values.
 */

import dotenv from 'dotenv';
dotenv.config();

function required(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback ?? '';
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

  jwtSecret: process.env.JWT_SECRET ?? '',
  jwtAccessExpires: process.env.JWT_ACCESS_EXPIRES ?? '15m',
  jwtRefreshExpires: process.env.JWT_REFRESH_EXPIRES ?? '30d',
} as const;

export type BackendConfig = typeof config;
