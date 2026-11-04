import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { surveyService } from '../../surveys/services/survey.service';
import {
  Search, Filter, ChevronLeft, ChevronRight, CheckCircle2, Clock, AlertCircle,
  RefreshCw, FileText, Layers, Check, X, ArrowRight, HelpCircle
} from 'lucide-react';

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
  <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 space-y-2.5">
    <label className="text-sm font-bold text-gray-900 leading-relaxed block">
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-[#003366]/10 text-[#003366] text-[10px] font-extrabold mr-1.5">
        {idx + 1}
      </span>
      {q.questionText}
      {q.required && <span className="text-red-500 ml-1">*</span>}
    </label>

    {(q.questionType === 'TEXT' || q.questionType === 'NUMBER' || q.questionType === 'DATE') && (
      <input
        type={q.questionType === 'NUMBER' ? 'number' : q.questionType === 'DATE' ? 'date' : 'text'}
        value={(answers[q.id] as string) || ''}
        onChange={(e) => onChange(q.id, e.target.value)}
        className="w-full text-sm p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#003366]/20 focus:outline-none focus:border-[#003366] transition-all"
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
        <span className="text-sm font-bold text-[#003366] min-w-[28px] text-center">
          {(answers[q.id] as string) || '5'}
        </span>
      </div>
    )}

    {q.questionType === 'TEXTAREA' && (
      <textarea
        value={(answers[q.id] as string) || ''}
        onChange={(e) => onChange(q.id, e.target.value)}
        className="w-full text-sm p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#003366]/20 focus:outline-none focus:border-[#003366] transition-all h-24 resize-none"
        required={q.required}
        placeholder={q.placeholder || ''}
      />
    )}

    {q.questionType === 'SELECT' && q.options && (
      <select
        value={(answers[q.id] as string) || ''}
        onChange={(e) => onChange(q.id, e.target.value)}
        className="w-full text-sm p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#003366]/20 focus:outline-none focus:border-[#003366] transition-all"
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
          <label key={opt} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
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
            <label key={opt} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
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

  // Search, Status Filter & Pagination state for handling long survey lists
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED' | 'EXPIRED'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchMySurveys();
  }, []);

  const fetchMySurveys = async () => {
    setLoading(true);
    try {
      const data = await surveyService.getMySurveys();
      setAssignments(data || []);
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

  // Counts
  const completedCount = assignments.filter((s) => s.status === 'COMPLETED').length;
  const pendingCount = assignments.filter((s) => s.status === 'PENDING' || s.status === 'IN_PROGRESS').length;
  const expiredCount = assignments.filter((s) => s.status === 'EXPIRED').length;
  const totalCount = assignments.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filter & Search Logic
  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch = !searchQuery ||
      (a.survey?.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.survey?.description || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    const isCompleted = a.status === 'COMPLETED';
    const isExpired = a.status === 'EXPIRED';
    const isPending = a.status === 'PENDING' || a.status === 'IN_PROGRESS';

    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'PENDING') return isPending;
    if (statusFilter === 'COMPLETED') return isCompleted;
    if (statusFilter === 'EXPIRED') return isExpired;

    return true;
  });

  // Pagination Math
  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage) || 1;
  const currentAssignments = filteredAssignments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-gray-500 flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin text-[#003366]" />
        <span>Loading tracer questionnaires from ASTU database...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Hero Banner with ASTU Branding ── */}
      <section
        className="rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #003366 0%, #001a33 50%, #0d2b4d 100%)' }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFCC00]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start gap-4">
            <img
              alt="ASTU Logo"
              className="h-14 w-14 object-contain scale-110 shrink-0"
              src="/images/astu-seal-logo.png"
            />
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#FFCC00]/20 text-[#FFD700] text-[10px] font-bold uppercase tracking-wider rounded-full border border-[#FFCC00]/30">
                Tracer &amp; Accreditation Studies
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Graduate Tracer Surveys
              </h2>
              <p className="text-sm text-white/70 leading-relaxed max-w-xl">
                Complete your tracer studies to help ASTU maintain ABET and ETA accreditation.
                Your responses drive curriculum improvements and career support programs.
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 min-w-[200px]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-2">Completion Progress</div>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-3xl font-extrabold text-[#FFCC00]">{progressPct}%</span>
              <span className="text-xs text-white/60 mb-1">{completedCount}/{totalCount} done</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, #FFCC00, #FFD700)' }}
              />
            </div>
            {pendingCount > 0 && (
              <p className="text-[10px] text-[#FFCC00] font-semibold mt-2">
                {pendingCount} pending — submit before deadline
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── Main interface: Survey list OR active survey questionnaire ── */}
      {!activeAssignment ? (
        <div className="space-y-5">
          {/* Header Controls, Filter Tabs, and Search Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2 border-b border-gray-150">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-white text-sm font-bold material-symbols-outlined" style={{ background: 'linear-gradient(135deg, #003366, #001a33)' }}>assignment</span>
                Your Tracer Questionnaires
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Managed tracer study assignments sent by your department and ASTU administration.
              </p>
            </div>

            {/* Filter Tabs & Search Control */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              
              {/* Search Bar */}
              <div className="relative flex-1 md:w-60">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  placeholder="Search questionnaires..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#003366] focus:bg-white transition-all"
                />
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs font-bold">
                <button
                  onClick={() => { setStatusFilter('ALL'); setCurrentPage(1); }}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    statusFilter === 'ALL' ? 'bg-white text-[#003366] shadow-xs' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  All ({totalCount})
                </button>
                <button
                  onClick={() => { setStatusFilter('PENDING'); setCurrentPage(1); }}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    statusFilter === 'PENDING' ? 'bg-white text-[#CC0033] shadow-xs' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Pending ({pendingCount})
                </button>
                <button
                  onClick={() => { setStatusFilter('COMPLETED'); setCurrentPage(1); }}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    statusFilter === 'COMPLETED' ? 'bg-white text-[#1D9E75] shadow-xs' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Done ({completedCount})
                </button>
              </div>

              {/* Refresh Button */}
              <button
                onClick={fetchMySurveys}
                className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold cursor-pointer"
                title="Refresh surveys list"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Questionnaire Items List */}
          <div className="space-y-3">
            {currentAssignments.map((assignment) => {
              const isCompleted = assignment.status === 'COMPLETED';
              const isExpired = assignment.status === 'EXPIRED';
              return (
                <div
                  key={assignment.id}
                  className={`rounded-2xl border transition-all duration-200 ${
                    isCompleted || isExpired
                      ? 'bg-gray-50/80 border-gray-200/80'
                      : 'bg-white border-gray-200/60 hover:shadow-md hover:border-[#003366]/20'
                  }`}
                >
                  <div className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1 space-y-2.5">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold tracking-wider rounded-full ${
                              isCompleted
                                ? 'bg-[#1D9E75]/10 text-[#1D9E75] border border-[#1D9E75]/20'
                                : isExpired ? 'bg-gray-200 text-gray-600' : 'bg-[#CC0033]/10 text-[#CC0033] border border-[#CC0033]/20'
                            }`}
                          >
                            {isCompleted ? 'Completed' : isExpired ? 'Expired' : 'Pending Action'}
                          </span>
                          <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-400" /> Deadline: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-gray-900">{assignment.survey?.title || 'Tracer Study'}</h4>
                        <p className="text-xs text-gray-500 leading-relaxed max-w-2xl">{assignment.survey?.description || 'Department tracer study survey questionnaire.'}</p>
                      </div>

                      <button
                        onClick={() => {
                          if (!isCompleted && !isExpired) {
                            handleStartSurvey(assignment);
                          }
                        }}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 cursor-pointer ${
                          isCompleted || isExpired
                            ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed'
                            : 'text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                        }`}
                        style={!isCompleted && !isExpired ? { background: 'linear-gradient(135deg, #003366, #001a33)' } : undefined}
                      >
                        {isCompleted ? 'Submitted' : isExpired ? 'Expired' : 'Start Questionnaire'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Empty State */}
            {filteredAssignments.length === 0 && (
              <div className="text-center py-12 px-6 rounded-2xl bg-gray-50 border border-gray-200/60 space-y-2">
                <AlertCircle className="w-8 h-8 text-gray-400 mx-auto" />
                <p className="text-sm font-semibold text-gray-700">No matching tracer study questionnaires found.</p>
                <p className="text-xs text-gray-400 max-w-md mx-auto">
                  {searchQuery || statusFilter !== 'ALL'
                    ? 'Try clearing your search query or status filter to see all assigned surveys.'
                    : 'New surveys assigned by your department head will automatically appear here.'}
                </p>
                {(searchQuery || statusFilter !== 'ALL') && (
                  <button
                    onClick={() => { setSearchQuery(''); setStatusFilter('ALL'); setCurrentPage(1); }}
                    className="mt-2 text-xs text-[#003366] font-bold hover:underline cursor-pointer"
                  >
                    Reset Search &amp; Filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pagination Controls when there are many questionnaires */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3">
              <span className="text-xs text-gray-500 font-medium">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAssignments.length)} of {filteredAssignments.length} questionnaires
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl border border-gray-200 disabled:opacity-40 hover:bg-gray-50 flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Previous
                </button>
                <span className="text-xs font-bold text-gray-700 px-2">Page {currentPage} of {totalPages}</span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl border border-gray-200 disabled:opacity-40 hover:bg-gray-50 flex items-center gap-1 cursor-pointer"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

        </div>
      ) : (
        /* ── Active Survey Question Form ── */
        <div className="rounded-2xl bg-white border border-gray-200/60 shadow-sm overflow-hidden">
          <div
            className="p-5 text-white"
            style={{ background: 'linear-gradient(135deg, #003366, #001a33)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  alt="ASTU"
                  className="h-9 w-9 object-contain rounded-lg bg-white/15 p-1 border border-white/20"
                  src="/images/AdamaScienceandTechnologyUniversityASTU-logo-350x350.jpg"
                />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFCC00]">
                    Tracer Study in Progress
                  </span>
                  <h3 className="text-lg font-bold mt-0.5">{activeAssignment.survey?.title}</h3>
                </div>
              </div>
              <button
                onClick={() => { setActiveAssignment(null); setAnswers({}); }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors border border-white/20 cursor-pointer"
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
                  <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-gray-200">
                    No questions available for this survey template.
                  </div>
                );
              }

              const hasSectionQuestions = (activeAssignment.survey?.sections || []).some((s: any) => (s.questions?.length || 0) > 0);
              
              if (hasSectionQuestions) {
                return activeAssignment.survey.sections.map((section: any, sIdx: number) => (
                  <div key={section.id || sIdx} className="space-y-4">
                    <div className="border-b border-gray-200 pb-2">
                      <h4 className="text-lg font-bold text-[#003366]">{section.title}</h4>
                      {section.description && <p className="text-sm text-gray-500">{section.description}</p>}
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

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => { setActiveAssignment(null); setAnswers({}); }}
                className="flex-1 px-5 py-3 border border-gray-200 hover:bg-gray-50 rounded-xl text-sm font-semibold text-gray-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-5 py-3 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #003366, #001a33)' }}
              >
                <span className="flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">send</span>
                  Submit Answers
                </span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};