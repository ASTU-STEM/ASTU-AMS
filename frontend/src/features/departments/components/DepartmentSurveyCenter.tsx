import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { surveyService } from '../../surveys/services/survey.service';
import { departmentService } from '../services/department.service';
import toast from 'react-hot-toast';
import {
  Send,
  Plus,
  Trash2,
  ClipboardList,
  AlertCircle,
  RefreshCw,
  FilePlus2,
  Eye,
  X,
  BarChart2,
  Users,
  CheckCircle2,
  Clock3,
  MoreHorizontal,
  Copy,
  Archive,
  Power,
} from 'lucide-react';

interface DepartmentSurveyCenterProps {
  darkMode?: boolean;
}

type SurveyQuestion = {
  id?: string;
  questionText: string;
  questionType: string;
  required?: boolean;
  options?: string[];
  order?: number;
};

type SurveyTemplate = {
  id: string;
  title: string;
  description?: string;
  type: string;
  milestoneMonths?: number | null;
  isActive: boolean;
  isArchived?: boolean;
  createdAt?: string;
  updatedAt?: string;
  questions?: SurveyQuestion[];
  sections?: Array<{ questions?: SurveyQuestion[] }>;
  _count?: { assignments?: number; responses?: number };
};

type BuilderQuestion = {
  questionText: string;
  questionType: string;
  required: boolean;
  options: string[];
  order: number;
};

const MILESTONE_TYPES = new Set(['SIX_MONTH', 'TWELVE_MONTH', 'EIGHTEEN_MONTH', 'TWENTY_FOUR_MONTH']);

const questionCount = (survey: SurveyTemplate | undefined | null): number => {
  if (!survey) return 0;
  const direct = Array.isArray(survey.questions) ? survey.questions.length : 0;
  const sections = Array.isArray(survey.sections) ? survey.sections : [];
  const nested = sections.reduce(
    (sum, s: any) => sum + (Array.isArray(s && s.questions) ? s.questions.length : 0),
    0
  );
  return direct + nested;
};

const allQuestions = (survey: SurveyTemplate | undefined | null): SurveyQuestion[] => {
  if (!survey) return [];
  const questions = Array.isArray(survey.questions) ? survey.questions : [];
  const sections = Array.isArray(survey.sections) ? survey.sections : [];
  const sectionQuestions = sections.flatMap((s: any) =>
    Array.isArray(s && s.questions) ? s.questions : []
  );
  return [...questions, ...sectionQuestions].sort((a, b) => (a.order || 0) - (b.order || 0));
};

const initials = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || '?';

const ratingAverage = (qa: any): string | null => {
  if (qa.questionType !== 'RATING' || !qa.distribution || qa.totalAnswers === 0) return null;
  const total = Object.entries(qa.distribution).reduce((sum, [key, count]) => sum + Number(key) * Number(count), 0);
  return (total / qa.totalAnswers).toFixed(1);
};

const completionPct = (detail: SurveyTemplate | null | undefined, responseList: any[], analysis: any): number => {
  const assigned = detail?._count?.assignments || 0;
  const answered = responseList.length || detail?._count?.responses || analysis?.totalResponses || 0;
  if (assigned > 0) return Math.min(100, Math.round((answered / assigned) * 100));
  return answered > 0 ? 100 : 0;
};

/** Keep one milestone card per type; prefer the row with the most questions / activity. */
function dedupeMilestones(surveys: SurveyTemplate[]): SurveyTemplate[] {
  const byType = new Map<string, SurveyTemplate>();
  for (const survey of surveys) {
    if (!MILESTONE_TYPES.has(survey.type)) continue;
    const current = byType.get(survey.type);
    if (!current) {
      byType.set(survey.type, survey);
      continue;
    }
    const currentScore = questionCount(current) * 1000 + (current._count?.assignments || 0);
    const nextScore = questionCount(survey) * 1000 + (survey._count?.assignments || 0);
    if (nextScore > currentScore) byType.set(survey.type, survey);
  }
  const order = ['SIX_MONTH', 'TWELVE_MONTH', 'EIGHTEEN_MONTH', 'TWENTY_FOUR_MONTH'];
  return order.map((type) => byType.get(type)).filter(Boolean) as SurveyTemplate[];
}

