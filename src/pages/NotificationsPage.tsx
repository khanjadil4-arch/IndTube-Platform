import { useState } from 'react';
import { Bell, CheckCircle2 } from 'lucide-react';
import { mockNotifications } from '@/data/mockData';
import { formatRelativeTime } from '@/lib/format';
import { markAllNotificationsRead } from '@/services/notificationService';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await markAllNotificationsRead();
    } catch {
      setNotifications(mockNotifications);
    }
  };

  return (
    <div className="px-3 sm:px-4 py-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-brand-500" />
          <h1 className="text-lg font-bold">Notifications</h1>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 text-sm text-brand-400 hover:text-brand-300 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      <div className="flex flex-col gap-1">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`flex gap-3 px-4 py-3 rounded-xl transition-colors cursor-pointer ${
              !n.read ? 'bg-ink-900/80 border border-ink-800' : 'hover:bg-ink-900/50'
            }`}
          >
            {n.avatarUrl ? (
              <img src={n.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 text-white" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm text-ink-200 leading-snug">{n.text}</p>
              <p className="text-xs text-ink-500 mt-1">{formatRelativeTime(n.createdAt)}</p>
            </div>
            {!n.read && (
              <div className="w-2 h-2 rounded-full bg-brand-500 mt-2 shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
