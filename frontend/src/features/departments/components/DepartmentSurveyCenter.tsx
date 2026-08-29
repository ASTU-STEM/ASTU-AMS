import React, { useState, useEffect } from 'react';
import { surveyService } from '../../surveys/services/survey.service';
import toast from 'react-hot-toast';
import {
  Send, Plus, Trash2, CheckCircle, Clock, FilePlus2, Sparkles,
  ClipboardList, AlertCircle, RefreshCw, BarChart2, ShieldCheck, Mail
} from 'lucide-react';

interface DepartmentSurveyCenterProps {
  darkMode?: boolean;
}

export const DepartmentSurveyCenter: React.FC<DepartmentSurveyCenterProps> = ({ darkMode = false }) => {
  const [surveys, setSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'manage' | 'create'>('manage');

  // Builder Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<any[]>([
    {
      questionText: 'How well did the department curriculum prepare you for your current engineering role?',
      questionType: 'RATING',
      required: true,
      options: [],
      order: 0
    },
    {
      questionText: 'Which emerging technical frameworks or tools should be added to the department syllabus?',
      questionType: 'TEXTAREA',
      required: true,
      options: [],
      order: 1
    }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSurveys = async () => {
    setLoading(true);
    try {
      const data = await surveyService.getSurveys();
      setSurveys(data || []);
    } catch (err: any) {
      console.error('Error fetching surveys:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: '',
        questionType: 'TEXT',
        required: false,
        options: [],
        order: questions.length
      }
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    const updated = [...questions];
    updated.splice(idx, 1);
    setQuestions(updated);
  };

  const handleAddOption = (qIdx: number) => {
    const updated = [...questions];
    if (!updated[qIdx].options) updated[qIdx].options = [];
    updated[qIdx].options.push(`Option ${updated[qIdx].options.length + 1}`);
    setQuestions(updated);
  };

  const handleRemoveOption = (qIdx: number, optIdx: number) => {
    const updated = [...questions];
    updated[qIdx].options.splice(optIdx, 1);
    setQuestions(updated);
  };

  const handleSaveAndDispatch = async () => {
    if (!title.trim()) return toast.error('Survey Title is required.');
    if (questions.length === 0) return toast.error('At least one survey question is required.');

    setIsSubmitting(true);
    try {
      const payload = {
        title,
        description,
        type: 'CUSTOM',
        targetAudience: 'ALUMNI',
        sendInstantly: true,
        questions: questions.map((q, i) => ({
          questionText: q.questionText,
          questionType: q.questionType,
          required: q.required,
          options: q.options || [],
          order: i
        }))
      };

      await surveyService.createSurvey(payload);
      toast.success('Department Level Survey published! Multi-channel notifications dispatched via In-App, Email, and SMS to all department alumni.');
      
      setTitle('');
      setDescription('');
      setActiveSubTab('manage');
      fetchSurveys();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create and dispatch department survey.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDispatchInstantly = async (surveyId: string, surveyTitle: string) => {
    try {
      await surveyService.activateSurvey(surveyId);
      toast.success(`Multi-channel survey notifications dispatched via In-App, Email, and SMS for "${surveyTitle}".`);
      fetchSurveys();
    } catch (err: any) {
      toast.error(err.message || 'Failed to dispatch survey notifications.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-[20px] border border-white/10 bg-gradient-to-r from-astu-navy via-[#003580] to-astu-green p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-white">
                Department Level Survey System
              </span>
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">Department Custom Alumni Surveys</h2>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-white/85">
              Create custom department tracer surveys to collect syllabus feedback, skill requirements, and career outcome updates from your department graduates. Every survey dispatch automatically triggers **In-App, Email, and SMS** notifications to department alumni.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveSubTab('manage')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeSubTab === 'manage' ? 'bg-white text-astu-navy shadow-sm' : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              Department Surveys
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('create')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeSubTab === 'create' ? 'bg-white text-astu-navy shadow-sm' : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              <Plus className="w-4 h-4" />
              Create New Survey
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeSubTab === 'manage' ? (
        <div className={`p-6 rounded-3xl border shadow-xs ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200/70 text-gray-900'}`}>
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-150">
            <div>
              <h3 className="text-lg font-extrabold flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-astu-navy" />
                Active &amp; Historical Department Surveys
              </h3>
              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                Surveys managed by Department Head for ABET accreditation and curriculum modernization.
              </p>
            </div>
            <button
              onClick={fetchSurveys}
              className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-gray-400">Loading department surveys...</div>
          ) : surveys.length === 0 ? (
            <div className="p-10 text-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50">
              <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700">No custom department surveys created yet.</p>
              <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                Click "Create New Survey" to build a survey for your department graduates with automated multi-channel (In-App, Email, SMS) notifications.
              </p>
              <button
                onClick={() => setActiveSubTab('create')}
                className="mt-4 px-5 py-2.5 bg-astu-navy text-white text-xs font-extrabold rounded-xl hover:bg-astu-navy/90 inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Create Department Survey
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {surveys.map((survey) => {
                const isMilestone = ['SIX_MONTH', 'TWELVE_MONTH', 'EIGHTEEN_MONTH', 'TWENTY_FOUR_MONTH'].includes(survey.type);

                return (
                  <div
                    key={survey.id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                      darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50/60 border-gray-200 hover:border-astu-navy/30 hover:shadow-md'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                          isMilestone ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {isMilestone ? 'Milestone Template' : 'Department Custom'}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${
                          survey.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {survey.isActive ? 'ACTIVE' : 'DRAFT'}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-gray-900 line-clamp-1">{survey.title}</h4>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{survey.description || 'Department tracer study survey'}</p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-gray-150 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-gray-400 font-semibold">
                        {(survey.questions?.length || 0) + (survey.sections?.flatMap((s: any) => s.questions || []).length || 0)} Questions
                      </span>
                      <button
                        onClick={() => handleDispatchInstantly(survey.id, survey.title)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-astu-navy text-white text-[11px] font-extrabold hover:bg-astu-navy/90 transition-all shadow-xs"
                      >
                        <Send className="w-3 h-3" /> Re-Dispatch Alert
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Create Survey Form */
        <div className={`p-6 rounded-3xl border shadow-xs space-y-6 ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200/70 text-gray-900'}`}>
          <div className="flex justify-between items-center pb-4 border-b border-gray-150">
            <div>
              <h3 className="text-lg font-extrabold flex items-center gap-2">
                <FilePlus2 className="w-5 h-5 text-astu-navy" />
                Department Survey Builder
              </h3>
              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                Design custom questions for your department alumni with automatic tri-channel alert delivery (In-App, Email, SMS).
              </p>
            </div>
            <button
              onClick={() => setActiveSubTab('manage')}
              className="px-4 py-2 text-xs font-bold border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={`text-[11px] font-extrabold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Survey Title *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. CSE Alumni Syllabus & Practical Skill Survey 2026"
                className={`w-full p-2.5 text-xs rounded-xl border outline-none focus:border-astu-navy font-semibold ${darkMode ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-500' : 'border-gray-250 bg-white text-gray-900'}`}
                required
              />
            </div>
            <div className="space-y-1">
              <label className={`text-[11px] font-extrabold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Department Scope</label>
              <input
                type="text"
                disabled
                value="Scoped to your Department Alumni"
                className={`w-full p-2.5 text-xs rounded-xl border bg-gray-100 font-bold text-gray-700 cursor-not-allowed ${darkMode ? 'bg-slate-700 border-slate-600 text-slate-300' : 'border-gray-200'}`}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className={`text-[11px] font-extrabold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Description / Instructions</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Explain the purpose of this department survey to alumni..."
              className={`w-full p-2.5 text-xs rounded-xl border outline-none focus:border-astu-navy h-20 ${darkMode ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-500' : 'border-gray-250 bg-white text-gray-900'}`}
            />
          </div>

          {/* Question List Builder */}
          <div className="space-y-4 pt-4 border-t border-gray-150">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-700">Survey Questions ({questions.length})</h4>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-extrabold rounded-xl hover:bg-blue-100 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Question
              </button>
            </div>

            <div className="space-y-4">
              {questions.map((q, qIdx) => (
                <div key={qIdx} className={`p-4 rounded-2xl border space-y-3 ${darkMode ? 'border-slate-700 bg-slate-800/60' : 'border-gray-200 bg-gray-50/70'}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-astu-navy">Question #{qIdx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(qIdx)}
                      className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-3">
                    <input
                      type="text"
                      value={q.questionText}
                      onChange={e => {
                        const updated = [...questions];
                        updated[qIdx].questionText = e.target.value;
                        setQuestions(updated);
                      }}
                      placeholder={`Enter Question #${qIdx + 1} text...`}
                      className={`w-full p-2.5 text-xs rounded-xl border font-semibold outline-none focus:border-astu-navy ${darkMode ? 'border-slate-600 bg-slate-700 text-white placeholder-slate-400' : 'border-gray-250 bg-white text-gray-900'}`}
                    />

                    <select
                      value={q.questionType}
                      onChange={e => {
                        const updated = [...questions];
                        updated[qIdx].questionType = e.target.value;
                        setQuestions(updated);
                      }}
                      className={`p-2.5 text-xs rounded-xl border font-bold outline-none ${darkMode ? 'border-slate-600 bg-slate-700 text-white' : 'border-gray-250 bg-white text-gray-900'}`}
                    >
                      <option value="TEXT">Short Text</option>
                      <option value="TEXTAREA">Paragraph Text</option>
                      <option value="RATING">Rating Scale (1-5 Stars)</option>
                      <option value="RADIO">Multiple Choice (Radio)</option>
                      <option value="CHECKBOX">Checkboxes</option>
                      <option value="SELECT">Dropdown</option>
                    </select>
                  </div>

                  {['RADIO', 'CHECKBOX', 'SELECT'].includes(q.questionType) && (
                    <div className="pl-4 space-y-2">
                      <label className={`text-[10px] font-bold uppercase ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Answer Options</label>
                      {(q.options || []).map((opt: string, optIdx: number) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={opt}
                            onChange={e => {
                              const updated = [...questions];
                              updated[qIdx].options[optIdx] = e.target.value;
                              setQuestions(updated);
                            }}
                            className="p-2 text-xs rounded-lg border border-gray-200 bg-white flex-1"
                            placeholder={`Option ${optIdx + 1}`}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(qIdx, optIdx)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleAddOption(qIdx)}
                        className="text-xs text-astu-navy font-bold hover:underline"
                      >
                        + Add Option
                      </button>
                    </div>
                  )}

                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={q.required}
                      onChange={e => {
                        const updated = [...questions];
                        updated[qIdx].required = e.target.checked;
                        setQuestions(updated);
                      }}
                      className="rounded text-astu-navy"
                    />
                    <span className="text-xs font-bold text-gray-700">Required Question</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-150">
            <button
              type="button"
              onClick={() => setActiveSubTab('manage')}
              className="px-5 py-2.5 text-xs font-bold text-gray-600 rounded-xl hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSaveAndDispatch}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1D9E75] text-white text-xs font-extrabold rounded-xl hover:brightness-110 shadow-md disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmitting ? 'Publishing & Dispatching...' : 'Publish & Dispatch Department Survey'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentSurveyCenter;
