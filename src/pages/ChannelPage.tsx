import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { CheckCircle2, Bell, Share2 } from 'lucide-react';
import { mockChannels, mockVideos } from '@/data/mockData';
import VideoCard from '@/components/VideoCard';
import { formatCount, formatRelativeTime } from '@/lib/format';

export default function ChannelPage() {
  const { id } = useParams<{ id: string }>();
  const channel = mockChannels.find((c) => c.id === id);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [tab, setTab] = useState<'videos' | 'about'>('videos');

  if (!channel) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <p className="text-lg font-semibold text-ink-300">Channel not found</p>
        <Link to="/" className="text-brand-400 text-sm mt-2 hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  const videos = mockVideos.filter((v) => v.channelId === channel.id);

  return (
    <div>
      <div className="relative h-32 sm:h-48 bg-ink-800 overflow-hidden">
        <img
          src={channel.bannerUrl}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 to-transparent" />
      </div>

      <div className="px-3 sm:px-4 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-10 relative z-10">
          <img
            src={channel.avatarUrl}
            alt={channel.name}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-ink-950"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold">{channel.name}</h1>
              {channel.isVerified && <CheckCircle2 className="w-5 h-5 text-ink-400" />}
            </div>
            <p className="text-sm text-ink-400 mt-0.5">
              {channel.handle} · {formatCount(channel.subscriberCount)} subscribers · {channel.videoCount} videos
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsSubscribed((v) => !v)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                isSubscribed
                  ? 'bg-ink-800 text-ink-200 hover:bg-ink-700'
                  : 'bg-white text-ink-950 hover:bg-ink-200'
              }`}
            >
              {isSubscribed ? (
                <>
                  <Bell className="w-4 h-4" />
                  Subscribed
                </>
              ) : (
                'Subscribe'
              )}
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 bg-ink-900 border border-ink-800 rounded-full text-sm font-semibold hover:bg-ink-800 transition-colors">
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>

        <div className="flex gap-1 mt-4 border-b border-ink-800">
          {(['videos', 'about'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
                tab === t
                  ? 'border-brand-500 text-white'
                  : 'border-transparent text-ink-400 hover:text-ink-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'videos' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6 py-4">
            {videos.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
            {videos.length === 0 && (
              <p className="text-ink-500 text-sm py-10">No videos published yet.</p>
            )}
          </div>
        ) : (
          <div className="py-4 max-w-2xl">
            <p className="text-sm text-ink-200 leading-relaxed">{channel.description}</p>
            <p className="text-xs text-ink-500 mt-4">
              Channel created {formatRelativeTime(channel.createdAt)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
