/**
 * Report service — data access layer for admin moderation reports.
 */

import type { Report } from '@/types';
import { mockReports } from '@/data/mockData';
import { config } from '@/lib/config';
import { apiRequest } from './apiClient';

export async function getReports(): Promise<Report[]> {
  if (config.useMockData) return mockReports;
  return apiRequest<Report[]>('/reports');
}
