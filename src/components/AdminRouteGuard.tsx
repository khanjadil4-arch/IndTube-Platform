/**
 * AdminRouteGuard — protects admin routes on the frontend.
 * When auth is not enabled (demo mode), the guard renders children so the
 * existing admin UI remains accessible for demo purposes.
 * When auth IS enabled, only ADMIN and OWNER roles may access admin pages.
 */

import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { isAuthEnabled } from '@/services/authService';

export default function AdminRouteGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (!isAuthEnabled) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-ink-700 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !['ADMIN', 'OWNER'].includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
