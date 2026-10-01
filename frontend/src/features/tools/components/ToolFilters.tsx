import React from 'react';
import { ToolCategory, ToolType } from '../types/tools.types';
import { TOOL_CATEGORIES } from '../data/toolCategories';
import { Search, Star, Filter, X } from 'lucide-react';

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
  return (
    <div className="space-y-4">
      {/* Search Bar Row */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search 160+ alumni tools (e.g. salary, CV, GPA, scholarship, Ethiopia, relocation, business)..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-9 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Type Filter Select */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Filter className="h-3.5 w-3.5" />
            <span>Type:</span>
          </div>
          <select
            value={selectedType}
            onChange={(e) => onSelectType(e.target.value as any)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-[#003366] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="all">All Tool Types</option>
            <option value="FRONTEND_UTILITY">Instant Utilities (Calculators)</option>
            <option value="DATA_DRIVEN">ASTU Portal Data-Driven</option>
            <option value="AI_ASSISTED">AI Generators & Assistants</option>
            <option value="GUIDED_WORKFLOW">Interactive Checklists</option>
            <option value="VERIFIED_RESOURCE">Verified Resources</option>
          </select>
        </div>
      </div>

      {/* Category Pills Slider / Wrap */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {/* All Pill */}
        <button
          type="button"
          onClick={() => onSelectCategory('all')}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
            selectedCategory === 'all'
              ? 'bg-[#003366] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800'
          }`}
        >
          <span>All Tools</span>
          <span
            className={`rounded-full px-1.5 py-0.2 text-[10px] ${
              selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800'
            }`}
          >
            {totalTools}
          </span>
        </button>

        {/* Favorites Pill */}
        <button
          type="button"
          onClick={() => onSelectCategory('favorites')}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
            selectedCategory === 'favorites'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-amber-50 hover:text-amber-700 border border-slate-200/80 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800'
          }`}
        >
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
          <span>My Favorites</span>
          <span
            className={`rounded-full px-1.5 py-0.2 text-[10px] ${
              selectedCategory === 'favorites' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800 dark:bg-amber-950'
            }`}
          >
            {favoritesCount}
          </span>
        </button>

        {/* 16 Category Pills */}
        {TOOL_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = categoryCounts[cat.id] || 0;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-[#003366] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{cat.icon}</span>
              <span>{cat.name}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
