import { Link } from 'react-router-dom';
import { MoreVertical, CheckCircle2 } from 'lucide-react';
import type { Video } from '@/types';
import { formatCount, formatDuration, formatRelativeTime } from '@/lib/format';
import { mockChannels } from '@/data/mockData';

const verifiedChannelIds = new Set(
  mockChannels.filter((c) => c.isVerified).map((c) => c.id),
);

interface Props {
  video: Video;
}

export default function FeaturedVideoCard({ video }: Props) {
  return (
    <div className="flex flex-col">
      <Link to={`/watch/${video.id}`} className="group relative block">
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-ink-800">
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <span className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm text-xs font-semibold px-2 py-0.5 rounded-md">
            {formatDuration(video.durationSeconds)}
          </span>
        </div>
      </Link>
      <div className="flex gap-3 mt-3 px-1">
        <Link to={`/channel/${video.channelId}`} className="shrink-0">
          <img
            src={video.channelAvatarUrl}
            alt={video.channelName}
            loading="lazy"
            className="w-9 h-9 rounded-full object-cover"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <Link to={`/watch/${video.id}`}>
            <h3 className="text-sm font-semibold leading-snug line-clamp-2 hover:text-brand-400 transition-colors">
              {video.title}
            </h3>
          </Link>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs text-ink-400">{video.channelName}</span>
            {verifiedChannelIds.has(video.channelId) && <CheckCircle2 className="w-3 h-3 text-ink-500" />}
          </div>
          <p className="text-xs text-ink-500 mt-0.5">
            {formatCount(video.viewCount)} views · {formatRelativeTime(video.createdAt)}
          </p>
        </div>
        <button className="p-1.5 -mr-1 rounded-full hover:bg-ink-800 transition-colors shrink-0">
          <MoreVertical className="w-4 h-4 text-ink-400" />
        </button>
      </div>
    </div>
  );
}
