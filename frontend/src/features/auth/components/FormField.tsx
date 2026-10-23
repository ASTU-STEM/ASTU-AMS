import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> {
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
    w-full rounded-lg border px-4 py-3 text-sm
    transition-all duration-200 bg-white text-on-surface dark:bg-slate-800/80 dark:text-white
    placeholder:text-on-surface-variant/40 dark:placeholder:text-slate-500
    focus:outline-none focus:ring-2
    disabled:cursor-not-allowed disabled:opacity-50
    ${hasError
      ? 'border-astu-red focus:border-astu-red focus:ring-astu-red/20 bg-astu-red/5 dark:bg-red-950/20 dark:border-red-500'
      : 'border-outline-variant focus:border-astu-navy focus:ring-astu-navy/20 hover:border-outline-variant/80 dark:border-slate-700 dark:focus:border-blue-400 dark:focus:ring-blue-400/20'
    }
  `;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <label 
        htmlFor={fieldId} 
        className="block text-sm font-semibold text-on-surface-variant dark:text-slate-300"
      >
        {label}
        {required && <span className="text-astu-red ml-1">*</span>}
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

      {helpText && !hasError && (
        <p id={helpId} className="text-[11px] text-on-surface-variant/85 leading-normal">
          {helpText}
        </p>
      )}

      {hasError && (
        <div id={errorId} className="flex items-center gap-1.5 text-xs text-astu-red font-medium" role="alert">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
