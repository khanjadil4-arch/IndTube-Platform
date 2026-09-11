/**
 * Video service — creates video records, manages upload status, retrieves metadata.
 * All database access goes through the portable pg connection layer.
 */

import { query } from '../db/index.js';
import { randomUUID } from 'node:crypto';

export interface VideoRow {
  id: string;
  channel_id: string;
  category_id: string | null;
  title: string;
  description: string;
  visibility: string;
  status: string;
  duration_seconds: number;
  thumbnail_url: string | null;
  video_url: string | null;
  storage_key: string | null;
  view_count: string;
  like_count: string;
  dislike_count: string;
  comment_count: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

export interface SafeVideo {
  id: string;
  channelId: string;
  categoryId: string | null;
  title: string;
  description: string;
  visibility: string;
  status: string;
  durationSeconds: number;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  storageKey: string | null;
  viewCount: number;
  likeCount: number;
  dislikeCount: number;
  commentCount: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

function toSafeVideo(row: VideoRow): SafeVideo {
  return {
    id: row.id,
    channelId: row.channel_id,
    categoryId: row.category_id,
    title: row.title,
    description: row.description,
    visibility: row.visibility,
    status: row.status,
    durationSeconds: row.duration_seconds,
    thumbnailUrl: row.thumbnail_url,
    videoUrl: row.video_url,
    storageKey: row.storage_key,
    viewCount: Number(row.view_count),
    likeCount: Number(row.like_count),
    dislikeCount: Number(row.dislike_count),
    commentCount: row.comment_count,
    isPublished: row.is_published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
;
}

export async function getChannelByOwner(ownerId: string): Promise<{ id: string } | null> {
  const rows = await query<{ id: string }>(
    'SELECT id FROM channels WHERE owner_id = $1',
    [ownerId],
  );
  return rows.length > 0 ? rows[0] : null;
}

export function generateStorageKey(videoId: string, extension: string): string {
  return `videos/${videoId}/original.${extension}`;
}

export async function createVideoRecord(params: {
  channelId: string;
  categoryId: string | null;
  title: string;
  description: string;
  visibility: string;
  storageKey: string;
}): Promise<SafeVideo> {
  const rows = await query<VideoRow>(
    `INSERT INTO videos (channel_id, category_id, title, description, visibility, status, storage_key)
     VALUES ($1, $2, $3, $4, $5, 'UPLOADING', $6)
     RETURNING *`,
    [
      params.channelId,
      params.categoryId,
      params.title,
      params.description,
      params.visibility,
      params.storageKey,
    ],
  );
  return toSafeVideo(rows[0]);
}

export async function updateVideoStatus(
  videoId: string,
  status: string,
): Promise<void> {
  await query('UPDATE videos SET status = $1 WHERE id = $2', [status, videoId]);
}

export async function setVideoUrl(
  videoId: string,
  videoUrl: string,
): Promise<void> {
  await query('UPDATE videos SET video_url = $1 WHERE id = $2', [videoUrl, videoId]);
}

export async function getVideoById(videoId: string): Promise<SafeVideo | null> {
  const rows = await query<VideoRow>(
    'SELECT * FROM videos WHERE id = $1',
    [videoId],
  );
  return rows.length > 0 ? toSafeVideo(rows[0]) : null;
}

export async function getVideoWithChannel(
  videoId: string,
): Promise<{ video: SafeVideo; ownerId: string } | null> {
  const rows = await query<VideoRow & { owner_id: string }>(
    `SELECT v.*, c.owner_id FROM videos v
     JOIN channels c ON v.channel_id = c.id
     WHERE v.id = $1`,
    [videoId],
  );
  if (rows.length === 0) return null;
  const row = rows[0];
  return { video: toSafeVideo(row), ownerId: row.owner_id };
}

export function generateVideoId(): string {
  return randomUUID();
}
