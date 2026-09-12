/**
 * Creator service — analytics, video management, and dashboard data
 * for authenticated creators. All data is database-derived.
 *
 * Creators can only access their own channel's data. The channel is resolved
 * from the authenticated user's ID — never from a client-supplied channel ID.
 */

import { query } from '../db/index.js';
import { InteractionError } from './interactionService.js';

// ─── Channel resolution ──────────────────────────────────────────────────────

interface ChannelRow {
  id: string;
  name: string;
  handle: string;
  avatar_url: string | null;
  subscriber_count: number;
  video_count: number;
  [key: string]: unknown;
}

export async function getCreatorChannel(userId: string): Promise<ChannelRow | null> {
  const rows = await query<ChannelRow>(
    `SELECT id, name, handle, avatar_url, subscriber_count, video_count
     FROM channels WHERE owner_id = $1`,
    [userId],
  );
  return rows.length > 0 ? rows[0] : null;
}

async function requireChannel(userId: string): Promise<ChannelRow> {
  const channel = await getCreatorChannel(userId);
  if (!channel) {
    throw new InteractionError('You do not have a channel', 403);
  }
  return channel;
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface CreatorAnalytics {
  channel: {
    id: string;
    name: string;
    handle: string;
    avatarUrl: string | null;
    subscriberCount: number;
    videoCount: number;
  };
  totals: {
    views: number;
    likes: number;
    dislikes: number;
    comments: number;
  };
  topVideos: TopVideoRow[];
  recentStats: DailyStatRow[];
}

export interface TopVideoRow {
  id: string;
  title: string;
  thumbnail_url: string | null;
  view_count: number;
  like_count: number;
  comment_count: number;
  created_at: string;
  [key: string]: unknown;
}

export interface DailyStatRow {
  stat_date: string;
  total_views: number;
  new_subscribers: number;
  new_comments: number;
  new_likes: number;
  [key: string]: unknown;
}

export async function getCreatorAnalytics(userId: string): Promise<CreatorAnalytics> {
  const channel = await requireChannel(userId);

  const totalRows = await query<{
    views: string;
    likes: string;
    dislikes: string;
    comments: string;
  }>(
    `SELECT
       COALESCE(SUM(v.view_count), 0)::text AS views,
       COALESCE(SUM(v.like_count), 0)::text AS likes,
       COALESCE(SUM(v.dislike_count), 0)::text AS dislikes,
       COALESCE(SUM(v.comment_count), 0)::text AS comments
     FROM videos v
     WHERE v.channel_id = $1`,
    [channel.id],
  );

  const topVideos = await query<TopVideoRow>(
    `SELECT id, title, thumbnail_url, view_count, like_count, comment_count, created_at
     FROM videos
     WHERE channel_id = $1 AND status != 'REMOVED'
     ORDER BY view_count DESC
     LIMIT 10`,
    [channel.id],
  );

  const recentStats = await query<DailyStatRow>(
    `SELECT stat_date, total_views, new_subscribers, new_comments, new_likes
     FROM daily_channel_stats
     WHERE channel_id = $1
     ORDER BY stat_date DESC
     LIMIT 30`,
    [channel.id],
  );

  return {
    channel: {
      id: channel.id,
      name: channel.name,
      handle: channel.handle,
      avatarUrl: channel.avatar_url,
      subscriberCount: channel.subscriber_count,
      videoCount: channel.video_count,
    },
    totals: {
      views: Number(totalRows[0].views),
      likes: Number(totalRows[0].likes),
      dislikes: Number(totalRows[0].dislikes),
      comments: Number(totalRows[0].comments),
    },
    topVideos,
    recentStats,
  };
}

// ─── Creator video list ──────────────────────────────────────────────────────

export interface CreatorVideoRow {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  video_url: string | null;
  visibility: string;
  status: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  duration_seconds: number;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

export async function getCreatorVideos(
  userId: string,
  limit = 50,
  offset = 0,
): Promise<{ videos: CreatorVideoRow[]; total: number }> {
  const channel = await requireChannel(userId);

  const videos = await query<CreatorVideoRow>(
    `SELECT id, title, description, thumbnail_url, video_url,
       visibility, status, view_count, like_count, comment_count,
       duration_seconds, created_at, updated_at
     FROM videos
     WHERE channel_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [channel.id, limit, offset],
  );

  const countRows = await query<{ count: string }>(
    'SELECT count(*)::text FROM videos WHERE channel_id = $1',
    [channel.id],
  );

  return {
    videos,
    total: Number(countRows[0].count),
  };
}

// ─── Video management ────────────────────────────────────────────────────────

export async function updateCreatorVideo(
  userId: string,
  videoId: string,
  updates: {
    title?: string;
    description?: string;
    visibility?: string;
    categoryId?: string | null;
  },
): Promise<CreatorVideoRow> {
  const channel = await requireChannel(userId);

  // Verify ownership
  const existing = await query<{ channel_id: string }>(
    'SELECT channel_id FROM videos WHERE id = $1',
    [videoId],
  );
  if (existing.length === 0) {
    throw new InteractionError('Video not found', 404);
  }
  if (existing[0].channel_id !== channel.id) {
    throw new InteractionError('You do not own this video', 403);
  }

  const setClauses: string[] = [];
  const params: unknown[] = [];
  let paramIdx = 1;

  if (updates.title !== undefined) {
    const trimmed = updates.title.trim();
    if (trimmed.length === 0) {
      throw new InteractionError('Title cannot be empty', 400);
    }
    setClauses.push(`title = $${paramIdx++}`);
    params.push(trimmed);
  }
  if (updates.description !== undefined) {
    setClauses.push(`description = $${paramIdx++}`);
    params.push(updates.description.trim());
  }
  if (updates.visibility !== undefined) {
    const validVisibilities = ['PUBLIC', 'UNLISTED', 'PRIVATE'];
    if (!validVisibilities.includes(updates.visibility)) {
      throw new InteractionError('Invalid visibility value', 400);
    }
    setClauses.push(`visibility = $${paramIdx++}`);
    params.push(updates.visibility);
  }
  if (updates.categoryId !== undefined) {
    setClauses.push(`category_id = $${paramIdx++}`);
    params.push(updates.categoryId);
  }

  if (setClauses.length === 0) {
    throw new InteractionError('No fields to update', 400);
  }

  params.push(videoId);
  const rows = await query<CreatorVideoRow>(
    `UPDATE videos SET ${setClauses.join(', ')} WHERE id = $${paramIdx}
     RETURNING id, title, description, thumbnail_url, video_url,
       visibility, status, view_count, like_count, comment_count,
       duration_seconds, created_at, updated_at`,
    params,
  );
  return rows[0];
}

export async function deleteCreatorVideo(
  userId: string,
  videoId: string,
): Promise<void> {
  const channel = await requireChannel(userId);

  const existing = await query<{ channel_id: string }>(
    'SELECT channel_id FROM videos WHERE id = $1',
    [videoId],
  );
  if (existing.length === 0) {
    throw new InteractionError('Video not found', 404);
  }
  if (existing[0].channel_id !== channel.id) {
    throw new InteractionError('You do not own this video', 403);
  }

  await query("UPDATE videos SET status = 'REMOVED' WHERE id = $1", [videoId]);
}
