import { useState, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Search as SearchIcon,
  X,
  Filter,
  Play,
  CheckCircle2,
  Zap,
  Users,
  Video as VideoIcon,
} from 'lucide-react';
import { mockVideos, mockChannels, mockShorts } from '@/data/mockData';
import VideoCard from '@/components/VideoCard';
import ShortCard from '@/components/ShortCard';
import { formatCount, formatRelativeTime } from '@/lib/format';

type FilterTab = 'all' | 'videos' | 'shorts' | 'channels';
type SortOption = 'relevance' | 'views' | 'newest';

export default function SearchPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const q = params.get('q') ?? '';

  const [filter, setFilter] = useState<FilterTab>('all');
  const [sort, setSort] = useState<SortOption>('relevance');
  const [showFilters, setShowFilters] = useState(false);

  const query = q.toLowerCase();

  const videoResults = useMemo(() => {
    let results = mockVideos.filter(
      (v) =>
        v.title.toLowerCase().includes(query) ||
        v.description.toLowerCase().includes(query) ||
        v.channelName.toLowerCase().includes(query) ||
        v.category.toLowerCase().includes(query)
    );
    if (sort === 'views') results = [...results].sort((a, b) => b.viewCount - a.viewCount);
    if (sort === 'newest') results = [...results].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return results;
  }, [query, sort]);

  const channelResults = useMemo(() => {
    return mockChannels.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.handle.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query)
    );
  }, [query]);

  const shortResults = useMemo(() => {
    return mockShorts.filter(
      (s) =>
        s.title.toLowerCase().includes(query) ||
        s.channelName.toLowerCase().includes(query)
    );
  }, [query]);

  const totalResults = videoResults.length + channelResults.length + shortResults.length;

  const filterTabs: { id: FilterTab; label: string; icon: typeof VideoIcon; count: number }[] = [
    { id: 'all', label: 'All', icon: SearchIcon, count: totalResults },
    { id: 'videos', label: 'Videos', icon: VideoIcon, count: videoResults.length },
    { id: 'shorts', label: 'Shorts', icon: Zap, count: shortResults.length },
    { id: 'channels', label: 'Channels', icon: Users, count: channelResults.length },
  ];

  return (
    <div className="px-3 sm:px-4 py-4 max-w-5xl mx-auto">
      {/* Search query header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <SearchIcon className="w-4 h-4 text-ink-400 shrink-0" />
            <h1 className="text-lg font-bold truncate">
              {q ? (
                <>Results for <span className="text-brand-400">"{q}"</span></>
              ) : (
                'Search IndTube'
              )}
            </h1>
          </div>
          {q && totalResults > 0 && (
            <p className="text-xs text-ink-500 mt-0.5">
              {totalResults} result{totalResults !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors shrink-0 ${
            showFilters ? 'bg-brand-600 text-white' : 'bg-ink-900 text-ink-300 hover:bg-ink-800'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
        </button>
      </div>

      {/* Filter tabs */}
      {q && totalResults > 0 && (
        <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide">
          {filterTabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === t.id
                  ? 'bg-white text-ink-950'
                  : 'bg-ink-900 text-ink-300 hover:bg-ink-800'
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
              <span className="text-xs opacity-60">{t.count}</span>
            </button>
          ))}
        </div>
      )}

      {/* Sort options */}
      {showFilters && q && (
        <div className="flex items-center gap-2 mb-4 p-3 card-surface animate-slide-down">
          <span className="text-xs font-semibold text-ink-400 uppercase shrink-0">Sort by</span>
          {(['relevance', 'views', 'newest'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                sort === s
                  ? 'bg-brand-600 text-white'
                  : 'bg-ink-800 text-ink-400 hover:bg-ink-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* No query state */}
      {!q && (
        <div className="flex flex-col items-center justify-center py-20 text-ink-500">
          <SearchIcon className="w-12 h-12 mb-3 opacity-50" />
          <p className="text-sm">Type in the search bar to find videos, channels, and more.</p>
          <Link to="/" className="text-brand-400 text-sm mt-3 hover:underline">
            Back to home
          </Link>
        </div>
      )}

      {/* No results */}
      {q && totalResults === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-ink-500">
          <SearchIcon className="w-12 h-12 mb-3 opacity-40" />
          <p className="text-lg font-semibold text-ink-300">No results found</p>
          <p className="text-sm mt-1">Try different keywords or remove search filters.</p>
        </div>
      )}

      {/* Channels */}
      {q && (filter === 'all' || filter === 'channels') && channelResults.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-ink-400 mb-3">
            Channels
          </h2>
          <div className="flex flex-col gap-3">
            {channelResults.map((c) => (
              <Link
                key={c.id}
                to={`/channel/${c.id}`}
                className="flex items-center gap-3 p-3 card-surface hover:bg-ink-800/50 transition-colors"
              >
                <img src={c.avatarUrl} alt={c.name} className="w-12 h-12 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-sm">{c.name}</span>
                    {c.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-ink-500" />}
                  </div>
                  <p className="text-xs text-ink-500">
                    {c.handle} · {formatCount(c.subscriberCount)} subscribers · {c.videoCount} videos
                  </p>
                  <p className="text-xs text-ink-400 mt-1 line-clamp-1">{c.description}</p>
                </div>
                <button className="px-4 py-1.5 bg-white text-ink-950 rounded-full text-xs font-semibold hover:bg-ink-200 transition-colors shrink-0">
                  Subscribe
                </button>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Shorts */}
      {q && (filter === 'all' || filter === 'shorts') && shortResults.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-brand-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink-400">
              Shorts
            </h2>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-3 px-3 pb-2">
            {shortResults.map((s) => (
              <ShortCard key={s.id} short={s} />
            ))}
          </div>
        </section>
      )}

      {/* Videos */}
      {q && (filter === 'all' || filter === 'videos') && videoResults.length > 0 && (
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wider text-ink-400 mb-3">
            Videos
          </h2>
          <div className="flex flex-col gap-4">
            {videoResults.map((v) => (
              <VideoCard key={v.id} video={v} layout="list" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
