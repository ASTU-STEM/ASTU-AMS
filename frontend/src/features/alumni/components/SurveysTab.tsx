import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ClipboardList } from 'lucide-react';
import { surveyService } from '../../surveys/services/survey.service';
import { EmptyState } from '../../../components/EmptyState';
import { LoadingSkeleton } from '../../../components/LoadingSkeleton';
import { AlumniSectionShell } from './AlumniSectionShell';
import { BrandMark } from './BrandMark';
import {
  alumniCardClass,
  alumniInputClass,
  alumniLabelClass,
  alumniMutedClass,
  alumniPanelClass,
  alumniPrimaryBtnClass,
  alumniSecondaryBtnClass,
  alumniSectionTitleClass,
  alumniSelectClass,
  alumniStatusBadge,
  alumniTextareaClass,
} from './alumniUi';

// ─── Reusable question field renderer ────────────────────────────────────────
const QuestionField = ({
  q,
  idx,
  answers,
  onChange,
}: {
  q: any;
  idx: number;
  answers: Record<string, string | string[]>;
  onChange: (id: string, val: string | string[]) => void;
}) => (
  <div className={`${alumniCardClass} p-4 space-y-2.5 bg-[var(--bg-page)]`}>
    <label className={`${alumniLabelClass} !normal-case !tracking-normal !text-sm !font-bold text-[var(--text-primary)] leading-relaxed`}>
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-[#003366]/10 text-[#003366] dark:text-[#FFD700] text-[10px] font-extrabold mr-1.5 align-middle">
        {idx + 1}
      </span>
      {q.questionText}
      {q.required && <span className="text-rose-500 ml-1">*</span>}
    </label>

    {(q.questionType === 'TEXT' || q.questionType === 'NUMBER' || q.questionType === 'DATE') && (
      <input
        type={q.questionType === 'NUMBER' ? 'number' : q.questionType === 'DATE' ? 'date' : 'text'}
        value={(answers[q.id] as string) || ''}
        onChange={(e) => onChange(q.id, e.target.value)}
        className={alumniInputClass}
        required={q.required}
        placeholder={q.placeholder || ''}
      />
    )}

    {(q.questionType === 'RATING' || q.questionType === 'range') && (
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={1}
          max={10}
          value={(answers[q.id] as string) || '5'}
          onChange={(e) => onChange(q.id, e.target.value)}
          className="flex-1 accent-[#003366]"
        />
        <span className="text-sm font-bold text-[#003366] dark:text-[#FFD700] min-w-[28px] text-center">
          {(answers[q.id] as string) || '5'}
        </span>
      </div>
    )}

    {q.questionType === 'TEXTAREA' && (
      <textarea
        value={(answers[q.id] as string) || ''}
        onChange={(e) => onChange(q.id, e.target.value)}
        className={`${alumniTextareaClass} min-h-[96px] resize-none`}
        required={q.required}
        placeholder={q.placeholder || ''}
      />
    )}

    {q.questionType === 'SELECT' && q.options && (
      <select
        value={(answers[q.id] as string) || ''}
        onChange={(e) => onChange(q.id, e.target.value)}
        className={alumniSelectClass}
        required={q.required}
      >
        <option value="">-- Select an option --</option>
        {q.options.map((opt: string) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    )}

    {q.questionType === 'RADIO' && q.options && (
      <div className="space-y-2 mt-1">
        {q.options.map((opt: string) => (
          <label key={opt} className="flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer">
            <input
              type="radio"
              name={q.id}
              value={opt}
              checked={answers[q.id] === opt}
              onChange={(e) => onChange(q.id, e.target.value)}
              required={q.required}
              className="text-[#003366] focus:ring-[#003366]"
            />
            {opt}
          </label>
        ))}
      </div>
    )}

    {q.questionType === 'CHECKBOX' && q.options && (
      <div className="space-y-2 mt-1">
        {q.options.map((opt: string) => {
          const currentArr = (answers[q.id] as string[]) || [];
          return (
            <label key={opt} className="flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer">
              <input
                type="checkbox"
                value={opt}
                checked={currentArr.includes(opt)}
                onChange={(e) => {
                  if (e.target.checked) onChange(q.id, [...currentArr, opt]);
                  else onChange(q.id, currentArr.filter((i) => i !== opt));
                }}
                className="rounded text-[#003366] focus:ring-[#003366]"
              />
              {opt}
            </label>
          );
        })}
      </div>
    )}
  </div>
);


export const SurveysTab = () => {
  const [assignments, setAssignments] = useState<any[]>([]);

  const [activeAssignment, setActiveAssignment] = useState<any | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMySurveys();
  }, []);

  const fetchMySurveys = async () => {
    setLoading(true);
    try {
      const data = await surveyService.getMySurveys();
      setAssignments(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load surveys');
    } finally {
      setLoading(false);
    }
  };

  const handleStartSurvey = (assignment: any) => {
    setActiveAssignment(assignment);
    const initialAnswers: Record<string, string | string[]> = {};
    if (assignment.survey?.sections) {
      assignment.survey.sections.forEach((s: any) => {
        s.questions.forEach((q: any) => {
          if (q.questionType === 'CHECKBOX') initialAnswers[q.id] = [];
          else initialAnswers[q.id] = '';
        });
      });
    } else if (assignment.survey?.questions) {
      assignment.survey.questions.forEach((q: any) => {
        if (q.questionType === 'CHECKBOX') initialAnswers[q.id] = [];
        else initialAnswers[q.id] = '';
      });
    }
    setAnswers(initialAnswers);
  };

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmitSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssignment) return;

    const formattedAnswers = Object.entries(answers).map(([questionId, answerText]) => {
      const text = Array.isArray(answerText) ? answerText.join(', ') : answerText;
      return { questionId, answerText: text };
    });

    try {
      await surveyService.submitAssignedSurvey(activeAssignment.id, formattedAnswers);
      toast.success('Thank you! Tracer survey submitted successfully.');
      setActiveAssignment(null);
      setAnswers({});
      fetchMySurveys();
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit survey. Please try again.');
    }
  };

  const completedCount = assignments.filter((s) => s.status === 'COMPLETED').length;
  const pendingCount = assignments.filter((s) => s.status === 'PENDING' || s.status === 'IN_PROGRESS').length;
  const totalCount = assignments.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (loading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton variant="card" count={1} />
        <LoadingSkeleton variant="card" count={3} className="mt-2" />
      </div>
    );
  }

  return (
    <AlumniSectionShell
      eyebrow="Tracer studies"
      title="Graduate surveys"
      description="Complete tracer studies to support ASTU accreditation and improve programs for future graduates."
      metrics={[
        { value: `${progressPct}%`, label: 'Progress', accent: 'gold' },
        { value: completedCount, label: 'Completed', accent: 'green' },
        { value: pendingCount, label: 'Pending', accent: 'white' },
      ]}
    >
      {!activeAssignment ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className={`${alumniSectionTitleClass} flex items-center gap-2`}>
              <span
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-white text-sm font-bold material-symbols-outlined"
                style={{ background: 'linear-gradient(135deg, #003366, #001a33)' }}
              >
                assignment
              </span>
              Your Tracer Questionnaires
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={alumniStatusBadge.brand}>{completedCount} Completed</span>
              {pendingCount > 0 && (
                <span className={alumniStatusBadge.danger}>{pendingCount} Pending</span>
              )}
            </div>
          </div>

          {assignments.length === 0 ? (
            <div className={alumniPanelClass}>
              <EmptyState
                icon={<ClipboardList className="h-10 w-10 text-slate-400 dark:text-slate-500" />}
                title="No tracer surveys yet"
                description="New surveys appear here when the university assigns them."
              />
            </div>
          ) : (
            <div className="space-y-3">
              {assignments.map((assignment) => {
                const isCompleted = assignment.status === 'COMPLETED';
                const isExpired = assignment.status === 'EXPIRED';
                return (
                  <div
                    key={assignment.id}
                    className={`${alumniCardClass} transition-all duration-200 ${
                      isCompleted || isExpired
                        ? 'opacity-80'
                        : 'hover:shadow-md hover:border-[#003366]/30'
                    }`}
                  >
                    <div className="p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1 space-y-2.5 min-w-0">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span
                              className={
                                isCompleted
                                  ? alumniStatusBadge.success
                                  : isExpired
                                    ? alumniStatusBadge.neutral
                                    : alumniStatusBadge.danger
                              }
                            >
                              {isCompleted ? 'Completed' : isExpired ? 'Expired' : 'Pending Action'}
                            </span>
                            <span className="text-[10px] text-[var(--text-muted)] font-semibold">
                              Deadline: {new Date(assignment.dueDate).toLocaleDateString()}
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-[var(--text-primary)]">
                            {assignment.survey?.title || 'Tracer Study'}
                          </h4>
                          <p className={`${alumniMutedClass} text-xs leading-relaxed max-w-2xl`}>
                            {assignment.survey?.description}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (!isCompleted && !isExpired) {
                              handleStartSurvey(assignment);
                            }
                          }}
                          disabled={isCompleted || isExpired}
                          className={
                            isCompleted || isExpired
                              ? `${alumniSecondaryBtnClass} opacity-60 cursor-not-allowed flex-shrink-0`
                              : `${alumniPrimaryBtnClass} flex-shrink-0`
                          }
                        >
                          {isCompleted ? 'Submitted' : isExpired ? 'Expired' : 'Start Questionnaire'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {pendingCount > 0 && totalCount > 0 && (
            <p className="text-xs font-semibold text-[#003366] dark:text-[#FFD700]">
              {pendingCount} pending — submit before deadline · {completedCount}/{totalCount} done
            </p>
          )}
        </div>
      ) : (
        <div className={`${alumniCardClass} overflow-hidden`}>
          <div
            className="p-5 text-white"
            style={{ background: 'linear-gradient(135deg, #003366, #001a33)' }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <BrandMark
                  className="h-9 w-9 object-contain rounded-lg bg-white/15 p-1 border border-white/20 text-[10px] shrink-0"
                  tone="dark"
                />
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFCC00]">
                    Tracer Study in Progress
                  </span>
                  <h3 className="text-lg font-bold mt-0.5 truncate">{activeAssignment.survey?.title}</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setActiveAssignment(null); setAnswers({}); }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors border border-white/20 shrink-0"
                aria-label="Close questionnaire"
              >
                <span className="material-symbols-outlined text-white text-sm">close</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmitSurvey} className="p-5 space-y-6">
            {(() => {
              const sectionQuestions = (activeAssignment.survey?.sections || []).flatMap((sec: any) => sec.questions || []);
              const directQuestions = activeAssignment.survey?.questions || [];

              const allQuestionsMap = new Map();
              [...directQuestions, ...sectionQuestions].forEach((q: any) => {
                if (q && q.questionText) {
                  allQuestionsMap.set(q.id || q.questionText, q);
                }
              });
              const allQuestions = Array.from(allQuestionsMap.values());

              if (allQuestions.length === 0) {
                return (
                  <EmptyState
                    title="No questions available"
                    description="This survey template has no questions configured yet."
                    className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)]"
                  />
                );
              }

              const hasSectionQuestions = (activeAssignment.survey?.sections || []).some(
                (s: any) => (s.questions?.length || 0) > 0
              );

              if (hasSectionQuestions) {
                return activeAssignment.survey.sections.map((section: any, sIdx: number) => (
                  <div key={section.id || sIdx} className="space-y-4">
                    <div className="border-b border-[var(--border-color)] pb-2">
                      <h4 className="text-lg font-bold text-[#003366] dark:text-[#FFD700]">{section.title}</h4>
                      {section.description && (
                        <p className={alumniMutedClass}>{section.description}</p>
                      )}
                    </div>
                    {(section.questions || []).map((q: any, idx: number) => (
                      <QuestionField key={q.id || idx} q={q} idx={idx} answers={answers} onChange={handleAnswerChange} />
                    ))}
                  </div>
                ));
              }

              return (
                <div className="space-y-4">
                  {allQuestions.map((q: any, idx: number) => (
                    <QuestionField key={q.id || idx} q={q} idx={idx} answers={answers} onChange={handleAnswerChange} />
                  ))}
                </div>
              );
            })()}

            <div className="sticky bottom-0 z-10 -mx-5 -mb-5 px-5 py-4 flex gap-3 border-t border-[var(--border-color)] bg-[var(--bg-card)]/95 backdrop-blur-sm">
              <button
                type="button"
                onClick={() => { setActiveAssignment(null); setAnswers({}); }}
                className={`${alumniSecondaryBtnClass} flex-1`}
              >
                Cancel
              </button>
              <button type="submit" className={`${alumniPrimaryBtnClass} flex-1`}>
                <span className="material-symbols-outlined text-sm">send</span>
                Submit Answers
              </button>
            </div>
          </form>
        </div>
      )}
    </AlumniSectionShell>
  );
};
