/**
 * AuthContext — provides current user, login, signup, logout, and session
 * restoration across the app. When the backend is not configured, the context
 * uses a demo mode with a mock user so all pages remain functional.
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

const DEMO_USER_KEY = 'indtube_demo_user';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, username: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getDemoUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(DEMO_USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function storeDemoUser(user: AuthUser | null): void {
  if (user) localStorage.setItem(DEMO_USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(DEMO_USER_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthEnabled) {
      setUser(getDemoUser());
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

  const login = useCallback(async (email: string, _password: string) => {
    if (!isAuthEnabled) {
      const demoUser: AuthUser = {
        id: 'demo-user',
        email,
        username: email.split('@')[0] || 'viewer',
        displayName: email.split('@')[0] || 'Viewer',
        avatarUrl: null,
        role: 'ADMIN',
        isVerified: false,
      };
      storeDemoUser(demoUser);
      setUser(demoUser);
      return;
    }
    const res = await loginUser(email, _password);
    storeTokens(res.accessToken, res.refreshToken);
    setUser(res.user);
  }, []);

  const signup = useCallback(
    async (email: string, username: string, _password: string, displayName?: string) => {
      if (!isAuthEnabled) {
        const demoUser: AuthUser = {
          id: `demo-${Date.now()}`,
          email,
          username,
          displayName: displayName || username,
          avatarUrl: null,
          role: 'VIEWER',
          isVerified: false,
        };
        storeDemoUser(demoUser);
        setUser(demoUser);
        return;
      }
      const res = await signupUser(email, username, _password, displayName);
      storeTokens(res.accessToken, res.refreshToken);
      setUser(res.user);
    },
    [],
  );

  const logout = useCallback(async () => {
    if (!isAuthEnabled) {
      storeDemoUser(null);
      setUser(null);
      return;
    }
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
