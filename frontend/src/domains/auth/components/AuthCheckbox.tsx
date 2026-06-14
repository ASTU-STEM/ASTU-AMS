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
        className="h-4 w-4 rounded border-outline-variant text-astu-navy focus:ring-astu-navy focus:ring-offset-0"
      />
      <label htmlFor={id} className="text-sm text-on-surface-variant cursor-pointer">
        {label}
      </label>
    </div>
  );
}
