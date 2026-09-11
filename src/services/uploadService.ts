/**
 * Frontend upload service — chunked multipart upload to S3-compatible storage.
 *
 * Flow:
 *   1. initiateUpload() — sends metadata to backend, gets sessionId + totalParts
 *   2. uploadChunk() — gets presigned URL from backend, PUTs the chunk directly to storage
 *   3. completeUpload() — sends all ETags to backend, backend finalizes with S3
 *
 * Supports resume (re-requesting presigned URLs for failed parts) and retry
 * (retrying a failed chunk upload up to MAX_RETRIES times).
 */

import { apiRequest } from './apiClient';
import { getStoredAccessToken } from './authService';

export interface InitiateUploadParams {
  title: string;
  description: string;
  visibility: string;
  contentType: string;
  fileSize: number;
  categoryId?: string;
}

export interface InitiateUploadResponse {
  videoId: string;
  sessionId: string;
  storageKey: string;
  uploadId: string;
  chunkSize: number;
  totalParts: number;
  fileSize: number;
}

export interface PartUploadResult {
  partNumber: number;
  etag: string;
}

export interface UploadStatusResponse {
  sessionId: string;
  videoId: string;
  uploadedParts: number;
  totalParts: number;
  chunkSize: number;
  fileSize: number;
  status: string;
}

const MAX_RETRIES = 3;

export async function initiateUpload(
  params: InitiateUploadParams,
): Promise<InitiateUploadResponse> {
  return apiRequest<InitiateUploadResponse>('/videos/initiate', {
    method: 'POST',
    body: params,
  });
}

export async function getPartUrl(
  videoId: string,
  partNumber: number,
): Promise<string> {
  const res = await apiRequest<{ url: string; partNumber: number }>(
    `/videos/${videoId}/parts/${partNumber}`,
    { method: 'POST' },
  );
  return res.url;
}

export async function uploadChunk(
  url: string,
  chunk: Blob,
  onProgress?: (loaded: number) => void,
  signal?: AbortSignal,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url, true);
    xhr.setRequestHeader('Content-Type', 'application/octet-stream');

    xhr.upload.onprogress = (e) => {
      if (onProgress) onProgress(e.loaded);
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const etag = xhr.getResponseHeader('ETag') || '';
        resolve(etag);
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during chunk upload'));
    xhr.onabort = () => reject(new Error('Upload aborted'));

    if (signal) {
      signal.addEventListener('abort', () => xhr.abort());
    }

    xhr.send(chunk);
  });
}

export async function uploadChunkWithRetry(
  videoId: string,
  partNumber: number,
  chunk: Blob,
  onProgress?: (loaded: number) => void,
  signal?: AbortSignal,
): Promise<PartUploadResult> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const url = await getPartUrl(videoId, partNumber);
      const etag = await uploadChunk(url, chunk, onProgress, signal);
      return { partNumber, etag };
    } catch (err) {
      lastError = err as Error;
      if (signal?.aborted) throw err;
      // Wait before retry (exponential backoff)
      if (attempt < MAX_RETRIES - 1) {
        await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
      }
    }
  }

  throw lastError ?? new Error('Failed to upload chunk after retries');
}

export async function completeUpload(
  videoId: string,
  parts: PartUploadResult[],
): Promise<{ videoId: string; status: string }> {
  return apiRequest<{ videoId: string; status: string }>(
    `/videos/${videoId}/complete`,
    {
      method: 'POST',
      body: {
        parts: parts.map((p) => ({
          PartNumber: p.partNumber,
          ETag: p.etag,
        })),
      },
    },
  );
}

export async function abortUpload(videoId: string): Promise<void> {
  await apiRequest<{ videoId: string; status: string }>(
    `/videos/${videoId}/abort`,
    { method: 'POST' },
  );
}

export async function getUploadStatus(videoId: string): Promise<UploadStatusResponse> {
  return apiRequest<UploadStatusResponse>(`/videos/${videoId}/upload-status`);
}

export function getAuthHeaders(): Record<string, string> {
  const token = getStoredAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
