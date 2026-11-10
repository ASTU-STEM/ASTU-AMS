import React, { useState, useEffect } from 'react';
import { surveyService } from '../../surveys/services/survey.service';
import toast from 'react-hot-toast';
import {
  Send, Plus, Trash2, CheckCircle, Clock, FilePlus2, Sparkles,
  ClipboardList, AlertCircle, RefreshCw, BarChart2, ShieldCheck, Mail,
  Eye, Edit2, Copy, Search, Filter, X, ChevronRight, User, CheckCircle2,
  MessageSquare, AlertTriangle, Layers, ArrowLeft, Grid, List, ChevronLeft, FileText, Check
} from 'lucide-react';

interface DepartmentSurveyCenterProps {
  darkMode?: boolean;
}

export const DepartmentSurveyCenter: React.FC<DepartmentSurveyCenterProps> = ({ darkMode = false }) => {
  const [surveys, setSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'manage' | 'create' | 'analytics'>('manage');
  
  // View Switcher (Default to LIST view per requirement)
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Survey List Pagination
  const [surveyPage, setSurveyPage] = useState(1);
  const surveysPerPage = 8;

  // Selected Survey for View/Edit/Analysis
  const [selectedSurvey, setSelectedSurvey] = useState<any | null>(null);
  const [analysisData, setAnalysisData] = useState<any | null>(null);
  const [responsesData, setResponsesData] = useState<any[]>([]);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  // Response Roster Search, Pagination & Detail View
  const [responseSearchQuery, setResponseSearchQuery] = useState('');
  const [responsePage, setResponsePage] = useState(1);
  const responsesPerPage = 8;
  const [viewingResponse, setViewingResponse] = useState<any | null>(null);
  const [inspectSearchQuery, setInspectSearchQuery] = useState('');

  // Professional Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTargetAudience, setEditTargetAudience] = useState<'ALUMNI' | 'EMPLOYERS' | 'BOTH'>('ALUMNI');
  const [editQuestions, setEditQuestions] = useState<any[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // Builder Form State (Create New Survey)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState<'ALUMNI' | 'EMPLOYERS' | 'BOTH'>('ALUMNI');
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
      console.error('Error fetching department surveys:', err);
      toast.error('Failed to load surveys from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  // Helper functions for questions
  const getQuestionCount = (survey: any) => {
    if (Array.isArray(survey.questions) && survey.questions.length > 0) {
      return survey.questions.length;
    }
    if (Array.isArray(survey.sections) && survey.sections.length > 0) {
      return survey.sections.reduce((acc: number, sec: any) => acc + (sec.questions?.length || 0), 0);
    }
    return 0;
  };

  const getAllQuestions = (survey: any) => {
    const list: any[] = [];
    if (Array.isArray(survey.questions)) {
      list.push(...survey.questions);
    }
    if (Array.isArray(survey.sections)) {
      survey.sections.forEach((sec: any) => {
        if (Array.isArray(sec.questions)) {
          list.push(...sec.questions);
        }
      });
    }
    return list;
  };

  // Filter department custom surveys (Type CUSTOM)
  const departmentSurveys = surveys.filter(s => s.type === 'CUSTOM');

  const filteredSurveys = departmentSurveys.filter(s => {
    const matchesSearch = !searchQuery ||
      (s.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.description || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === 'ALL') return matchesSearch;
    if (statusFilter === 'ACTIVE') return matchesSearch && s.isActive;
    if (statusFilter === 'DRAFT') return matchesSearch && !s.isActive;
    return matchesSearch;
  });

  // Survey Pagination Math
  const totalSurveyPages = Math.ceil(filteredSurveys.length / surveysPerPage) || 1;
  const currentSurveys = filteredSurveys.slice(
    (surveyPage - 1) * surveysPerPage,
    surveyPage * surveysPerPage
  );

  // Question handlers for Create Form
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

  // Question handlers for Edit Modal
  const handleAddEditQuestion = () => {
    setEditQuestions([
      ...editQuestions,
      {
        questionText: '',
        questionType: 'TEXT',
        required: false,
        options: [],
        order: editQuestions.length
      }
    ]);
  };

  const handleRemoveEditQuestion = (idx: number) => {
    const updated = [...editQuestions];
    updated.splice(idx, 1);
    setEditQuestions(updated);
  };

  const handleAddEditOption = (qIdx: number) => {
    const updated = [...editQuestions];
    if (!updated[qIdx].options) updated[qIdx].options = [];
    updated[qIdx].options.push(`Option ${updated[qIdx].options.length + 1}`);
    setEditQuestions(updated);
  };

  const handleRemoveEditOption = (qIdx: number, optIdx: number) => {
    const updated = [...editQuestions];
    updated[qIdx].options.splice(optIdx, 1);
    setEditQuestions(updated);
  };

  const handleSaveAndDispatch = async () => {
    if (!title.trim()) return toast.error('Survey Title is required.');
    if (questions.length === 0) return toast.error('At least one survey question is required.');

    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].questionText.trim()) {
        return toast.error(`Question #${i + 1} text cannot be empty.`);
      }
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title,
        description,
        type: 'CUSTOM',
        targetAudience,
        sendInstantly: true,
        isActive: true,
        questions: questions.map((q, i) => ({
          questionText: q.questionText,
          questionType: q.questionType,
          required: q.required,
          options: q.options || [],
          order: i
        }))
      };

      await surveyService.createSurvey(payload);
      toast.success('🚀 Department Survey published! Multi-channel alerts (In-App DB, Email, and SMS) dispatched to department alumni.');

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
      await surveyService.sendSurveyInstantly(surveyId);
      toast.success(`🚀 Multi-channel notifications dispatched via In-App, Email, and SMS for "${surveyTitle}".`);
      fetchSurveys();
    } catch (err: any) {
      toast.error(err.message || 'Failed to dispatch survey notifications.');
    }
  };

  const handleToggleActive = async (survey: any) => {
    try {
      if (survey.isActive) {
        await surveyService.deactivateSurvey(survey.id);
        toast.success(`Survey "${survey.title}" set to Draft.`);
      } else {
        await surveyService.activateSurvey(survey.id);
        toast.success(`Survey "${survey.title}" activated and dispatched to alumni!`);
      }
      fetchSurveys();
    } catch (err: any) {
      toast.error(err.message || 'Failed to toggle survey active status.');
    }
  };

  const handleCloneSurvey = async (surveyId: string) => {
    try {
      await surveyService.cloneSurvey(surveyId);
      toast.success('Survey cloned successfully in database!');
      fetchSurveys();
    } catch (err: any) {
      toast.error(err.message || 'Failed to clone survey.');
    }
  };

  const handleDeleteSurvey = async (survey: any) => {
    if (['SIX_MONTH', 'TWELVE_MONTH', 'EIGHTEEN_MONTH', 'TWENTY_FOUR_MONTH'].includes(survey.type)) {
      return toast.error('Standard milestone templates cannot be deleted.');
    }
    if (!window.confirm(`Are you sure you want to archive custom survey "${survey.title}"?`)) return;

    try {
      await surveyService.deleteSurvey(survey.id);
      toast.success('Custom survey archived from database!');
      fetchSurveys();
    } catch (err: any) {
      toast.error(err.message || 'Failed to archive survey.');
    }
  };

  const handleViewAnalysis = async (survey: any) => {
    setSelectedSurvey(survey);
    setActiveSubTab('analytics');
    setLoadingAnalysis(true);
    setResponseSearchQuery('');
    setResponsePage(1);

    try {
      const [analysisRes, responsesRes] = await Promise.all([
        surveyService.getSurveyAnalysis(survey.id).catch(() => null),
        surveyService.getResponsesBySurvey(survey.id).catch(() => []),
      ]);

      setAnalysisData(analysisRes);
      setResponsesData(responsesRes || []);
    } catch (err) {
      console.error('Failed to load survey analysis:', err);
      toast.error('Failed to load live survey responses.');
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const openEditModal = (survey: any) => {
    setSelectedSurvey(survey);
    setEditTitle(survey.title || '');
    setEditDescription(survey.description || '');
    setEditTargetAudience(survey.targetAudience || 'ALUMNI');

    const existingQuestions = getAllQuestions(survey);
    if (existingQuestions.length > 0) {
      setEditQuestions(existingQuestions.map((q: any, idx: number) => ({
        questionText: q.questionText || '',
        questionType: q.questionType || 'TEXT',
        required: q.required ?? false,
        options: Array.isArray(q.options) ? [...q.options] : [],
        order: idx,
      })));
    } else {
      setEditQuestions([
        { questionText: '', questionType: 'TEXT', required: false, options: [], order: 0 }
      ]);
    }
    setIsEditModalOpen(true);
  };

  const handleUpdateSurveyDetails = async () => {
    if (!selectedSurvey) return;
    if (!editTitle.trim()) return toast.error('Survey Title is required.');
    if (editQuestions.length === 0) return toast.error('At least one survey question is required.');

    for (let i = 0; i < editQuestions.length; i++) {
      if (!editQuestions[i].questionText.trim()) {
        return toast.error(`Question #${i + 1} text cannot be empty.`);
      }
    }

    setIsUpdating(true);
    try {
      await surveyService.updateSurvey(selectedSurvey.id, {
        title: editTitle,
        description: editDescription,
        targetAudience: editTargetAudience,
        questions: editQuestions.map((q, i) => ({
          questionText: q.questionText,
          questionType: q.questionType,
          required: q.required,
          options: q.options || [],
          order: i,
        })),
      });
      toast.success('Survey details & questions updated successfully!');
      setIsEditModalOpen(false);
      fetchSurveys();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update survey details.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Filter & Pagination logic for Responses Roster
  const filteredResponses = responsesData.filter((r: any) => {
    if (!responseSearchQuery) return true;
    const q = responseSearchQuery.toLowerCase();
    const name = (r.alumni?.fullName || r.alumniName || '').toLowerCase();
    const studentId = (r.alumni?.studentId || r.studentId || '').toLowerCase();
    const email = (r.alumni?.user?.email || r.email || '').toLowerCase();
    return name.includes(q) || studentId.includes(q) || email.includes(q);
  });

  const totalResponsePages = Math.ceil(filteredResponses.length / responsesPerPage) || 1;
  const currentResponses = filteredResponses.slice(
    (responsePage - 1) * responsesPerPage,
    responsePage * responsesPerPage
  );

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

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => { setSelectedSurvey(null); setActiveSubTab('manage'); }}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeSubTab === 'manage' ? 'bg-white text-astu-navy shadow-sm' : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              📋 Department Surveys
            </button>
            <button
              onClick={() => { setSelectedSurvey(null); setActiveSubTab('create'); }}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeSubTab === 'create' ? 'bg-white text-astu-navy shadow-sm' : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              ➕ Create New Survey
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area: Manage Surveys */}
      {activeSubTab === 'manage' && (
        <div className={`p-6 rounded-3xl border shadow-xs ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200/70 text-gray-900'}`}>
          
          {/* Controls & Filter Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-gray-150">
            <div>
              <h3 className="text-lg font-extrabold flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-astu-navy" />
                Active &amp; Historical Department Surveys
              </h3>
              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                Surveys managed by Department Head for ABET accreditation and curriculum modernization.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              
              {/* View Switcher: List vs Card (Requirement #3) */}
              <div className="flex items-center bg-gray-100 dark:bg-slate-800 p-1 rounded-xl border border-gray-200 dark:border-slate-700">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-slate-700 text-astu-navy dark:text-white shadow-xs'
                      : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  title="List View"
                >
                  <List className="w-3.5 h-3.5" /> List
                </button>
                <button
                  onClick={() => setViewMode('card')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'card'
                      ? 'bg-white dark:bg-slate-700 text-astu-navy dark:text-white shadow-xs'
                      : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  title="Card Grid View"
                >
                  <Grid className="w-3.5 h-3.5" /> Grid Cards
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative flex-1 md:w-56">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setSurveyPage(1); }}
                  placeholder="Search surveys..."
                  className={`w-full pl-9 pr-3 py-1.5 rounded-xl text-xs border outline-none ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); setSurveyPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border outline-none ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                }`}
              >
                <option value="ALL">All Department Surveys</option>
                <option value="ACTIVE">Active Surveys Only</option>
                <option value="DRAFT">Draft Surveys Only</option>
              </select>

              {/* Refresh Button */}
              <button
                onClick={fetchSurveys}
                className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                title="Refresh Surveys from Database"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Survey Render Area */}
          {loading ? (
            <div className="p-12 text-center text-xs text-gray-400 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-astu-navy" />
              <span>Loading department surveys directly from database...</span>
            </div>
          ) : filteredSurveys.length === 0 ? (
            <div className="p-10 text-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50">
              <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700">No matching department surveys found.</p>
              <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                Click "Create New Survey" to build a survey for your department graduates with automated multi-channel (In-App, Email, SMS) notifications.
              </p>
              <button
                onClick={() => setActiveSubTab('create')}
                className="mt-4 px-5 py-2.5 bg-astu-navy text-white text-xs font-extrabold rounded-xl hover:bg-astu-navy/90 cursor-pointer shadow-xs"
              >
                ➕ Create Department Survey
              </button>
            </div>
          ) : viewMode === 'list' ? (

            /* LIST VIEW (Table / List layout for surveys per Requirement #3) */
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-slate-700">
                <table className="w-full text-left text-xs">
                  <thead className={`border-b ${darkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-gray-100 text-slate-700 border-gray-200'}`}>
                    <tr>
                      <th className="p-3.5 font-extrabold">Survey Title &amp; Description</th>
                      <th className="p-3.5 font-extrabold">Audience</th>
                      <th className="p-3.5 font-extrabold text-center">Status</th>
                      <th className="p-3.5 font-extrabold text-center">Questions</th>
                      <th className="p-3.5 font-extrabold text-center">Sent Alerts</th>
                      <th className="p-3.5 font-extrabold text-center">Responses</th>
                      <th className="p-3.5 font-extrabold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150 dark:divide-slate-800">
                    {currentSurveys.map((survey) => {
                      const qCount = getQuestionCount(survey);
                      const respCount = survey._count?.responses ?? survey.responses?.length ?? 0;
                      const sentCount = survey._count?.assignments ?? survey.assignments?.length ?? 0;

                      return (
                        <tr key={survey.id} className="hover:bg-gray-50/70 dark:hover:bg-slate-800/60 transition-all">
                          <td className="p-3.5 max-w-xs">
                            <div className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1" title={survey.title}>
                              {survey.title}
                            </div>
                            <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                              {survey.description || 'Department tracer study survey'}
                            </div>
                          </td>

                          <td className="p-3.5">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-100 text-blue-800">
                              {survey.targetAudience || 'ALUMNI'}
                            </span>
                          </td>

                          <td className="p-3.5 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                              survey.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
                            }`}>
                              {survey.isActive ? 'ACTIVE' : 'DRAFT'}
                            </span>
                          </td>

                          <td className="p-3.5 text-center font-bold text-slate-800 dark:text-slate-200">
                            {qCount}
                          </td>

                          <td className="p-3.5 text-center font-bold text-slate-800 dark:text-slate-200">
                            {sentCount}
                          </td>

                          <td className="p-3.5 text-center">
                            <button
                              onClick={() => handleViewAnalysis(survey)}
                              className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-[11px] font-extrabold transition-all cursor-pointer inline-flex items-center gap-1"
                              title="View detailed responses"
                            >
                              <BarChart2 className="w-3 h-3" /> {respCount} Responses
                            </button>
                          </td>

                          <td className="p-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleDispatchInstantly(survey.id, survey.title)}
                                className="px-2.5 py-1.5 rounded-lg bg-astu-navy text-white text-[11px] font-extrabold hover:bg-blue-900 transition-all cursor-pointer inline-flex items-center gap-1"
                                title="Re-dispatch notification alerts"
                              >
                                <Send className="w-3 h-3" /> Send Alert
                              </button>

                              <button
                                onClick={() => openEditModal(survey)}
                                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 cursor-pointer"
                                title="Edit survey details and questions"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleCloneSurvey(survey.id)}
                                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 cursor-pointer"
                                title="Clone Survey"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleToggleActive(survey)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer border ${
                                  survey.isActive ? 'border-amber-300 text-amber-700 hover:bg-amber-50' : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                                }`}
                              >
                                {survey.isActive ? 'Deactivate' : 'Activate'}
                              </button>

                              <button
                                onClick={() => handleDeleteSurvey(survey)}
                                className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
                                title="Archive Custom Survey"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Survey List Pagination Controls */}
              {totalSurveyPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-gray-500 font-medium">
                    Showing {(surveyPage - 1) * surveysPerPage + 1} to {Math.min(surveyPage * surveysPerPage, filteredSurveys.length)} of {filteredSurveys.length} surveys
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={surveyPage === 1}
                      onClick={() => setSurveyPage(p => p - 1)}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl border border-gray-200 disabled:opacity-40 hover:bg-gray-50 flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Previous
                    </button>
                    <span className="text-xs font-bold text-gray-700 px-2">Page {surveyPage} of {totalSurveyPages}</span>
                    <button
                      disabled={surveyPage === totalSurveyPages}
                      onClick={() => setSurveyPage(p => p + 1)}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl border border-gray-200 disabled:opacity-40 hover:bg-gray-50 flex items-center gap-1 cursor-pointer"
                    >
                      Next <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

          ) : (

            /* CARD GRID VIEW */
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {currentSurveys.map((survey) => {
                  const qCount = getQuestionCount(survey);
                  const respCount = survey._count?.responses ?? survey.responses?.length ?? 0;
                  const sentCount = survey._count?.assignments ?? survey.assignments?.length ?? 0;

                  return (
                    <div
                      key={survey.id}
                      className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50/60 border-gray-200 hover:border-astu-navy/40 hover:shadow-md'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-800">
                            Department Custom
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${
                              survey.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
                            }`}>
                              {survey.isActive ? 'ACTIVE' : 'DRAFT'}
                            </span>
                          </div>
                        </div>

                        <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1" title={survey.title}>
                          {survey.title}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 h-8">
                          {survey.description || 'Department tracer study survey'}
                        </p>

                        {/* Metrics Pill */}
                        <div className="grid grid-cols-3 gap-1 my-3 p-2 bg-white dark:bg-slate-900 rounded-xl border border-gray-150 dark:border-slate-700 text-center">
                          <div>
                            <p className="text-[9px] font-extrabold text-gray-400 uppercase">Questions</p>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{qCount}</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-extrabold text-gray-400 uppercase">Sent</p>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{sentCount}</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-extrabold text-gray-400 uppercase">Responses</p>
                            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{respCount}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-gray-150 dark:border-slate-700">
                        <div className="flex items-center justify-between gap-2">
                          <button
                            onClick={() => handleDispatchInstantly(survey.id, survey.title)}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-astu-navy text-white text-[11px] font-extrabold hover:bg-blue-900 transition-all shadow-xs cursor-pointer"
                          >
                            <Send className="w-3 h-3" /> Re-Dispatch Alert
                          </button>
                          <button
                            onClick={() => handleViewAnalysis(survey)}
                            className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-[11px] font-extrabold transition-all cursor-pointer flex items-center gap-1"
                            title="View Live Responses & Analytics"
                          >
                            <BarChart2 className="w-3.5 h-3.5" /> Responses ({respCount})
                          </button>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditModal(survey)}
                              className="hover:text-astu-navy font-semibold flex items-center gap-0.5 cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" /> Edit
                            </button>
                            <span>•</span>
                            <button
                              onClick={() => handleCloneSurvey(survey.id)}
                              className="hover:text-astu-navy font-semibold flex items-center gap-0.5 cursor-pointer"
                            >
                              <Copy className="w-3 h-3" /> Clone
                            </button>
                            <span>•</span>
                            <button
                              onClick={() => handleToggleActive(survey)}
                              className="hover:text-astu-navy font-semibold cursor-pointer"
                            >
                              {survey.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>

                          <button
                            onClick={() => handleDeleteSurvey(survey)}
                            className="text-red-500 hover:text-red-700 font-bold cursor-pointer"
                            title="Archive Custom Survey"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Survey Card View Pagination Controls */}
              {totalSurveyPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-gray-500 font-medium">
                    Showing {(surveyPage - 1) * surveysPerPage + 1} to {Math.min(surveyPage * surveysPerPage, filteredSurveys.length)} of {filteredSurveys.length} surveys
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={surveyPage === 1}
                      onClick={() => setSurveyPage(p => p - 1)}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl border border-gray-200 disabled:opacity-40 hover:bg-gray-50 flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Previous
                    </button>
                    <span className="text-xs font-bold text-gray-700 px-2">Page {surveyPage} of {totalSurveyPages}</span>
                    <button
                      disabled={surveyPage === totalSurveyPages}
                      onClick={() => setSurveyPage(p => p + 1)}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl border border-gray-200 disabled:opacity-40 hover:bg-gray-50 flex items-center gap-1 cursor-pointer"
                    >
                      Next <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Analytics & Live Responses Tab */}
      {activeSubTab === 'analytics' && selectedSurvey && (
        <div className={`p-6 rounded-3xl border shadow-xs space-y-6 ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200/70 text-gray-900'}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-gray-150">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveSubTab('manage')}
                className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Surveys
              </button>
              <div>
                <h3 className="text-lg font-extrabold flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-astu-navy" />
                  Live Responses &amp; Analytics: {selectedSurvey.title}
                </h3>
                <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  Real-time survey response telemetry collected from department alumni directly from database.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleViewAnalysis(selectedSurvey)}
              className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingAnalysis ? 'animate-spin' : ''}`} /> Refresh Telemetry
            </button>
          </div>

          {loadingAnalysis ? (
            <div className="p-12 text-center text-xs text-gray-400 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-astu-navy" />
              <span>Fetching live response records from database...</span>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Analytics KPI Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-blue-50/50 border-blue-200'}`}>
                  <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Total Responses Received</p>
                  <p className="text-2xl font-extrabold text-astu-navy dark:text-blue-400 mt-1">
                    {analysisData?.totalResponses ?? responsesData.length}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Live database submissions</p>
                </div>

                <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-emerald-50/50 border-emerald-200'}`}>
                  <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Targeted Alumni Assignments</p>
                  <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                    {analysisData?.totalAssignments ?? selectedSurvey._count?.assignments ?? 0}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Multi-channel dispatched alerts</p>
                </div>

                <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-purple-50/50 border-purple-200'}`}>
                  <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Survey Response Rate</p>
                  <p className="text-2xl font-extrabold text-purple-700 dark:text-purple-400 mt-1">
                    {(() => {
                      const totalResp = analysisData?.totalResponses ?? responsesData.length;
                      const totalAssign = analysisData?.totalAssignments ?? selectedSurvey._count?.assignments ?? selectedSurvey.assignments?.length ?? 0;
                      if (analysisData?.responseRate !== undefined && analysisData?.responseRate !== null) {
                        return `${analysisData.responseRate}%`;
                      }
                      const rate = totalAssign > 0 ? Math.round((totalResp / totalAssign) * 100) : (totalResp > 0 ? 100 : 0);
                      return `${rate}%`;
                    })()}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Department alumni completion</p>
                </div>
              </div>

              {/* Submissions Roster Controls & Table (Requirement #1 & #3) */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <User className="w-4 h-4 text-astu-navy" /> Alumni Submissions Roster ({filteredResponses.length})
                  </h4>

                  {/* Search Bar for Responses List */}
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={responseSearchQuery}
                      onChange={e => { setResponseSearchQuery(e.target.value); setResponsePage(1); }}
                      placeholder="Search alumnus name, ID, or email..."
                      className={`w-full pl-9 pr-3 py-1.5 rounded-xl text-xs border outline-none ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                {filteredResponses.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50">
                    <p className="text-xs font-semibold text-gray-500">No alumni responses submitted for this survey yet.</p>
                    <p className="text-[11px] text-gray-400 mt-1">Click "Re-Dispatch Alert" to trigger In-App, Email, and SMS notifications to alumni.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-slate-700">
                      <table className="w-full text-left text-xs">
                        <thead className={`border-b ${darkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-gray-100 text-slate-700 border-gray-200'}`}>
                          <tr>
                            <th className="p-3.5 font-extrabold">Student ID</th>
                            <th className="p-3.5 font-extrabold">Alumni Name</th>
                            <th className="p-3.5 font-extrabold">Email</th>
                            <th className="p-3.5 font-extrabold">Submitted Date</th>
                            <th className="p-3.5 font-extrabold text-center">Answers Submitted</th>
                            <th className="p-3.5 font-extrabold text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-150 dark:divide-slate-800">
                          {currentResponses.map((resp: any) => {
                            const answerCount = resp.answers?.length || resp.questionResponses?.length || 0;
                            return (
                              <tr key={resp.id} className="hover:bg-gray-50/70 dark:hover:bg-slate-800/60 transition-all">
                                <td className="p-3.5 font-bold text-astu-navy dark:text-blue-400">
                                  {resp.alumni?.studentId || resp.studentId || 'N/A'}
                                </td>
                                <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                                  {resp.alumni?.fullName || resp.alumniName || 'Verified Alumnus'}
                                </td>
                                <td className="p-3.5 text-slate-500">
                                  {resp.alumni?.user?.email || resp.email || 'N/A'}
                                </td>
                                <td className="p-3.5 font-semibold text-slate-600">
                                  {resp.createdAt ? new Date(resp.createdAt).toLocaleString() : 'Recent'}
                                </td>
                                <td className="p-3.5 text-center">
                                  <button
                                    onClick={() => setViewingResponse(resp)}
                                    className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-extrabold rounded-full transition-all cursor-pointer inline-flex items-center gap-1"
                                    title="Click to view detailed answer submissions"
                                  >
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    {answerCount} Answers Recorded
                                  </button>
                                </td>
                                <td className="p-3.5 text-center">
                                  <button
                                    onClick={() => setViewingResponse(resp)}
                                    className="px-3 py-1.5 bg-astu-navy text-white text-[11px] font-extrabold rounded-xl hover:bg-blue-900 transition-all cursor-pointer inline-flex items-center gap-1 shadow-xs"
                                  >
                                    <Eye className="w-3.5 h-3.5" /> Inspect Answers
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Response Roster Pagination Controls */}
                    {totalResponsePages > 1 && (
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-gray-500 font-medium">
                          Showing {(responsePage - 1) * responsesPerPage + 1} to {Math.min(responsePage * responsesPerPage, filteredResponses.length)} of {filteredResponses.length} submissions
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            disabled={responsePage === 1}
                            onClick={() => setResponsePage(p => p - 1)}
                            className="px-3 py-1.5 text-xs font-bold rounded-xl border border-gray-200 disabled:opacity-40 hover:bg-gray-50 flex items-center gap-1 cursor-pointer"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" /> Previous
                          </button>
                          <span className="text-xs font-bold text-gray-700 px-2">Page {responsePage} of {totalResponsePages}</span>
                          <button
                            disabled={responsePage === totalResponsePages}
                            onClick={() => setResponsePage(p => p + 1)}
                            className="px-3 py-1.5 text-xs font-bold rounded-xl border border-gray-200 disabled:opacity-40 hover:bg-gray-50 flex items-center gap-1 cursor-pointer"
                          >
                            Next <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      )}

      {/* Create Survey Form */}
      {activeSubTab === 'create' && (
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
              className="px-4 py-2 text-xs font-bold border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1 md:col-span-2">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-gray-600">Survey Title *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. SWE Curriculum ABET Accreditation & Skill Match Survey 2026"
                className="w-full p-2.5 text-xs rounded-xl border border-gray-250 outline-none focus:border-astu-navy font-semibold"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-gray-600">Target Audience Scope</label>
              <select
                value={targetAudience}
                onChange={(e: any) => setTargetAudience(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-gray-250 font-bold outline-none"
              >
                <option value="ALUMNI">Department Alumni Only</option>
                <option value="EMPLOYERS">Department Corporate Employers</option>
                <option value="BOTH">Both Alumni &amp; Employers</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-gray-600">Description / Instructions</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Explain the purpose of this department survey to graduates..."
              className="w-full p-2.5 text-xs rounded-xl border border-gray-250 outline-none focus:border-astu-navy h-20"
            />
          </div>

          {/* Question List Builder */}
          <div className="space-y-4 pt-4 border-t border-gray-150">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-700">Survey Questions ({questions.length})</h4>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-extrabold rounded-xl hover:bg-blue-100 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Question
              </button>
            </div>

            <div className="space-y-4">
              {questions.map((q, qIdx) => (
                <div key={qIdx} className="p-4 rounded-2xl border border-gray-200 bg-gray-50/70 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-astu-navy">Question #{qIdx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(qIdx)}
                      className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
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
                      className="w-full p-2.5 text-xs rounded-xl border border-gray-250 bg-white font-semibold outline-none focus:border-astu-navy"
                    />

                    <select
                      value={q.questionType}
                      onChange={e => {
                        const updated = [...questions];
                        updated[qIdx].questionType = e.target.value;
                        setQuestions(updated);
                      }}
                      className="p-2.5 text-xs rounded-xl border border-gray-250 bg-white font-bold outline-none"
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
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Answer Options</label>
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
                            className="text-gray-400 hover:text-red-500 cursor-pointer"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleAddOption(qIdx)}
                        className="text-xs text-astu-navy font-bold hover:underline cursor-pointer"
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
              className="px-5 py-2.5 text-xs font-bold text-gray-600 rounded-xl hover:bg-gray-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSaveAndDispatch}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1D9E75] text-white text-xs font-extrabold rounded-xl hover:brightness-110 shadow-md disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmitting ? 'Publishing & Dispatching...' : 'Publish & Dispatch Department Survey'}
            </button>
          </div>
        </div>
      )}

      {/* Requirement #2: Professional Edit Survey Modal with Title, Description & Questions Builder */}
      {isEditModalOpen && selectedSurvey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className={`w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-gray-200 text-slate-900'}`}>
            <div className="flex justify-between items-center p-6 border-b border-gray-150 dark:border-slate-800">
              <div>
                <h3 className="text-base font-extrabold flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-astu-navy" /> Edit Department Survey &amp; Questions
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Update survey title, description, target scope, and customize all survey questions.
                </p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[11px] font-extrabold uppercase text-gray-500">Survey Title *</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-gray-250 font-semibold outline-none focus:border-astu-navy"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase text-gray-500">Target Audience Scope</label>
                  <select
                    value={editTargetAudience}
                    onChange={(e: any) => setEditTargetAudience(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-gray-250 font-bold outline-none"
                  >
                    <option value="ALUMNI">Department Alumni Only</option>
                    <option value="EMPLOYERS">Department Corporate Employers</option>
                    <option value="BOTH">Both Alumni &amp; Employers</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-extrabold uppercase text-gray-500">Description / Instructions</label>
                <textarea
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-gray-250 h-20 outline-none focus:border-astu-navy"
                />
              </div>

              {/* Questions Section in Edit Modal */}
              <div className="space-y-4 pt-4 border-t border-gray-150 dark:border-slate-800">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Survey Questions ({editQuestions.length})
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddEditQuestion}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-extrabold rounded-xl hover:bg-blue-100 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Question
                  </button>
                </div>

                <div className="space-y-4">
                  {editQuestions.map((q, qIdx) => (
                    <div key={qIdx} className="p-4 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50/70 dark:bg-slate-800/60 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-astu-navy dark:text-blue-400">
                          Question #{qIdx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveEditQuestion(qIdx)}
                          className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-3">
                        <input
                          type="text"
                          value={q.questionText}
                          onChange={e => {
                            const updated = [...editQuestions];
                            updated[qIdx].questionText = e.target.value;
                            setEditQuestions(updated);
                          }}
                          placeholder={`Enter Question #${qIdx + 1} text...`}
                          className="w-full p-2.5 text-xs rounded-xl border border-gray-250 dark:border-slate-600 bg-white dark:bg-slate-900 font-semibold outline-none focus:border-astu-navy"
                        />

                        <select
                          value={q.questionType}
                          onChange={e => {
                            const updated = [...editQuestions];
                            updated[qIdx].questionType = e.target.value;
                            setEditQuestions(updated);
                          }}
                          className="p-2.5 text-xs rounded-xl border border-gray-250 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold outline-none"
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
                          <label className="text-[10px] font-bold text-gray-500 uppercase">Answer Options</label>
                          {(q.options || []).map((opt: string, optIdx: number) => (
                            <div key={optIdx} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={opt}
                                onChange={e => {
                                  const updated = [...editQuestions];
                                  updated[qIdx].options[optIdx] = e.target.value;
                                  setEditQuestions(updated);
                                }}
                                className="p-2 text-xs rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 flex-1"
                                placeholder={`Option ${optIdx + 1}`}
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveEditOption(qIdx, optIdx)}
                                className="text-gray-400 hover:text-red-500 cursor-pointer"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => handleAddEditOption(qIdx)}
                            className="text-xs text-astu-navy dark:text-blue-400 font-bold hover:underline cursor-pointer"
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
                            const updated = [...editQuestions];
                            updated[qIdx].required = e.target.checked;
                            setEditQuestions(updated);
                          }}
                          className="rounded text-astu-navy"
                        />
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Required Question</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="flex justify-end gap-2 p-6 border-t border-gray-150 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/40 rounded-b-3xl">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-5 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={isUpdating}
                onClick={handleUpdateSurveyDetails}
                className="px-6 py-2.5 text-xs font-bold bg-astu-navy text-white rounded-xl hover:bg-blue-900 disabled:opacity-50 cursor-pointer shadow-md inline-flex items-center gap-2"
              >
                {isUpdating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                {isUpdating ? 'Updating Survey...' : 'Save Survey Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Requirement #1: Detailed Alumni Submission Response Inspector Modal */}
      {viewingResponse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-gray-200 text-slate-900'}`}>
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-150 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                    Alumnus Survey Submission
                  </span>
                  <span className="text-xs text-gray-400">
                    {viewingResponse.createdAt ? new Date(viewingResponse.createdAt).toLocaleString() : 'Recent'}
                  </span>
                </div>
                <h3 className="text-lg font-extrabold mt-1 text-slate-900 dark:text-white">
                  {viewingResponse.alumni?.fullName || viewingResponse.alumniName || 'Verified Alumnus'}
                </h3>
              </div>
              <button onClick={() => setViewingResponse(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content: Alumnus Meta Header & Answers List */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              
              {/* Alumnus Metadata Card */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-blue-50/60 dark:bg-slate-800/70 border border-blue-150 dark:border-slate-700 text-xs">
                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase">Student ID</p>
                  <p className="font-bold text-astu-navy dark:text-blue-400 mt-0.5">
                    {viewingResponse.alumni?.studentId || viewingResponse.studentId || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase">Email Address</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate" title={viewingResponse.alumni?.user?.email || viewingResponse.email}>
                    {viewingResponse.alumni?.user?.email || viewingResponse.email || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase">Total Answers</p>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {viewingResponse.answers?.length || 0} Recorded Answers
                  </p>
                </div>
              </div>

              {/* Submitted Answers List */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-astu-navy" /> Recorded Question Answers ({(viewingResponse.answers || []).length})
                  </h4>

                  {/* Modal In-Line Search Bar for Many Questions */}
                  {(viewingResponse.answers || []).length > 3 && (
                    <div className="relative w-full sm:w-56">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={inspectSearchQuery}
                        onChange={e => setInspectSearchQuery(e.target.value)}
                        placeholder="Filter questions or answers..."
                        className="w-full pl-8 pr-2.5 py-1 text-[11px] rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:border-astu-navy"
                      />
                    </div>
                  )}
                </div>

                {(!viewingResponse.answers || viewingResponse.answers.length === 0) ? (
                  <div className="p-6 text-center text-xs text-gray-500 rounded-2xl border border-dashed">
                    No answer details found in this response record.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                    {(viewingResponse.answers || []).filter((ans: any, idx: number) => {
                      if (!inspectSearchQuery) return true;
                      const q = inspectSearchQuery.toLowerCase();
                      const qText = (ans.question?.questionText || `Question #${idx + 1}`).toLowerCase();
                      const aText = (ans.answerText || '').toLowerCase();
                      return qText.includes(q) || aText.includes(q);
                    }).map((ans: any, idx: number) => {
                      const qText = ans.question?.questionText || `Question #${idx + 1}`;
                      const qType = ans.question?.questionType || 'ANSWER';

                      return (
                        <div key={ans.id || idx} className="p-4 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-800/50 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                              Q{idx + 1}. {qText}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 uppercase shrink-0">
                              {qType}
                            </span>
                          </div>

                          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/40 text-xs font-semibold text-slate-800 dark:text-slate-100 flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <div className="flex-1 whitespace-pre-wrap">
                              {ans.answerText || <span className="italic text-gray-400">No text provided</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-5 border-t border-gray-150 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/40 rounded-b-3xl">
              <button
                onClick={() => setViewingResponse(null)}
                className="px-6 py-2 bg-astu-navy text-white text-xs font-bold rounded-xl hover:bg-blue-900 cursor-pointer shadow-xs"
              >
                Close Response Inspector
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default DepartmentSurveyCenter;
