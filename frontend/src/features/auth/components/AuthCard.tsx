import React from 'react';

interface AuthCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function AuthCard({ children, className = '' }: AuthCardProps) {
  return (
    <div className={`w-full max-w-md rounded-xl border border-outline-variant bg-[var(--bg-card)] p-8 shadow-sm ${className}`}>
      {children}
    </div>
  );
}
