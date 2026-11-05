import React from 'react';
import { Loader2 } from 'lucide-react';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  fullWidth?: boolean;
}

export default function PrimaryButton({
  type = 'submit',
  variant = 'primary',
  children,
  onClick,
  disabled = false,
  loading = false,
  className = '',
  fullWidth = true,
  ...props
}: PrimaryButtonProps) {
  const baseStyles =
    'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-slate-900';

  const variantStyles = {
    primary:
      'bg-astu-navy text-white shadow-[0_10px_24px_-12px_rgba(7,89,166,0.55)] hover:-translate-y-0.5 hover:bg-[#064a8a] focus-visible:ring-astu-navy dark:bg-sky-600 dark:hover:bg-sky-500 dark:focus-visible:ring-sky-400 motion-reduce:hover:translate-y-0',
    secondary:
      'bg-astu-red text-white shadow-[0_10px_24px_-12px_rgba(227,30,36,0.5)] hover:-translate-y-0.5 hover:bg-[#c4181d] focus-visible:ring-astu-red motion-reduce:hover:translate-y-0',
    outline:
      'border border-slate-200 bg-white text-astu-navy hover:border-astu-navy hover:bg-astu-navy/5 focus-visible:ring-astu-navy dark:border-slate-600 dark:bg-slate-900 dark:text-sky-300 dark:hover:border-sky-500 dark:hover:bg-sky-500/10 dark:focus-visible:ring-sky-400',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
          <span>Please wait...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
