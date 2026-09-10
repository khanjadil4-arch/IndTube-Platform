/**
 * Frontend auth service — communicates with the IndTube backend API.
 * When VITE_API_BASE_URL is not set, all methods return mock-friendly states
 * so the existing demo experience continues working.
 */

import { config } from '@/lib/config';
import { apiRequest } from './apiClient';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  role: string;
  isVerified: boolean;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

const TOKEN_KEY = 'indtube_access_token';
const REFRESH_KEY = 'indtube_refresh_token';

export function getStoredAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function storeTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export async function signupUser(
  email: string,
  username: string,
  password: string,
  displayName?: string,
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/api/auth/signup', {
    method: 'POST',
    body: { email, username, password, displayName },
  });
}

export async function loginUser(
  email: string,
  password: string,
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export async function logoutUser(refreshToken: string): Promise<void> {
  await apiRequest<{ success: boolean }>('/api/auth/logout', {
    method: 'POST',
    body: { refreshToken },
  });
}

export async function refreshUser(
  refreshToken: string,
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/api/auth/refresh', {
    method: 'POST',
    body: { refreshToken },
  });
}

export async function fetchCurrentUser(
  accessToken: string,
): Promise<{ user: AuthUser }> {
  return apiRequest<{ user: AuthUser }>('/api/auth/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export const isAuthEnabled = !!config.apiBaseUrl;
