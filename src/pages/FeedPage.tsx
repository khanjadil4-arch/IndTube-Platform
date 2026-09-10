import { Flame } from 'lucide-react';
import { mockVideos } from '@/data/mockData';
import VideoCard from '@/components/VideoCard';

export default function FeedPage() {
  const trending = [...mockVideos].sort((a, b) => b.viewCount - a.viewCount);

  return (
    <div className="px-3 sm:px-4 py-4 max-w-6xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center">
          <Flame className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold">Trending</h1>
          <p className="text-xs text-ink-500">Most viewed videos on IndTube</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6">
        {trending.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}
