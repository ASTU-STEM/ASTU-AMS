import React, { useState } from 'react';
import { TracerSurvey } from '../types/alumni.types';
import toast from 'react-hot-toast';

interface SurveysTabProps {
  surveys: TracerSurvey[];
  onCompleteSurvey: (surveyId: number, answers: Record<string, string>) => void;
}

export const SurveysTab: React.FC<SurveysTabProps> = ({ surveys, onCompleteSurvey }) => {
  const [activeSurvey, setActiveSurvey] = useState<TracerSurvey | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleStartSurvey = (survey: TracerSurvey) => {
    setActiveSurvey(survey);
    const initialAnswers: Record<string, string> = {};
    survey.questions.forEach((q) => {
      initialAnswers[q.id] = '';
    });
    setAnswers(initialAnswers);
  };

  const handleSubmitSurvey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSurvey) return;

    const unanswered = activeSurvey.questions.filter((q) => !answers[q.id] || !answers[q.id].trim());
    if (unanswered.length > 0) {
      toast.error('Please answer all questions before submitting.');
      return;
    }

    onCompleteSurvey(activeSurvey.id, answers);
    setActiveSurvey(null);
    setAnswers({});
    toast.success('Thank you! Tracer survey submitted successfully.');
  };

  const completedCount = surveys.filter((s) => s.status === 'COMPLETED').length;
  const pendingCount = surveys.filter((s) => s.status === 'PENDING').length;
  const totalCount = surveys.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* ── Hero Banner with ASTU Branding ── */}
      <section
        className="rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #003366 0%, #001a33 50%, #0d2b4d 100%)' }}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFCC00]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start gap-4">
            <img
              alt="ASTU Logo"
              className="h-14 w-14 object-contain rounded-xl bg-white/10 p-1.5 border border-white/20 shadow-md flex-shrink-0"
              src="/images/AdamaScienceandTechnologyUniversityASTU-logo-350x350.jpg"
            />
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#FFCC00]/20 text-[#FFD700] text-[10px] font-bold uppercase tracking-wider rounded-full border border-[#FFCC00]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFCC00] animate-pulse"></span>
                Tracer & Accreditation Studies
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

          {/* Progress Summary Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 min-w-[200px]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-2">Completion Progress</div>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-3xl font-extrabold text-[#FFCC00]">{progressPct}%</span>
              <span className="text-xs text-white/60 mb-1">{completedCount}/{totalCount} done</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progressPct}%`,
                  background: 'linear-gradient(90deg, #FFCC00, #FFD700)',
                }}
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
      {!activeSurvey ? (
        <div className="space-y-4">
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-white text-sm font-bold"
                  style={{ background: 'linear-gradient(135deg, #003366, #001a33)' }}
                >
                  📋
                </span>
                Your Tracer Questionnaires
              </h3>
              <p className="text-xs text-gray-500 mt-0.5 ml-10">Complete all pending studies to assist quality reviews</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-[10px] font-bold bg-[#003366]/10 text-[#003366] rounded-full">
                {completedCount} Completed
              </span>
              {pendingCount > 0 && (
                <span className="px-2.5 py-1 text-[10px] font-bold bg-red-50 text-[#CC0033] rounded-full">
                  {pendingCount} Pending
                </span>
              )}
            </div>
          </div>

          {/* Survey Cards */}
          <div className="space-y-3">
            {surveys.map((survey, idx) => {
              const isCompleted = survey.status === 'COMPLETED';
              return (
                <div
                  key={survey.id}
                  className={`rounded-2xl border transition-all duration-200 ${
                    isCompleted
                      ? 'bg-gray-50/80 border-gray-200/80'
                      : 'bg-white border-gray-200/60 hover:shadow-md hover:border-[#003366]/20'
                  }`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1 space-y-2.5">
                        {/* Status & Deadline Row */}
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold tracking-wider rounded-full ${
                              isCompleted
                                ? 'bg-[#1D9E75]/10 text-[#1D9E75] border border-[#1D9E75]/20'
                                : 'bg-[#CC0033]/10 text-[#CC0033] border border-[#CC0033]/20'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-[#1D9E75]' : 'bg-[#CC0033] animate-pulse'}`}></span>
                            {isCompleted ? 'Completed' : 'Pending Action'}
                          </span>
                          <span className="text-[10px] text-gray-400 font-semibold">
                            Deadline: {survey.deadline}
                          </span>
                          {isCompleted && survey.completedAt && (
                            <span className="text-[10px] text-gray-400 font-semibold">
                              · Completed: {survey.completedAt}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h4 className="text-base font-bold text-gray-900">{survey.title}</h4>

                        {/* Description */}
                        <p className="text-xs text-gray-500 leading-relaxed max-w-2xl">{survey.description}</p>

                        {/* Type Badge */}
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md"
                            style={{
                              background: '#003366' + '10',
                              color: '#003366',
                            }}
                          >
                            {survey.type || 'Tracer Study'}
                          </span>
                          {survey.questions && (
                            <span className="text-[10px] text-gray-400 font-medium">
                              {survey.questions.length} questions
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => {
                          if (!isCompleted) {
                            handleStartSurvey(survey);
                          } else {
                            toast.success('You have already submitted this study. Thank you!');
                          }
                        }}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                          isCompleted
                            ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed'
                            : 'text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                        }`}
                        style={
                          !isCompleted
                            ? { background: 'linear-gradient(135deg, #003366, #001a33)' }
                            : undefined
                        }
                      >
                        {isCompleted ? (
                          <span className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            Submitted
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm">edit_note</span>
                            Start Questionnaire
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {surveys.length === 0 && (
              <div className="text-center py-12 px-6 rounded-2xl bg-gray-50 border border-gray-200/60">
                <div className="text-4xl mb-3 opacity-30">📊</div>
                <p className="text-sm font-semibold text-gray-600">No tracer study questionnaires found.</p>
                <p className="text-xs text-gray-400 mt-1">New surveys will appear here when assigned.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ── Active Survey Question Form ── */
        <div className="rounded-2xl bg-white border border-gray-200/60 shadow-sm overflow-hidden">
          {/* Form Header with ASTU Branding */}
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
                  <h3 className="text-lg font-bold mt-0.5">{activeSurvey.title}</h3>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveSurvey(null);
                  setAnswers({});
                }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors border border-white/20"
              >
                <span className="material-symbols-outlined text-white text-sm">close</span>
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="px-5 pt-4 pb-0">
            <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 mb-1.5">
              <span>Progress</span>
              <span>
                {Object.values(answers).filter((v) => v.trim()).length} / {activeSurvey.questions.length} answered
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${activeSurvey.questions.length > 0
                    ? (Object.values(answers).filter((v) => v.trim()).length / activeSurvey.questions.length) * 100
                    : 0
                  }%`,
                  background: 'linear-gradient(90deg, #003366, #003366CC)',
                }}
              />
            </div>
          </div>

          {/* Questions Form */}
          <form onSubmit={handleSubmitSurvey} className="p-5 space-y-4">
            {activeSurvey.questions.map((q, idx) => (
              <div
                key={q.id}
                className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 space-y-2.5"
              >
                <label className="text-sm font-bold text-gray-900 leading-relaxed block">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-[#003366]/10 text-[#003366] text-[10px] font-extrabold mr-1.5">
                    {idx + 1}
                  </span>
                  {q.text}
                </label>

                {q.type === 'select' && q.options && (
                  <select
                    value={answers[q.id] || ''}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    className="w-full text-sm p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#003366]/20 focus:outline-none focus:border-[#003366] transition-all"
                    required
                  >
                    <option value="">-- Select an option --</option>
                    {q.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}

                {q.type === 'text' && (
                  <textarea
                    value={answers[q.id] || ''}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    className="w-full text-sm p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#003366]/20 focus:outline-none focus:border-[#003366] transition-all h-24 resize-none"
                    placeholder="Describe skill gaps, tools, or course recommendations here..."
                    required
                  />
                )}
              </div>
            ))}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setActiveSurvey(null);
                  setAnswers({});
                }}
                className="flex-1 px-5 py-3 border border-gray-200 hover:bg-gray-50 rounded-xl text-sm font-semibold text-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-5 py-3 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]"
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