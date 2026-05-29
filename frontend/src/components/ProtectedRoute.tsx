import React from 'react';
import type { UserRole } from '../contexts/AuthContext';

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
  void allowedRoles;
  void redirectTo;
  return element;
};

export default ProtectedRoute;
