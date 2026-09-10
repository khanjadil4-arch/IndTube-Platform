import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import Sidebar from '@/components/layout/Sidebar';
import HomePage from '@/pages/HomePage';
import FeedPage from '@/pages/FeedPage';
import WatchPage from '@/pages/WatchPage';
import ChannelPage from '@/pages/ChannelPage';
import SearchPage from '@/pages/SearchPage';
import SubscriptionsPage from '@/pages/SubscriptionsPage';
import UploadPage from '@/pages/UploadPage';
import ProfilePage from '@/pages/ProfilePage';
import NotificationsPage from '@/pages/NotificationsPage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import AdminRouteGuard from '@/components/AdminRouteGuard';
import AdminLayout from '@/pages/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminChannels from '@/pages/admin/AdminChannels';
import AdminVideos from '@/pages/admin/AdminVideos';
import AdminReports from '@/pages/admin/AdminReports';
import AdminSettings from '@/pages/admin/AdminSettings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route element={<AppLayout />}>
          <Route
            path="/"
            element={
              <div className="flex">
                <Sidebar />
                <div className="flex-1 min-w-0">
                  <HomePage />
                </div>
              </div>
            }
          />
          <Route
            path="/feed"
            element={
              <div className="flex">
                <Sidebar />
                <div className="flex-1 min-w-0">
                  <FeedPage />
                </div>
              </div>
            }
          />
          <Route
            path="/subscriptions"
            element={
              <div className="flex">
                <Sidebar />
                <div className="flex-1 min-w-0">
                  <SubscriptionsPage />
                </div>
              </div>
            }
          />
          <Route
            path="/upload"
            element={
              <div className="flex">
                <Sidebar />
                <div className="flex-1 min-w-0">
                  <UploadPage />
                </div>
              </div>
            }
          />
          <Route
            path="/profile"
            element={
              <div className="flex">
                <Sidebar />
                <div className="flex-1 min-w-0">
                  <ProfilePage />
                </div>
              </div>
            }
          />
          <Route
            path="/notifications"
            element={
              <div className="flex">
                <Sidebar />
                <div className="flex-1 min-w-0">
                  <NotificationsPage />
                </div>
              </div>
            }
          />
          <Route
            path="/search"
            element={
              <div className="flex">
                <Sidebar />
                <div className="flex-1 min-w-0">
                  <SearchPage />
                </div>
              </div>
            }
          />
          <Route
            path="/watch/:id"
            element={
              <div className="flex">
                <Sidebar />
                <div className="flex-1 min-w-0">
                  <WatchPage />
                </div>
              </div>
            }
          />
          <Route
            path="/channel/:id"
            element={
              <div className="flex">
                <Sidebar />
                <div className="flex-1 min-w-0">
                  <ChannelPage />
                </div>
              </div>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRouteGuard>
                <AdminLayout />
              </AdminRouteGuard>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="channels" element={<AdminChannels />} />
            <Route path="videos" element={<AdminVideos />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
