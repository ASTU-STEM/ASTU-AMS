import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';

interface SupportLinkProps {
  currentRoute?: string;
  lastErrorCode?: string;
  sessionId?: string;
  label?: string;
  className?: string;
}

export default function SupportLink({
  currentRoute,
  lastErrorCode,
  sessionId,
  label = 'Need help? Contact Support',
  className = ''
}: SupportLinkProps) {
  // If not provided, grab current pathname
  const currentPath = currentRoute || window.location.pathname;

  return (
    <Link
      to="/support"
      state={{
        currentRoute: currentPath,
        lastErrorCode,
        sessionId
      }}
      className={`text-xs text-on-surface-variant hover:text-astu-navy font-semibold inline-flex items-center gap-1.5 hover:underline transition-all ${className}`}
    >
      <HelpCircle className="h-3.5 w-3.5 flex-shrink-0" />
      <span>{label}</span>
    </Link>
  );
}
