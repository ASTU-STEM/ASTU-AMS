import React from 'react';
import { ToolItem } from '../types/tools.types';
import { TOOL_REGISTRY } from '../data/toolRegistry';
import { ArrowUpRight } from 'lucide-react';
import { AlumniSectionBlock } from '../../alumni/components/AlumniSectionBlock';
import { alumniGridGapClass } from '../../alumni/components/alumniUi';
import { ToolTypeBadge } from './ToolTypeBadge';

interface QuickToolsRowProps {
  onOpenTool: (tool: ToolItem) => void;
}

export const QuickToolsRow: React.FC<QuickToolsRowProps> = ({ onOpenTool }) => {
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

  const quickTools = quickToolIds
    .map((id) => TOOL_REGISTRY.find((t) => t.id === id))
    .filter((t): t is ToolItem => t !== undefined);

  return (
    <AlumniSectionBlock
      step={1}
      title="Quick launch"
      description="Ten high-impact calculators, generators, and safety checks alumni open most often."
      aside={
        <span className="rounded-full border border-[var(--border-color)] bg-[var(--bg-page)] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">
          10 popular tools
        </span>
      }
    >
      <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 ${alumniGridGapClass}`}>
        {quickTools.map((tool) => (
          <button
            key={tool.id}
            type="button"
            onClick={() => onOpenTool(tool)}
            title={tool.name}
            className="group relative flex min-h-[128px] flex-col justify-between rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] p-4 sm:p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#003366]/30 hover:shadow-md dark:hover:border-[#FFCC00]/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003366]/25 dark:focus-visible:ring-[#FFCC00]/30"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#003366]/10 text-[#003366] dark:bg-[#FFCC00]/15 dark:text-[#FFD700] transition-transform group-hover:scale-105">
                <span className="material-symbols-outlined text-[22px]">{tool.icon}</span>
              </span>
              <ToolTypeBadge toolType={tool.toolType} compact className="max-w-[7rem] truncate" />
            </div>

            <p className="mt-4 text-sm font-semibold leading-snug text-[var(--text-primary)] line-clamp-2">
              {tool.name}
            </p>

            <div className="mt-5 flex items-center justify-between border-t border-[var(--border-color)] pt-4 text-xs font-semibold text-[var(--text-secondary)] group-hover:text-[#003366] dark:group-hover:text-[#FFD700]">
              <span>Launch</span>
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </button>
        ))}
      </div>
    </AlumniSectionBlock>
  );
};
