/**
 * Auth service — handles user registration, login, session management.
 * All database access goes through the portable pg connection layer.
 */

import { query, withTransaction, type PoolClient } from '../db/index.js';
import { hashPassword, verifyPassword } from './passwordService.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  type AccessTokenPayload,
} from './tokenService.js';

export interface SafeUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  role: string;
  isVerified: boolean;
}

interface UserRow {
  id: string;
  email: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  role: string;
  is_verified: boolean;
  password_hash: string;
  account_status: string;
  [key: string]: unknown;
}

function toSafeUser(row: UserRow): SafeUser {
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    role: row.role,
    isVerified: row.is_verified,
  };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signup(
  email: string,
  username: string,
  password: string,
  displayName?: string,
): Promise<{ user: SafeUser; accessToken: string; refreshToken: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedUsername = username.trim();
  const trimmedDisplay = (displayName ?? trimmedUsername).trim();

  if (!EMAIL_RE.test(normalizedEmail)) {
    throw new AuthError('Invalid email format', 400);
  }
  if (password.length < 8) {
    throw new AuthError('Password must be at least 8 characters', 400);
  }
  if (trimmedUsername.length < 3) {
    throw new AuthError('Username must be at least 3 characters', 400);
  }

  const existing = await query<{ email: string; username: string }>(
    'SELECT email, username FROM users WHERE email = $1 OR username = $2',
    [normalizedEmail, trimmedUsername],
  );
  if (existing.length > 0) {
    throw new AuthError('Email or username already in use', 409);
  }

  const passwordHash = await hashPassword(password);

  const rows = await query<UserRow>(
    `INSERT INTO users (email, username, display_name, password_hash, role, account_status)
     VALUES ($1, $2, $3, $4, 'USER', 'active')
     RETURNING id, email, username, display_name, avatar_url, role, is_verified, password_hash, account_status`,
    [normalizedEmail, trimmedUsername, trimmedDisplay, passwordHash],
  );

  const user = rows[0];
  return issueTokens(user);
}

export async function login(
  email: string,
  password: string,
): Promise<{ user: SafeUser; accessToken: string; refreshToken: string }> {
  const normalizedEmail = email.trim().toLowerCase();

  const rows = await query<UserRow>(
    `SELECT id, email, username, display_name, avatar_url, role, is_verified, password_hash, account_status
     FROM users WHERE email = $1`,
    [normalizedEmail],
  );

  // Use the same error message regardless of whether the account exists
  if (rows.length === 0) {
    throw new AuthError('Invalid email or password', 401);
  }

  const user = rows[0];
  if (user.account_status !== 'active') {
    throw new AuthError('Account is not active', 403);
  }

  const valid = await verifyPassword(user.password_hash, password);
  if (!valid) {
    throw new AuthError('Invalid email or password', 401);
  }

  await query('UPDATE users SET last_login = now() WHERE id = $1', [user.id]);

  return issueTokens(user);
}

export async function refresh(
  refreshToken: string,
): Promise<{ user: SafeUser; accessToken: string; refreshToken: string }> {
  const payload = verifyRefreshToken(refreshToken);
  if (!payload) {
    throw new AuthError('Invalid refresh token', 401);
  }

  const tokenHash = hashToken(refreshToken);
  const rows = await query<{ user_id: string; revoked_at: string | null }>(
    'SELECT user_id, revoked_at FROM refresh_tokens WHERE token_hash = $1 AND expires_at > now()',
    [tokenHash],
  );

  if (rows.length === 0 || rows[0].revoked_at) {
    throw new AuthError('Invalid or expired refresh token', 401);
  }

  // Revoke old token
  await query('UPDATE refresh_tokens SET revoked_at = now() WHERE token_hash = $1', [
    tokenHash,
  ]);

  const userRows = await query<UserRow>(
    `SELECT id, email, username, display_name, avatar_url, role, is_verified, password_hash, account_status
     FROM users WHERE id = $1`,
    [payload.sub],
  );

  if (userRows.length === 0) {
    throw new AuthError('User not found', 401);
  }

  return issueTokens(userRows[0]);
}

export async function logout(refreshToken: string): Promise<void> {
  const tokenHash = hashToken(refreshToken);
  await query('UPDATE refresh_tokens SET revoked_at = now() WHERE token_hash = $1', [
    tokenHash,
  ]);
}

export async function getUserById(id: string): Promise<SafeUser | null> {
  const rows = await query<UserRow>(
    `SELECT id, email, username, display_name, avatar_url, role, is_verified, password_hash, account_status
     FROM users WHERE id = $1`,
    [id],
  );
  return rows.length > 0 ? toSafeUser(rows[0]) : null;
}

async function issueTokens(user: UserRow): Promise<{
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
}> {
  const payload: AccessTokenPayload = { sub: user.id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  const tokenHash = hashToken(refreshToken);

  await query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, now() + interval \'30 days\')',
    [user.id, tokenHash],
  );

  return { user: toSafeUser(user), accessToken, refreshToken };
}

export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}
