/**
 * JWT token generation and verification.
 * Access tokens are short-lived; refresh tokens are long-lived and hashed in DB.
 */

import jwt from 'jsonwebtoken';
import { createHash } from 'node:crypto';
import { config } from '../config/index.js';

export interface AccessTokenPayload {
  sub: string;
  role: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtAccessExpires as jwt.SignOptions['expiresIn'],
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AccessTokenPayload;
    return decoded;
  } catch {
    return null;
  }
}

export function signRefreshToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtRefreshExpires as jwt.SignOptions['expiresIn'],
  });
}

export function verifyRefreshToken(token: string): AccessTokenPayload | null {
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AccessTokenPayload;
    return decoded;
  } catch {
    return null;
  }
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
