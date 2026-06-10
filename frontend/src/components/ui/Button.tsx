import React, { useState } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variants = {
  primary: 'bg-astu-navy text-white hover:bg-astu-navy/90 shadow-sm',
  secondary: 'bg-astu-green text-white hover:bg-astu-green/90 shadow-sm',
  outline: 'border border-outline-variant text-on-surface hover:bg-surface-container-low',
  ghost: 'text-on-surface hover:bg-surface-container-low',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ripple = { x: e.clientX - rect.left, y: e.clientY - rect.top, id: Date.now() };
    setRipples(prev => [...prev, ripple]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== ripple.id)), 600);
    props.onClick?.(e);
  };

  return (
    <button
      className={`relative inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 
        ${variants[variant]} ${sizes[size]} 
        ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'active:scale-[0.97] hover:brightness-105'}
        ${className}`}
      disabled={disabled || isLoading}
      {...props}
      onClick={handleClick}
    >
      {isLoading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {!isLoading && leftIcon}
      {children}
      {!isLoading && rightIcon}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 animate-ripple pointer-events-none"
          style={{ left: ripple.x - 10, top: ripple.y - 10, width: 20, height: 20 }}
        />
      ))}
    </button>
  );
}
