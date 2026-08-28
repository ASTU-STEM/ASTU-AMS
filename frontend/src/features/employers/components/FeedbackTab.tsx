import React, { useState, useMemo, useEffect } from 'react';
import { GraduateFeedback } from '../types/employer.types';
import { employerService } from '../services/employer.service';
import { surveyService } from '../../surveys/services/survey.service';
import toast from 'react-hot-toast';
import { Download, Search, Filter, Star, TrendingUp, Users, Award, ClipboardCheck, X, CheckCircle, Send } from 'lucide-react';

interface FeedbackTabProps {
  feedbacks: GraduateFeedback[];
  onSubmitFeedback: (feedback: Omit<GraduateFeedback, 'id' | 'submittedAt'>) => void;
  onRefreshFeedbacks?: () => void;
  darkMode: boolean;
}

export const FeedbackTab: React.FC<FeedbackTabProps> = ({ feedbacks, onSubmitFeedback, onRefreshFeedbacks, darkMode }) => {
  const [assignedSurveys, setAssignedSurveys] = useState<any[]>([]);
  const [surveysLoading, setSurveysLoading] = useState<boolean>(true);
  const [activeSurveyModal, setActiveSurveyModal] = useState<any | null>(null);
  const [surveyAnswers, setSurveyAnswers] = useState<Record<string, string>>({});
  const [submittingSurvey, setSubmittingSurvey] = useState<boolean>(false);
  const [completedSurveyIds, setCompletedSurveyIds] = useState<Set<string>>(new Set());

  const fetchEmployerSurveys = async () => {
    setSurveysLoading(true);
    try {
      const data = await surveyService.getMySurveys();
      if (Array.isArray(data)) {
        setAssignedSurveys(data);
      }
    } catch (_) {
      // Fallback sample survey if network unavailable
    } finally {
      setSurveysLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployerSurveys();
  }, []);

  const handleOpenSurveyModal = (survey: any) => {
    setActiveSurveyModal(survey);
    setSurveyAnswers({});
  };

  const handleSubmitSurveyAnswers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSurveyModal) return;

    setSubmittingSurvey(true);
    try {
      const formattedAnswers = Object.entries(surveyAnswers).map(([qId, text]) => ({
        questionId: qId,
        answerText: text,
      }));

      await surveyService.submitAssignedSurvey(
        activeSurveyModal.id,
        formattedAnswers
      );

      setCompletedSurveyIds((prev) => new Set(prev).add(activeSurveyModal.id));
      toast.success('Thank you! Your employer survey response has been submitted to ASTU Administration.');
      setActiveSurveyModal(null);
      fetchEmployerSurveys();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit survey. Please try again.');
    } finally {
      setSubmittingSurvey(false);
    }
  };

  const [formData, setFormData] = useState({
    alumnusName: '',
    department: 'Computer Science and Engineering',
    technicalSkills: 5,
    communication: 5,
    leadership: 5,
    teamwork: 5,
    problemSolving: 5,
    comments: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'rating'>('recent');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.alumnusName.trim() || !formData.comments.trim()) {
      toast.error('Please complete the feedback comments and select graduate names.');
      return;
    }

    setIsSubmitting(true);
    try {
      await employerService.submitFeedback({
        alumnusName: formData.alumnusName,
        department: formData.department,
        technicalSkills: formData.technicalSkills,
        communication: formData.communication,
        leadership: formData.leadership,
        teamwork: formData.teamwork,
        problemSolving: formData.problemSolving,
        comments: formData.comments
      });

      setFormData({
        alumnusName: '',
        department: 'Computer Science and Engineering',
        technicalSkills: 5,
        communication: 5,
        leadership: 5,
        teamwork: 5,
        problemSolving: 5,
        comments: ''
      });

      toast.success('Thank you! Graduate feedback submitted to ASTU Academic Board.');
      if (onRefreshFeedbacks) onRefreshFeedbacks();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter and sort feedbacks
  const filteredFeedbacks = useMemo(() => {
    let result = [...feedbacks];

    // Search filter
    if (searchQuery) {
      result = result.filter(fb =>
        fb.alumnusName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fb.comments.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fb.department.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Department filter
    if (selectedDepartment !== 'all') {
      result = result.filter(fb => fb.department === selectedDepartment);
    }

    // Sort
    if (sortBy === 'rating') {
      result.sort((a, b) => {
        const avgA = (a.technicalSkills + a.communication + a.leadership + a.teamwork + a.problemSolving) / 5;
        const avgB = (b.technicalSkills + b.communication + b.leadership + b.teamwork + b.problemSolving) / 5;
        return avgB - avgA;
      });
    }

    return result;
  }, [feedbacks, searchQuery, selectedDepartment, sortBy]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (feedbacks.length === 0) {
      return {
        avgOverall: 0,
        avgTechnical: 0,
        avgCommunication: 0,
        avgLeadership: 0,
        avgTeamwork: 0,
        avgProblemSolving: 0,
        totalFeedbacks: 0,
        topDepartment: 'N/A'
      };
    }

    const total = feedbacks.length;
    const avgOverall = feedbacks.reduce((sum, fb) =>
      sum + (fb.technicalSkills + fb.communication + fb.leadership + fb.teamwork + fb.problemSolving) / 5, 0) / total;

    // Find top department
    const deptCounts: Record<string, { count: number; total: number }> = {};
    feedbacks.forEach(fb => {
      if (!deptCounts[fb.department]) {
        deptCounts[fb.department] = { count: 0, total: 0 };
      }
      deptCounts[fb.department].count++;
      deptCounts[fb.department].total += (fb.technicalSkills + fb.communication + fb.leadership + fb.teamwork + fb.problemSolving) / 5;
    });

    let topDept = '';
    let topAvg = 0;
    Object.entries(deptCounts).forEach(([dept, data]) => {
      const avg = data.total / data.count;
      if (avg > topAvg) {
        topAvg = avg;
        topDept = dept;
      }
    });

    return {
      avgOverall: avgOverall.toFixed(2),
      avgTechnical: (feedbacks.reduce((sum, fb) => sum + fb.technicalSkills, 0) / total).toFixed(2),
      avgCommunication: (feedbacks.reduce((sum, fb) => sum + fb.communication, 0) / total).toFixed(2),
      avgLeadership: (feedbacks.reduce((sum, fb) => sum + fb.leadership, 0) / total).toFixed(2),
      avgTeamwork: (feedbacks.reduce((sum, fb) => sum + fb.teamwork, 0) / total).toFixed(2),
      avgProblemSolving: (feedbacks.reduce((sum, fb) => sum + fb.problemSolving, 0) / total).toFixed(2),
      totalFeedbacks: total,
      topDepartment: topDept || 'N/A'
    };
  }, [feedbacks]);

  const departments = useMemo(() => {
    const depts = new Set(feedbacks.map(fb => fb.department));
    return ['all', ...Array.from(depts)];
  }, [feedbacks]);

  const handleExport = () => {
    const csvContent = 'data:text/csv;charset=utf-8,'
      + 'Graduate Name,Department,Technical Skills,Communication,Leadership,Teamwork,Problem Solving,Average Rating,Comments,Submitted At\n'
      + feedbacks.map(fb => {
        const avg = ((fb.technicalSkills + fb.communication + fb.leadership + fb.teamwork + fb.problemSolving) / 5).toFixed(2);
        return `"${fb.alumnusName}","${fb.department}",${fb.technicalSkills},${fb.communication},${fb.leadership},${fb.teamwork},${fb.problemSolving},${avg},"${fb.comments.replace(/"/g, '""')}","${fb.submittedAt}"`;
      }).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `graduate_feedback_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Feedback data exported successfully!');
  };

  const renderStarRating = (key: 'technicalSkills' | 'communication' | 'leadership' | 'teamwork' | 'problemSolving') => {
    return (
      <div className="flex gap-1.5 mt-1">
        {[1, 2, 3, 4, 5].map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, [key]: val }))}
            className="text-amber-400 focus:outline-none transition-transform hover:scale-110"
          >
            <span className="material-symbols-outlined font-bold text-xl">
              {formData[key] >= val ? 'star' : 'star_border'}
            </span>
          </button>
        ))}
      </div>
    );
  };

  const getMetricAverage = (fb: GraduateFeedback) => {
    return ((fb.technicalSkills + fb.communication + fb.leadership + fb.teamwork + fb.problemSolving) / 5).toFixed(1);
  };

  const renderProgressBar = (value: number, max: number, color: string, label: string) => (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-semibold text-gray-500">{label}</span>
        <span className="text-[10px] font-bold text-gray-700">{value}/{max}</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Assigned Employer Surveys Section */}
      <section className={`p-6 border rounded-3xl shadow-sm transition-all duration-300 ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200/60 text-gray-900'}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-4 border-b border-gray-150">
          <div>
            <h3 className="text-lg font-extrabold flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-astu-navy" />
              Assigned ASTU Employer Surveys
            </h3>
            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
              Surveys dispatched by ASTU Administration for employer satisfaction, skill requirements, and curriculum feedback.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-[#003580] border border-blue-200">
            {assignedSurveys.length} Available Surveys
          </span>
        </div>

        {surveysLoading ? (
          <div className="p-8 text-center text-xs text-gray-400">Loading active employer surveys...</div>
        ) : assignedSurveys.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50">
            <p className="text-sm font-semibold text-gray-600">No pending employer surveys at this time.</p>
            <p className="text-xs text-gray-400 mt-1">ASTU Administration will notify your organization via In-App, Email, and SMS when new surveys are published.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignedSurveys.map((survey: any) => {
              const isDone = completedSurveyIds.has(survey.id);
              const qCount = (survey.questions?.length || 0) + ((survey.sections || []).reduce((acc: number, s: any) => acc + (s.questions?.length || 0), 0));

              return (
                <div
                  key={survey.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isDone
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50/60 border-gray-200 hover:border-astu-navy/40 hover:bg-white hover:shadow-md'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                        isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {isDone ? 'COMPLETED' : 'PENDING ACTION'}
                      </span>
                      <span className="text-[10px] text-gray-400 font-semibold">{qCount} Questions</span>
                    </div>

                    <h4 className="font-bold text-sm text-gray-900 line-clamp-1">{survey.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{survey.description || 'ASTU Partner Employer Survey'}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-150 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400">ASTU Quality Board</span>
                    {isDone ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                        <CheckCircle className="w-4 h-4" /> Submitted
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenSurveyModal(survey)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#003580] text-white text-xs font-extrabold hover:bg-[#002660] transition-all shadow-xs"
                      >
                        Take Survey →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Survey Modal */}
      {activeSurveyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-gray-150 pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-100 text-blue-700 uppercase tracking-wider">
                  Employer Survey
                </span>
                <h3 className="text-lg font-extrabold text-gray-900 mt-1">{activeSurveyModal.title}</h3>
                <p className="text-xs text-gray-500">{activeSurveyModal.description}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveSurveyModal(null)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitSurveyAnswers} className="space-y-6">
              {(() => {
                const questions = [
                  ...(activeSurveyModal.questions || []),
                  ...((activeSurveyModal.sections || []).flatMap((s: any) => s.questions || []))
                ];

                if (questions.length === 0) {
                  return (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                        <label className="block text-xs font-bold text-gray-800 mb-2">1. Technical &amp; Practical Skill Preparedness (Rating 1-5)</label>
                        <select
                          onChange={(e) => setSurveyAnswers(prev => ({ ...prev, q1: e.target.value }))}
                          className="w-full p-2.5 text-xs rounded-xl border border-gray-200"
                          required
                        >
                          <option value="">Select rating...</option>
                          <option value="5 - Excellent">5 - Excellent</option>
                          <option value="4 - Good">4 - Good</option>
                          <option value="3 - Satisfactory">3 - Satisfactory</option>
                          <option value="2 - Needs Improvement">2 - Needs Improvement</option>
                          <option value="1 - Poor">1 - Poor</option>
                        </select>
                      </div>
                      <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                        <label className="block text-xs font-bold text-gray-800 mb-2">2. Missing Skills &amp; Technology Frameworks in ASTU Curriculum</label>
                        <textarea
                          onChange={(e) => setSurveyAnswers(prev => ({ ...prev, q2: e.target.value }))}
                          className="w-full p-2.5 text-xs rounded-xl border border-gray-200 h-20"
                          placeholder="e.g. Cloud Architecture, Docker/Kubernetes, Mobile App Development..."
                          required
                        />
                      </div>
                    </div>
                  );
                }

                return questions.map((q: any, idx: number) => (
                  <div key={q.id || idx} className="p-4 rounded-2xl border border-gray-150 bg-gray-50/50 space-y-2">
                    <label className="block text-xs font-bold text-gray-800">
                      {idx + 1}. {q.questionText} {q.required && <span className="text-red-500">*</span>}
                    </label>

                    {q.questionType === 'RATING' ? (
                      <div className="flex gap-2 pt-1">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setSurveyAnswers(prev => ({ ...prev, [q.id]: String(val) }))}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                              surveyAnswers[q.id] === String(val)
                                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                                : 'bg-white border-gray-200 text-gray-700 hover:bg-amber-50'
                            }`}
                          >
                            ★ {val}
                          </button>
                        ))}
                      </div>
                    ) : q.questionType === 'TEXTAREA' ? (
                      <textarea
                        value={surveyAnswers[q.id] || ''}
                        onChange={(e) => setSurveyAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                        className="w-full p-2.5 text-xs rounded-xl border border-gray-200 h-20 outline-none focus:border-astu-navy"
                        placeholder="Your detailed response..."
                        required={q.required}
                      />
                    ) : q.options && q.options.length > 0 ? (
                      <div className="space-y-1.5 pt-1">
                        {q.options.map((opt: string, optIdx: number) => (
                          <label key={optIdx} className="flex items-center gap-2.5 text-xs text-gray-700 font-semibold cursor-pointer">
                            <input
                              type="radio"
                              name={`q_${q.id}`}
                              value={opt}
                              checked={surveyAnswers[q.id] === opt}
                              onChange={(e) => setSurveyAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                              className="text-astu-navy"
                              required={q.required}
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={surveyAnswers[q.id] || ''}
                        onChange={(e) => setSurveyAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                        className="w-full p-2.5 text-xs rounded-xl border border-gray-200 outline-none focus:border-astu-navy"
                        placeholder="Your answer..."
                        required={q.required}
                      />
                    )}
                  </div>
                ));
              })()}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-150">
                <button
                  type="button"
                  onClick={() => setActiveSurveyModal(null)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 rounded-xl hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingSurvey}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-astu-navy text-white text-xs font-extrabold rounded-xl hover:bg-astu-navy/90 shadow-md disabled:opacity-50"
                >
                  {submittingSurvey ? 'Submitting...' : 'Submit Survey Response'} <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200/60'}`}>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-astu-navy/10">
              <Award className="w-4 h-4 text-astu-navy" />
            </div>
            <span className="text-[10px] font-semibold text-gray-500">Overall</span>
          </div>
          <p className="text-2xl font-extrabold text-astu-navy">{stats.avgOverall}</p>
          <p className="text-[10px] text-gray-500">/ 5.0 average</p>
        </div>

        <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200/60'}`}>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-[10px] font-semibold text-gray-500">Technical</span>
          </div>
          <p className="text-2xl font-extrabold text-emerald-600">{stats.avgTechnical}</p>
          <p className="text-[10px] text-gray-500">/ 5.0 average</p>
        </div>

        <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200/60'}`}>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10">
              <Users className="w-4 h-4 text-blue-500" />
            </div>
            <span className="text-[10px] font-semibold text-gray-500">Teamwork</span>
          </div>
          <p className="text-2xl font-extrabold text-blue-600">{stats.avgTeamwork}</p>
          <p className="text-[10px] text-gray-500">/ 5.0 average</p>
        </div>

        <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200/60'}`}>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-purple-500/10">
              <Star className="w-4 h-4 text-purple-500" />
            </div>
            <span className="text-[10px] font-semibold text-gray-500">Communication</span>
          </div>
          <p className="text-2xl font-extrabold text-purple-600">{stats.avgCommunication}</p>
          <p className="text-[10px] text-gray-500">/ 5.0 average</p>
        </div>

        <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200/60'}`}>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10">
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-[10px] font-semibold text-gray-500">Leadership</span>
          </div>
          <p className="text-2xl font-extrabold text-amber-600">{stats.avgLeadership}</p>
          <p className="text-[10px] text-gray-500">/ 5.0 average</p>
        </div>

        <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200/60'}`}>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-rose-500/10">
              <TrendingUp className="w-4 h-4 text-rose-500" />
            </div>
            <span className="text-[10px] font-semibold text-gray-500">Total</span>
          </div>
          <p className="text-2xl font-extrabold text-rose-600">{stats.totalFeedbacks}</p>
          <p className="text-[10px] text-gray-500">feedbacks</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left: Rating feedback Form */}
        <div className="lg:col-span-1">
          <form
            onSubmit={handleSubmit}
            className={`p-6 border rounded-3xl shadow-sm transition-all duration-300 space-y-5 ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200/60 text-gray-900'
              }`}
          >
            <div>
              <h3 className="text-lg font-bold">Submit Graduate Audit</h3>
              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Rate hired ASTU graduates to assist academic curriculum quality audits</p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider">Hired Graduate Name</label>
              <input
                type="text"
                value={formData.alumnusName}
                onChange={e => setFormData(prev => ({ ...prev, alumnusName: e.target.value }))}
                placeholder="e.g. Abebe Bikila"
                className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-250 text-gray-800'
                  }`}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider">Department</label>
              <select
                value={formData.department}
                onChange={e => setFormData(prev => ({ ...prev, department: e.target.value }))}
                className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none font-semibold ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-250 text-gray-800'
                  }`}
              >
                <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                <option value="Electrical and Computer Engineering">Electrical and Computer Engineering</option>
                <option value="Mechanical and Vehicle Engineering">Mechanical and Vehicle Engineering</option>
              </select>
            </div>

            {/* Core rating sliders */}
            <div className="space-y-3 pt-2 border-t border-gray-150">
              {[
                { key: 'technicalSkills' as const, label: 'Technical & Practical Skills' },
                { key: 'communication' as const, label: 'Professional Communication' },
                { key: 'leadership' as const, label: 'Leadership Qualities' },
                { key: 'teamwork' as const, label: 'Teamwork & Collaboration' },
                { key: 'problemSolving' as const, label: 'Analytical Problem-Solving' }
              ].map(metric => (
                <div key={metric.key} className="flex justify-between items-center bg-gray-50/5 p-2 rounded-xl border border-gray-100/5">
                  <span className="text-xs font-semibold">{metric.label}</span>
                  {renderStarRating(metric.key)}
                </div>
              ))}
            </div>

            <div className="space-y-1 pt-2 border-t border-gray-150">
              <label className="text-[10px] font-bold uppercase tracking-wider">Academic Recommendations</label>
              <textarea
                value={formData.comments}
                onChange={e => setFormData(prev => ({ ...prev, comments: e.target.value }))}
                placeholder="Highlight any tools, frameworks, or syllabus improvements required..."
                className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none h-20 resize-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-250 text-gray-800'
                  }`}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-astu-navy text-white rounded-xl text-xs font-extrabold uppercase tracking-wider hover:scale-102 transition-all shadow-md disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <><span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Submitting...</>
              ) : (
                'Submit Feedback Audit'
              )}
            </button>
          </form>
        </div>

        {/* Right: Feedback ledger lists */}
        <div className="lg:col-span-2">
          <div className={`p-6 border rounded-3xl shadow-sm transition-all duration-300 space-y-6 ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200/60 text-gray-900'
            }`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold">Submitted Quality Feedback</h3>
                <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Review structured graduate audits transmitted to ASTU Quality Assurance Dean</p>
              </div>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-astu-navy text-white rounded-xl text-xs font-bold hover:bg-astu-navy/90 transition-all"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search feedback..."
                  className={`w-full pl-10 pr-4 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-astu-navy/20 ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'
                    }`}
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className={`px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-astu-navy/20 ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'
                    }`}
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>
                      {dept === 'all' ? 'All Departments' : dept}
                    </option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'recent' | 'rating')}
                  className={`px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-astu-navy/20 ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'
                    }`}
                >
                  <option value="recent">Most Recent</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

<div className="space-y-4">
                {filteredFeedbacks.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-sm text-gray-500">No feedback found matching your criteria.</p>
                  </div>
                ) : (
                  filteredFeedbacks.map((fb) => (
                    <div
                      key={fb.id}
                      className={`p-5 border rounded-2xl bg-gradient-to-br transition-all ${darkMode ? 'from-slate-800 to-slate-900 border-slate-700' : 'from-gray-50 to-white border-gray-150'}`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-3">
                        <div>
                          <h4 className="font-bold text-sm">{fb.alumnusName}</h4>
                          <p className="text-xs text-astu-navy font-bold">{fb.department}</p>
                          <span className="text-[10px] text-gray-500 font-semibold">Submitted {fb.submittedAt}</span>
                        </div>
                        <div className="text-right">
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-extrabold rounded-lg text-xs">
                            Avg. Rating: {getMetricAverage(fb)} / 5
                          </span>
                        </div>
                      </div>

                      <p className={`text-xs leading-relaxed italic ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                        "{fb.comments}"
                      </p>

                      {/* Rating dots */}
                      <div className="grid grid-cols-5 gap-2 pt-4 mt-3 border-t border-gray-150 text-[10px] font-bold text-gray-500">
                        <div>Tech: <span className="text-amber-500">{fb.technicalSkills}/5</span></div>
                        <div>Comm: <span className="text-amber-500">{fb.communication}/5</span></div>
                        <div>Lead: <span className="text-amber-500">{fb.leadership}/5</span></div>
                        <div>Team: <span className="text-amber-500">{fb.teamwork}/5</span></div>
                        <div>Solve: <span className="text-amber-500">{fb.problemSolving}/5</span></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};
