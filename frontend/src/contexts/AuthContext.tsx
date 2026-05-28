import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'alumni' | 'employer' | 'registrar' | 'department' | 'admin';

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
  alumni: { id: 'alum-001', name: 'Abebe Bikila', email: 'abebe@astu.edu.et', role: 'alumni', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80' },
  employer: { id: 'emp-001', name: 'Tigist Haile', email: 'tigist@safir.com', role: 'employer', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80' },
  registrar: { id: 'reg-001', name: 'Dr. Abebe Assefa', email: 'registrar@astu.edu.et', role: 'registrar', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80' },
  department: { id: 'dept-001', name: 'Dr. Meseret Alemu', email: 'cs.head@astu.edu.et', role: 'department', department: 'Computer Science', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80' },
  admin: { id: 'adm-001', name: 'System Administrator', email: 'admin@astu.edu.et', role: 'admin', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80' },
};

const ROLE_STORAGE_KEY = 'astu_ams_user_role';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    // Restore session from localStorage on mount
    const savedRole = localStorage.getItem(ROLE_STORAGE_KEY) as UserRole | null;
    if (savedRole && MOCK_USERS[savedRole]) {
      setUser(MOCK_USERS[savedRole]);
    }
  }, []);

  const login = (role: UserRole, name?: string) => {
    const mockUser = { ...MOCK_USERS[role] };
    if (name) mockUser.name = name;
    localStorage.setItem(ROLE_STORAGE_KEY, role);
    setUser(mockUser);
  };

  const logout = () => {
    localStorage.removeItem(ROLE_STORAGE_KEY);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
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
