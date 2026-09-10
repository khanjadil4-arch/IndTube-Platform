import { Outlet, NavLink, Link } from 'react-router-dom';
import {
  BarChart3,
  Users,
  FolderTree,
  Video,
  Flag,
  Settings,
  Shield,
  Flame,
  ArrowLeft,
} from 'lucide-react';

const navItems = [
  { to: '/admin', icon: BarChart3, label: 'Dashboard', end: true },
  { to: '/admin/users', icon: Users, label: 'Users', end: false },
  { to: '/admin/channels', icon: FolderTree, label: 'Channels', end: false },
  { to: '/admin/videos', icon: Video, label: 'Videos', end: false },
  { to: '/admin/reports', icon: Flag, label: 'Reports', end: false },
  { to: '/admin/settings', icon: Settings, label: 'Settings', end: false },
];

export default function AdminLayout() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex">
      <aside className="hidden md:flex flex-col w-56 border-r border-ink-800 bg-ink-950 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto scrollbar-hide">
        <div className="p-3">
          <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-ink-500">
            <Shield className="w-4 h-4" />
            Owner Panel
          </div>
          <nav className="flex flex-col gap-1 mt-1">
            {navItems.map(({ to, icon: Icon, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-600 text-white'
                      : 'text-ink-300 hover:bg-ink-800 hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-3 border-t border-ink-800">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 text-sm text-ink-400 hover:text-ink-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to site
          </Link>
        </div>
      </aside>

      <div className="flex-1 min-w-0 overflow-x-auto">
        <div className="md:hidden border-b border-ink-800 bg-ink-950 sticky top-14 z-30">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide px-3 py-2">
            {navItems.map(({ to, icon: Icon, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-brand-600 text-white'
                      : 'bg-ink-900 text-ink-300'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
