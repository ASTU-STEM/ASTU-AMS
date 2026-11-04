import React from 'react';
import { ToolItem } from '../types/tools.types';
import { Star, ArrowRight, CheckCircle, Zap, Cpu, ListChecks, Info } from 'lucide-react';

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
  const getTypeBadge = () => {
    switch (tool.toolType) {
      case 'FRONTEND_UTILITY':
        return { label: 'Instant Utility', icon: <Zap className="w-3 h-3 text-amber-500" />, bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'DATA_DRIVEN':
        return { label: 'ASTU Portal Data', icon: <CheckCircle className="w-3 h-3 text-blue-500" />, bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'AI_ASSISTED':
        return { label: 'AI Generator', icon: <Cpu className="w-3 h-3 text-purple-500" />, bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'GUIDED_WORKFLOW':
        return { label: 'Interactive Checklist', icon: <ListChecks className="w-3 h-3 text-emerald-500" />, bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'VERIFIED_RESOURCE':
      default:
        return { label: 'Verified Resource', icon: <Info className="w-3 h-3 text-cyan-500" />, bg: 'bg-cyan-50 text-cyan-700 border-cyan-200' };
    }
  };

  const badgeInfo = getTypeBadge();

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#003366]/30 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      {/* Top Header Row */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[#003366] transition-transform group-hover:scale-105 group-hover:bg-[#003366] group-hover:text-white dark:bg-slate-800 dark:text-blue-400">
              <span className="material-symbols-outlined text-2xl">{tool.icon}</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border ${badgeInfo.bg}`}>
                  {badgeInfo.icon}
                  {badgeInfo.label}
                </span>
                {tool.isFeatured && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-800 border border-amber-200">
                    ⭐ Featured
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
                ? 'bg-amber-50 text-amber-500 hover:bg-amber-100 dark:bg-amber-950/40'
                : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800'
            }`}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={`h-4.5 w-4.5 ${isFavorite ? 'fill-amber-400 text-amber-500' : ''}`} />
          </button>
        </div>

        {/* Title and Description */}
        <h3 className="mt-3 text-base font-bold tracking-tight text-slate-900 group-hover:text-[#003366] transition-colors dark:text-white dark:group-hover:text-blue-400">
          {tool.name}
        </h3>
        <p className="mt-1.5 text-xs text-slate-600 leading-relaxed line-clamp-2 dark:text-slate-300">
          {tool.description}
        </p>
      </div>

      {/* Footer Row */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between gap-2">
          {/* Tags */}
          <div className="flex items-center gap-1 overflow-hidden">
            {tool.tags.slice(0, 2).map((tag, idx) => (
              <span
                key={idx}
                className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400 truncate"
              >
                #{tag}
              </span>
            ))}
            {tool.tags.length > 2 && (
              <span className="text-[10px] text-slate-400 font-medium">+{tool.tags.length - 2}</span>
            )}
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={() => onOpenTool(tool)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#003366] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#002244] hover:shadow-sm active:scale-95 shrink-0"
          >
            <span>Open Tool</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
