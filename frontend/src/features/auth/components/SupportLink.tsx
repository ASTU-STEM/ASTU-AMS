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
      className={`inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-astu-navy hover:underline dark:text-slate-400 dark:hover:text-sky-300 ${className}`}
    >
      <HelpCircle className="h-3.5 w-3.5 flex-shrink-0" />
      <span>{label}</span>
    </Link>
  );
}
