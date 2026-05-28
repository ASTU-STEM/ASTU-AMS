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
    // Initialize answers
    const initialAnswers: Record<string, string> = {};
    survey.questions.forEach((q) => {
      initialAnswers[q.id] = '';
    });
    setAnswers(initialAnswers);
  };

  const handleSubmitSurvey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSurvey) return;

    // Validation: make sure all questions are answered
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

  return (
    <div className="space-y-8">
      {/* Intro section */}
      <section className="bg-gradient-to-r from-red-900 via-rose-950 to-astu-navy rounded-3xl p-8 md:p-10 text-white shadow-lg relative overflow-hidden">
        <div className="absolute left-0 bottom-0 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        <div className="max-w-3xl relative z-10 space-y-4">
          <span className="px-3 py-1 bg-white/15 text-[#FFD700] text-xs font-bold uppercase tracking-wider rounded-full">Tracer & Accreditation Studies</span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Institutional Impact Tracer Studies 📊</h2>
          <p className="text-md opacity-90 leading-relaxed">
            ASTU tracer studies collect real employment outcomes, income averages, and industry skill-gap insights. Your feedback provides the verified audits required by international and national accreditation agencies (such as ETA) to expand degree recognitions.
          </p>
        </div>
      </section>

      {/* Main interface: Survey list OR active survey questionnaire */}
      {!activeSurvey ? (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200/60 max-w-4xl mx-auto space-y-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Your Tracer Questionnaires</h3>
            <p className="text-sm text-gray-600">Please complete all pending studies to assist quality reviews</p>
          </div>

          <div className="space-y-4">
            {surveys.map((survey) => (
              <div
                key={survey.id}
                className={`p-6 border rounded-2xl transition-all ${
                  survey.status === 'COMPLETED'
                    ? 'bg-gray-50/50 border-gray-200'
                    : 'bg-gradient-to-r from-red-50/10 to-white border-red-100 hover:shadow-md hover:border-red-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-0.5 text-xs font-bold tracking-wider rounded-full ${
                          survey.status === 'COMPLETED'
                            ? 'bg-gray-100 text-gray-500'
                            : 'bg-astu-red/15 text-astu-red'
                        }`}
                      >
                        {survey.status === 'COMPLETED' ? 'Completed' : 'Pending Action'}
                      </span>
                      <span className="text-xs text-gray-500 font-medium">Deadline: {survey.deadline}</span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900">{survey.title}</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">{survey.description}</p>
                  </div>
                  <button
                    onClick={() => {
                      if (survey.status === 'PENDING') {
                        handleStartSurvey(survey);
                      } else {
                        toast.success('You have already submitted this study. Thank you!');
                      }
                    }}
                    className={`px-6 py-3 rounded-xl text-xs font-bold transition-all shadow-sm ${
                      survey.status === 'COMPLETED'
                        ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-astu-red hover:bg-red-600 text-white hover:scale-105'
                    }`}
                  >
                    {survey.status === 'COMPLETED' ? 'Completed' : 'Start Questionnaire'}
                  </button>
                </div>
              </div>
            ))}

            {surveys.length === 0 && (
              <div className="p-8 text-center text-gray-500 italic">No tracer study questionnaires found.</div>
            )}
          </div>
        </div>
      ) : (
        /* Active Survey Question Form */
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200/60 max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <span className="text-xs font-bold text-astu-red uppercase tracking-wider">Tracer Study in Progress</span>
              <h3 className="text-xl font-bold text-gray-900 mt-1">{activeSurvey.title}</h3>
            </div>
            <button
              onClick={() => {
                setActiveSurvey(null);
                setAnswers({});
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <form onSubmit={handleSubmitSurvey} className="space-y-6">
            {activeSurvey.questions.map((q, idx) => (
              <div key={q.id} className="space-y-2 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <label className="text-sm font-bold text-gray-900 leading-relaxed block">
                  {idx + 1}. {q.text}
                </label>

                {q.type === 'select' && q.options && (
                  <select
                    value={answers[q.id] || ''}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    className="w-full text-sm p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-astu-red/25 focus:outline-none focus:border-astu-red transition-all"
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
                    className="w-full text-sm p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-astu-red/25 focus:outline-none focus:border-astu-red transition-all h-24 resize-none"
                    placeholder="Describe skill gaps, tools, or course recommendations here..."
                    required
                  />
                )}
              </div>
            ))}

            <div className="flex gap-4 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setActiveSurvey(null);
                  setAnswers({});
                }}
                className="flex-1 px-6 py-3 border border-gray-200 hover:bg-gray-50 rounded-xl text-sm font-semibold text-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-astu-red hover:bg-red-600 text-white font-semibold rounded-xl transition-all shadow-md hover:scale-105"
              >
                Submit Answers
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
