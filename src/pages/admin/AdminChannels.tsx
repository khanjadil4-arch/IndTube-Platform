import { useState } from 'react';
import { Search, CheckCircle2, Trash2, Eye } from 'lucide-react';
import { mockChannels } from '@/data/mockData';
import { formatCount, formatRelativeTime } from '@/lib/format';

export default function AdminChannels() {
  const [query, setQuery] = useState('');

  const filtered = mockChannels.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.handle.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Channel Management</h1>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search channels..."
          className="w-full bg-ink-900 border border-ink-800 rounded-lg pl-10 pr-4 py-2 text-sm placeholder:text-ink-500 focus:outline-none focus:border-brand-600 transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((c) => (
          <div key={c.id} className="card-surface p-4 flex items-center gap-3">
            <img src={c.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-sm truncate">{c.name}</span>
                {c.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-ink-500 shrink-0" />}
              </div>
              <p className="text-xs text-ink-500">
                {formatCount(c.subscriberCount)} subs · {c.videoCount} videos
              </p>
              <p className="text-xs text-ink-600 mt-0.5">{formatRelativeTime(c.createdAt)}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button className="p-2 rounded hover:bg-ink-800 transition-colors" title="View">
                <Eye className="w-4 h-4 text-ink-400" />
              </button>
              <button className="p-2 rounded hover:bg-ink-800 transition-colors" title="Delete">
                <Trash2 className="w-4 h-4 text-error-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
