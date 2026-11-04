import React, { useState } from 'react';
import { Users, ChevronRight, CheckCircle2, XCircle, Award, Mail, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

export type CandidateStage = 'Applied' | 'Screening' | 'Interview' | 'Offer Extended' | 'Hired';

export interface CandidateItem {
  id: string;
  name: string;
  studentId: string;
  department: string;
  cgpa: string;
  roleApplied: string;
  stage: CandidateStage;
  matchScore: number;
}

const STAGES: CandidateStage[] = ['Applied', 'Screening', 'Interview', 'Offer Extended', 'Hired'];

interface CandidatePipelineKanbanProps {
  candidates?: CandidateItem[];
  onStageChange?: (candidateId: string, newStage: CandidateStage) => void;
}

export const CandidatePipelineKanban: React.FC<CandidatePipelineKanbanProps> = ({
  candidates: propCandidates,
  onStageChange,
}) => {
  const [candidates, setCandidates] = useState<CandidateItem[]>(() => {
    return propCandidates && propCandidates.length > 0
      ? propCandidates
      : [
          {
            id: 'cand-1',
            name: 'Kalkidan Bekele',
            studentId: 'ETS/0412/12',
            department: 'Computer Science and Engineering',
            cgpa: '3.88',
            roleApplied: 'Junior Backend Software Engineer',
            stage: 'Applied',
            matchScore: 94,
          },
          {
            id: 'cand-2',
            name: 'Yared Tadesse',
            studentId: 'ETS/0819/12',
            department: 'Electrical & Electronics Engineering',
            cgpa: '3.75',
            roleApplied: 'IoT Embedded Systems Specialist',
            stage: 'Screening',
            matchScore: 89,
          },
          {
            id: 'cand-3',
            name: 'Blen Hailu',
            studentId: 'ETS/0210/12',
            department: 'Computer Science and Engineering',
            cgpa: '3.92',
            roleApplied: 'Cloud & DevOps Engineer',
            stage: 'Interview',
            matchScore: 98,
          },
          {
            id: 'cand-4',
            name: 'Natnael Girma',
            studentId: 'ETS/0550/12',
            department: 'Mechanical Engineering',
            cgpa: '3.65',
            roleApplied: 'Robotics Automation Associate',
            stage: 'Offer Extended',
            matchScore: 86,
          },
        ];
  });

  const advanceStage = (id: string, currentStage: CandidateStage) => {
    const currentIndex = STAGES.indexOf(currentStage);
    if (currentIndex < STAGES.length - 1) {
      const nextStage = STAGES[currentIndex + 1];
      setCandidates((prev) =>
        prev.map((c) => (c.id === id ? { ...c, stage: nextStage } : c))
      );
      if (onStageChange) onStageChange(id, nextStage);
      toast.success(`Advanced candidate to ${nextStage}`);
    }
  };

  return (
    <div data-testid="candidate-pipeline-kanban" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Talent Acquisition Pipeline</h2>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Review applicants, advance verification stages, and extend official ASTU hiring offers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-bold text-sky-400">
            {candidates.length} Total Applicants In Review
          </span>
        </div>
      </div>

      {/* Kanban Board 5 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageCandidates = candidates.filter((c) => c.stage === stage);

          return (
            <div
              key={stage}
              className="flex min-w-[220px] flex-col rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-[var(--text-secondary)]">
                  {stage}
                </h4>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--bg-input)] text-[10px] font-bold text-sky-400">
                  {stageCandidates.length}
                </span>
              </div>

              <div className="mt-3.5 space-y-3 flex-1">
                {stageCandidates.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[var(--border-color)] p-6 text-center text-[11px] text-[var(--text-muted)]">
                    No candidates
                  </div>
                ) : (
                  stageCandidates.map((cand) => (
                    <div
                      key={cand.id}
                      className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)] p-3.5 shadow-md transition-all hover:border-sky-500/40"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h5 className="font-bold text-xs text-[var(--text-primary)]">{cand.name}</h5>
                          <span className="font-mono text-[10px] text-sky-400">{cand.studentId}</span>
                        </div>
                        <span className="rounded-md bg-emerald-500/20 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-300">
                          {cand.matchScore}%
                        </span>
                      </div>

                      <p className="mt-2 text-[11px] font-medium text-[var(--text-secondary)] leading-tight">
                        {cand.roleApplied}
                      </p>
                      <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">{cand.department}</p>

                      <div className="mt-3 flex items-center justify-between border-t border-[var(--border-color)] pt-2 text-[11px]">
                        <span className="font-mono text-[var(--text-secondary)]">CGPA: {cand.cgpa}</span>
                        {stage !== 'Hired' && (
                          <button
                            type="button"
                            onClick={() => advanceStage(cand.id, cand.stage)}
                            className="inline-flex items-center gap-0.5 rounded-lg bg-sky-600/30 px-2 py-1 text-[10px] font-bold text-sky-300 hover:bg-sky-600 hover:text-[var(--text-primary)] transition-colors"
                          >
                            Advance <ChevronRight className="h-3 w-3" />
                          </button>
                        )}
                        {stage === 'Hired' && (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-400 text-[10px]">
                            <CheckCircle2 className="h-3 w-3" /> Hired
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
