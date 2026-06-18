import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../types';

interface ProtectedRouteProps {
  element: React.ReactElement;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

const AUTH_GUARD_ENABLED = false;

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  element,
  allowedRoles,
  redirectTo = '/login',
}) => {
  const location = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!AUTH_GUARD_ENABLED && !localStorage.getItem('user')) {
      const path = location.pathname;
      const roleMap: Record<string, UserRole> = {
        alumni: 'ALUMNI',
        employer: 'EMPLOYER',
        registrar: 'REGISTRAR',
        department: 'DEPARTMENT_HEAD',
        admin: 'ADMIN',
        cms: 'CMS_MANAGER',
      };
      const detected = Object.entries(roleMap).find(([key]) => path.includes(key));
      const role = detected?.[1] || 'ADMIN';
      localStorage.setItem('user', JSON.stringify({
        id: `demo-${role.toLowerCase()}`,
        email: `${role.toLowerCase()}@astu.edu.et`,
        firstName: role.charAt(0) + role.slice(1).toLowerCase(),
        lastName: 'User',
        role,
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2026-01-01',
      }));
      localStorage.setItem('astu_ams_user_role', role);
      window.dispatchEvent(new Event('astu-auth-changed'));
    }
  }, [location.pathname]);

  if (!AUTH_GUARD_ENABLED) {
    return element;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-astu-navy mx-auto" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="mt-4 text-sm text-on-surface-variant">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />;
  }

  if (!allowedRoles.includes(user.role)) {
    const dashboardMap: Record<string, string> = {
      ALUMNI: '/alumni/dashboard',
      EMPLOYER: '/employer/dashboard',
      REGISTRAR: '/registrar/dashboard',
      DEPARTMENT_HEAD: '/department/dashboard',
      ADMIN: '/admin/dashboard',
      CMS_MANAGER: '/cms/dashboard',
    };
    return <Navigate to={dashboardMap[user.role] || '/'} replace />;
  }

  return element;
};

export default ProtectedRoute;
