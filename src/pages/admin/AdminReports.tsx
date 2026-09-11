import { useState } from 'react';
import { Flag, Check, X, Eye } from 'lucide-react';
import { mockReports } from '@/data/mockData';
import { formatRelativeTime } from '@/lib/format';
import type { Report, ReportStatus } from '@/types';

const statusColors: Record<ReportStatus, string> = {
  pending: 'bg-warning-950 text-warning-400',
  reviewing: 'bg-accent-950 text-accent-400',
  resolved: 'bg-success-950 text-success-400',
  dismissed: 'bg-ink-800 text-ink-400',
};

export default function AdminReports() {
  const [filter, setFilter] = useState<'all' | ReportStatus>('all');
  const [reports, setReports] = useState<Report[]>(mockReports);

  const updateStatus = (id: string, status: ReportStatus) => {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const filtered = filter === 'all' ? reports : reports.filter((r) => r.status === filter);

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Reports</h1>

      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
        {(['all', 'pending', 'reviewing', 'resolved', 'dismissed'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-colors ${
              filter === s ? 'bg-brand-600 text-white' : 'bg-ink-900 text-ink-300 hover:bg-ink-800'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {filtered.map((r) => (
          <div key={r.id} className="card-surface p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning-950 flex items-center justify-center shrink-0">
                <Flag className="w-5 h-5 text-warning-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold">{r.reason}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${statusColors[r.status]}`}>
                    {r.status}
                  </span>
                </div>
                <p className="text-xs text-ink-500 mt-1">
                  Target: <span className="capitalize">{r.target}</span> ({r.targetId}) ·
                  Reported by @{r.reporterName} · {formatRelativeTime(r.createdAt)}
                </p>
              </div>
            </div>
            {r.status === 'pending' && (
              <div className="flex gap-2 mt-3 pl-13">
                <button
                  onClick={() => updateStatus(r.id, 'resolved')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-success-950 text-success-400 rounded-lg text-xs font-medium hover:bg-success-900 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  Resolve
                </button>
                <button
                  onClick={() => updateStatus(r.id, 'dismissed')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-ink-800 text-ink-400 rounded-lg text-xs font-medium hover:bg-ink-700 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Dismiss
                </button>
                <button
                  onClick={() => updateStatus(r.id, 'reviewing')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-ink-800 text-ink-400 rounded-lg text-xs font-medium hover:bg-ink-700 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Review
                </button>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-ink-500 text-sm py-10">No reports in this category.</p>
        )}
      </div>
    </div>
  );
}
