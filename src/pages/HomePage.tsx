import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Flame, Music, Gamepad2, Newspaper, Zap, Users } from 'lucide-react';
import { homeTabs, mockVideos, mockShorts, mockChannels } from '@/data/mockData';
import { formatCount, formatRelativeTime } from '@/lib/format';
import FeaturedVideoCard from '@/components/FeaturedVideoCard';
import ShortCard from '@/components/ShortCard';
import SectionHeader from '@/components/SectionHeader';
import VideoCard from '@/components/VideoCard';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('home');
  const navigate = useNavigate();

  const featuredVideo = mockVideos[2]; // Live at Sunset — highest views
  const trendingVideos = [...mockVideos].sort((a, b) => b.viewCount - a.viewCount).slice(0, 4);
  const shorts = mockShorts;
  const recommended = mockVideos.slice(4, 8);
  const musicVideos = mockVideos.filter((v) => v.category === 'music').slice(0, 3);
  const gamingVideos = mockVideos.filter((v) => v.category === 'gaming').slice(0, 3);
  const newsVideos = mockVideos.filter((v) => v.category === 'tech').slice(0, 3);
  const popularChannels = mockChannels;

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-3">
      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 mb-1">
        {homeTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-white text-ink-950'
                : 'bg-ink-900 text-ink-300 hover:bg-ink-800'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Featured video */}
      <section className="mb-6">
        <FeaturedVideoCard video={featuredVideo} />
      </section>

      {/* Shorts section */}
      <section className="mb-6">
        <SectionHeader title="Shorts" icon={Zap} onSeeAll={() => navigate('/search?q=short')} />
        <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-3 px-3 pb-2">
          {shorts.map((s) => (
            <ShortCard key={s.id} short={s} />
          ))}
        </div>
      </section>

      {/* Trending videos */}
      <section className="mb-6">
        <SectionHeader title="Trending" icon={Flame} onSeeAll={() => navigate('/feed')} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
          {trendingVideos.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      </section>

      {/* Recommended */}
      <section className="mb-6">
        <SectionHeader title="Recommended" icon={Zap} onSeeAll={() => navigate('/feed')} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-5">
          {recommended.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      </section>

      {/* Music */}
      <section className="mb-6">
        <SectionHeader title="Music" icon={Music} onSeeAll={() => navigate('/search?q=music')} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-5">
          {musicVideos.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      </section>

      {/* Gaming */}
      <section className="mb-6">
        <SectionHeader title="Gaming" icon={Gamepad2} onSeeAll={() => navigate('/search?q=gaming')} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-5">
          {gamingVideos.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      </section>

      {/* News / Tech */}
      <section className="mb-6">
        <SectionHeader title="News & Tech" icon={Newspaper} onSeeAll={() => navigate('/search?q=tech')} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-5">
          {newsVideos.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      </section>

      {/* Popular Channels */}
      <section className="mb-8">
        <SectionHeader title="Popular Channels" icon={Users} onSeeAll={() => navigate('/subscriptions')} />
        <div className="flex gap-4 overflow-x-auto scrollbar-hide -mx-3 px-3 pb-2">
          {popularChannels.map((c) => (
            <Link
              key={c.id}
              to={`/channel/${c.id}`}
              className="flex flex-col items-center gap-2 shrink-0 w-24 text-center group"
            >
              <img
                src={c.avatarUrl}
                alt={c.name}
                loading="lazy"
                className="w-16 h-16 rounded-full object-cover ring-2 ring-ink-800 group-hover:ring-brand-600 transition-all"
              />
              <span className="text-xs font-medium truncate max-w-full">{c.name}</span>
              <span className="text-[10px] text-ink-500">
                {formatCount(c.subscriberCount)} subs
              </span>
            </Link>
          ))}
        </div>
      </section>

      <div className="text-center pb-2">
        <p className="text-xs text-ink-600">
          IndTube v0.1.0 — Mock data shown. Backend integration coming soon.
        </p>
      </div>
    </div>
  );
}
