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
      <label htmlFor={name} className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label}
        {required ? <span className="ml-1 text-astu-red">*</span> : null}
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
            w-full rounded-xl border px-4 py-3 text-sm text-slate-900
            transition-all duration-200
            placeholder:text-slate-400
            focus:outline-none focus:ring-2
            disabled:cursor-not-allowed disabled:opacity-50
            dark:text-slate-100 dark:placeholder:text-slate-500
            ${
              hasError
                ? 'border-astu-red bg-astu-red/5 focus:border-astu-red focus:ring-astu-red/20 dark:bg-rose-500/10'
                : 'border-slate-200 bg-white hover:border-slate-300 focus:border-astu-navy focus:ring-astu-navy/20 dark:border-slate-600 dark:bg-slate-950/60 dark:hover:border-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-400/20'
            }
            ${showPasswordToggle ? 'pr-11' : ''}
          `}
          aria-invalid={hasError ? true : undefined}
          aria-describedby={hasError ? `${name}-error` : undefined}
        />
        {showPasswordToggle && onTogglePassword ? (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-astu-navy dark:hover:text-sky-300"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        ) : null}
      </div>
      {hasError ? (
        <div id={`${name}-error`} className="flex items-center gap-1.5 text-xs text-astu-red">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}
    </div>
  );
}
