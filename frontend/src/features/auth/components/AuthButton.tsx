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
  const baseStyles = 'rounded-lg py-3 px-4 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
  
  const variantStyles = {
    primary: 'bg-astu-navy text-white hover:brightness-110 hover:shadow-lg focus:ring-astu-navy',
    secondary: 'bg-astu-red text-white hover:brightness-110 hover:shadow-lg focus:ring-astu-red',
    outline: 'border-2 border-astu-navy text-astu-navy hover:bg-astu-navy hover:text-white focus:ring-astu-navy',
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
