import React from 'react';
import { ToolCategory, ToolType } from '../types/tools.types';
import { TOOL_CATEGORIES } from '../data/toolCategories';
import { TOOL_REGISTRY } from '../data/toolRegistry';
import { Search, Star, Filter, X } from 'lucide-react';
import { ALL_TOOL_TYPES, TOOL_TYPE_FILTER_LABELS } from '../utils/toolUi';

const AVAILABLE_TOOL_TYPES = ALL_TOOL_TYPES.filter((value) =>
  TOOL_REGISTRY.some((tool) => tool.toolType === value),
).map((value) => ({ value, label: TOOL_TYPE_FILTER_LABELS[value] }));

interface ToolFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: ToolCategory | 'all' | 'favorites';
  onSelectCategory: (cat: ToolCategory | 'all' | 'favorites') => void;
  selectedType: ToolType | 'all';
  onSelectType: (t: ToolType | 'all') => void;
  favoritesCount: number;
  categoryCounts: Record<string, number>;
  totalTools: number;
}

export const ToolFilters: React.FC<ToolFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  selectedType,
  onSelectType,
  favoritesCount,
  categoryCounts,
  totalTools,
}) => {
  const hasActiveFilters =
    searchQuery.trim() !== '' || selectedCategory !== 'all' || selectedType !== 'all';

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={`Search ${TOOL_REGISTRY.length} alumni tools (e.g. salary, CV, GPA, scholarship, Ethiopia, business)`}
            className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] py-2.5 pl-10 pr-9 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 dark:focus:border-[#FFCC00]/40 transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--text-muted)] hover:text-[var(--text-secondary)] dark:hover:text-slate-200 rounded-md transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Type Filter Select */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] dark:text-slate-400 shrink-0">
            <Filter className="h-3.5 w-3.5 text-blue-500" />
            <span>Type:</span>
          </div>
          <select
            value={selectedType}
            onChange={(e) => onSelectType(e.target.value as any)}
            className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[#003366] dark:focus:border-[#FFCC00]/40 transition-all shadow-xs"
          >
            <option value="all">All Tool Types</option>
            {AVAILABLE_TOOL_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label} ({TOOL_REGISTRY.filter((tool) => tool.toolType === t.value).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Pills Slider / Wrap */}
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
        {/* All Pill */}
        <button
          type="button"
          onClick={() => onSelectCategory('all')}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
            selectedCategory === 'all'
              ? 'bg-[#003366] dark:bg-blue-600 text-white shadow-sm'
              : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-page)] border border-[var(--border-color)] dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700/60 dark:hover:bg-slate-800 dark:hover:text-white'
          }`}
        >
          <span>All Tools</span>
          <span
            className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
              selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-[var(--bg-page)] text-[var(--text-secondary)] dark:bg-slate-700/70 dark:text-slate-300'
            }`}
          >
            {totalTools}
          </span>
        </button>

        {/* Favorites Pill */}
        <button
          type="button"
          onClick={() => onSelectCategory('favorites')}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
            selectedCategory === 'favorites'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-amber-50 hover:text-amber-700 border border-[var(--border-color)] dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700/60 dark:hover:bg-slate-800 dark:hover:text-amber-300'
          }`}
        >
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
          <span>My Favorites</span>
          <span
            className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
              selectedCategory === 'favorites' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
            }`}
          >
            {favoritesCount}
          </span>
        </button>

        {/* 16 Category Pills */}
        {TOOL_CATEGORIES.filter((cat) => (categoryCounts[cat.id] || 0) > 0).map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = categoryCounts[cat.id] || 0;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-[#003366] dark:bg-blue-600 text-white shadow-sm'
                  : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-page)] border border-[var(--border-color)] dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700/60 dark:hover:bg-slate-800 dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{cat.icon}</span>
              <span>{cat.name}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-[var(--bg-page)] text-[var(--text-muted)] dark:bg-slate-700/70 dark:text-slate-300'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-[var(--border-color)] bg-[var(--bg-page)] px-3 py-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Active filters</span>
          {searchQuery.trim() && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-2 py-1 text-[10px] font-bold text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5"
            >
              Search: “{searchQuery.trim()}”
              <X className="h-3 w-3" />
            </button>
          )}
          {selectedCategory !== 'all' && (
            <button
              type="button"
              onClick={() => onSelectCategory('all')}
              className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-2 py-1 text-[10px] font-bold text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5"
            >
              {selectedCategory === 'favorites'
                ? 'Favorites only'
                : TOOL_CATEGORIES.find((c) => c.id === selectedCategory)?.name || selectedCategory}
              <X className="h-3 w-3" />
            </button>
          )}
          {selectedType !== 'all' && (
            <button
              type="button"
              onClick={() => onSelectType('all')}
              className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-2 py-1 text-[10px] font-bold text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5"
            >
              {TOOL_TYPE_FILTER_LABELS[selectedType]}
              <X className="h-3 w-3" />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              onSearchChange('');
              onSelectCategory('all');
              onSelectType('all');
            }}
            className="ml-auto text-[10px] font-bold text-[#003366] hover:underline dark:text-[#FFD700]"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};
