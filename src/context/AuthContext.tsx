/**
 * AuthContext — provides current user, login, signup, logout, and session
 * restoration across the app. When the backend is not configured, the context
 * is in a "demo mode" state so existing mock-data pages continue working.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import {
  type AuthUser,
  signupUser,
  loginUser,
  logoutUser,
  refreshUser,
  fetchCurrentUser,
  getStoredAccessToken,
  getStoredRefreshToken,
  storeTokens,
  clearTokens,
  isAuthEnabled,
} from '@/services/authService';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, username: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthEnabled) {
      setLoading(false);
      return;
    }

    const accessToken = getStoredAccessToken();
    const refreshToken = getStoredRefreshToken();

    if (!accessToken) {
      setLoading(false);
      return;
    }

    fetchCurrentUser(accessToken)
      .then((res) => setUser(res.user))
      .catch(() => {
        if (refreshToken) {
          refreshUser(refreshToken)
            .then((res) => {
              storeTokens(res.accessToken, res.refreshToken);
              setUser(res.user);
            })
            .catch(() => clearTokens());
        } else {
          clearTokens();
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await loginUser(email, password);
    storeTokens(res.accessToken, res.refreshToken);
    setUser(res.user);
  }, []);

  const signup = useCallback(
    async (email: string, username: string, password: string, displayName?: string) => {
      const res = await signupUser(email, username, password, displayName);
      storeTokens(res.accessToken, res.refreshToken);
      setUser(res.user);
    },
    [],
  );

  const logout = useCallback(async () => {
    const refreshToken = getStoredRefreshToken();
    if (refreshToken) {
      try {
        await logoutUser(refreshToken);
      } catch {
        // ignore — clearing locally is the important part
      }
    }
    clearTokens();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
