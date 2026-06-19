import React from 'react';
import { Search } from 'lucide-react';

interface NavbarSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function NavbarSearch({ value, onChange, placeholder = 'Search...' }: NavbarSearchProps) {
  return (
    <label className="group hidden h-11 w-[420px] max-w-[36vw] items-center rounded-full border bg-[#F3F5FA] px-3 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 md:flex focus-within:border-[#003580] focus-within:ring-2 focus-within:ring-[#003580]/10 dark:bg-[#1E2130]"
      style={{ borderColor: 'var(--border-color)' }}>
      <span className="mr-2 inline-flex h-5 w-5 items-center justify-center text-[#8FA3BF]">
        <Search className="h-4.5 w-4.5 flex-none" />
      </span>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent outline-none placeholder:text-[#7C879D] dark:placeholder:text-[#97A0B8]"
      />
    </label>
  );
}
