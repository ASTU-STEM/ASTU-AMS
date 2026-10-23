import React from 'react';
import { ToolItem } from '../types/tools.types';
import { TOOL_REGISTRY } from '../data/toolRegistry';
import { Zap, ArrowUpRight } from 'lucide-react';

interface QuickToolsRowProps {
  onOpenTool: (tool: ToolItem) => void;
}

export const QuickToolsRow: React.FC<QuickToolsRowProps> = ({ onOpenTool }) => {
  // 10 distinct, high-impact tools spanning calculators, career utilities, and safety
  const quickToolIds = [
    'gpa-calculator',
    'cgpa-calculator',
    'salary-after-living-costs-calculator',
    'cv-builder',
    'cover-letter-generator',
    'career-skills-gap-checker',
    'job-scam-risk-checker',
    'grade-converter',
    'interview-question-generator',
    'ethiopian-cost-of-living-estimator',
  ];

  const resolveTool = (id: string): ToolItem | undefined => {
    return TOOL_REGISTRY.find((t) => t.id === id);
  };

  const quickTools = quickToolIds
    .map(resolveTool)
    .filter((t): t is ToolItem => t !== undefined);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-700/60 dark:border-slate-800 bg-gradient-to-br from-slate-900 via-[#0a192f] to-[#002244] p-4 sm:p-5 text-white shadow-xl backdrop-blur-xl">
      {/* Top university brand stripe */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#FFD700] via-[#003366] to-[#006B3C]" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 shadow-inner">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              Quick launch
              <span className="rounded-full bg-amber-400/15 border border-amber-400/30 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                10 Popular Tools
              </span>
            </h3>
            <p className="text-[11px] text-slate-300">Most-used calculators, generators, and career helpers</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3">
        {quickTools.map((tool) => (
          <button
            key={tool.id}
            type="button"
            onClick={() => onOpenTool(tool)}
            title={tool.name}
            className="group relative flex flex-col justify-between rounded-xl bg-slate-800/70 hover:bg-slate-800 p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-400/50 hover:shadow-lg border border-slate-700/60 active:scale-98"
          >
            <div className="flex items-center justify-between gap-1.5 mb-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/15 text-amber-300 border border-blue-400/20 group-hover:scale-110 group-hover:bg-amber-400/20 group-hover:text-amber-200 transition-all">
                <span className="material-symbols-outlined text-[17px]">{tool.icon}</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-blue-300 transition-colors">
                {tool.tags[0] || 'Tool'}
              </span>
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-100 group-hover:text-white transition-colors line-clamp-2 leading-snug">
                {tool.name}
              </p>
            </div>

            <div className="mt-2.5 flex items-center justify-between text-[10px] font-medium text-slate-400 group-hover:text-amber-300 transition-colors pt-1.5 border-t border-slate-700/40">
              <span>Launch</span>
              <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
