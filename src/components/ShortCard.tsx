import { Link } from 'react-router-dom';
import { Play, Heart } from 'lucide-react';
import type { Short } from '@/types';
import { formatCount } from '@/lib/format';

interface Props {
  short: Short;
}

export default function ShortCard({ short }: Props) {
  return (
    <Link
      to={`/watch/${short.id}`}
      className="flex flex-col shrink-0 w-[140px] sm:w-[160px] group"
    >
      <div className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-ink-800">
        <img
          src={short.thumbnailUrl}
          alt={short.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-xs font-medium px-1.5 py-0.5 rounded">
          {short.durationSeconds}s
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-10 h-10 rounded-full bg-brand-600/90 flex items-center justify-center">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-2.5">
          <p className="text-xs font-semibold text-white line-clamp-2 leading-snug">
            {short.title}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <Heart className="w-3 h-3 text-white/80" />
            <span className="text-[10px] text-white/70">
              {formatCount(short.likeCount)}
            </span>
          </div>
        </div>
      </div>
      <p className="text-xs text-ink-400 mt-1.5 truncate">{short.channelName}</p>
      <p className="text-[10px] text-ink-500">{formatCount(short.viewCount)} views</p>
    </Link>
  );
}
