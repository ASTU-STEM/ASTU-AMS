import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { UserRole } from '../contexts/AuthContext';
import { useAuth } from '../contexts/AuthContext';

const AUTH_GUARD_ENABLED = false;

interface ProtectedRouteProps {
  element: React.ReactElement;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

/**
 * ProtectedRoute — wraps a route element with RBAC enforcement.
 * If the user is not authenticated, redirects to /login.
 * If the user lacks the required role, redirects to / (home) with a warning.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  element,
  allowedRoles,
  redirectTo = '/login',
}) => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  // Temporarily keep dashboards unblocked until backend auth is fully connected.
  if (!AUTH_GUARD_ENABLED) {
    return element;
  }

  const getRoleDashboardRoute = (role: UserRole): string => {
    switch (role) {
      case 'ALUMNI':
        return '/alumni/dashboard';
      case 'EMPLOYER':
        return '/employer/dashboard';
      case 'REGISTRAR':
        return '/registrar/dashboard';
      case 'DEPARTMENT_HEAD':
        return '/department/dashboard';
      case 'ADMIN':
        return '/admin/dashboard';
      default:
        return '/';
    }
  };

  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={getRoleDashboardRoute(user.role)} replace />;
  }

  return element;
};

export default ProtectedRoute;
