/**
 * Search service — data access layer for search history and suggestions.
 *
 * Search history is kept in memory during the mock phase. When a real backend
 * is connected, these methods will call the API for per-user search history.
 */

import type { SearchHistoryItem, SearchSuggestion } from '@/types';
import { mockSearchHistory, mockSearchSuggestions } from '@/data/searchData';
import { config } from '@/lib/config';
import { apiRequest } from './apiClient';

export async function getSearchHistory(): Promise<SearchHistoryItem[]> {
  if (config.useMockData) return mockSearchHistory;
  return apiRequest<SearchHistoryItem[]>('/search/history');
}

export async function clearSearchHistory(): Promise<void> {
  if (config.useMockData) return;
  await apiRequest<void>('/search/history', { method: 'DELETE' });
}

export async function removeSearchHistoryItem(id: string): Promise<void> {
  if (config.useMockData) return;
  await apiRequest<void>(`/search/history/${id}`, { method: 'DELETE' });
}

export function getSuggestions(query: string): SearchSuggestion[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return mockSearchSuggestions.filter((s) => s.text.toLowerCase().includes(q));
}
