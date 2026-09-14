/**
 * Notification service — stores, retrieves, and manages user notifications.
 * All queries are parameterized. Users can only access their own notifications.
 */

import { query } from '../db/index.js';

export interface NotificationRow {
  id: string;
  user_id: string;
  type: string;
  title: string | null;
  message: string | null;
  actor_user_id: string | null;
  actor_name: string | null;
  actor_avatar_url: string | null;
  link_url: string | null;
  is_read: boolean;
  created_at: string;
  [key: string]: unknown;
}

export async function getNotifications(
  userId: string,
  limit = 20,
  offset = 0,
): Promise<{ notifications: NotificationRow[]; total: number }> {
  const notifications = await query<NotificationRow>(
    `SELECT
       n.id, n.user_id, n.type, n.title, n.message,
       n.actor_user_id, n.actor_name, n.actor_avatar_url,
       n.link_url, n.is_read, n.created_at
     FROM notifications n
     WHERE n.user_id = $1
     ORDER BY n.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset],
  );

  const countRows = await query<{ count: string }>(
    'SELECT count(*)::text FROM notifications WHERE user_id = $1',
    [userId],
  );

  return {
    notifications,
    total: Number(countRows[0].count),
  };
}

export async function getUnreadCount(userId: string): Promise<number> {
  const rows = await query<{ count: string }>(
    'SELECT count(*)::text FROM notifications WHERE user_id = $1 AND is_read = FALSE',
    [userId],
  );
  return Number(rows[0].count);
}

export async function markAsRead(
  userId: string,
  notificationId: string,
): Promise<void> {
  const result = await query(
    'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2 RETURNING id',
    [notificationId, userId],
  );
  if (result.length === 0) {
    // No row updated — either doesn't exist or doesn't belong to user
    throw new NotificationError('Notification not found', 404);
  }
}

export async function markAllAsRead(userId: string): Promise<void> {
  await query(
    'UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE',
    [userId],
  );
}

export async function deleteNotification(
  userId: string,
  notificationId: string,
): Promise<void> {
  const result = await query(
    'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id',
    [notificationId, userId],
  );
  if (result.length === 0) {
    throw new NotificationError('Notification not found', 404);
  }
}

// ─── Internal: create notifications from interactions ────────────────────────

export async function createNotification(params: {
  userId: string;
  type: 'SUBSCRIBE' | 'COMMENT' | 'LIKE' | 'UPLOAD' | 'SYSTEM';
  title?: string;
  message?: string;
  actorUserId?: string | null;
  actorName?: string | null;
  actorAvatarUrl?: string | null;
  linkUrl?: string | null;
}): Promise<void> {
  // Don't create self-notifications
  if (params.actorUserId && params.actorUserId === params.userId) return;

  await query(
    `INSERT INTO notifications (user_id, type, title, message, actor_user_id, actor_name, actor_avatar_url, link_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      params.userId,
      params.type,
      params.title ?? null,
      params.message ?? null,
      params.actorUserId ?? null,
      params.actorName ?? null,
      params.actorAvatarUrl ?? null,
      params.linkUrl ?? null,
    ],
  );
}

export class NotificationError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = 'NotificationError';
  }
}
