import { useState } from 'react';
import { Search, Trash2, Eye, Flag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockVideos, mockReports } from '@/data/mockData';
import { formatCount, formatRelativeTime } from '@/lib/format';

export default function AdminVideos() {
  const [query, setQuery] = useState('');
  const [videos, setVideos] = useState(mockVideos);

  const filtered = videos.filter(
    (v) =>
      v.title.toLowerCase().includes(query.toLowerCase()) ||
      v.channelName.toLowerCase().includes(query.toLowerCase()),
  );

  const reportedIds = new Set(
    mockReports.filter((r) => r.target === 'video').map((r) => r.targetId),
  );

  const handleDelete = (id: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== id));
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Video Management</h1>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search videos..."
          className="w-full bg-ink-900 border border-ink-800 rounded-lg pl-10 pr-4 py-2 text-sm placeholder:text-ink-500 focus:outline-none focus:border-brand-600 transition-colors"
        />
      </div>

      <div className="flex flex-col gap-2">
        {filtered.map((v) => (
          <div key={v.id} className="card-surface p-3 flex items-center gap-3">
            <img src={v.thumbnailUrl} alt="" className="w-24 h-14 rounded object-cover shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium truncate">{v.title}</span>
                {reportedIds.has(v.id) && (
                  <Flag className="w-3.5 h-3.5 text-warning-400 shrink-0" />
                )}
              </div>
              <p className="text-xs text-ink-500 mt-0.5">
                {v.channelName} · {formatCount(v.viewCount)} views · {formatRelativeTime(v.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Link to={`/watch/${v.id}`} className="p-2 rounded hover:bg-ink-800 transition-colors" title="View">
                <Eye className="w-4 h-4 text-ink-400" />
              </Link>
              <button
                onClick={() => handleDelete(v.id)}
                className="p-2 rounded hover:bg-ink-800 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4 text-error-400" />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-ink-500 text-sm py-10">No videos found.</p>
        )}
      </div>
    </div>
  );
}
