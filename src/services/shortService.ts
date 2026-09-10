/**
 * Short service — data access layer for Shorts.
 */

import type { Short } from '@/types';
import { mockShorts } from '@/data/mockData';
import { config } from '@/lib/config';
import { apiRequest } from './apiClient';

export async function getShorts(): Promise<Short[]> {
  if (config.useMockData) return mockShorts;
  return apiRequest<Short[]>('/shorts');
}

export function searchShorts(query: string): Short[] {
  const q = query.toLowerCase();
  return mockShorts.filter(
    (s) => s.title.toLowerCase().includes(q) || s.channelName.toLowerCase().includes(q),
  );
}
