import React from 'react';
import { ToolItem } from '../types/tools.types';
import { TOOL_REGISTRY } from '../data/toolRegistry';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

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

  const resolveTool = (id: string): ToolItem | undefined => {
    return TOOL_REGISTRY.find((t) => t.id === id);
  };

  const recommendedTools = recommendedIds.map(resolveTool).filter((t): t is ToolItem => t !== undefined);

  // Dynamic grid column balancing so there are never awkward blank slots:
  // 6 items -> 3 columns (2 full rows of 3)
  // 8 items -> 4 columns (2 full rows of 4)
  const gridColsClass = recommendedTools.length % 3 === 0
    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

  return (
    <div className="relative overflow-hidden rounded-2xl border border-indigo-900/40 dark:border-indigo-900/50 bg-gradient-to-br from-slate-900 via-[#0d1527] to-[#111c38] p-5 text-white shadow-xl backdrop-blur-xl">
      {/* Subtle top indigo accent */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-inner">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Recommended for {userName}
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-bold text-indigo-300">
                <CheckCircle2 className="h-3 w-3 text-indigo-400" />
                Tailored for your profile
              </span>
            </h3>
            <p className="text-[11px] text-slate-300">
              {profile?.department?.name || 'ASTU Graduate'} · {isEmployed ? 'Career growth & acceleration picks' : 'Job-readiness & placement picks'}
            </p>
          </div>
        </div>

        <span className="text-[11px] font-semibold text-indigo-300/80 bg-white/5 border border-white/10 px-3 py-1 rounded-full self-start sm:self-auto">
          {recommendedTools.length} Curated Picks
        </span>
      </div>

      <div className={`grid ${gridColsClass} gap-3 sm:gap-3.5`}>
        {recommendedTools.map((tool) => (
          <div
            key={tool.id}
            onClick={() => onOpenTool(tool)}
            className="group cursor-pointer relative flex flex-col justify-between rounded-xl border border-slate-700/60 bg-slate-800/80 hover:bg-slate-800 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-400/60 hover:shadow-lg hover:shadow-indigo-500/10 active:scale-98"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-400/20 group-hover:scale-110 group-hover:bg-indigo-500/25 transition-all">
                  <span className="material-symbols-outlined text-xl">{tool.icon}</span>
                </div>
                <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-indigo-300 border border-white/10 transition-colors">
                  {tool.tags[0] || 'Tool'}
                </span>
              </div>

              <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1 leading-snug">
                {tool.name}
              </h4>
              <p className="text-[11px] text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                {tool.description}
              </p>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-indigo-400 group-hover:text-indigo-300 pt-2 border-t border-slate-700/50 transition-colors">
              <span>Launch tool</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
