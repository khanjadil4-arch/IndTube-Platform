/**
 * User service — data access layer for users.
 */

import type { User } from '@/types';
import { mockUsers } from '@/data/mockData';
import { config } from '@/lib/config';
import { apiRequest } from './apiClient';

export async function getUsers(): Promise<User[]> {
  if (config.useMockData) return mockUsers;
  return apiRequest<User[]>('/users');
}

export async function getUserById(id: string): Promise<User | null> {
  if (config.useMockData) return mockUsers.find((u) => u.id === id) ?? null;
  return apiRequest<User | null>(`/users/${id}`);
}
