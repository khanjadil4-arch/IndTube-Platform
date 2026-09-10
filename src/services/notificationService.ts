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
