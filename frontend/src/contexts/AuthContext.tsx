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

const readStoredUser = (): User | null => {
  // Authentication may only be restored from a successful backend login.  In
  // particular, never infer a user or role from a browser-only preference.
  if (!localStorage.getItem('authToken')) return null;

  const storedUser = localStorage.getItem('user');
  if (!storedUser) return null;

  try {
    const parsed = JSON.parse(storedUser);
    const role = normalizeRole(parsed.role);
    const rawName = typeof parsed.name === 'string' ? parsed.name : (typeof parsed.fullName === 'string' ? parsed.fullName : '');
    const nameParts = rawName.trim().split(/\s+/).filter(Boolean);
    const firstName = typeof parsed.firstName === 'string' && parsed.firstName.trim() ? parsed.firstName.trim() : nameParts[0];
    const lastName = typeof parsed.lastName === 'string' && parsed.lastName.trim() ? parsed.lastName.trim() : nameParts.slice(1).join(' ');

    if (!role || !parsed.id || !parsed.email || !firstName || !lastName) return null;

    return {
      id: String(parsed.id),
      email: String(parsed.email),
      firstName,
      lastName,
      name: rawName || `${firstName} ${lastName}`,
      department: typeof parsed.department === 'string' ? parsed.department : undefined,
      role,
      isActive: parsed.isActive !== false,
      createdAt: typeof parsed.createdAt === 'string' ? parsed.createdAt : '',
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : '',
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
