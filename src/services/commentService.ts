/**
 * Comment service — data access layer for video comments.
 */

import type { Comment } from '@/types';
import { mockComments } from '@/data/mockData';
import { config } from '@/lib/config';
import { apiRequest } from './apiClient';

export async function getComments(videoId: string): Promise<Comment[]> {
  if (config.useMockData) return mockComments.filter((c) => c.videoId === videoId);
  return apiRequest<Comment[]>(`/videos/${videoId}/comments`);
}
