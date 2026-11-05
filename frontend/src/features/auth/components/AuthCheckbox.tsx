import React from 'react';

interface AuthCheckboxProps {
  id: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  className?: string;
}

export default function AuthCheckbox({
  id,
  name,
  checked,
  onChange,
  label,
  className = '',
}: AuthCheckboxProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <input
        id={id}
        name={name}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-slate-300 text-astu-navy focus:ring-astu-navy focus:ring-offset-0 dark:border-slate-600 dark:bg-slate-900"
      />
      <label
        htmlFor={id}
        className="cursor-pointer text-sm text-slate-600 dark:text-slate-300"
      >
        {label}
      </label>
    </div>
  );
}
