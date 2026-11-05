import React from 'react';
import { Loader2 } from 'lucide-react';

interface AuthButtonProps {
  type?: 'submit' | 'button';
  variant?: 'primary' | 'secondary' | 'outline';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  fullWidth?: boolean;
}

export default function AuthButton({
  type = 'submit',
  variant = 'primary',
  children,
  onClick,
  disabled = false,
  loading = false,
  className = '',
  fullWidth = true,
}: AuthButtonProps) {
  const baseStyles =
    'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-slate-900';

  const variantStyles = {
    primary:
      'bg-astu-navy text-white shadow-[0_10px_24px_-12px_rgba(7,89,166,0.55)] hover:-translate-y-0.5 hover:bg-[#064a8a] focus-visible:ring-astu-navy dark:bg-sky-600 dark:hover:bg-sky-500 dark:focus-visible:ring-sky-400 motion-reduce:hover:translate-y-0',
    secondary:
      'bg-astu-red text-white shadow-[0_10px_24px_-12px_rgba(227,30,36,0.5)] hover:-translate-y-0.5 hover:bg-[#c4181d] focus-visible:ring-astu-red motion-reduce:hover:translate-y-0',
    outline:
      'border border-astu-navy/30 bg-white text-astu-navy hover:border-astu-navy hover:bg-astu-navy/5 focus-visible:ring-astu-navy dark:border-sky-500/40 dark:bg-transparent dark:text-sky-300 dark:hover:bg-sky-500/10 dark:focus-visible:ring-sky-400',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Please wait...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
