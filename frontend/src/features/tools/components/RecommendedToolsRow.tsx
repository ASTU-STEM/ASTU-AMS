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

  // Ten of these ids never existed in TOOL_REGISTRY, so this list resolved to
  // 2 tools when employed and 3 when not, rendered into a 4-column grid under a
  // heading that claims the list was "Shortlisted by employment status". It is a
  // hand-picked shortlist, so it now says so.
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

  const resolveTool = (id: string): ToolItem | undefined => {
    const found = TOOL_REGISTRY.find((t) => t.id === id);
    if (!found && import.meta.env.DEV) {
      console.warn(`[tools] RecommendedToolsRow references unknown tool id: "${id}"`);
    }
    return found;
  };

  const recommendedTools = recommendedIds.map(resolveTool).filter((t): t is ToolItem => t !== undefined);

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
              {profile?.department?.name || 'ASTU Graduate'} · {isEmployed ? 'Career growth picks' : 'Job-ready picks'}
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 self-start sm:self-auto">
          Matched to your status
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
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors dark:text-white line-clamp-2">
                  {tool.name}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-3 mt-0.5 dark:text-slate-400 leading-relaxed">
                  {tool.description}
                </p>
              </div>
            </div>

            <div className="mt-2.5 flex items-center justify-between text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span>Open</span>
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
