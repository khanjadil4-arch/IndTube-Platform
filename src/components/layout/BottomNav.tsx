import { NavLink, Link } from 'react-router-dom';
import { Home, Play, Plus, Users, Library, Bell } from 'lucide-react';

const items = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/feed', icon: Play, label: 'Trending' },
  { to: '/subscriptions', icon: Users, label: 'Subs' },
  { to: '/notifications', icon: Bell, label: 'Alerts' },
  { to: '/profile', icon: Library, label: 'Library' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-ink-950/95 backdrop-blur-md border-t border-ink-800 md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {items.slice(0, 2).map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors ${
                isActive ? 'text-brand-500' : 'text-ink-400 hover:text-ink-200'
              }`
            }
          >
            <Icon className="w-5 h-5" strokeWidth={2} />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}

        {/* Prominent Create button */}
        <Link
          to="/upload"
          className="flex items-center justify-center -mt-2"
          aria-label="Create"
        >
          <div className="w-12 h-12 rounded-full bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-600/40 hover:bg-brand-500 hover:scale-105 transition-all">
            <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
        </Link>

        {items.slice(2).map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors ${
                isActive ? 'text-brand-500' : 'text-ink-400 hover:text-ink-200'
              }`
            }
          >
            <Icon className="w-5 h-5" strokeWidth={2} />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
