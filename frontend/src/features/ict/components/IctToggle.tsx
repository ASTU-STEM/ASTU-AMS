import React from 'react';

/** Accessible on/off switch used by feature flags and policy toggles */
export default function IctToggle({
  checked,
  onChange,
  label,
  disabled = false,
  size = 'md',
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
}) {
  const w = size === 'sm' ? 'h-5 w-9' : 'h-[22px] w-10';
  const knob = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  const shift = size === 'sm' ? 'translate-x-4' : 'translate-x-[18px]';
  const base = 'translate-x-0.5';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex ${w} shrink-0 items-center rounded-full border transition-colors duration-200 ict-focus disabled:cursor-not-allowed disabled:opacity-50 ${
        checked
          ? 'border-[var(--ict-accent)] bg-[var(--ict-accent)]'
          : 'border-[var(--border-color)] bg-[var(--ict-control-track)]'
      } ${disabled ? '' : 'cursor-pointer'}`}
    >
      <span
        className={`pointer-events-none inline-block ${knob} rounded-full bg-[var(--bg-elevated)] shadow-sm ring-1 ring-black/5 transition-transform duration-200 ${
          checked ? shift : base
        }`}
      />
    </button>
  );
}
