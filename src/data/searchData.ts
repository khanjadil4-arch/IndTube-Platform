import type { SearchHistoryItem, SearchSuggestion } from '@/types';

export const mockSearchHistory: SearchHistoryItem[] = [
  {
    id: 'h1',
    query: 'react typescript tutorial',
    thumbnailUrl: 'https://images.pexels.com/photos/4955393/pexels-photo-4955393.jpeg?auto=compress&cs=tinysrgb&h=80&w=120',
    searchedAt: '2025-09-07T10:00:00Z',
  },
  {
    id: 'h2',
    query: 'live concert sunset',
    thumbnailUrl: 'https://images.pexels.com/photos/4218027/pexels-photo-4218027.jpeg?auto=compress&cs=tinysrgb&h=80&w=120',
    searchedAt: '2025-09-06T18:00:00Z',
  },
  {
    id: 'h3',
    query: 'esports highlights',
    thumbnailUrl: 'https://images.pexels.com/photos/9072317/pexels-photo-9072317.jpeg?auto=compress&cs=tinysrgb&h=80&w=120',
    searchedAt: '2025-09-05T20:00:00Z',
  },
  {
    id: 'h4',
    query: 'pasta recipe quick',
    thumbnailUrl: 'https://images.pexels.com/photos/8845419/pexels-photo-8845419.jpeg?auto=compress&cs=tinysrgb&h=80&w=120',
    searchedAt: '2025-09-04T09:00:00Z',
  },
  {
    id: 'h5',
    query: 'javascript async await',
    searchedAt: '2025-09-03T14:00:00Z',
  },
];

export const mockSearchSuggestions: SearchSuggestion[] = [
  { id: 'sg1', text: 'react typescript tutorial', type: 'topic' },
  { id: 'sg2', text: 'react app from scratch', type: 'video', thumbnailUrl: 'https://images.pexels.com/photos/4955393/pexels-photo-4955393.jpeg?auto=compress&cs=tinysrgb&h=80&w=120' },
  { id: 'sg3', text: 'css grid flexbox guide', type: 'video', thumbnailUrl: 'https://images.pexels.com/photos/256502/pexels-photo-256502.jpeg?auto=compress&cs=tinysrgb&h=80&w=120' },
  { id: 'sg4', text: 'live concert full film', type: 'video', thumbnailUrl: 'https://images.pexels.com/photos/4218027/pexels-photo-4218027.jpeg?auto=compress&cs=tinysrgb&h=80&w=120' },
  { id: 'sg5', text: 'acoustic guitar session', type: 'video', thumbnailUrl: 'https://images.pexels.com/photos/7715347/pexels-photo-7715347.jpeg?auto=compress&cs=tinysrgb&h=80&w=120' },
  { id: 'sg6', text: 'esports championship highlights', type: 'video', thumbnailUrl: 'https://images.pexels.com/photos/9072317/pexels-photo-9072317.jpeg?auto=compress&cs=tinysrgb&h=80&w=120' },
  { id: 'sg7', text: 'gaming setup tour rgb', type: 'video', thumbnailUrl: 'https://images.pexels.com/photos/9072394/pexels-photo-9072394.jpeg?auto=compress&cs=tinysrgb&h=80&w=120' },
  { id: 'sg8', text: 'sourdough bread baking guide', type: 'video', thumbnailUrl: 'https://images.pexels.com/photos/30926953/pexels-photo-30926953.jpeg?auto=compress&cs=tinysrgb&h=80&w=120' },
  { id: 'sg9', text: 'javascript async patterns', type: 'video', thumbnailUrl: 'https://images.pexels.com/photos/31177212/pexels-photo-31177212.jpeg?auto=compress&cs=tinysrgb&h=80&w=120' },
  { id: 'sg10', text: 'weeknight pasta 15 minutes', type: 'video', thumbnailUrl: 'https://images.pexels.com/photos/8845419/pexels-photo-8845419.jpeg?auto=compress&cs=tinysrgb&h=80&w=120' },
  { id: 'sg11', text: 'top 10 plays gaming', type: 'video', thumbnailUrl: 'https://images.pexels.com/photos/9072216/pexels-photo-9072216.jpeg?auto=compress&cs=tinysrgb&h=80&w=120' },
  { id: 'sg12', text: 'knife skills cooking', type: 'video', thumbnailUrl: 'https://images.pexels.com/photos/13422410/pexels-photo-13422410.jpeg?auto=compress&cs=tinysrgb&h=80&w=120' },
  { id: 'sg13', text: 'CodeCraft', type: 'channel', thumbnailUrl: 'https://images.pexels.com/photos/9181434/pexels-photo-9181434.jpeg?auto=compress&cs=tinysrgb&h=80&w=80' },
  { id: 'sg14', text: 'SoundWave', type: 'channel', thumbnailUrl: 'https://images.pexels.com/photos/31530222/pexels-photo-31530222.jpeg?auto=compress&cs=tinysrgb&h=80&w=80' },
  { id: 'sg15', text: 'PixelPlay', type: 'channel', thumbnailUrl: 'https://images.pexels.com/photos/10147223/pexels-photo-10147223.jpeg?auto=compress&cs=tinysrgb&h=80&w=80' },
];
