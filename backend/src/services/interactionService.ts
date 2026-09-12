/**
 * Interaction service — video likes/dislikes, subscriptions, comments,
 * comment likes, video views, and watch history.
 *
 * All database access uses parameterized queries through the portable pg layer.
 * Counts are always derived from database state, never set directly by callers.
 */

import { query, withTransaction, getPool, type PoolClient } from '../db/index.js';
import { createNotification } from './notificationService.js';

// ─── Video Likes / Dislikes ──────────────────────────────────────────────────

export interface VideoReactionResult {
  reaction: 'LIKE' | 'DISLIKE' | null;
  likeCount: number;
  dislikeCount: number;
}

export async function setVideoReaction(
  userId: string,
  videoId: string,
  state: 'LIKE' | 'DISLIKE',
): Promise<VideoReactionResult> {
  return withTransaction(async (client) => {
    await client.query(
      `INSERT INTO video_likes (user_id, video_id, state)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, video_id)
       DO UPDATE SET state = EXCLUDED.state`,
      [userId, videoId, state],
    );
    return await getVideoReactionCounts(client, userId, videoId);
  });
}

export async function removeVideoReaction(
  userId: string,
  videoId: string,
): Promise<VideoReactionResult> {
  return withTransaction(async (client) => {
    await client.query(
      'DELETE FROM video_likes WHERE user_id = $1 AND video_id = $2',
      [userId, videoId],
    );
    return await getVideoReactionCounts(client, userId, videoId);
  });
}

export async function getVideoReaction(
  userId: string,
  videoId: string,
): Promise<VideoReactionResult> {
  const client = getPool().connect();
  return getVideoReactionCounts(await client, userId, videoId);
}

async function getVideoReactionCounts(
  client: PoolClient,
  userId: string,
  videoId: string,
): Promise<VideoReactionResult> {
  const reactionRows = await client.query(
    'SELECT state FROM video_likes WHERE user_id = $1 AND video_id = $2',
    [userId, videoId],
  );
  const countRows = await client.query(
    `SELECT
       (SELECT count(*) FROM video_likes WHERE video_id = $1 AND state = 'LIKE') AS likes,
       (SELECT count(*) FROM video_likes WHERE video_id = $1 AND state = 'DISLIKE') AS dislikes`,
    [videoId],
  );
  return {
    reaction: reactionRows.rows.length > 0 ? reactionRows.rows[0].state : null,
    likeCount: Number(countRows.rows[0].likes),
    dislikeCount: Number(countRows.rows[0].dislikes),
  };
}

// ─── Subscriptions ───────────────────────────────────────────────────────────

export interface SubscriptionResult {
  subscribed: boolean;
  subscriberCount: number;
}

export async function subscribe(
  userId: string,
  channelId: string,
): Promise<SubscriptionResult> {
  const channelRows = await query<{ owner_id: string; name: string }>(
    'SELECT owner_id, name FROM channels WHERE id = $1',
    [channelId],
  );
  if (channelRows.length === 0) {
    throw new InteractionError('Channel not found', 404);
  }
  if (channelRows[0].owner_id === userId) {
    throw new InteractionError('Cannot subscribe to your own channel', 400);
  }

  // Check if already subscribed to avoid duplicate notifications
  const existing = await query<{ id: string }>(
    'SELECT id FROM subscriptions WHERE subscriber_id = $1 AND channel_id = $2',
    [userId, channelId],
  );

  await query(
    `INSERT INTO subscriptions (subscriber_id, channel_id)
     VALUES ($1, $2)
     ON CONFLICT (subscriber_id, channel_id) DO NOTHING`,
    [userId, channelId],
  );

  // Create notification for channel owner (only on new subscription)
  if (existing.length === 0) {
    const actorRows = await query<{ display_name: string; avatar_url: string | null }>(
      'SELECT display_name, avatar_url FROM users WHERE id = $1',
      [userId],
    );
    if (actorRows.length > 0) {
      await createNotification({
        userId: channelRows[0].owner_id,
        type: 'SUBSCRIBE',
        message: `${actorRows[0].display_name} subscribed to your channel`,
        actorUserId: userId,
        actorName: actorRows[0].display_name,
        actorAvatarUrl: actorRows[0].avatar_url,
        linkUrl: `/channel/${channelId}`,
      });
    }
  }

  return getSubscriptionStatus(userId, channelId);
}

