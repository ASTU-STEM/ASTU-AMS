import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { User, UserRole } from '../types';
import { authService } from '../features/auth/services/auth.service';
import config from '../config';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
  hasPermission: (allowedRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const normalizeRole = (role?: string | null): UserRole | null => {
  switch (role?.toUpperCase()) {
    case 'ALUMNI': return 'ALUMNI';
    case 'EMPLOYER': return 'EMPLOYER';
    case 'REGISTRAR': return 'REGISTRAR';
    case 'DEPARTMENT':
    case 'DEPARTMENT_HEAD': return 'DEPARTMENT_HEAD';
    case 'ADMIN': return 'ADMIN';
    case 'SUPER_ADMIN': return 'SUPER_ADMIN';
    case 'ALUMNI_OFFICE':
    case 'CMS_MANAGER': return 'CMS_MANAGER';
    default: return null;
  }
};

/**
 * Read the `exp` claim from a JWT without verifying it.
 *
 * The access token lives 60 minutes (backend/.env JWT_ACCESS_EXPIRY). The old
 * restore path only checked that a token *existed*, so after an hour the user
 * still appeared signed in while every authenticated request returned 401.
 */
const isTokenExpired = (token: string, skewSeconds = 15): boolean => {
  try {
    const payload = token.split('.')[1];
    if (!payload) return true;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
    const claims = JSON.parse(atob(padded));
    if (typeof claims.exp !== 'number') return false;
    return claims.exp * 1000 - skewSeconds * 1000 <= Date.now();
  } catch {
    return false;
  }
};

/**
 * Exchange the refresh token for a new access token.
 *
 * Returns true when localStorage now holds a fresh access token. Used on boot
 * so an expired access token self-heals instead of blanking the dashboard.
 */
const refreshAccessToken = async (): Promise<boolean> => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return false;
  try {
    const response = await fetch(`${config.apiUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!response.ok) return false;
    const body = await response.json();
    const token = body?.data?.accessToken ?? body?.data?.token;
    if (!token) return false;
    localStorage.setItem('authToken', token);
    if (body.data.refreshToken) localStorage.setItem('refreshToken', body.data.refreshToken);
    return true;
  } catch {
    return false;
  }
};

const clearAuthStorage = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('astu_ams_user_role');
};

const readStoredUser = (): User | null => {
  const token = localStorage.getItem('authToken');
  // Reject legacy demo sessions that never came from the real auth API
  if (!token || token.startsWith('mock-jwt-token-')) {
    if (token?.startsWith('mock-jwt-token-')) clearAuthStorage();
    return null;
  }

  const storedUser = localStorage.getItem('user');
  if (!storedUser) return null;

  try {
    const parsed = JSON.parse(storedUser);
    const role = normalizeRole(parsed.role);
    if (!role) return null;

    const rawName = String(parsed.name || parsed.fullName || '').trim();
    const firstName =
      parsed.firstName !== undefined && parsed.firstName !== ''
        ? String(parsed.firstName)
        : rawName
          ? rawName.split(' ')[0]
          : '';
    const lastName =
      parsed.lastName !== undefined && parsed.lastName !== ''
        ? String(parsed.lastName)
        : rawName
          ? rawName.split(' ').slice(1).join(' ')
          : '';

    if (!parsed.id || !parsed.email) return null;

    return {
      id: String(parsed.id),
      email: String(parsed.email),
      firstName,
      lastName,
      name: rawName || `${firstName} ${lastName}`.trim(),
      role,
      isActive: parsed.isActive !== false,
      createdAt: parsed.createdAt ?? new Date().toISOString(),
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
  } catch {
    console.warn('Failed to restore stored auth user');
    return null;
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // A stale access token used to be accepted as a valid session, which left
    // the user "signed in" with every authenticated API call returning 401 and
    // the dashboard showing "couldn't load" for each panel. Try to renew it
    // before deciding the session is dead.
    const boot = async () => {
      const token = localStorage.getItem('authToken');
      if (token && isTokenExpired(token)) {
        const renewed = await refreshAccessToken();
        if (!renewed) {
          clearAuthStorage();
          setUser(null);
          setIsLoading(false);
          return;
        }
      }
      setUser(readStoredUser());
      setIsLoading(false);
    };

    void boot();

    const syncStoredUser = () => {
      setUser(readStoredUser());
    };

    window.addEventListener('storage', syncStoredUser);
    window.addEventListener('astu-auth-changed', syncStoredUser);

    return () => {
      window.removeEventListener('storage', syncStoredUser);
      window.removeEventListener('astu-auth-changed', syncStoredUser);
    };
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.error('Logout error', e);
    } finally {
      clearAuthStorage();
      setUser(null);
    }
  }, []);

  const hasPermission = useCallback((allowedRoles: UserRole[]): boolean => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
