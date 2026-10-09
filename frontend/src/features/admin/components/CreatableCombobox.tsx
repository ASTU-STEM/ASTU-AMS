import React, { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export interface CreatableComboboxProps {
  label: string;
  required?: boolean;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  presets: string[];
  helperText?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export default function CreatableCombobox({
  label,
  required,
  value,
  onChange,
  placeholder,
  presets,
  helperText,
  icon: Icon,
}: CreatableComboboxProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
          {label} {required && <span className="text-rose-500 font-black">*</span>}
        </label>
        <span className="text-[10px] text-slate-400 font-medium">Select preset or type custom</span>
      </div>

      <div className="relative">
        <div className="relative flex items-center">
          {Icon && (
            <div className="absolute left-3 text-slate-400 pointer-events-none">
              <Icon className="h-4 w-4" />
            </div>
          )}
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] transition-all pr-9 shadow-2xs ${
              Icon ? 'pl-9' : 'pl-3.5'
            }`}
          />
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="absolute right-2 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Toggle Presets Dropdown"
          >
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {dropdownOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
            <div className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-56 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-700 mb-1">
                Suggested Presets (Click to choose or edit)
              </div>
              {presets.map((preset) => {
                const isSelected = value === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      onChange(preset);
                      setDropdownOpen(false);
                    }}
                    className={`flex items-center justify-between w-full rounded-lg px-2.5 py-2 text-xs font-medium text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 text-[#003366] font-bold dark:bg-sky-500/10 dark:text-sky-400'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{preset}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-[#003366] dark:text-sky-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {helperText && <p className="text-[11px] text-slate-500">{helperText}</p>}
    </div>
  );
}