export async function unsubscribe(
  userId: string,
  channelId: string,
): Promise<SubscriptionResult> {
  await query(
    'DELETE FROM subscriptions WHERE subscriber_id = $1 AND channel_id = $2',
    [userId, channelId],
  );
  return getSubscriptionStatus(userId, channelId);
}

export async function getSubscriptionStatus(
  userId: string,
  channelId: string,
): Promise<SubscriptionResult> {
  const rows = await query<{ subscribed: boolean; count: string }>(
    `SELECT
       EXISTS(SELECT 1 FROM subscriptions WHERE subscriber_id = $1 AND channel_id = $2) AS subscribed,
       (SELECT count(*)::text FROM subscriptions WHERE channel_id = $2) AS count`,
    [userId, channelId],
  );
  if (rows.length === 0) {
    return { subscribed: false, subscriberCount: 0 };
  }
  return {
    subscribed: rows[0].subscribed,
    subscriberCount: Number(rows[0].count),
  };
}

// ─── Comments ────────────────────────────────────────────────────────────────

export interface CommentRow {
  id: string;
  video_id: string;
  user_id: string;
  author_name: string;
  author_avatar: string | null;
  text: string;
  like_count: number;
  is_pinned: boolean;
  parent_comment_id: string | null;
  created_at: string;
  updated_at: string;
  liked_by_user: boolean;
  reply_count: number;
  [key: string]: unknown;
}

function commentSelect(userId: string): string {
  return `
    SELECT
      c.id, c.video_id, c.user_id, c.text, c.like_count,
      c.is_pinned, c.parent_comment_id, c.created_at, c.updated_at,
      u.display_name AS author_name,
      u.avatar_url AS author_avatar,
      EXISTS(SELECT 1 FROM comment_likes WHERE comment_id = c.id AND user_id = $2) AS liked_by_user,
      (SELECT count(*)::int FROM comments r WHERE r.parent_comment_id = c.id AND r.is_removed = FALSE) AS reply_count
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.is_removed = FALSE
  `;
}

export async function getCommentsByVideo(
  userId: string | null,
  videoId: string,
): Promise<CommentRow[]> {
  if (userId) {
    const rows = await query<CommentRow>(
      `${commentSelect(userId)} AND c.video_id = $1 AND c.parent_comment_id IS NULL
       ORDER BY c.is_pinned DESC, c.created_at DESC`,
      [videoId, userId],
    );
    return rows;
  }
  const rows = await query<CommentRow>(
    `SELECT
      c.id, c.video_id, c.user_id, c.text, c.like_count,
      c.is_pinned, c.parent_comment_id, c.created_at, c.updated_at,
      u.display_name AS author_name,
      u.avatar_url AS author_avatar,
      FALSE AS liked_by_user,
      (SELECT count(*)::int FROM comments r WHERE r.parent_comment_id = c.id AND r.is_removed = FALSE) AS reply_count
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.is_removed = FALSE AND c.video_id = $1 AND c.parent_comment_id IS NULL
    ORDER BY c.is_pinned DESC, c.created_at DESC`,
    [videoId],
  );
  return rows;
}

export async function getReplies(
  userId: string | null,
  parentId: string,
): Promise<CommentRow[]> {
  if (userId) {
    const rows = await query<CommentRow>(
      `${commentSelect(userId)} AND c.parent_comment_id = $1
       ORDER BY c.created_at ASC`,
      [parentId, userId],
    );
    return rows;
  }
  const rows = await query<CommentRow>(
    `SELECT
      c.id, c.video_id, c.user_id, c.text, c.like_count,
      c.is_pinned, c.parent_comment_id, c.created_at, c.updated_at,
      u.display_name AS author_name,
      u.avatar_url AS author_avatar,
      FALSE AS liked_by_user,
      0 AS reply_count
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.is_removed = FALSE AND c.parent_comment_id = $1
    ORDER BY c.created_at ASC`,
    [parentId],
  );
  return rows;
}

