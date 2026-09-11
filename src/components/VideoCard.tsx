import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import type { Video } from '@/types';
import { formatCount, formatDuration, formatRelativeTime } from '@/lib/format';
import { mockChannels } from '@/data/mockData';

const verifiedChannelIds = new Set(
  mockChannels.filter((c) => c.isVerified).map((c) => c.id),
);

interface Props {
  video: Video;
  layout?: 'grid' | 'list';
}

export default function VideoCard({ video, layout = 'grid' }: Props) {
  const isVerified = verifiedChannelIds.has(video.channelId);

  if (layout === 'list') {
    return (
      <Link to={`/watch/${video.id}`} className="flex gap-3 group">
        <div className="relative w-40 sm:w-48 shrink-0 aspect-video rounded-lg overflow-hidden bg-ink-800">
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <span className="absolute bottom-1 right-1 bg-ink-950/90 text-xs font-medium px-1.5 py-0.5 rounded">
            {formatDuration(video.durationSeconds)}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-brand-400 transition-colors">
            {video.title}
          </h3>
          <p className="text-xs text-ink-400 mt-1">{video.channelName}</p>
          <p className="text-xs text-ink-500 mt-0.5">
            {formatCount(video.viewCount)} views · {formatRelativeTime(video.createdAt)}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/watch/${video.id}`} className="group flex flex-col">
      <div className="relative aspect-video rounded-xl overflow-hidden bg-ink-800">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className="absolute bottom-2 right-2 bg-ink-950/90 text-xs font-medium px-1.5 py-0.5 rounded">
          {formatDuration(video.durationSeconds)}
        </span>
      </div>
      <div className="flex gap-3 mt-3">
        <Link to={`/channel/${video.channelId}`} className="shrink-0">
          <img
            src={video.channelAvatarUrl}
            alt={video.channelName}
            loading="lazy"
            className="w-9 h-9 rounded-full object-cover"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-brand-400 transition-colors">
            {video.title}
          </h3>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs text-ink-400">{video.channelName}</span>
            {isVerified && <CheckCircle2 className="w-3 h-3 text-ink-500" />}
          </div>
          <p className="text-xs text-ink-500 mt-0.5">
            {formatCount(video.viewCount)} views · {formatRelativeTime(video.createdAt)}
          </p>
        </div>
      </div>
    </Link>
  );
}
