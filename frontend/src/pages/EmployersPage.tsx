import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * EmployersPage
 * Seamless redirection hub to the unified Master Partners & Employers portal (/partners?tab=employers).
 */
export default function EmployersPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/partners?tab=employers', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-3">
        <div className="h-10 w-10 border-4 border-[#003366] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-600">
          Connecting to ASTU Corporate Partners & Employers Directory...
        </p>
      </div>
    </div>
  );
}