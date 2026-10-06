import React from 'react';
import { ToolItem } from '../types/tools.types';
import { TOOL_CATEGORIES } from '../data/toolCategories';
import { Star, ArrowRight, Clock } from 'lucide-react';
import { ToolTypeBadge } from './ToolTypeBadge';

interface ToolCardProps {
  tool: ToolItem;
  isFavorite: boolean;
  onToggleFavorite: (toolId: string) => void;
  onOpenTool: (tool: ToolItem) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({
  tool,
  isFavorite,
  onToggleFavorite,
  onOpenTool,
}) => {
  const categoryName = TOOL_CATEGORIES.find((c) => c.id === tool.category)?.name;

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#003366]/40 hover:shadow-lg dark:hover:border-[#FFCC00]/35 backdrop-blur-sm">
      {/* Top Header Row */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--bg-page)] text-[#003366] transition-transform group-hover:scale-105 group-hover:bg-[#003366] group-hover:text-white dark:text-[#FFD700] dark:group-hover:bg-[#FFCC00] dark:group-hover:text-[#003366] shadow-xs">
              <span className="material-symbols-outlined text-2xl">{tool.icon}</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <ToolTypeBadge toolType={tool.toolType} />
                {tool.isFeatured && (
                  <span className="rounded-full bg-amber-100 dark:bg-amber-950/50 px-2 py-0.5 text-[10px] font-extrabold text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                    ⭐ Featured
                  </span>
                )}
                {tool.isPopular && (
                  <span className="rounded-full bg-orange-100 dark:bg-orange-950/40 px-2 py-0.5 text-[10px] font-extrabold text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-800/60">
                    🔥 Popular
                  </span>
                )}
                {tool.isNew && (
                  <span className="rounded-full bg-violet-100 dark:bg-violet-950/40 px-2 py-0.5 text-[10px] font-extrabold text-violet-800 dark:text-violet-300 border border-violet-200 dark:border-violet-800/60">
                    New
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(tool.id);
            }}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
              isFavorite
                ? 'bg-amber-50 text-amber-500 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-400'
                : 'text-[var(--text-muted)] hover:bg-[var(--bg-page)] hover:text-[var(--text-secondary)] dark:hover:bg-slate-800 dark:text-slate-500 dark:hover:text-slate-300'
            }`}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={`h-4.5 w-4.5 ${isFavorite ? 'fill-amber-400 text-amber-500' : ''}`} />
          </button>
        </div>

        {/* Title and Description */}
        <h3 className="mt-3 text-sm sm:text-base font-bold tracking-tight text-[var(--text-primary)] group-hover:text-[#003366] transition-colors dark:group-hover:text-[#FFD700] line-clamp-1">
          {tool.name}
        </h3>
        {categoryName && (
          <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{categoryName}</p>
        )}
        <p className="mt-1.5 text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
          {tool.description}
        </p>
        {typeof tool.estimatedMinutes === 'number' && tool.estimatedMinutes > 0 && (
          <p className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--text-muted)]">
            <Clock className="h-3 w-3" aria-hidden />
            ~{tool.estimatedMinutes} min
          </p>
        )}
      </div>

      {/* Footer Row */}
      <div className="mt-4 pt-3 border-t border-[var(--border-color)]">
        <div className="flex items-center justify-between gap-2">
          {/* Tags */}
          <div className="flex items-center gap-1 overflow-hidden">
            {tool.tags.slice(0, 2).map((tag, idx) => (
              <span
                key={idx}
                className="rounded-md bg-[var(--bg-page)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-secondary)] border border-[var(--border-color)] truncate"
              >
                #{tag}
              </span>
            ))}
            {tool.tags.length > 2 && (
              <span className="text-[10px] text-[var(--text-muted)] font-medium">+{tool.tags.length - 2}</span>
            )}
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={() => onOpenTool(tool)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#003366] hover:bg-[#002244] dark:bg-blue-600 dark:hover:bg-blue-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-all hover:shadow-sm active:scale-95 shrink-0"
          >
            <span>Open Tool</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
