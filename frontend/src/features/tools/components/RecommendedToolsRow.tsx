import React from 'react';
import { ToolItem } from '../types/tools.types';
import { TOOL_REGISTRY } from '../data/toolRegistry';
import { Sparkles, ArrowRight } from 'lucide-react';

interface RecommendedToolsRowProps {
  profile: any;
  onOpenTool: (tool: ToolItem) => void;
}

export const RecommendedToolsRow: React.FC<RecommendedToolsRowProps> = ({ profile, onOpenTool }) => {
  const isEmployed = profile?.employmentStatus === 'EMPLOYED' || profile?.employmentStatus === 'SELF_EMPLOYED';
  const userName = profile?.fullName ? profile.fullName.split(' ')[0] : 'Alumni';

  const recommendedIds = isEmployed
    ? [
        'career-progress-tracker',
        'salary-increase-calculator',
        'personal-development-plan',
        'masters-readiness-checker',
        'mentor-match-assistant',
        'professional-bio-generator',
      ]
    : [
        'first-job-planner',
        'job-match-checker',
        'ethiopian-salary-explorer',
        'career-skills-gap-checker',
        'cv-builder',
        'interview-question-practice',
        'mentor-match-assistant',
        'profile-strength-checker',
      ];

  const recommendedTools = recommendedIds
    .map((id) => TOOL_REGISTRY.find((t) => t.id === id))
    .filter((t): t is ToolItem => t !== undefined);

  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 via-blue-50/50 to-white p-4 dark:border-indigo-900/40 dark:from-slate-900 dark:to-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold shadow-xs">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Recommended for {userName}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {profile?.department?.name || 'ASTU Graduate'} • {isEmployed ? 'Career Advancement Track' : 'Graduate Employability Track'}
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 self-start sm:self-auto">
          Tailored by ASTU Profile
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {recommendedTools.map((tool) => (
          <div
            key={tool.id}
            onClick={() => onOpenTool(tool)}
            className="group cursor-pointer rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs transition-all hover:border-indigo-400 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                <span className="material-symbols-outlined text-xl">{tool.icon}</span>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors dark:text-white truncate">
                  {tool.name}
                </h4>
                <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5 dark:text-slate-400">
                  {tool.description}
                </p>
              </div>
            </div>

            <div className="mt-2.5 flex items-center justify-between text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span>Open Tool</span>
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
