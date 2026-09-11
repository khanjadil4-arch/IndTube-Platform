/**
 * Upload session service — tracks multipart upload sessions in the database
 * so they can be resumed after network interruptions.
 */

import { query } from '../db/index.js';

export interface UploadSession {
  id: string;
  video_id: string;
  channel_id: string;
  storage_key: string;
  s3_upload_id: string;
  file_size: number;
  chunk_size: number;
  total_parts: number;
  uploaded_parts: number;
  status: string;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

export async function createUploadSession(params: {
  videoId: string;
  channelId: string;
  storageKey: string;
  s3UploadId: string;
  fileSize: number;
  chunkSize: number;
  totalParts: number;
}): Promise<UploadSession> {
  const rows = await query<UploadSession>(
    `INSERT INTO upload_sessions (video_id, channel_id, storage_key, s3_upload_id, file_size, chunk_size, total_parts, uploaded_parts, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 0, 'active')
     RETURNING *`,
    [
      params.videoId,
      params.channelId,
      params.storageKey,
      params.s3UploadId,
      params.fileSize,
      params.chunkSize,
      params.totalParts,
    ],
  );
  return rows[0];
}

export async function getUploadSession(sessionId: string): Promise<UploadSession | null> {
  const rows = await query<UploadSession>(
    'SELECT * FROM upload_sessions WHERE id = $1',
    [sessionId],
  );
  return rows.length > 0 ? rows[0] : null;
}

export async function getUploadSessionByVideo(videoId: string): Promise<UploadSession | null> {
  const rows = await query<UploadSession>(
    "SELECT * FROM upload_sessions WHERE video_id = $1 AND status = 'active' ORDER BY created_at DESC LIMIT 1",
    [videoId],
  );
  return rows.length > 0 ? rows[0] : null;
}

export async function updateUploadedParts(
  sessionId: string,
  uploadedParts: number,
): Promise<void> {
  await query(
    'UPDATE upload_sessions SET uploaded_parts = $1, updated_at = now() WHERE id = $2',
    [uploadedParts, sessionId],
  );
}

export async function completeUploadSession(sessionId: string): Promise<void> {
  await query(
    "UPDATE upload_sessions SET status = 'completed', updated_at = now() WHERE id = $1",
    [sessionId],
  );
}

export async function abortUploadSession(sessionId: string): Promise<void> {
  await query(
    "UPDATE upload_sessions SET status = 'aborted', updated_at = now() WHERE id = $1",
    [sessionId],
  );
}
