import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Bookmark,
  Eye,
  Calendar,
} from 'lucide-react';
import type { Video } from '@/types';
import { formatCount, formatRelativeTime } from '@/lib/format';
import { mockChannels } from '@/data/mockData';

const verifiedChannelIds = new Set(
  mockChannels.filter((c) => c.isVerified).map((c) => c.id),
);

interface Props {
  video: Video;
  isSubscribed: boolean;
  onToggleSubscribe: () => void;
  isLiked: boolean;
  isDisliked: boolean;
  onLike: () => void;
  onDislike: () => void;
}

export default function VideoPlayer({
  video,
  isSubscribed,
  onToggleSubscribe,
  isLiked,
  isDisliked,
  onLike,
  onDislike,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [video.id]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex flex-col">
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
        <video
          ref={videoRef}
          controls
          playsInline
          className="w-full h-full"
          poster={video.thumbnailUrl}
        >
          <source src={video.videoUrl} type="video/mp4" />
        </video>
      </div>

      <h1 className="text-lg sm:text-xl font-bold mt-4 leading-tight">{video.title}</h1>

      <div className="flex flex-wrap items-center gap-3 mt-3">
        <Link to={`/channel/${video.channelId}`} className="flex items-center gap-2 shrink-0">
          <img
            src={video.channelAvatarUrl}
            alt={video.channelName}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="hidden sm:block">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-sm">{video.channelName}</span>
              {verifiedChannelIds.has(video.channelId) && <CheckCircle2 className="w-3.5 h-3.5 text-ink-500" />}
            </div>
            <span className="text-xs text-ink-500">
              {formatCount(video.subscriberCount ?? 84200)} subscribers
            </span>
          </div>
        </Link>

        <button
          onClick={onToggleSubscribe}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ml-auto sm:ml-0 ${
            isSubscribed
              ? 'bg-ink-800 text-ink-200 hover:bg-ink-700'
              : 'bg-white text-ink-950 hover:bg-ink-200'
          }`}
        >
          {isSubscribed ? 'Subscribed' : 'Subscribe'}
        </button>

        <div className="flex items-center gap-1 bg-ink-900 border border-ink-800 rounded-full overflow-hidden">
          <button
            onClick={onLike}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium hover:bg-ink-800 transition-colors ${
              isLiked ? 'text-brand-400' : ''
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-brand-500 text-brand-500' : ''}`} />
            {formatCount(video.likeCount)}
          </button>
          <div className="w-px h-5 bg-ink-800" />
          <button
            onClick={onDislike}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium hover:bg-ink-800 transition-colors ${
              isDisliked ? 'text-brand-400' : ''
            }`}
          >
            <ThumbsDown className={`w-4 h-4 ${isDisliked ? 'fill-brand-500 text-brand-500' : ''}`} />
          </button>
        </div>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-2 bg-ink-900 border border-ink-800 rounded-full text-sm font-medium hover:bg-ink-800 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          {copied ? 'Copied!' : 'Share'}
        </button>

        <button className="flex items-center gap-1.5 px-3 py-2 bg-ink-900 border border-ink-800 rounded-full text-sm font-medium hover:bg-ink-800 transition-colors">
          <Bookmark className="w-4 h-4" />
          <span className="hidden sm:inline">Save</span>
        </button>
      </div>

      <div className="mt-4 card-surface p-4">
        <div className="flex items-center gap-4 text-xs text-ink-400 mb-2">
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {formatCount(video.viewCount)} views
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatRelativeTime(video.createdAt)}
          </span>
        </div>
        <p className="text-sm text-ink-200 leading-relaxed whitespace-pre-line">
          {video.description}
        </p>
      </div>
    </div>
  );
}
