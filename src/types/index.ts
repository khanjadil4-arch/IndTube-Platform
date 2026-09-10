export type UserRole = 'owner' | 'admin' | 'creator' | 'viewer';

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  role: UserRole;
  bio: string;
  createdAt: string;
  subscriberCount: number;
  isVerified: boolean;
}

export interface Channel {
  id: string;
  ownerId: string;
  name: string;
  handle: string;
  avatarUrl: string;
  bannerUrl: string;
  description: string;
  subscriberCount: number;
  videoCount: number;
  createdAt: string;
  isVerified: boolean;
}

export interface Video {
  id: string;
  channelId: string;
  channelName: string;
  channelAvatarUrl: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  category: string;
  durationSeconds: number;
  viewCount: number;
  likeCount: number;
  dislikeCount: number;
  commentCount: number;
  createdAt: string;
  isPublished: boolean;
  subscriberCount?: number;
}

export interface Comment {
  id: string;
  videoId: string;
  authorName: string;
  authorAvatarUrl: string;
  text: string;
  likeCount: number;
  createdAt: string;
  replies: Comment[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Notification {
  id: string;
  type: 'subscribe' | 'like' | 'comment' | 'upload' | 'system';
  text: string;
  createdAt: string;
  read: boolean;
  avatarUrl?: string;
}

export type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed';
export type ReportTarget = 'video' | 'comment' | 'channel' | 'user';

export interface Report {
  id: string;
  target: ReportTarget;
  targetId: string;
  reason: string;
  status: ReportStatus;
  reporterName: string;
  createdAt: string;
}

export interface Short {
  id: string;
  channelId: string;
  channelName: string;
  channelAvatarUrl: string;
  title: string;
  thumbnailUrl: string;
  videoUrl: string;
  viewCount: number;
  likeCount: number;
  durationSeconds: number;
  createdAt: string;
}

export interface HomeTab {
  id: string;
  name: string;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  thumbnailUrl?: string;
  searchedAt: string;
}

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'video' | 'channel' | 'short' | 'topic';
  thumbnailUrl?: string;
}
