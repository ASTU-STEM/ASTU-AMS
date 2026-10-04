import React from 'react';
import { ToolItem } from '../types/tools.types';
import { TOOL_REGISTRY } from '../data/toolRegistry';
import { Zap } from 'lucide-react';

interface QuickToolsRowProps {
  onOpenTool: (tool: ToolItem) => void;
}

export const QuickToolsRow: React.FC<QuickToolsRowProps> = ({ onOpenTool }) => {
  // Five of the previous ten ids did not exist in TOOL_REGISTRY
  // (cover-letter-builder, job-match-checker, relocation-cost-calculator,
  // savings-goal-calculator, date-difference-calculator). They were dropped by a
  // silent .filter(), so the "5 column" grid happened to look right while half
  // the launchpad was empty. resolveTool() now warns instead of hiding it.
  const quickToolIds = [
    'gpa-calculator',
    'cgpa-calculator',
    'salary-after-living-costs-calculator',
    'cv-builder',
    'cover-letter-generator',
    'career-skills-gap-checker',
    'job-scam-risk-checker',
    'grade-converter',
    'cgpa-calculator',
    'ethiopian-cost-of-living-estimator',
  ];

  const resolveTool = (id: string): ToolItem | undefined => {
    const found = TOOL_REGISTRY.find((t) => t.id === id);
    if (!found && import.meta.env.DEV) {
      console.warn(`[tools] QuickToolsRow references unknown tool id: "${id}"`);
    }
    return found;
  };

  const quickTools = [...new Set(quickToolIds)]
    .map(resolveTool)
    .filter((t): t is ToolItem => t !== undefined);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-r from-slate-900 via-[#003366] to-[#004d99] p-4 text-white shadow-md">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400 text-slate-950 font-bold">
          <Zap className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold tracking-tight">Quick launch</h3>
          <p className="text-[11px] text-blue-200">Most-used calculators and career helpers</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
        {quickTools.map((tool) => (
          <button
            key={tool.id}
            type="button"
            onClick={() => onOpenTool(tool)}
            className="group flex items-center gap-2.5 rounded-xl bg-white/10 p-2.5 text-left backdrop-blur-md transition-all hover:bg-white/20 hover:scale-[1.02] active:scale-95 border border-white/10"
          >
            <span className="material-symbols-outlined text-lg text-amber-300 shrink-0 group-hover:scale-110 transition-transform">
              {tool.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{tool.name}</p>
              <p className="text-[9px] text-blue-200 truncate">{tool.tags[0] || 'Quick'}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
