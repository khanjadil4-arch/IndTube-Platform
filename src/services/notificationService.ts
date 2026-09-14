/**
 * Notification service — data access layer for notifications.
 */

import type { Notification } from '@/types';
import { mockNotifications } from '@/data/mockData';
import { config } from '@/lib/config';
import { apiRequest } from './apiClient';

export async function getNotifications(): Promise<Notification[]> {
  if (config.useMockData) return mockNotifications;
  return apiRequest<Notification[]>('/notifications');
}

export async function markAllNotificationsRead(): Promise<void> {
  if (config.useMockData) return;
  await apiRequest<void>('/notifications/read-all', { method: 'POST' });
}

export async function getUnreadNotificationCount(): Promise<number> {
  if (config.useMockData) return mockNotifications.filter((n) => !n.read).length;
  const res = await apiRequest<{ count: number }>('/notifications/unread-count');
  return res.count;
}