export async function createComment(
  userId: string,
  videoId: string,
  text: string,
  parentCommentId: string | null,
): Promise<CommentRow> {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    throw new InteractionError('Comment cannot be empty', 400);
  }
  if (trimmed.length > 2000) {
    throw new InteractionError('Comment is too long (max 2000 characters)', 400);
  }

  let parentAuthorId: string | null = null;
  if (parentCommentId) {
    const parent = await query<{ video_id: string; user_id: string }>(
      'SELECT video_id, user_id FROM comments WHERE id = $1 AND is_removed = FALSE',
      [parentCommentId],
    );
    if (parent.length === 0) {
      throw new InteractionError('Parent comment not found', 404);
    }
    if (parent[0].video_id !== videoId) {
      throw new InteractionError('Parent comment does not belong to this video', 400);
    }
    parentAuthorId = parent[0].user_id;
  }

  const rows = await query<CommentRow>(
    `INSERT INTO comments (video_id, user_id, text, parent_comment_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id, video_id, user_id, text, like_count, is_pinned,
       parent_comment_id, created_at, updated_at`,
    [videoId, userId, trimmed, parentCommentId],
  );

  const userRows = await query<{ display_name: string; avatar_url: string | null }>(
    'SELECT display_name, avatar_url FROM users WHERE id = $1',
    [userId],
  );

  // Create notifications
  const actorName = userRows[0].display_name;
  const actorAvatar = userRows[0].avatar_url;

  if (parentCommentId && parentAuthorId) {
    // Reply notification to parent comment author
    await createNotification({
      userId: parentAuthorId,
      type: 'COMMENT',
      message: `${actorName} replied to your comment`,
      actorUserId: userId,
      actorName,
      actorAvatarUrl: actorAvatar,
      linkUrl: `/watch/${videoId}`,
    });
  } else {
    // Comment notification to video owner
    const videoOwner = await query<{ owner_id: string }>(
      `SELECT c.owner_id FROM videos v JOIN channels c ON v.channel_id = c.id WHERE v.id = $1`,
      [videoId],
    );
    if (videoOwner.length > 0) {
      await createNotification({
        userId: videoOwner[0].owner_id,
        type: 'COMMENT',
        message: `${actorName} commented on your video`,
        actorUserId: userId,
        actorName,
        actorAvatarUrl: actorAvatar,
        linkUrl: `/watch/${videoId}`,
      });
    }
  }

  return {
    ...rows[0],
    author_name: actorName,
    author_avatar: actorAvatar,
    liked_by_user: false,
    reply_count: 0,
  };
}

export async function updateComment(
  userId: string,
  commentId: string,
  text: string,
  userRole: string,
): Promise<CommentRow> {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    throw new InteractionError('Comment cannot be empty', 400);
  }
  if (trimmed.length > 2000) {
    throw new InteractionError('Comment is too long (max 2000 characters)', 400);
  }

  const existing = await query<{ user_id: string }>(
    'SELECT user_id FROM comments WHERE id = $1 AND is_removed = FALSE',
    [commentId],
  );
  if (existing.length === 0) {
    throw new InteractionError('Comment not found', 404);
  }
  if (existing[0].user_id !== userId && userRole !== 'ADMIN' && userRole !== 'OWNER') {
    throw new InteractionError('You can only edit your own comments', 403);
  }

  const rows = await query<CommentRow>(
    `UPDATE comments SET text = $1 WHERE id = $2
     RETURNING id, video_id, user_id, text, like_count, is_pinned,
       parent_comment_id, created_at, updated_at`,
    [trimmed, commentId],
  );

  const userRows = await query<{ display_name: string; avatar_url: string | null }>(
    'SELECT display_name, avatar_url FROM users WHERE id = $1',
    [rows[0].user_id],
  );

  return {
    ...rows[0],
    author_name: userRows[0].display_name,
    author_avatar: userRows[0].avatar_url,
    liked_by_user: false,
    reply_count: 0,
  };
}

export async function deleteComment(
  userId: string,
  commentId: string,
  userRole: string,
): Promise<void> {
  const existing = await query<{ user_id: string }>(
    'SELECT user_id FROM comments WHERE id = $1 AND is_removed = FALSE',
    [commentId],
  );
  if (existing.length === 0) {
    throw new InteractionError('Comment not found', 404);
  }
  if (existing[0].user_id !== userId && userRole !== 'ADMIN' && userRole !== 'OWNER') {
    throw new InteractionError('You can only delete your own comments', 403);
  }

  await query('DELETE FROM comments WHERE id = $1', [commentId]);
}

// ─── Comment Likes ───────────────────────────────────────────────────────────

