/**
 * Channel service — data access layer for channels.
 */

import type { Channel } from '@/types';
import { mockChannels } from '@/data/mockData';
import { config } from '@/lib/config';
import { apiRequest } from './apiClient';

export async function getChannels(): Promise<Channel[]> {
  if (config.useMockData) return mockChannels;
  return apiRequest<Channel[]>('/channels');
}

export async function getChannelById(id: string): Promise<Channel | null> {
  if (config.useMockData) return mockChannels.find((c) => c.id === id) ?? null;
  return apiRequest<Channel | null>(`/channels/${id}`);
}

export function searchChannels(query: string): Channel[] {
  const q = query.toLowerCase();
  return mockChannels.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.handle.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q),
  );
}
