import { Link } from 'react-router-dom';
import { Bell, CheckCircle2 } from 'lucide-react';
import { mockChannels, mockVideos } from '@/data/mockData';
import VideoCard from '@/components/VideoCard';
import { formatCount } from '@/lib/format';

export default function SubscriptionsPage() {
  const subscribedChannels = mockChannels.slice(0, 3);
  const recentUploads = mockVideos
    .filter((v) => subscribedChannels.some((c) => c.id === v.channelId))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="px-3 sm:px-4 py-4 max-w-6xl mx-auto">
      <h1 className="text-lg font-bold mb-4">Subscriptions</h1>

      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 mb-4">
        {subscribedChannels.map((c) => (
          <Link
            key={c.id}
            to={`/channel/${c.id}`}
            className="flex flex-col items-center gap-2 shrink-0 w-20"
          >
            <img src={c.avatarUrl} alt={c.name} className="w-16 h-16 rounded-full object-cover" />
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium truncate max-w-[72px]">{c.name}</span>
              {c.isVerified && <CheckCircle2 className="w-3 h-3 text-ink-500 shrink-0" />}
            </div>
          </Link>
        ))}
      </div>

      <div className="border-t border-ink-800 pt-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-ink-400 mb-3">
          Latest from your subscriptions
        </h2>
        {recentUploads.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6">
            {recentUploads.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-ink-500">
            <Bell className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">You haven't subscribed to any channels yet.</p>
            <p className="text-xs mt-1">
              {formatCount(0)} subscriptions
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
