import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useRegistration } from '../contexts/RegistrationContext';

interface VerificationRouteGuardProps {
  children?: React.ReactNode;
}

export default function VerificationRouteGuard({ children }: VerificationRouteGuardProps) {
  const { registrationDetails } = useRegistration();

  useEffect(() => {
    if (!registrationDetails) {
      toast.error('Registration session not found or expired. Please sign up first.');
    }
  }, [registrationDetails]);

  if (!registrationDetails) {
    return <Navigate to="/register" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
