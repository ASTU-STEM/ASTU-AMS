import React from 'react';
import { Link } from 'react-router-dom';

interface AuthFooterLinkProps {
  text: string;
  linkText: string;
  to: string;
}

export default function AuthFooterLink({ text, linkText, to }: AuthFooterLinkProps) {
  return (
    <p className="text-center text-sm text-slate-600 dark:text-slate-400">
      {text}{' '}
      <Link
        to={to}
        className="font-bold text-astu-navy transition hover:underline dark:text-sky-300 dark:hover:text-sky-200"
      >
        {linkText}
      </Link>
    </p>
  );
}
