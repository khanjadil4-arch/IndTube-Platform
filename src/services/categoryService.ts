/**
 * Category service — data access layer for video categories and home tabs.
 */

import type { Category, HomeTab } from '@/types';
import { categories, homeTabs } from '@/data/mockData';
import { config } from '@/lib/config';
import { apiRequest } from './apiClient';

export async function getCategories(): Promise<Category[]> {
  if (config.useMockData) return categories;
  return apiRequest<Category[]>('/categories');
}

export async function getHomeTabs(): Promise<HomeTab[]> {
  if (config.useMockData) return homeTabs;
  return apiRequest<HomeTab[]>('/home-tabs');
}
