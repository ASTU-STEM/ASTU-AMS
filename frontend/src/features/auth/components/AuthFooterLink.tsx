import React from 'react';
import { Link } from 'react-router-dom';

interface AuthFooterLinkProps {
  text: string;
  linkText: string;
  to: string;
}

export default function AuthFooterLink({ text, linkText, to }: AuthFooterLinkProps) {
  return (
    <p className="text-center text-sm text-on-surface-variant dark:text-slate-400">
      {text}{' '}
      <Link to={to} className="font-semibold text-astu-navy dark:text-blue-400 hover:underline dark:hover:text-blue-300 transition-colors">
        {linkText}
      </Link>
    </p>
  );
}
