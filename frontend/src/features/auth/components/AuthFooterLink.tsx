import React from 'react';
import { Link } from 'react-router-dom';

interface AuthFooterLinkProps {
  text: string;
  linkText: string;
  to: string;
}

export default function AuthFooterLink({ text, linkText, to }: AuthFooterLinkProps) {
  return (
    <p className="text-center text-sm text-on-surface-variant">
      {text}{' '}
      <Link to={to} className="font-semibold text-astu-navy hover:underline">
        {linkText}
      </Link>
    </p>
  );
}
