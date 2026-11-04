import React from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

interface AuthInputProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'tel';
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  touched?: boolean;
  disabled?: boolean;
  required?: boolean;
  showPasswordToggle?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
  autoComplete?: string;
}

export default function AuthInput({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  touched,
  disabled = false,
  required = false,
  showPasswordToggle = false,
  showPassword = false,
  onTogglePassword,
  autoComplete,
}: AuthInputProps) {
  const hasError = touched && error;
  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className="space-y-1.5">
      <label 
        htmlFor={name} 
        className="block text-sm font-semibold text-on-surface-variant"
      >
        {label}
        {required && <span className="text-astu-red ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`
            w-full rounded-lg border px-4 py-3 text-sm
            transition-all duration-200
            placeholder:text-on-surface-variant/50
            focus:outline-none focus:ring-2
            disabled:cursor-not-allowed disabled:opacity-50
            ${hasError
              ? 'border-astu-red focus:border-astu-red focus:ring-astu-red/20 bg-astu-red/5'
              : 'border-outline-variant focus:border-astu-navy focus:ring-astu-navy/20 bg-white hover:border-outline-variant/80'
            }
          `}
          aria-invalid={hasError ? true : undefined}
          aria-describedby={hasError ? `${name}-error` : undefined}
        />
        {showPasswordToggle && onTogglePassword && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-astu-navy transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
      {hasError && (
        <div id={`${name}-error`} className="flex items-center gap-1.5 text-xs text-astu-red">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
