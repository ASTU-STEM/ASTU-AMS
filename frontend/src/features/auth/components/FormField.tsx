import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FormFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> {
  label: string;
  name: string;
  as?: 'input' | 'select' | 'textarea';
  error?: string;
  touched?: boolean;
  helpText?: string;
  children?: React.ReactNode;
  rows?: number;
}

export default function FormField({
  label,
  name,
  as = 'input',
  error,
  touched,
  helpText,
  required,
  className = '',
  children,
  id,
  ...props
}: FormFieldProps) {
  const hasError = !!(touched && error);
  const fieldId = id || name;
  const errorId = `${fieldId}-error`;
  const helpId = `${fieldId}-help`;

  const inputClasses = `
    w-full rounded-xl border px-4 py-3 text-sm text-slate-900
    transition-all duration-200 bg-white
    placeholder:text-slate-400
    focus:outline-none focus:ring-2
    disabled:cursor-not-allowed disabled:opacity-50
    dark:bg-slate-950/60 dark:text-slate-100 dark:placeholder:text-slate-500
    ${
      hasError
        ? 'border-astu-red focus:border-astu-red focus:ring-astu-red/20 bg-astu-red/5 dark:bg-rose-500/10'
        : 'border-slate-200 hover:border-slate-300 focus:border-astu-navy focus:ring-astu-navy/20 dark:border-slate-600 dark:hover:border-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-400/20'
    }
  `;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <label htmlFor={fieldId} className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label}
        {required ? <span className="ml-1 text-astu-red">*</span> : null}
      </label>

      <div className="relative">
        {as === 'select' ? (
          <select
            id={fieldId}
            name={name}
            className={inputClasses}
            aria-invalid={hasError ? true : undefined}
            aria-describedby={`${hasError ? errorId : ''} ${helpText ? helpId : ''}`.trim() || undefined}
            required={required}
            {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
          >
            {children}
          </select>
        ) : as === 'textarea' ? (
          <textarea
            id={fieldId}
            name={name}
            className={inputClasses}
            aria-invalid={hasError ? true : undefined}
            aria-describedby={`${hasError ? errorId : ''} ${helpText ? helpId : ''}`.trim() || undefined}
            required={required}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            id={fieldId}
            name={name}
            className={inputClasses}
            aria-invalid={hasError ? true : undefined}
            aria-describedby={`${hasError ? errorId : ''} ${helpText ? helpId : ''}`.trim() || undefined}
            required={required}
            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
      </div>

      {helpText && !hasError ? (
        <p id={helpId} className="text-[11px] leading-normal text-slate-500 dark:text-slate-400">
          {helpText}
        </p>
      ) : null}

      {hasError ? (
        <div
          id={errorId}
          className="flex items-center gap-1.5 text-xs font-medium text-astu-red"
          role="alert"
        >
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}
    </div>
  );
}