const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse rounded-lg bg-slate-200/70 dark:bg-slate-700/50 ${className}`} />
);

export const DepartmentSurveyCenter: React.FC<DepartmentSurveyCenterProps> = ({ darkMode = false }) => {
  const [surveys, setSurveys] = useState<SurveyTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'manage' | 'create'>('manage');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<SurveyTemplate | null>(null);
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [dispatchResult, setDispatchResult] = useState<{
    survey: SurveyTemplate;
    dispatchedCount: number;
    totalTargeted: number;
  } | null>(null);
  const [preview, setPreview] = useState<{
    surveyId: string;
    survey: SurveyTemplate;
    totalTargeted: number;
    alumniCount: number;
    employerCount: number;
    departmentName: string | null;
    alumni: { id: string; name: string; studentId: string | null; status: string }[];
  } | null>(null);
  const [responses, setResponses] = useState<any[]>([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<BuilderQuestion[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSurveys = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await surveyService.getSurveys();
      setSurveys(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load surveys.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSurveys();
  }, [fetchSurveys]);

  const milestones = useMemo(() => dedupeMilestones(surveys), [surveys]);
  const customSurveys = useMemo(
    () =>
      surveys
        .filter((s) => s.type === 'CUSTOM' && !s.isArchived)
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()),
    [surveys]
  );

  const summary = useMemo(() => {
    const pool = [...milestones, ...customSurveys];
    return {
      templates: pool.length,
      questions: pool.reduce((sum, s) => sum + questionCount(s), 0),
      assignments: pool.reduce((sum, s) => sum + (s._count?.assignments || 0), 0),
      responses: pool.reduce((sum, s) => sum + (s._count?.responses || 0), 0),
    };
  }, [milestones, customSurveys]);

  const openDetail = async (survey: SurveyTemplate) => {
    setSelectedId(survey.id);
    setSelectedDetail(survey);
    setAnalysis(null);
    setDetailLoading(true);
    try {
      const [full, analytics, surveyResponses] = await Promise.all([
        surveyService.getSurvey(survey.id),
        surveyService.getSurveyAnalysis(survey.id).catch(() => null),
        surveyService.getResponsesBySurvey(survey.id).catch(() => []),
      ]);
      setSelectedDetail(full || survey);
      setAnalysis(analytics);
      setResponses(Array.isArray(surveyResponses) ? surveyResponses : []);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load survey details.');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedId(null);
    setSelectedDetail(null);
    setAnalysis(null);
    setResponses([]);
  };

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { questionText: '', questionType: 'TEXT', required: false, options: [], order: prev.length },
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx).map((q, i) => ({ ...q, order: i })));
  };

  const handleSaveAndDispatch = async () => {
    if (!title.trim()) return toast.error('Survey title is required.');
    if (questions.length === 0) return toast.error('Add at least one question.');
    if (questions.some((q) => !q.questionText.trim())) return toast.error('Every question needs text.');

    setIsSubmitting(true);
    try {
      await surveyService.createSurvey({
        title: title.trim(),
        description: description.trim(),
        type: 'CUSTOM',
        targetAudience: 'ALUMNI',
        sendInstantly: true,
        questions: questions.map((q, i) => ({
          questionText: q.questionText.trim(),
          questionType: q.questionType,
          required: q.required,
          options: q.options || [],
          order: i,
        })),
      });
      toast.success('Survey published and dispatched to your department alumni.');
      setTitle('');
      setDescription('');
      setQuestions([]);
      setActiveSubTab('manage');
      await fetchSurveys();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create survey.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const askDispatch = async (survey: SurveyTemplate) => {
    setPreviewingId(survey.id);
    setPreview(null);
    try {
      const [profile, alumni] = await Promise.all([
        departmentService.getDepartmentProfile().catch(() => null),
        departmentService.getDepartmentAlumni().catch(() => []),
      ]);
      const recipients = Array.isArray(alumni) ? alumni : [];
      setPreview({
        surveyId: survey.id,
        survey,
        totalTargeted: recipients.length,
        alumniCount: recipients.length,
        employerCount: 0,
        departmentName: profile?.name ?? null,
        alumni: recipients.map((a) => ({
          id: a.id,
          name: a.fullName,
          studentId: a.studentId,
          status: 'Active',
        })),
      });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load dispatch preview.');
    } finally {
      setPreviewingId(null);
    }
  };

  const confirmDispatch = async () => {
    if (!preview) return;
    const survey = preview.survey;
    setDispatchingId(survey.id);
    try {
      const result = await departmentService.dispatchSurveyInstantly(survey.id);
      setPreview(null);
      setDispatchResult({
        survey,
        dispatchedCount: result.dispatchedCount,
        totalTargeted: result.totalTargeted,
      });
      if (result.dispatchedCount === 0) {
        toast('No active alumni were available to notify — no new assignments created.', { icon: 'ℹ️' });
      } else {
        toast.success(
          `Dispatched to ${result.dispatchedCount} of ${result.totalTargeted} department alumni.`
        );
      }
      await fetchSurveys();
      if (selectedId === survey.id) await openDetail(survey);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to dispatch survey.');
    } finally {
      setDispatchingId(null);
    }
  };

  const handleToggleActive = async (survey: SurveyTemplate) => {
    setMenuFor(null);
    const activating = !survey.isActive;
    try {
      if (activating) {
        await surveyService.activateSurvey(survey.id);
        toast.success('Survey activated and dispatched to alumni.');
      } else {
        await surveyService.deactivateSurvey(survey.id);
        toast.success('Survey deactivated.');
      }
      await fetchSurveys();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update survey status.');
    }
  };

  const handleClone = async (survey: SurveyTemplate) => {
    setMenuFor(null);
    try {
      await surveyService.cloneSurvey(survey.id);
      toast.success('Survey cloned successfully.');
      await fetchSurveys();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to clone survey.');
    }
  };

  const handleArchive = async (survey: SurveyTemplate) => {
    setMenuFor(null);
    const name = survey.title || 'this survey';
    if (!window.confirm(`Archive "${name}"? Archived surveys are hidden from your list.`)) return;
    try {
      await surveyService.deleteSurvey(survey.id);
      toast.success('Survey archived.');
      await fetchSurveys();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to archive survey.');
    }
  };

  const cardShell = darkMode
    ? 'bg-slate-900 border-slate-800 text-white'
    : 'bg-white border-slate-200/80 text-slate-900';

  const renderSurveyCard = (survey: SurveyTemplate, kind: 'milestone' | 'custom') => {
    const qCount = questionCount(survey);
    const assignments = survey._count?.assignments || 0;
    const responses = survey._count?.responses || 0;

    return (
      <div
        key={survey.id}
        className={`flex flex-col rounded-2xl border p-5 transition ${
          darkMode
            ? 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
            : 'border-slate-200 bg-slate-50/40 hover:border-[#003580]/25 hover:shadow-sm'
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
              kind === 'milestone'
                ? darkMode ? 'bg-amber-950/40 text-amber-300' : 'bg-amber-50 text-amber-800'
                : darkMode ? 'bg-blue-950/40 text-blue-300' : 'bg-blue-50 text-blue-800'
            }`}
          >
            {kind === 'milestone' ? `${survey.milestoneMonths || '—'}-Month Tracer` : 'Custom Survey'}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              survey.isActive
                ? darkMode ? 'bg-emerald-950/40 text-emerald-300' : 'bg-emerald-50 text-emerald-700'
                : darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {survey.isActive ? 'Active' : 'Inactive'}
          </span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuFor((prev) => (prev === survey.id ? null : survey.id))}
              aria-label="Survey actions"
              className={`rounded-lg p-1.5 transition ${darkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {menuFor === survey.id && (
              <div
                className={`absolute right-0 top-9 z-10 w-44 overflow-hidden rounded-xl border py-1 shadow-lg ${
                  darkMode ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleToggleActive(survey)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold ${
                    survey.isActive
                      ? 'text-amber-600'
                      : darkMode ? 'text-emerald-400' : 'text-emerald-700'
                  } ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}
                >
                  <Power className="h-3.5 w-3.5" />
                  {survey.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  type="button"
                  onClick={() => handleClone(survey)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold ${darkMode ? 'text-slate-200 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  <Copy className="h-3.5 w-3.5" />
                  Clone survey
                </button>
                {kind === 'custom' && (
                  <button
                    type="button"
                    onClick={() => handleArchive(survey)}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-red-500 ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-red-50'}`}
                  >
                    <Archive className="h-3.5 w-3.5" />
                    Archive
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <h4 className={`mt-3 text-sm font-bold leading-snug ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          {survey.title}
        </h4>
        <p className={`mt-1 line-clamp-2 text-xs leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          {survey.description || 'No description provided.'}
        </p>

        <div className={`mt-4 grid grid-cols-3 gap-2 rounded-xl border px-3 py-2.5 text-center ${darkMode ? 'border-slate-800' : 'border-slate-200 bg-white'}`}>
          <div>
            <p className={`text-base font-bold tabular-nums ${darkMode ? 'text-white' : 'text-slate-900'}`}>{qCount}</p>
            <p className={`text-[10px] font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Questions</p>
          </div>
          <div>
            <p className={`text-base font-bold tabular-nums ${darkMode ? 'text-white' : 'text-slate-900'}`}>{assignments}</p>
            <p className={`text-[10px] font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Assigned</p>
          </div>
          <div>
            <p className={`text-base font-bold tabular-nums ${darkMode ? 'text-white' : 'text-slate-900'}`}>{responses}</p>
            <p className={`text-[10px] font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Responses</p>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => openDetail(survey)}
            className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold ${
              darkMode ? 'border-slate-700 text-slate-200 hover:bg-slate-800' : 'border-slate-200 text-slate-700 hover:bg-white'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            View
          </button>
          <button
            type="button"
            disabled={dispatchingId === survey.id || previewingId === survey.id}
            onClick={() => askDispatch(survey)}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#003580] px-3 py-2 text-xs font-semibold text-white hover:bg-[#003580]/90 disabled:opacity-60"
          >
            <Send className="h-3.5 w-3.5" />
            {dispatchingId === survey.id
              ? 'Dispatching…'
              : previewingId === survey.id
                ? 'Checking targets…'
                : 'Dispatch'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#003580]/15 bg-gradient-to-br from-[#003580] via-[#1a4a8a] to-[#0f5f9e] p-6 text-white shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">Department Surveys</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">Create & dispatch to your alumni</h2>
            <p className="mt-1 max-w-2xl text-sm text-white/85">
              Milestone tracer templates plus your custom department surveys. Dispatch reaches alumni in your department only.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveSubTab('manage')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold ${
                activeSubTab === 'manage' ? 'bg-white text-[#003580]' : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              <ClipboardList className="h-4 w-4" />
              Manage
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('create')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold ${
                activeSubTab === 'create' ? 'bg-white text-[#003580]' : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              <Plus className="h-4 w-4" />
              Create survey
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/15 pt-5 md:grid-cols-4">
          {[
            { label: 'Templates', value: summary.templates, icon: ClipboardList },
            { label: 'Questions', value: summary.questions, icon: FilePlus2 },
            { label: 'Assigned', value: summary.assignments, icon: Users },
            { label: 'Responses', value: summary.responses, icon: CheckCircle2 },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-xl bg-white/10 px-3 py-3">
                <div className="flex items-center gap-2 text-white/70">
                  <Icon className="h-3.5 w-3.5" />
                  <span className="text-[11px] font-semibold uppercase tracking-wide">{item.label}</span>
                </div>
                <p className="mt-1 text-2xl font-bold tabular-nums">{loading ? '—' : item.value}</p>
              </div>
            );
          })}
        </div>
      </div>

      {activeSubTab === 'manage' ? (
        <div className="space-y-6">
          <div className={`rounded-2xl border p-5 ${cardShell}`}>
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold">Tracer milestone templates</h3>
                <p className={`mt-0.5 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Official 6 / 12 / 18 / 24-month surveys from the backend (one card per milestone).
                </p>
              </div>
              <button
                type="button"
                onClick={fetchSurveys}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold ${
                  darkMode ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'
                }`}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-52 rounded-2xl" />
                ))}
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-dashed border-red-200 bg-red-50/50 p-8 text-center">
                <AlertCircle className="mx-auto h-8 w-8 text-red-500" />
                <p className="mt-3 text-sm font-semibold text-red-700">{error}</p>
                <button
                  type="button"
                  onClick={fetchSurveys}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#003580] px-4 py-2 text-xs font-semibold text-white"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Try again
                </button>
              </div>
            ) : milestones.length === 0 ? (
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>No milestone templates available yet.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {milestones.map((survey) => renderSurveyCard(survey, 'milestone'))}
              </div>
            )}
          </div>

          <div className={`rounded-2xl border p-5 ${cardShell}`}>
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold">Your custom department surveys</h3>
                <p className={`mt-0.5 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Surveys you create here are dispatched to alumni in your department.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubTab('create')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#003580] px-3 py-2 text-xs font-semibold text-white"
              >
                <Plus className="h-3.5 w-3.5" />
                New survey
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-48 rounded-2xl" />
                ))}
              </div>
            ) : customSurveys.length === 0 ? (
              <div className={`rounded-2xl border border-dashed p-10 text-center ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                <FilePlus2 className={`mx-auto h-8 w-8 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                <p className={`mt-3 text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>No custom surveys yet</p>
                <p className={`mt-1 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Build a curriculum or skills survey and publish it to your graduates.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {customSurveys.map((survey) => renderSurveyCard(survey, 'custom'))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className={`space-y-6 rounded-2xl border p-6 ${cardShell}`}>
          <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 pb-4 dark:border-slate-800">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-bold">
                <FilePlus2 className="h-5 w-5 text-[#003580]" />
                Survey builder
              </h3>
              <p className={`mt-0.5 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Create questions, then publish & dispatch to your department alumni.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveSubTab('manage')}
              className={`rounded-xl border px-4 py-2 text-xs font-semibold ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className={`text-[11px] font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Survey title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Curriculum feedback — Class of 2024"
                className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#003580]/25 ${
                  darkMode ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-200 bg-white'
                }`}
              />
            </div>
            <div className="space-y-1.5">
              <label className={`text-[11px] font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Audience
              </label>
              <input
                type="text"
                disabled
                value="Your department alumni only"
                className={`w-full cursor-not-allowed rounded-xl border px-3 py-2.5 text-sm ${
                  darkMode ? 'border-slate-700 bg-slate-800 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={`text-[11px] font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell alumni why this survey matters..."
              className={`h-24 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#003580]/25 ${
                darkMode ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-200 bg-white'
              }`}
            />
          </div>

          <div className="space-y-4 border-t border-slate-200/70 pt-4 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h4 className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Questions ({questions.length})
              </h4>
              <button
                type="button"
                onClick={handleAddQuestion}
                className={`inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-bold ${darkMode ? 'border-blue-800 bg-blue-950 text-blue-300' : 'border-blue-200 bg-blue-50 text-blue-700'}`}
              >
                <Plus className="h-3.5 w-3.5" /> Add question
              </button>
            </div>

            {questions.length === 0 && (
              <p className={`rounded-xl border border-dashed px-4 py-8 text-center text-sm ${darkMode ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                No questions yet. Add your first question to continue.
              </p>
            )}

            <div className="space-y-4">
              {questions.map((q, qIdx) => (
                <div
                  key={qIdx}
                  className={`space-y-3 rounded-2xl border p-4 ${darkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50/70'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#003580]">Question #{qIdx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(qIdx)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_200px]">
                    <input
                      type="text"
                      value={q.questionText}
                      onChange={(e) => {
                        const updated = [...questions];
                        updated[qIdx] = { ...updated[qIdx], questionText: e.target.value };
                        setQuestions(updated);
                      }}
                      placeholder="Question text..."
                      className={`rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#003580]/25 ${
                        darkMode ? 'border-slate-600 bg-slate-700 text-white' : 'border-slate-200 bg-white'
                      }`}
                    />
                    <select
                      value={q.questionType}
                      onChange={(e) => {
                        const updated = [...questions];
                        updated[qIdx] = { ...updated[qIdx], questionType: e.target.value };
                        setQuestions(updated);
                      }}
                      className={`rounded-xl border px-3 py-2.5 text-sm ${
                        darkMode ? 'border-slate-600 bg-slate-700 text-white' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <option value="TEXT">Short text</option>
                      <option value="TEXTAREA">Paragraph</option>
                      <option value="RATING">Rating (1–5)</option>
                      <option value="RADIO">Multiple choice</option>
                      <option value="CHECKBOX">Checkboxes</option>
                      <option value="SELECT">Dropdown</option>
                    </select>
                  </div>

                  {['RADIO', 'CHECKBOX', 'SELECT'].includes(q.questionType) && (
                    <div className="space-y-2 pl-1">
                      {(q.options || []).map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const updated = [...questions];
                              const options = [...(updated[qIdx].options || [])];
                              options[optIdx] = e.target.value;
                              updated[qIdx] = { ...updated[qIdx], options };
                              setQuestions(updated);
                            }}
                            className={`flex-1 rounded-lg border px-2.5 py-2 text-sm ${
                              darkMode ? 'border-slate-600 bg-slate-700 text-white' : 'border-slate-200 bg-white'
                            }`}
                            placeholder={`Option ${optIdx + 1}`}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...questions];
                              updated[qIdx] = {
                                ...updated[qIdx],
                                options: (updated[qIdx].options || []).filter((_, i) => i !== optIdx),
                              };
                              setQuestions(updated);
                            }}
                            className="text-slate-400 hover:text-red-500"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...questions];
                          updated[qIdx] = {
                            ...updated[qIdx],
                            options: [...(updated[qIdx].options || []), `Option ${(updated[qIdx].options || []).length + 1}`],
                          };
                          setQuestions(updated);
                        }}
                        className="text-xs font-bold text-[#003580]"
                      >
                        + Add option
                      </button>
                    </div>
                  )}

                  <label className="inline-flex items-center gap-2 text-xs font-semibold">
                    <input
                      type="checkbox"
                      checked={q.required}
                      onChange={(e) => {
                        const updated = [...questions];
                        updated[qIdx] = { ...updated[qIdx], required: e.target.checked };
                        setQuestions(updated);
                      }}
                    />
                    Required
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200/70 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActiveSubTab('manage')}
              className={`rounded-xl px-5 py-2.5 text-xs font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSaveAndDispatch}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              {isSubmitting ? 'Publishing…' : 'Publish & dispatch'}
            </button>
          </div>
        </div>
      )}

      {selectedId && selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-4 backdrop-blur-sm sm:items-center">
          <div
            className={`flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border shadow-xl ${
              darkMode ? 'border-slate-800 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-900'
            }`}
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-200/70 px-5 py-4 dark:border-slate-800">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#003580]">
                  {MILESTONE_TYPES.has(selectedDetail.type) ? 'Milestone template' : 'Custom survey'}
                </p>
                <h3 className="mt-1 truncate text-lg font-bold">{selectedDetail.title}</h3>
                <p className={`mt-1 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {selectedDetail.description || 'No description'}
                </p>
              </div>
              <button type="button" onClick={closeDetail} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
              {detailLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-40 w-full" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { label: 'Questions', value: questionCount(selectedDetail), icon: ClipboardList },
                      { label: 'Assigned', value: selectedDetail._count?.assignments || 0, icon: Users },
                      { label: 'Responses', value: selectedDetail._count?.responses || analysis?.totalResponses || 0, icon: CheckCircle2 },
                      {
                        label: 'Status',
                        value: selectedDetail.isActive ? 'Active' : 'Inactive',
                        icon: Clock3,
                      },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.label}
                          className={`rounded-xl border p-3 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}
                        >
                          <div className={`mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            <Icon className="h-3.5 w-3.5" />
                            {item.label}
                          </div>
                          <p className="text-lg font-bold">{item.value}</p>
                        </div>
                      );
                    })}
                  </div>

                  {((selectedDetail._count?.assignments || 0) > 0 ||
                    (responses.length || analysis?.totalResponses || 0) > 0) && (
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="flex items-center gap-2 text-sm font-bold">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          Response progress
                        </h4>
                        <span className={`text-xs font-semibold tabular-nums ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                          {responses.length || analysis?.totalResponses || 0} of {selectedDetail._count?.assignments || 0} assigned
                        </span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all"
                          style={{ width: `${completionPct(selectedDetail, responses, analysis)}%` }}
                        />
                      </div>
                      <p className={`mt-1 text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {completionPct(selectedDetail, responses, analysis) > 0
                          ? `${completionPct(selectedDetail, responses, analysis)}% completion`
                          : `${selectedDetail._count?.assignments || 0} assigned — consider a reminder to pending alumni.`}
                      </p>
                    </div>
                  )}

                  {!((selectedDetail._count?.assignments || 0) > 0) &&
                    !((responses.length || analysis?.totalResponses || 0) > 0) && (
                      <div
                        className={`rounded-xl border border-dashed p-5 text-center ${darkMode ? 'border-slate-700' : 'border-amber-200 bg-amber-50/40'}`}
                      >
                        <FilePlus2 className={`mx-auto h-7 w-7 ${darkMode ? 'text-slate-500' : 'text-amber-500'}`} />
                        <p className={`mt-2 text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                          No responses yet
                        </p>
                        <p className={`mt-1 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          Dispatch this survey to your graduates to start collecting answers.
                        </p>
                        <button
                          type="button"
                          disabled={dispatchingId === selectedDetail.id || previewingId === selectedDetail.id}
                          onClick={() => askDispatch(selectedDetail)}
                          className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#003580] px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
                        >
                          <Send className="h-3.5 w-3.5" />
                          {dispatchingId === selectedDetail.id
                            ? 'Dispatching…'
                            : previewingId === selectedDetail.id
                              ? 'Checking targets…'
                              : 'Dispatch'}
                        </button>
                      </div>
                    )}

                  <div>
                    <h4 className="mb-3 flex items-center gap-2 text-sm font-bold">
                      <ClipboardList className="h-4 w-4 text-[#003580]" />
                      Questions
                    </h4>
                    <ol className="space-y-2">
                      {allQuestions(selectedDetail).map((q, idx) => (
                        <li
                          key={q.id || idx}
                          className={`rounded-xl border px-3 py-2.5 text-sm ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <span>
                              <span className="mr-2 font-semibold text-[#003580]">{idx + 1}.</span>
                              {q.questionText}
                            </span>
                            <span className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                              {q.questionType}
                            </span>
                          </div>
                        </li>
                      ))}
                      {allQuestions(selectedDetail).length === 0 && (
                        <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>No questions on this template.</p>
                      )}
                    </ol>
                  </div>

                  {responses.length > 0 && (
                    <div>
                      <h4 className="mb-3 flex items-center gap-2 text-sm font-bold">
                        <Users className="h-4 w-4 text-[#003580]" />
                        Respondents ({responses.length})
                      </h4>
                      <ul className="space-y-2">
                        {responses.map((r: any) => {
                          const usr = r?.alumni?.user || {};
                          const name = usr.fullName || usr.name || r?.alumni?.email || 'Alumni graduate';
                          const dep = r?.alumni?.department?.name || 'Graduate';
                          return (
                            <li
                              key={r.id}
                              className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}
                            >
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                                {initials(name)}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold">{name}</p>
                                <p className={`truncate text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{dep}</p>
                              </div>
                              {r.submittedAt && (
                                <span className={`shrink-0 text-[11px] font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                  {new Date(r.submittedAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  {analysis?.totalResponses > 0 && analysis?.questionAnalytics?.length > 0 && (
                    <div>
                      <h4 className="mb-3 flex items-center gap-2 text-sm font-bold">
                        <BarChart2 className="h-4 w-4 text-[#003580]" />
                        Response insights ({analysis.totalResponses} responses)
                      </h4>
                      <div className="space-y-3">
                        {analysis.questionAnalytics.slice(0, 6).map((qa: any) => (
                          <div
                            key={qa.questionId}
                            className={`rounded-xl border p-3 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}
                          >
                            <p className="text-sm font-semibold">{qa.questionText}</p>
                            <p className={`mt-1 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                              {qa.totalAnswers} answers · {qa.questionType}
                            </p>
                            {ratingAverage(qa) && (
                              <p className="mt-1 text-sm font-bold text-emerald-600">
                                ★ {ratingAverage(qa)} / 5 average
                              </p>
                            )}
                            {qa.distribution && Object.keys(qa.distribution).length > 0 && (
                              <div className="mt-2 space-y-1.5">
                                {Object.entries(qa.distribution).map(([label, count]) => {
                                  const n = Number(count);
                                  const p = qa.totalAnswers > 0 ? Math.round((n / qa.totalAnswers) * 100) : 0;
                                  return (
                                    <div key={label} className="flex items-center gap-2">
                                      <span className={`w-36 shrink-0 truncate text-xs ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                        {label}
                                      </span>
                                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                        <div
                                          className="h-full rounded-full bg-[#003580]"
                                          style={{ width: `${p}%` }}
                                        />
                                      </div>
                                      <span className="w-8 shrink-0 text-right text-xs font-semibold tabular-nums">{n}</span>
                                      <span className={`w-10 shrink-0 text-right text-[10px] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                        {p}%
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-200/70 px-5 py-4 dark:border-slate-800">
              <button
                type="button"
                onClick={closeDetail}
                className={`rounded-xl border px-4 py-2 text-xs font-semibold ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}
              >
                Close
              </button>
              <button
                type="button"
                disabled={dispatchingId === selectedDetail.id}
                onClick={() => askDispatch(selectedDetail)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#003580] px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
              >
                <Send className="h-3.5 w-3.5" />
                {dispatchingId === selectedDetail.id ? 'Dispatching…' : 'Dispatch to department'}
              </button>
            </div>
          </div>
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 z-[55] flex items-end justify-center bg-slate-950/45 p-4 backdrop-blur-sm sm:items-center">
          <div
            className={`flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border shadow-xl ${
              darkMode ? 'border-slate-800 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-900'
            }`}
          >
            <div className="border-b border-slate-200/70 px-6 py-4 dark:border-slate-800">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#003580]">Confirm dispatch</p>
                  <h3 className="mt-0.5 truncate text-lg font-bold">{preview.survey.title}</h3>
                  <p className={`mt-1 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {preview.departmentName ? `${preview.departmentName} department` : 'All eligible graduates'} · 21-day response window
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreview(null)}
                  className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="grid grid-cols-2 gap-3">
                <div className={`rounded-xl border p-4 text-center ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                  <p className="text-2xl font-bold tabular-nums">{preview.alumniCount}</p>
                  <p className={`mt-0.5 text-[11px] font-semibold uppercase tracking-wide ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Active alumni
                  </p>
                </div>
                <div className={`rounded-xl border p-4 text-center ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                  <p className="text-2xl font-bold tabular-nums">{preview.totalTargeted}</p>
                  <p className={`mt-0.5 text-[11px] font-semibold uppercase tracking-wide ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Total recipients
                  </p>
                </div>
              </div>

              {preview.alumniCount === 0 ? (
                <div className={`mt-4 rounded-xl border border-dashed p-4 text-center ${darkMode ? 'border-slate-700' : 'border-amber-200 bg-amber-50/50'}`}>
                  <AlertCircle className={`mx-auto h-6 w-6 ${darkMode ? 'text-amber-400' : 'text-amber-500'}`} />
                  <p className={`mt-2 text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>No active alumni to notify yet</p>
                  <p className={`mt-1 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Nothing will be assigned. Add or sync graduates first, then dispatch again.
                  </p>
                </div>
              ) : (
                <div className="mt-4">
                  <p className={`text-[11px] font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Recipients ({preview.alumniCount})
                  </p>
                  <ul className={`mt-2 max-h-48 space-y-1 overflow-y-auto rounded-xl border p-1 ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                    {preview.alumni.map((a) => (
                      <li key={a.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#003580]/10 text-[10px] font-bold text-[#003580]">
                          {initials(a.name)}
                        </span>
                        <span className="min-w-0 truncate font-medium">{a.name}</span>
                        <span className={`ml-auto shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                          {a.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-200/70 px-6 py-4 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setPreview(null)}
                className={`rounded-xl border px-4 py-2 text-xs font-semibold ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={dispatchingId === preview.survey.id}
                onClick={confirmDispatch}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#003580] px-5 py-2 text-xs font-semibold text-white hover:bg-[#003580]/90 disabled:opacity-60"
              >
                <Send className="h-3.5 w-3.5" />
                {dispatchingId === preview.survey.id
                  ? 'Dispatching…'
                  : preview.alumniCount === 0
                    ? 'Dispatch anyway'
                    : `Dispatch to ${preview.totalTargeted}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {dispatchResult && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/45 p-4 backdrop-blur-sm sm:items-center">
          <div
            className={`w-full max-w-md overflow-hidden rounded-2xl border shadow-xl ${
              darkMode ? 'border-slate-800 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-900'
            }`}
          >
            <div
              className={`px-6 py-5 ${
                dispatchResult.dispatchedCount > 0
                  ? 'bg-emerald-50 dark:bg-emerald-950/40'
                  : 'bg-amber-50 dark:bg-amber-950/30'
              }`}
            >
              <div className="flex items-start gap-3">
                {dispatchResult.dispatchedCount > 0 ? (
                  <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <AlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-amber-600 dark:text-amber-400" />
                )}
                <div className="min-w-0">
                  <p className={`text-[11px] font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Dispatch result
                  </p>
                  <h3 className="mt-0.5 text-base font-bold leading-snug">{dispatchResult.survey.title}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setDispatchResult(null)}
                  className={`ml-auto rounded-lg p-1 ${darkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="px-6 py-5">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className={`rounded-xl border p-4 ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                  <p className="text-2xl font-bold tabular-nums">{dispatchResult.dispatchedCount}</p>
                  <p className={`mt-0.5 text-[11px] font-semibold uppercase tracking-wide ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Assigned
                  </p>
                </div>
                <div className={`rounded-xl border p-4 ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                  <p className="text-2xl font-bold tabular-nums">{dispatchResult.totalTargeted}</p>
                  <p className={`mt-0.5 text-[11px] font-semibold uppercase tracking-wide ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Targeted
                  </p>
                </div>
              </div>

              <p className={`mt-4 text-sm leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                {dispatchResult.dispatchedCount === 0
                  ? 'No active alumni in your department were available to notify, so no new assignments were created. Once graduates are added or synced, click Dispatch again to invite them.'
                  : `This survey was assigned to ${dispatchResult.dispatchedCount} active graduate${
                      dispatchResult.dispatchedCount === 1 ? '' : 's'
                    } in your department. They will receive the notification and have 21 days to respond.`}
              </p>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDispatchResult(null)}
                  className="rounded-xl bg-[#003580] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#003580]/90"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentSurveyCenter;
