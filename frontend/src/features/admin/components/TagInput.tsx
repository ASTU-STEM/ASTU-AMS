import React, { useCallback, useState } from 'react';
import { Plus, X, Hash } from 'lucide-react';

export type TagInputProps = {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  maxTags?: number;
  allowDuplicates?: boolean;
  className?: string;
};

export default function TagInput({
  value,
  onChange,
  placeholder = 'Add a tag and press Enter',
  suggestions = [],
  maxTags,
  allowDuplicates = false,
  className = '',
}: TagInputProps) {
  const [draft, setDraft] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const addTag = useCallback(
    (tag: string) => {
      const cleaned = tag.trim();
      if (!cleaned) return;
      if (maxTags && value.length >= maxTags) return;
      if (!allowDuplicates && value.includes(cleaned)) return;
      onChange([...value, cleaned]);
      setDraft('');
    },
    [onChange, value, maxTags, allowDuplicates]
  );

  const removeTag = useCallback(
    (tag: string) => {
      onChange(value.filter((existing) => existing !== tag));
    },
    [onChange, value]
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addTag(draft);
    } else if (event.key === 'Backspace' && !draft && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  const filteredSuggestions = suggestions.filter(
    (s) => !value.includes(s) && s.toLowerCase().includes(draft.toLowerCase())
  );

  return (
    <div className={`relative ${className}`}>
      <div className="flex flex-wrap items-center gap-1.5 rounded-[8px] border border-slate-200 bg-white px-2 py-1.5 focus-within:border-[#003580] focus-within:ring-2 focus-within:ring-[#003580]/10">
        <Hash className="ml-1 h-3.5 w-3.5 text-slate-400" />
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-md bg-[#003580]/10 px-2 py-0.5 text-[11px] font-semibold text-[#003580]"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full hover:bg-[#003580]/20"
              aria-label={`Remove ${tag}`}
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
        {draft && (
          <button
            type="button"
            onClick={() => addTag(draft)}
            className="inline-flex h-6 items-center gap-1 rounded-md bg-[#003580] px-2 text-[10px] font-semibold text-white hover:brightness-110"
          >
            <Plus className="h-3 w-3" />
            Add
          </button>
        )}
      </div>
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-44 overflow-y-auto rounded-[8px] border border-slate-200 bg-white py-1 shadow-lg">
          <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Suggestions
          </div>
          {filteredSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => addTag(suggestion)}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-50"
            >
              <Hash className="h-3 w-3 text-slate-400" />
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
