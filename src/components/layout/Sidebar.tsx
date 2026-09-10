import { Link } from 'react-router-dom';
import { Home, Flame, Upload, Bell, User, Shield, Settings, Users, Video, Flag, BarChart3, FolderTree } from 'lucide-react';

const mainNav = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/feed', icon: Flame, label: 'Trending' },
  { to: '/subscriptions', icon: Bell, label: 'Subscriptions' },
  { to: '/upload', icon: Upload, label: 'Upload' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const adminNav = [
  { to: '/admin', icon: BarChart3, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/channels', icon: FolderTree, label: 'Channels' },
  { to: '/admin/videos', icon: Video, label: 'Videos' },
  { to: '/admin/reports', icon: Flag, label: 'Reports' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-ink-800 bg-ink-950 h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto scrollbar-hide">
      <nav className="flex flex-col gap-1 p-3">
        {mainNav.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-ink-300 hover:bg-ink-800 hover:text-white transition-colors"
          >
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-ink-800" />

      <div className="p-3">
        <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-ink-500">
          <Shield className="w-4 h-4" />
          Owner Panel
        </div>
        <nav className="flex flex-col gap-1">
          {adminNav.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-ink-300 hover:bg-ink-800 hover:text-white transition-colors"
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-ink-800">
        <p className="text-xs text-ink-500 leading-relaxed">
          IndTube v0.1.0 — Foundation build. Backend services will be connected incrementally.
        </p>
      </div>
    </aside>
  );
}
