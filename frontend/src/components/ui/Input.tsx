import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export default function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-on-surface">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-on-surface 
            placeholder:text-on-surface-variant/50 
            focus:outline-none focus:ring-2 focus:ring-astu-navy/20 focus:border-astu-navy
            ${error ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-outline-variant'}
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${className}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {helperText && !error && <p className="text-xs text-on-surface-variant">{helperText}</p>}
    </div>
  );
}
