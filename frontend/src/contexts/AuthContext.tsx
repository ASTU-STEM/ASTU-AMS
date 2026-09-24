import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { User, UserRole } from '../types';
import { authService } from '../features/auth/services/auth.service';

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
    setUser(readStoredUser());
    setIsLoading(false);

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
