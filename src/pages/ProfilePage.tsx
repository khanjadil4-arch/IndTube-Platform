import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Settings, Shield, Film, Heart, Clock, Bell } from 'lucide-react';
import { mockUsers, mockVideos } from '@/data/mockData';
import VideoCard from '@/components/VideoCard';
import { formatCount, formatRelativeTime } from '@/lib/format';

export default function ProfilePage() {
  const user = mockUsers[5]; // Regular Viewer
  const [tab, setTab] = useState<'videos' | 'liked' | 'history'>('videos');

  const likedVideos = mockVideos.slice(2, 5);
  const historyVideos = mockVideos.slice(0, 4);
  const userVideos: typeof mockVideos = [];

  const tabs = [
    { id: 'videos' as const, label: 'Uploads', icon: Film, count: userVideos.length },
    { id: 'liked' as const, label: 'Liked', icon: Heart, count: likedVideos.length },
    { id: 'history' as const, label: 'History', icon: Clock, count: historyVideos.length },
  ];

  const currentVideos = tab === 'videos' ? userVideos : tab === 'liked' ? likedVideos : historyVideos;

  return (
    <div>
      <div className="relative h-28 sm:h-36 bg-gradient-to-r from-ink-800 to-ink-900" />

      <div className="px-3 sm:px-4 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 sm:-mt-8 relative z-10">
          <img
            src={user.avatarUrl}
            alt={user.displayName}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-ink-950"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold">{user.displayName}</h1>
              {user.isVerified && <CheckCircle2 className="w-5 h-5 text-ink-400" />}
            </div>
            <p className="text-sm text-ink-400 mt-0.5">
              @{user.username} · {formatCount(user.subscriberCount)} subscribers
            </p>
            <p className="text-xs text-ink-500 mt-1">
              Joined {formatRelativeTime(user.createdAt)}
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 px-4 py-2 bg-ink-900 border border-ink-800 rounded-full text-sm font-semibold hover:bg-ink-800 transition-colors">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </button>
            <Link
              to="/admin"
              className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white rounded-full text-sm font-semibold hover:bg-brand-500 transition-colors"
            >
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          </div>
        </div>

        <p className="text-sm text-ink-300 mt-4 max-w-2xl">{user.bio}</p>

        <div className="flex gap-1 mt-5 border-b border-ink-800 overflow-x-auto scrollbar-hide">
          {tabs.map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                tab === id
                  ? 'border-brand-500 text-white'
                  : 'border-transparent text-ink-400 hover:text-ink-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              <span className="text-xs text-ink-500">{count}</span>
            </button>
          ))}
        </div>

        <div className="py-4">
          {currentVideos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6">
              {currentVideos.map((v) => (
                <VideoCard key={v.id} video={v} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-ink-500">
              <Bell className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Nothing here yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
