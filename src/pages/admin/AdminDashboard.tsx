import { Link } from 'react-router-dom';
import {
  Users,
  Video,
  Flag,
  FolderTree,
  TrendingUp,
  Eye,
  ThumbsUp,
  DollarSign,
  Activity,
} from 'lucide-react';
import { mockUsers, mockVideos, mockChannels, mockReports } from '@/data/mockData';
import { formatCount } from '@/lib/format';

export default function AdminDashboard() {
  const stats = [
    { label: 'Total Users', value: mockUsers.length, icon: Users, color: 'text-accent-400', bg: 'bg-accent-950' },
    { label: 'Channels', value: mockChannels.length, icon: FolderTree, color: 'text-success-400', bg: 'bg-success-950' },
    { label: 'Videos', value: mockVideos.length, icon: Video, color: 'text-brand-400', bg: 'bg-brand-950' },
    { label: 'Open Reports', value: mockReports.filter((r) => r.status === 'pending').length, icon: Flag, color: 'text-warning-400', bg: 'bg-warning-950' },
  ];

  const quickStats = [
    { label: 'Total Views', value: formatCount(mockVideos.reduce((s, v) => s + v.viewCount, 0)), icon: Eye },
    { label: 'Total Likes', value: formatCount(mockVideos.reduce((s, v) => s + v.likeCount, 0)), icon: ThumbsUp },
    { label: 'Active Today', value: '1.2K', icon: Activity },
    { label: 'Revenue (mock)', value: '$0', icon: DollarSign },
  ];

  const recentReports = mockReports.slice(0, 4);
  const topVideos = [...mockVideos].sort((a, b) => b.viewCount - a.viewCount).slice(0, 5);

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Owner Dashboard</h1>
        <p className="text-sm text-ink-500 mt-1">Platform overview and management controls</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="card-surface p-4">
            <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-ink-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {quickStats.map((s) => (
          <div key={s.label} className="flex items-center gap-2 p-3 card-surface">
            <s.icon className="w-4 h-4 text-ink-400" />
            <div>
              <p className="text-sm font-semibold">{s.value}</p>
              <p className="text-xs text-ink-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card-surface p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm">Recent Reports</h2>
            <Link to="/admin/reports" className="text-xs text-brand-400 hover:underline">
              View all
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {recentReports.map((r) => (
              <div key={r.id} className="flex items-center gap-2 py-2 border-b border-ink-800/50 last:border-0">
                <Flag className={`w-4 h-4 shrink-0 ${
                  r.status === 'pending' ? 'text-warning-400' :
                  r.status === 'resolved' ? 'text-success-400' :
                  'text-ink-500'
                }`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm truncate">{r.reason}</p>
                  <p className="text-xs text-ink-500 capitalize">{r.target} · {r.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-surface p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-brand-400" />
              Top Videos
            </h2>
          </div>
          <div className="flex flex-col gap-2">
            {topVideos.map((v, i) => (
              <div key={v.id} className="flex items-center gap-3 py-2 border-b border-ink-800/50 last:border-0">
                <span className="text-sm font-bold text-ink-500 w-4">{i + 1}</span>
                <img src={v.thumbnailUrl} alt="" className="w-16 h-9 rounded object-cover shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm truncate">{v.title}</p>
                  <p className="text-xs text-ink-500">{formatCount(v.viewCount)} views</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
