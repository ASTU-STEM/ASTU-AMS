import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { User, UserRole } from '../types';
import { authService } from '../../domains/auth/services/auth.service';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (role: UserRole, name?: string) => void;
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
    case 'ALUMNI_OFFICE':
    case 'CMS_MANAGER': return 'CMS_MANAGER';
    default: return null;
  }
};

const readStoredUser = (): User | null => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      const role = normalizeRole(parsed.role);
      if (role) {
        return {
          id: String(parsed.id ?? ''),
          email: String(parsed.email ?? ''),
          role,
          isActive: true,
          createdAt: parsed.createdAt ?? '2024-01-01',
          updatedAt: parsed.updatedAt ?? '2026-01-01',
        };
      }
    } catch {
      console.warn('Failed to restore stored auth user');
    }
  }
  return null;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      authService.getCurrentUser()
        .then(result => {
          if (result.ok && result.data?.user) {
            const apiUser = result.data.user;
            const role = normalizeRole(apiUser.role);
            if (role) {
              const userData: User = {
                id: apiUser.id,
                email: apiUser.email,
                role,
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              setUser(userData);
              localStorage.setItem('user', JSON.stringify(userData));
              localStorage.setItem('astu_ams_user_role', role);
            }
          }
          setIsLoading(false);
        })
        .catch(() => {
          setUser(readStoredUser());
          setIsLoading(false);
        });
    } else {
      setUser(readStoredUser());
      setIsLoading(false);
    }

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

  const login = useCallback(async (role: UserRole, name?: string) => {
    try {
      const email = `${role.toLowerCase()}@astu.edu.et`;
      const result = await authService.login({ emailOrStudentId: email, password: 'Password@123' });
      if (result.ok) return;
    } catch {}

    const userData: User = {
      id: `${role.toLowerCase()}-001`,
      email: `${role.toLowerCase()}@astu.edu.et`,
      role,
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2026-01-01',
    };
    localStorage.setItem('astu_ams_user_role', role);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('authToken', 'mock-jwt-token-' + Date.now());
    window.dispatchEvent(new Event('astu-auth-changed'));
    setUser(userData);
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
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
