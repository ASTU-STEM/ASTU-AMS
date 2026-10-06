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
  const baseStyles = 'rounded-lg py-3 px-4 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2';
  
  const variantStyles = {
    primary: 'bg-astu-navy text-white hover:brightness-110 hover:shadow-md focus:ring-astu-navy',
    secondary: 'bg-astu-red text-white hover:brightness-110 hover:shadow-md focus:ring-astu-red',
    outline: 'border-2 border-outline-variant text-astu-navy hover:bg-[var(--bg-page)] focus:ring-astu-navy bg-white',
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
