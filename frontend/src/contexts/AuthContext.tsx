import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { User, UserRole } from '../types';
import { authService } from '../features/auth/services/auth.service';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (role: UserRole, name?: string) => void;
  logout: () => void;
  hasPermission: (allowedRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const MOCK_USERS: Record<string, User> = {
  ALUMNI: { id: 'alum-001', email: 'abebe@astu.edu.et', firstName: 'Abebe', lastName: 'Bikila', role: 'ALUMNI', isActive: true, createdAt: '2024-01-01', updatedAt: '2026-01-01' },
  EMPLOYER: { id: 'emp-001', email: 'tigist@safir.com', firstName: 'Tigist', lastName: 'Haile', role: 'EMPLOYER', isActive: true, createdAt: '2024-01-01', updatedAt: '2026-01-01' },
  REGISTRAR: { id: 'reg-001', email: 'registrar@astu.edu.et', firstName: 'Abebe', lastName: 'Assefa', role: 'REGISTRAR', isActive: true, createdAt: '2024-01-01', updatedAt: '2026-01-01' },
  DEPARTMENT_HEAD: { id: 'dept-001', email: 'cs.head@astu.edu.et', firstName: 'Meseret', lastName: 'Alemu', role: 'DEPARTMENT_HEAD', isActive: true, createdAt: '2024-01-01', updatedAt: '2026-01-01' },
  ADMIN: { id: 'adm-001', email: 'admin@astu.edu.et', firstName: 'System', lastName: 'Administrator', role: 'ADMIN', isActive: true, createdAt: '2024-01-01', updatedAt: '2026-01-01' },
  SUPER_ADMIN: { id: 'super-adm-001', email: 'admin@astust.edu.et', firstName: 'Tolosa Abebe', lastName: 'Badho', role: 'SUPER_ADMIN', isActive: true, createdAt: '2024-01-01', updatedAt: '2026-01-01' },
  CMS_MANAGER: { id: 'cms-mgr-001', email: 'cms@astu.edu.et', firstName: 'Content', lastName: 'Manager', role: 'CMS_MANAGER', isActive: true, createdAt: '2024-01-01', updatedAt: '2026-01-01' },
};

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
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      const role = normalizeRole(parsed.role);
      if (role) {
        const mock = MOCK_USERS[role];
        const rawName = parsed.name || parsed.fullName || '';
        const firstName = parsed.firstName !== undefined && parsed.firstName !== '' 
          ? parsed.firstName 
          : (rawName ? rawName.split(' ')[0] : (mock?.firstName ?? ''));
        const lastName = parsed.lastName !== undefined && parsed.lastName !== ''
          ? parsed.lastName 
          : (rawName ? rawName.split(' ').slice(1).join(' ') : (mock?.lastName ?? ''));
        
        return {
          id: String(parsed.id ?? mock?.id ?? ''),
          email: String(parsed.email ?? mock?.email ?? ''),
          firstName: String(firstName),
          lastName: String(lastName),
          name: String(rawName || `${firstName} ${lastName}`.trim()),
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
  const savedRole = normalizeRole(localStorage.getItem('astu_ams_user_role'));
  return savedRole ? MOCK_USERS[savedRole] ?? null : null;
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

  const login = useCallback((role: UserRole, name?: string) => {
    const mockUser = MOCK_USERS[role];
    if (!mockUser) return;
    const userData = name ? { ...mockUser, firstName: name.split(' ')[0], lastName: name.split(' ').slice(1).join(' ') } : mockUser;
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
