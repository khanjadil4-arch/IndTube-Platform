import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { mockVideos, mockChannels } from '@/data/mockData';
import VideoPlayer from '@/components/VideoPlayer';
import CommentSection from '@/components/CommentSection';
import VideoCard from '@/components/VideoCard';
import { formatCount } from '@/lib/format';

export default function WatchPage() {
  const { id } = useParams<{ id: string }>();
  const video = mockVideos.find((v) => v.id === id);

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);

  if (!video) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <p className="text-lg font-semibold text-ink-300">Video not found</p>
        <Link to="/" className="text-brand-400 text-sm mt-2 hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  const channel = mockChannels.find((c) => c.id === video.channelId);
  const relatedVideos = mockVideos
    .filter((v) => v.id !== video.id && v.category === video.category)
    .slice(0, 6);

  const handleLike = () => {
    setIsLiked((v) => !v);
    if (isDisliked) setIsDisliked(false);
  };

  const handleDislike = () => {
    setIsDisliked((v) => !v);
    if (isLiked) setIsLiked(false);
  };

  return (
    <div className="px-3 sm:px-4 py-3 max-w-6xl mx-auto">
      <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-6">
        <div className="min-w-0">
          <VideoPlayer
            video={{ ...video, subscriberCount: channel?.subscriberCount }}
            isSubscribed={isSubscribed}
            onToggleSubscribe={() => setIsSubscribed((v) => !v)}
            isLiked={isLiked}
            isDisliked={isDisliked}
            onLike={handleLike}
            onDislike={handleDislike}
          />
          <CommentSection videoId={video.id} />
        </div>

        <div className="mt-6 lg:mt-0">
          <h2 className="text-sm font-bold uppercase tracking-wider text-ink-400 mb-3">
            Related videos
          </h2>
          <div className="flex flex-col gap-3">
            {relatedVideos.map((v) => (
              <VideoCard key={v.id} video={v} layout="list" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
