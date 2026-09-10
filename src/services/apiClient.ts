/**
 * Minimal HTTP client for future IndTube API calls.
 *
 * When `config.apiBaseUrl` is set, service modules use this helper to make
 * requests to your own backend. When it is empty (the current phase), services
 * fall back to mock data and this client is not exercised.
 *
 * The client is intentionally framework-free — no axios, no SDK — so the
 * project stays portable and dependency-light.
 */

import { config } from '@/lib/config';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, headers = {}, signal } = options;

  if (!config.apiBaseUrl) {
    throw new Error('API base URL not configured. Set VITE_API_BASE_URL.');
  }

  const res = await fetch(`${config.apiBaseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  if (!res.ok) {
    let parsed: unknown;
    try {
      parsed = await res.json();
    } catch {
      // response body is not JSON
    }
    throw new ApiError(`API ${res.status} on ${path}`, res.status, parsed);
  }

  return res.json() as Promise<T>;
}