export async function toggleCommentLike(
  userId: string,
  commentId: string,
): Promise<{ liked: boolean; likeCount: number }> {
  const existing = await query<{ id: string }>(
    'SELECT id FROM comment_likes WHERE user_id = $1 AND comment_id = $2',
    [userId, commentId],
  );

  if (existing.length > 0) {
    await query('DELETE FROM comment_likes WHERE user_id = $1 AND comment_id = $2', [
      userId,
      commentId,
    ]);
  } else {
    await query(
      'INSERT INTO comment_likes (user_id, comment_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [userId, commentId],
    );
  }

  const countRows = await query<{ like_count: number }>(
    'SELECT like_count FROM comments WHERE id = $1',
    [commentId],
  );
  return {
    liked: existing.length === 0,
    likeCount: countRows.length > 0 ? countRows[0].like_count : 0,
  };
}

// ─── Video Views ─────────────────────────────────────────────────────────────

const VIEW_DEDUP_WINDOW_MINUTES = 5;

export async function recordVideoView(
  videoId: string,
  userId: string | null,
  sessionHash: string | null,
): Promise<{ viewCount: number; counted: boolean }> {
  if (!userId && !sessionHash) {
    throw new InteractionError('Either userId or sessionHash is required', 400);
  }

  const windowStart = new Date(Date.now() - VIEW_DEDUP_WINDOW_MINUTES * 60 * 1000);

  let dedupCheck: { id: string }[];
  if (userId) {
    dedupCheck = await query<{ id: string }>(
      `SELECT id FROM video_view_events
        WHERE video_id = $1 AND user_id = $2 AND created_at > $3
        LIMIT 1`,
      [videoId, userId, windowStart],
    );
  } else {
    dedupCheck = await query<{ id: string }>(
      `SELECT id FROM video_view_events
        WHERE video_id = $1 AND session_hash = $2 AND created_at > $3
        LIMIT 1`,
      [videoId, sessionHash, windowStart],
    );
  }

  const counted = dedupCheck.length === 0;

  if (counted) {
    await query(
      `INSERT INTO video_view_events (video_id, user_id, session_hash)
       VALUES ($1, $2, $3)`,
      [videoId, userId, sessionHash],
    );
    await query(
      `UPDATE videos SET view_count = view_count + 1 WHERE id = $1`,
      [videoId],
    );
  }

  const videoRows = await query<{ view_count: string }>(
    'SELECT view_count::text FROM videos WHERE id = $1',
    [videoId],
  );
  return {
    viewCount: videoRows.length > 0 ? Number(videoRows[0].view_count) : 0,
    counted,
  };
}

// ─── Watch History ───────────────────────────────────────────────────────────

export interface HistoryRow {
  id: string;
  video_id: string;
  title: string;
  thumbnail_url: string | null;
  channel_name: string;
  channel_avatar_url: string | null;
  duration_seconds: number;
  watched_position: number;
  last_watched_at: string;
  [key: string]: unknown;
}

export async function getWatchHistory(userId: string): Promise<HistoryRow[]> {
  return query<HistoryRow>(
    `SELECT
       wh.id, wh.video_id, wh.watched_position, wh.last_watched_at,
       v.title, v.thumbnail_url, v.duration_seconds,
       c.name AS channel_name,
       c.avatar_url AS channel_avatar_url
     FROM watch_history wh
     JOIN videos v ON wh.video_id = v.id
     JOIN channels c ON v.channel_id = c.id
     WHERE wh.user_id = $1
     ORDER BY wh.last_watched_at DESC
     LIMIT 100`,
    [userId],
  );
}

export async function upsertWatchProgress(
  userId: string,
  videoId: string,
  watchedPosition: number,
): Promise<void> {
  const position = Math.max(0, Math.floor(watchedPosition));

  await query(
    `INSERT INTO watch_history (user_id, video_id, watched_position, last_watched_at)
     VALUES ($1, $2, $3, now())
     ON CONFLICT (user_id, video_id)
     DO UPDATE SET watched_position = EXCLUDED.watched_position,
                   last_watched_at = now()`,
    [userId, videoId, position],
  );
}

export async function deleteHistoryEntry(userId: string, videoId: string): Promise<void> {
  await query(
    'DELETE FROM watch_history WHERE user_id = $1 AND video_id = $2',
    [userId, videoId],
  );
}

export async function clearWatchHistory(userId: string): Promise<void> {
  await query('DELETE FROM watch_history WHERE user_id = $1', [userId]);
}

// ─── Error ───────────────────────────────────────────────────────────────────

export class InteractionError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = 'InteractionError';
  }
}
