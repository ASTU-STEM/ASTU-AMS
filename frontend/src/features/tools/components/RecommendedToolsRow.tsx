import React from 'react';
import { ToolItem } from '../types/tools.types';
import { TOOL_REGISTRY } from '../data/toolRegistry';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { AlumniSectionBlock } from '../../alumni/components/AlumniSectionBlock';
import { alumniGridGapClass, alumniStatusBadge } from '../../alumni/components/alumniUi';
import { formatEmploymentStatus } from '../../alumni/utils/statusUi';
import { ToolTypeBadge } from './ToolTypeBadge';

interface RecommendedToolsRowProps {
  profile: any;
  onOpenTool: (tool: ToolItem) => void;
}

export const RecommendedToolsRow: React.FC<RecommendedToolsRowProps> = ({ profile, onOpenTool }) => {
  const isEmployed = profile?.employmentStatus === 'EMPLOYED' || profile?.employmentStatus === 'SELF_EMPLOYED';
  const userName = profile?.fullName ? profile.fullName.split(' ')[0] : 'Alumni';

  const recommendedIds = isEmployed
    ? [
        'personal-development-plan',
        'mentor-match-assistant',
        'salary-negotiation-copilot',
        'certification-roadmap-planner',
        'application-tracker-pro',
        'linkedin-profile-optimizer',
      ]
    : [
        'career-skills-gap-checker',
        'cv-builder',
        'mentor-match-assistant',
        'interview-question-generator',
        'cover-letter-generator',
        'job-scam-risk-checker',
        'career-goal-builder',
        'thesis-topic-generator',
      ];

  const recommendedTools = recommendedIds
    .map((id) => TOOL_REGISTRY.find((t) => t.id === id))
    .filter((t): t is ToolItem => t !== undefined);

  const gridColsClass =
    recommendedTools.length % 3 === 0
      ? 'sm:grid-cols-2 lg:grid-cols-3'
      : 'sm:grid-cols-2 lg:grid-cols-4';

  return (
    <AlumniSectionBlock
      step={2}
      title={`Recommended for ${userName}`}
      description={`${profile?.department?.name || 'ASTU Graduate'} · ${
        isEmployed ? 'Career growth and acceleration picks from your profile.' : 'Job-readiness and placement picks from your profile.'
      }`}
      aside={
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className={alumniStatusBadge.info}>{formatEmploymentStatus(profile?.employmentStatus)}</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
            <CheckCircle2 className="h-3 w-3" />
            {recommendedTools.length} curated
          </span>
        </div>
      }
    >
      <div className={`grid grid-cols-1 ${gridColsClass} ${alumniGridGapClass}`}>
        {recommendedTools.map((tool) => (
          <button
            key={tool.id}
            type="button"
            onClick={() => onOpenTool(tool)}
            className="group flex min-h-[160px] flex-col justify-between rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] p-5 sm:p-6 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-500/35 hover:shadow-md dark:hover:border-indigo-400/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/25"
          >
            <div>
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 transition-transform group-hover:scale-105">
                  <span className="material-symbols-outlined text-[24px]">{tool.icon}</span>
                </div>
                <ToolTypeBadge toolType={tool.toolType} compact />
              </div>
              <h4 className="text-sm font-bold text-[var(--text-primary)] line-clamp-2 leading-snug group-hover:text-indigo-700 dark:group-hover:text-indigo-300">
                {tool.name}
              </h4>
              <p className="mt-2.5 text-xs leading-relaxed text-[var(--text-secondary)] line-clamp-3">
                {tool.description}
              </p>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-[var(--border-color)] pt-4 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <span>Launch tool</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </button>
        ))}
      </div>
    </AlumniSectionBlock>
  );
};
