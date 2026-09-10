import { useState } from 'react';
import { Search, Shield, Ban, CheckCircle2, MoreVertical } from 'lucide-react';
import { mockUsers } from '@/data/mockData';
import { formatCount, formatRelativeTime } from '@/lib/format';
import type { UserRole } from '@/types';

const roleColors: Record<UserRole, string> = {
  owner: 'bg-brand-600 text-white',
  admin: 'bg-accent-600 text-white',
  creator: 'bg-success-600 text-white',
  viewer: 'bg-ink-700 text-ink-200',
};

export default function AdminUsers() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | UserRole>('all');

  const filtered = mockUsers.filter((u) => {
    const matchesQuery =
      u.username.toLowerCase().includes(query.toLowerCase()) ||
      u.displayName.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === 'all' || u.role === filter;
    return matchesQuery && matchesFilter;
  });

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold mb-4">User Management</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users..."
            className="w-full bg-ink-900 border border-ink-800 rounded-lg pl-10 pr-4 py-2 text-sm placeholder:text-ink-500 focus:outline-none focus:border-brand-600 transition-colors"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'all' | UserRole)}
          className="bg-ink-900 border border-ink-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-600 transition-colors"
        >
          <option value="all">All roles</option>
          <option value="owner">Owner</option>
          <option value="admin">Admin</option>
          <option value="creator">Creator</option>
          <option value="viewer">Viewer</option>
        </select>
      </div>

      <div className="card-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-800 text-ink-400 text-xs uppercase">
                <th className="text-left px-4 py-3 font-medium">User</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Role</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Subscribers</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Joined</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-ink-800/50 last:border-0 hover:bg-ink-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={u.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-medium truncate">{u.displayName}</span>
                          {u.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-ink-500 shrink-0" />}
                        </div>
                        <span className="text-xs text-ink-500">@{u.username}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${roleColors[u.role]}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-300 hidden md:table-cell">
                    {formatCount(u.subscriberCount)}
                  </td>
                  <td className="px-4 py-3 text-ink-400 hidden lg:table-cell">
                    {formatRelativeTime(u.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded hover:bg-ink-800 transition-colors" title="Change role">
                        <Shield className="w-4 h-4 text-ink-400" />
                      </button>
                      <button className="p-1.5 rounded hover:bg-ink-800 transition-colors" title="Ban">
                        <Ban className="w-4 h-4 text-error-400" />
                      </button>
                      <button className="p-1.5 rounded hover:bg-ink-800 transition-colors">
                        <MoreVertical className="w-4 h-4 text-ink-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
