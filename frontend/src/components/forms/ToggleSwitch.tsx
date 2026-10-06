import React from 'react';

interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  disabled?: boolean;
}

export default function ToggleSwitch({ label, checked, onChange, description, disabled }: ToggleSwitchProps) {
  return (
    <label className={`flex items-start gap-3 cursor-pointer ${disabled ? 'opacity-50' : ''}`}>
      <div className="relative mt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={`w-10 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-astu-navy' : 'bg-[var(--bg-page)]'}`}
        >
          <div
            className={`w-4 h-4 bg-[var(--bg-card)] rounded-full shadow-sm transition-transform duration-200 absolute top-1 ${
              checked ? 'translate-x-5' : 'translate-x-1'
            }`}
          />
        </div>
      </div>
      <div>
        <span className="text-sm font-medium text-on-surface">{label}</span>
        {description && <p className="text-xs text-on-surface-variant mt-0.5">{description}</p>}
      </div>
    </label>
  );
}
