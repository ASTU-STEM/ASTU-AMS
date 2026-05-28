import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '../contexts/AuthContext';

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
  redirectTo = '/',
}) => {
  const { isAuthenticated, hasPermission } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasPermission(allowedRoles)) {
    return <Navigate to={redirectTo} replace />;
  }

  return element;
};

export default ProtectedRoute;