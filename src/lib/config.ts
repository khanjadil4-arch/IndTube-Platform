/**
 * Central configuration for IndTube.
 *
 * All future backend endpoints, storage URLs, and feature flags are read from
 * environment variables. Nothing is hard-coded — the project can be pointed at
 * any self-controlled server or S3-compatible storage by setting these vars.
 *
 * During the current mock-data phase, no env vars are required. The defaults
 * below keep the app running with local demo data. When a real backend is
 * connected later, set the env vars in `.env` (or your deployment environment)
 * and the service layer will pick them up automatically.
 */

function env(key: string, fallback = ''): string {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] ?? fallback;
  }
  return fallback;
}

export const config = {
  /** Base URL of the IndTube API server (your own server). Empty = use mock data. */
  apiBaseUrl: env('VITE_API_BASE_URL', ''),

  /** S3-compatible storage endpoint for videos, thumbnails, and avatars. */
  storageEndpoint: env('VITE_STORAGE_ENDPOINT', ''),

  /** Public bucket URL for serving stored assets. */
  storagePublicUrl: env('VITE_STORAGE_PUBLIC_URL', ''),

  /** Auth provider base URL (your own auth server or compatible provider). */
  authBaseUrl: env('VITE_AUTH_BASE_URL', ''),

  /** When true, the app uses in-memory mock data instead of calling the API. */
  useMockData: !env('VITE_API_BASE_URL'),
} as const;

export type AppConfig = typeof config;
