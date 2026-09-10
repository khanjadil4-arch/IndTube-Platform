/**
 * Video service — data access layer for videos.
 *
 * Currently returns mock data. When `VITE_API_BASE_URL` is set, the methods
 * will call your own backend instead. Pages and components import from here
 * (not from mockData directly), so swapping to a real API later only requires
 * updating this file.
 */

import type { Video } from '@/types';
import { mockVideos } from '@/data/mockData';
import { config } from '@/lib/config';
import { apiRequest } from './apiClient';

export async function getVideos(): Promise<Video[]> {
  if (config.useMockData) return mockVideos;
  return apiRequest<Video[]>('/videos');
}

export async function getVideoById(id: string): Promise<Video | null> {
  if (config.useMockData) return mockVideos.find((v) => v.id === id) ?? null;
  return apiRequest<Video | null>(`/videos/${id}`);
}

export async function getVideosByChannel(channelId: string): Promise<Video[]> {
  if (config.useMockData) return mockVideos.filter((v) => v.channelId === channelId);
  return apiRequest<Video[]>(`/channels/${channelId}/videos`);
}

export async function getVideosByCategory(category: string): Promise<Video[]> {
  if (config.useMockData) {
    return category === 'all'
      ? mockVideos
      : mockVideos.filter((v) => v.category === category);
  }
  return apiRequest<Video[]>(`/videos?category=${encodeURIComponent(category)}`);
}

export function searchVideos(query: string): Video[] {
  const q = query.toLowerCase();
  return mockVideos.filter(
    (v) =>
      v.title.toLowerCase().includes(q) ||
      v.description.toLowerCase().includes(q) ||
      v.channelName.toLowerCase().includes(q) ||
      v.category.toLowerCase().includes(q),
  );
}
