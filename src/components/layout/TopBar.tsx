import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Upload, Menu, X, Flame } from 'lucide-react';
import { mockNotifications } from '@/data/mockData';
import { formatRelativeTime } from '@/lib/format';
import SearchOverlay from '@/components/SearchOverlay';

export default function TopBar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-ink-950/95 backdrop-blur-md border-b border-ink-800">
      <div className="flex items-center gap-3 px-4 h-14">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <Flame className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-extrabold tracking-tight hidden sm:block">
            Ind<span className="text-brand-500">Tube</span>
          </span>
        </Link>

        <form
          onSubmit={handleSearch}
          className="flex-1 max-w-xl mx-auto hidden md:flex items-center"
        >
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search videos, channels..."
              className="w-full bg-ink-900 border border-ink-800 rounded-full pl-10 pr-4 py-2 text-sm placeholder:text-ink-500 focus:outline-none focus:border-brand-600 transition-colors"
            />
          </div>
        </form>

        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={() => setSearchOpen(true)}
            className="md:hidden p-2 rounded-full hover:bg-ink-800 transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          <Link
            to="/upload"
            className="p-2 rounded-full hover:bg-ink-800 transition-colors"
            aria-label="Upload"
          >
            <Upload className="w-5 h-5" />
          </Link>

          <div className="relative">
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className="p-2 rounded-full hover:bg-ink-800 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-brand-500 rounded-full" />
              )}
            </button>

            {notifOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setNotifOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-1rem)] bg-ink-900 border border-ink-800 rounded-xl shadow-2xl z-50 animate-slide-down overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-ink-800">
                    <span className="font-semibold text-sm">Notifications</span>
                    <button onClick={() => setNotifOpen(false)} className="p-1 rounded hover:bg-ink-800">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto scrollbar-hide">
                    {mockNotifications.map((n) => (
                      <div
                        key={n.id}
                        className={`flex gap-3 px-4 py-3 border-b border-ink-800/50 hover:bg-ink-800/50 transition-colors cursor-pointer ${
                          !n.read ? 'bg-ink-800/30' : ''
                        }`}
                      >
                        {n.avatarUrl ? (
                          <img src={n.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center shrink-0">
                            <Bell className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm text-ink-200 leading-snug">{n.text}</p>
                          <p className="text-xs text-ink-500 mt-0.5">{formatRelativeTime(n.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <Link
            to="/profile"
            className="ml-1 w-8 h-8 rounded-full bg-accent-600 flex items-center justify-center text-sm font-semibold shrink-0"
          >
            U
          </Link>
        </div>
      </div>

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </header>
  );
}
