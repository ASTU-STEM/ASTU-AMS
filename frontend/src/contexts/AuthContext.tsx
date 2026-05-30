import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'ALUMNI' | 'EMPLOYER' | 'REGISTRAR' | 'DEPARTMENT_HEAD' | 'ADMIN';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  department?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (role: UserRole, name?: string) => void;
  logout: () => void;
  hasPermission: (allowedRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const MOCK_USERS: Record<UserRole, AuthUser> = {
  ALUMNI: { id: 'alum-001', name: 'Abebe Bikila', email: 'abebe@astu.edu.et', role: 'ALUMNI', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80' },
  EMPLOYER: { id: 'emp-001', name: 'Tigist Haile', email: 'tigist@safir.com', role: 'EMPLOYER', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80' },
  REGISTRAR: { id: 'reg-001', name: 'Dr. Abebe Assefa', email: 'registrar@astu.edu.et', role: 'REGISTRAR', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80' },
  DEPARTMENT_HEAD: { id: 'dept-001', name: 'Dr. Meseret Alemu', email: 'cs.head@astu.edu.et', role: 'DEPARTMENT_HEAD', department: 'Computer Science', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80' },
  ADMIN: { id: 'adm-001', name: 'System Administrator', email: 'admin@astu.edu.et', role: 'ADMIN', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80' },
};

const ROLE_STORAGE_KEY = 'astu_ams_user_role';

const normalizeRole = (role?: string | null): UserRole | null => {
  switch (role?.toUpperCase()) {
    case 'ALUMNI':
      return 'ALUMNI';
    case 'EMPLOYER':
      return 'EMPLOYER';
    case 'REGISTRAR':
      return 'REGISTRAR';
    case 'DEPARTMENT':
    case 'DEPARTMENT_HEAD':
      return 'DEPARTMENT_HEAD';
    case 'ADMIN':
      return 'ADMIN';
    default:
      return null;
  }
};

const readStoredUser = (): AuthUser | null => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      const role = normalizeRole(parsed.role);
      if (role) {
        return {
          id: String(parsed.id ?? MOCK_USERS[role].id),
          name: String(parsed.fullName ?? parsed.name ?? MOCK_USERS[role].name),
          email: String(parsed.email ?? MOCK_USERS[role].email),
          role,
          avatarUrl: parsed.avatarUrl ?? MOCK_USERS[role].avatarUrl,
          department: parsed.department ?? MOCK_USERS[role].department,
        };
      }
    } catch (error) {
      console.warn('Failed to restore stored auth user:', error);
    }
  }

  const savedRole = normalizeRole(localStorage.getItem(ROLE_STORAGE_KEY));
  return savedRole ? MOCK_USERS[savedRole] : null;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const syncStoredUser = () => setUser(readStoredUser());

    syncStoredUser();
    window.addEventListener('storage', syncStoredUser);
    window.addEventListener('astu-auth-changed', syncStoredUser);

    return () => {
      window.removeEventListener('storage', syncStoredUser);
      window.removeEventListener('astu-auth-changed', syncStoredUser);
    };
  }, []);

  const login = (role: UserRole, name?: string) => {
    const mockUser = { ...MOCK_USERS[role] };
    if (name) mockUser.name = name;
    localStorage.setItem(ROLE_STORAGE_KEY, role);
    localStorage.setItem('user', JSON.stringify({ id: mockUser.id, fullName: mockUser.name, email: mockUser.email, role: mockUser.role }));
    window.dispatchEvent(new Event('astu-auth-changed'));
    setUser(mockUser);
  };

  const logout = () => {
    localStorage.removeItem(ROLE_STORAGE_KEY);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('astu-auth-changed'));
    setUser(null);
  };

  const hasPermission = (allowedRoles: UserRole[]): boolean => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
