import React, { useState, useEffect } from 'react';
import {
  CalendarDays, ChevronDown, ChevronRight, ClipboardList,
  Eye, FilePlus2, GripVertical, MoreHorizontal, Plus,
  Send, Sparkles, Trash2, X, BarChart as BarChartIcon,
  Calendar, Edit2, Play, Search, Filter, RefreshCw, Mail,
  Users, CheckCircle, Clock, AlertTriangle, AlertCircle, TrendingUp
} from 'lucide-react';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminBadge from '../components/AdminBadge';
import AdminStatCard from '../components/AdminStatCard';
import { surveyService } from '../../surveys/services/survey.service';
import toast from 'react-hot-toast';
import { adminMockData } from '../api/mockData';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';


type SurveyType = 'SIX_MONTH' | 'TWELVE_MONTH' | 'EIGHTEEN_MONTH' | 'TWENTY_FOUR_MONTH' | 'CUSTOM';
type QuestionType = 'TEXT' | 'TEXTAREA' | 'SELECT' | 'RADIO' | 'CHECKBOX' | 'RATING' | 'NUMBER' | 'DATE';

interface Question {
  id?: string;
  questionText: string;
  questionType: QuestionType;
  required: boolean;
  options: string[];
  order: number;
}

interface Section {
  id?: string;
  title: string;
  description: string;
  order: number;
  questions: Question[];
}

export default function SurveyManagement() {
  const [activeTab, setActiveTab] = useState<'all' | 'create' | 'analytics' | 'waves' | 'details' | 'edit'>('all');
  const [surveys, setSurveys] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<any | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // Builder State
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<SurveyType>('SIX_MONTH');
  const [sections, setSections] = useState<Section[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Analytics & Waves State
  const [completionReport, setCompletionReport] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);

  useEffect(() => {
    fetchSurveys(); // Always fetch on mount for stats
  }, []);

  useEffect(() => {
    if (activeTab === 'all') fetchSurveys();
    if (activeTab === 'analytics') {
      fetchStats();
      fetchReport();
    }
    if (activeTab === 'waves') {
      fetchAssignments();
    }
  }, [activeTab]);

  const fetchSurveys = async () => {
    setLoading(true);
    try {
      const data = await surveyService.getSurveys();
      setSurveys(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await surveyService.getSurveyStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReport = async () => {
    setAnalyticsLoading(true);
    try {
      const data = await surveyService.getCompletionReport();
      setCompletionReport(data || []);
    } catch (err) {
      console.error(err);
      setCompletionReport([]);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchAssignments = async () => {
    setAssignmentsLoading(true);
    try {
      const data = await surveyService.getSurveyAssignments();
      setAssignments(data || []);
    } catch (err) {
      console.error(err);
      setAssignments([]);
    } finally {
      setAssignmentsLoading(false);
    }
  };



  const handleAddSection = () => {
    setSections([...sections, { title: 'New Section', description: '', order: sections.length, questions: [] }]);
  };

  const handleAddQuestion = (sectionIndex: number) => {
    const updated = [...sections];
    updated[sectionIndex].questions.push({
      questionText: '',
      questionType: 'TEXT',
      required: false,
      options: [],
      order: updated[sectionIndex].questions.length,
    });
    setSections(updated);
  };

  const startEditSurvey = (survey: any) => {
    setEditId(survey.id);
    setTitle(survey.title);
    setDescription(survey.description);
    setType(survey.type);
    
    // Map existing sections and questions to builder state
    const mappedSections = survey.sections?.map((s: any) => ({
      id: s.id,
      title: s.title,
      description: s.description || '',
      order: s.order,
      questions: s.questions?.map((q: any) => ({
        id: q.id,
        questionText: q.questionText,
        questionType: q.questionType,
        required: q.required,
        options: q.options || [],
        order: q.order
      })) || []
    })) || [];
    
    // If questions exist directly on survey but no sections (legacy), wrap them in a default section
    if (mappedSections.length === 0 && survey.questions && survey.questions.length > 0) {
      mappedSections.push({
        title: 'Main Section',
        description: '',
        order: 0,
        questions: survey.questions.map((q: any) => ({
          id: q.id,
          questionText: q.questionText,
          questionType: q.questionType,
          required: q.required,
          options: q.options || [],
          order: q.order
        }))
      });
    }
    
    setSections(mappedSections);
    setActiveTab('edit');
  };

  const resetBuilder = () => {
    setEditId(null);
    setTitle('');
    setDescription('');
    setType('SIX_MONTH');
    setSections([]);
  };

  const handleSaveSurvey = async () => {
    if (!title) return toast.error('Title is required');
    if (sections.length === 0) return toast.error('At least one section is required');
    
    setIsSubmitting(true);
    try {
      const payload = {
        title,
        description,
        type,
        milestoneMonths: type === 'SIX_MONTH' ? 6 : type === 'TWELVE_MONTH' ? 12 : type === 'EIGHTEEN_MONTH' ? 18 : type === 'TWENTY_FOUR_MONTH' ? 24 : undefined,
        sections: sections.map(s => ({
          title: s.title,
          description: s.description,
          order: s.order,
          questions: s.questions.map((q, i) => ({
            questionText: q.questionText,
            questionType: q.questionType,
            required: q.required,
            options: q.options,
            order: i
          }))
        }))
      };

      if (editId) {
        await surveyService.updateSurvey(editId, payload);
        toast.success('Survey updated successfully!');
        const updatedSurvey = await surveyService.getSurvey(editId);
        setSelectedSurvey(updatedSurvey);
        setActiveTab('details');
      } else {
        const newSurvey = await surveyService.createSurvey(payload);
        toast.success('Survey created successfully!');
        setSelectedSurvey(newSurvey);
        setActiveTab('details');
      }
      resetBuilder();
    } catch (err: any) {
      console.error(err);
      toast.error(`Failed to save survey: ${err.message || 'Check console for details.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const viewDetails = (survey: any) => {
    setSelectedSurvey(survey);
    setActiveTab('details');
  };

  // Compute aggregate stats from loaded surveys
  const totalSurveys = surveys.length;
  const pendingSurveys = surveys.filter(s => s.isActive && !s.isArchived).length;
  const completedSurveys = surveys.filter(s => s.isArchived).length;
  const totalResponses = surveys.reduce((acc, s) => acc + (s._count?.responses || 0), 0);
  const totalSent = surveys.reduce((acc, s) => acc + (s._count?.assignments || 0), 0);
  const totalQuestions = surveys.reduce((acc, s) => {
    const sectionQs = s.sections?.reduce((a: number, sec: any) => a + (sec.questions?.length || 0), 0) || 0;
    const directQs = s.questions?.length || 0;
    return acc + sectionQs + directQs;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-[14px]" style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #0d3b4f 40%, #14705a 80%, #1a8a60 100%)',
      }}>
        {/* Decorative circles */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
        <div className="absolute -right-8 top-8 h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute right-24 -bottom-12 h-48 w-48 rounded-full bg-white/5" />

        <div className="relative px-8 py-8">
          <span className="mb-3 inline-block rounded-sm text-[11px] font-bold uppercase tracking-[0.25em] text-emerald-400">
            Tracer Studies
          </span>
          <h1 className="mb-2 text-3xl font-bold text-white">Tracer Surveys</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-300/90">
            Design, launch, and monitor graduate tracer surveys for ABET accreditation. Track 6/12/24-month
            response rates and export accreditation-ready data.
          </p>
        </div>
      </div>

      {/* Survey Management Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#dc2626] text-sm font-bold text-white shadow-md">
            SM
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Survey Management</h2>
            <p className="text-sm text-slate-500">Create, schedule, and monitor graduate tracer surveys for ABET accreditation</p>
          </div>
        </div>
        <button
          onClick={() => { resetBuilder(); setActiveTab('create'); }}
          className="inline-flex items-center gap-2 rounded-[8px] bg-[#dc2626] px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#b91c1c] transition-colors"
        >
          <Plus className="h-4 w-4" /> Create Survey
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="rounded-[12px] border border-slate-100 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="text-3xl font-bold text-slate-900">{totalSurveys}</div>
          <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Total Surveys</div>
        </div>
        <div className="rounded-[12px] border border-slate-100 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="text-3xl font-bold text-slate-900">{pendingSurveys}</div>
          <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Pending</div>
          <div className="mt-1 text-xs font-semibold text-[#dc2626]">Awaiting launch</div>
        </div>
        <div className="rounded-[12px] border border-slate-100 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="text-3xl font-bold text-slate-900">{completedSurveys}</div>
          <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Completed</div>
          <div className="mt-1 text-xs font-semibold text-[#3b82f6]">All responses in</div>
        </div>
        <div className="rounded-[12px] border border-slate-100 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="text-3xl font-bold text-slate-900">{totalResponses}</div>
          <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Responses</div>
          <div className="mt-1 text-xs font-semibold text-[#10b981]">{totalSent} sent total</div>
        </div>
        <div className="rounded-[12px] border border-slate-100 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="text-3xl font-bold text-slate-900">{totalQuestions}</div>
          <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Questions</div>
          <div className="mt-1 text-xs font-semibold text-[#8b5cf6]">Across all surveys</div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex flex-wrap gap-2 rounded-[10px] border border-slate-200 bg-white p-2 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        {['all', 'create', 'analytics', 'waves'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`rounded-[8px] px-4 py-2 text-sm font-semibold transition-colors ${activeTab === tab || (activeTab === 'edit' && tab === 'create') || (activeTab === 'details' && tab === 'all') ? 'bg-[#003580] text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} Surveys
          </button>
        ))}
      </div>

      {activeTab === 'all' && (
        <section className="rounded-[10px] border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading surveys...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="border-b border-slate-200 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Survey Title</th>
                    <th className="border-b border-slate-200 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Type</th>
                    <th className="border-b border-slate-200 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Milestone</th>
                    <th className="border-b border-slate-200 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Status</th>
                    <th className="border-b border-slate-200 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Questions</th>
                  </tr>
                </thead>
                <tbody>
                  {surveys.map(s => (
                    <tr key={s.id} onClick={() => viewDetails(s)} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer">
                      <td className="px-4 py-4 font-semibold text-slate-900">{s.title}</td>
                      <td className="px-4 py-4 text-slate-600">{s.type}</td>
                      <td className="px-4 py-4 text-slate-600">{s.milestoneMonths ? `${s.milestoneMonths} Months` : 'Custom'}</td>
                      <td className="px-4 py-4">
                        <AdminBadge variant={s.isActive ? 'success' : 'neutral'}>{s.isActive ? 'Active' : 'Inactive'}</AdminBadge>
                      </td>
                      <td className="px-4 py-4 text-slate-600">{s.sections?.reduce((acc: number, sec: any) => acc + (sec.questions?.length || 0), 0) + (s.questions?.length || 0)}</td>
                    </tr>
                  ))}
                  {surveys.length === 0 && (
                    <tr><td colSpan={5} className="p-8 text-center text-slate-500">No survey templates found. Create one!</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {analyticsLoading ? (
            <div className="rounded-[10px] border border-slate-200 bg-white p-8 text-center text-slate-500">
              <RefreshCw className="mx-auto mb-2 h-6 w-6 animate-spin text-[#003580]" />
              Loading analytics and reports...
            </div>
          ) : (
            <>
              {/* Analytics Summary Cards */}
              {(() => {
                const totalAssigned = completionReport.reduce((acc, r) => acc + r.totalAssigned, 0);
                const totalCompleted = completionReport.reduce((acc, r) => acc + r.completed, 0);
                const avgRate = totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0;
                const totalOverdue = completionReport.reduce((acc, r) => acc + (r.overdue || 0), 0);
                const totalExpired = completionReport.reduce((acc, r) => acc + (r.expired || 0), 0);

                return (
                  <div className="grid grid-cols-4 gap-4">
                    <div className="rounded-[12px] border border-slate-100 bg-white p-5 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-2xl font-bold text-slate-900">{totalAssigned}</div>
                          <div className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-400">Total Assigned</div>
                        </div>
                        <div className="rounded-full bg-blue-50 p-2 text-blue-600">
                          <Users className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                    <div className="rounded-[12px] border border-slate-100 bg-white p-5 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-2xl font-bold text-slate-900">{totalCompleted}</div>
                          <div className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-400">Completed Responses</div>
                        </div>
                        <div className="rounded-full bg-emerald-50 p-2 text-emerald-600">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                    <div className="rounded-[12px] border border-slate-100 bg-white p-5 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-2xl font-bold text-slate-900">{avgRate}%</div>
                          <div className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-400">Avg Response Rate</div>
                        </div>
                        <div className="rounded-full bg-purple-50 p-2 text-purple-600">
                          <TrendingUp className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                    <div className="rounded-[12px] border border-slate-100 bg-white p-5 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-2xl font-bold text-slate-900">{totalOverdue}</div>
                          <div className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-400">Overdue / Expired</div>
                        </div>
                        <div className="rounded-full bg-red-50 p-2 text-red-600">
                          <Clock className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Recharts section */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Donut chart - status breakdown */}
                <div className="rounded-[10px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Response Status Breakdown</h3>
                  <div className="h-64 flex items-center justify-center">
                    {(() => {
                      const pending = completionReport.reduce((acc, r) => acc + (r.totalAssigned - r.completed - (r.overdue || 0) - (r.expired || 0)), 0);
                      const completed = completionReport.reduce((acc, r) => acc + r.completed, 0);
                      const overdue = completionReport.reduce((acc, r) => acc + (r.overdue || 0), 0);
                      const expired = completionReport.reduce((acc, r) => acc + (r.expired || 0), 0);
                      
                      const data = [
                        { name: 'Completed', value: completed, color: '#10b981' },
                        { name: 'Pending / In Progress', value: pending > 0 ? pending : 0, color: '#3b82f6' },
                        { name: 'Overdue', value: overdue, color: '#f59e0b' },
                        { name: 'Expired', value: expired, color: '#ef4444' },
                      ].filter(d => d.value > 0);

                      if (data.length === 0) {
                        return <div className="text-slate-400 text-sm">No response data available.</div>;
                      }

                      return (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={data}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <RechartsTooltip />
                            <Legend verticalAlign="bottom" height={36} />
                          </PieChart>
                        </ResponsiveContainer>
                      );
                    })()}
                  </div>
                </div>

                {/* Bar chart - milestone completion */}
                <div className="rounded-[10px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Milestone Response Rates (%)</h3>
                  <div className="h-64">
                    {(() => {
                      const data = completionReport.map(r => ({
                        name: r.surveyTitle.length > 20 ? r.surveyTitle.slice(0, 17) + '...' : r.surveyTitle,
                        rate: r.completionRate,
                      }));

                      return (
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsBarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748B' }} />
                            <RechartsTooltip formatter={(value) => [`${value}%`, 'Response Rate']} />
                            <Bar dataKey="rate" fill="#003580" radius={[4, 4, 0, 0]}>
                              {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#003580' : '#1D9E75'} />
                              ))}
                            </Bar>
                          </RechartsBarChart>
                        </ResponsiveContainer>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Template report table */}
              <section className="rounded-[10px] border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
                <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Survey Template Performance</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-separate border-spacing-0 text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="border-b border-slate-200 px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Survey Title</th>
                        <th className="border-b border-slate-200 px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Milestone</th>
                        <th className="border-b border-slate-200 px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Assigned</th>
                        <th className="border-b border-slate-200 px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Completed</th>
                        <th className="border-b border-slate-200 px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Response Rate</th>
                        <th className="border-b border-slate-200 px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Overdue</th>
                        <th className="border-b border-slate-200 px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Expired</th>
                      </tr>
                    </thead>
                    <tbody>
                      {completionReport.map((r, idx) => (
                        <tr key={r.surveyId || idx} className="border-b border-slate-100 hover:bg-slate-50/50">
                          <td className="px-6 py-4 font-semibold text-slate-900">{r.surveyTitle}</td>
                          <td className="px-6 py-4 text-slate-600">
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                              {r.milestoneMonths ? `${r.milestoneMonths}-Month` : 'Custom'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-900 font-medium">{r.totalAssigned}</td>
                          <td className="px-6 py-4 text-slate-600">{r.completed}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-slate-700 w-8">{r.completionRate}%</span>
                              <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100 shrink-0">
                                <div
                                  className="h-full rounded-full bg-emerald-500"
                                  style={{ width: `${r.completionRate}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-amber-600 font-medium">{r.overdue || 0}</td>
                          <td className="px-6 py-4 text-red-500 font-medium">{r.expired || 0}</td>
                        </tr>
                      ))}
                      {completionReport.length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-500">No report data found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </div>
      )}

      {activeTab === 'waves' && (
        <div className="space-y-6">
          {assignmentsLoading ? (
            <div className="rounded-[10px] border border-slate-200 bg-white p-8 text-center text-slate-500">
              <RefreshCw className="mx-auto mb-2 h-6 w-6 animate-spin text-[#003580]" />
              Loading waves and assignments...
            </div>
          ) : (
            <>
              {/* Dynamic Waves Summary */}
              <section className="rounded-[10px] border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Active Deployment Waves</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Surveys currently active or scheduled in waves by graduation milestones</p>
                </div>
                <div className="p-6">
                  {(() => {
                    // Group assignments by surveyId
                    const grouped = assignments.reduce((acc: Record<string, any>, item) => {
                      const sId = item.surveyId || 'unknown';
                      if (!acc[sId]) {
                        acc[sId] = {
                          surveyId: sId,
                          title: item.survey?.title || 'Unknown Survey',
                          type: item.survey?.type || 'CUSTOM',
                          launchDate: item.assignedAt,
                          recipients: 0,
                          completed: 0,
                        };
                      }
                      acc[sId].recipients += 1;
                      if (item.status === 'COMPLETED') {
                        acc[sId].completed += 1;
                      }
                      // Keep earliest launch date
                      if (new Date(item.assignedAt) < new Date(acc[sId].launchDate)) {
                        acc[sId].launchDate = item.assignedAt;
                      }
                      return acc;
                    }, {});

                    const wavesList = Object.values(grouped);

                    if (wavesList.length === 0) {
                      return <div className="text-center text-slate-400 text-sm">No waves deployed yet.</div>;
                    }

                    return (
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {wavesList.map((wave: any, idx) => {
                          const rate = wave.recipients > 0 ? Math.round((wave.completed / wave.recipients) * 100) : 0;
                          const launchDateStr = new Date(wave.launchDate).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          });

                          return (
                            <div key={wave.surveyId || idx} className="rounded-[12px] border border-slate-100 bg-slate-50/50 p-5 hover:border-[#003580]/20 transition-all">
                              <div className="flex justify-between items-start mb-3">
                                <span className="rounded-full bg-[#eff6ff] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600">
                                  {wave.type.replace('_', '-')}
                                </span>
                                <span className="text-xs text-slate-400 font-semibold">{launchDateStr}</span>
                              </div>
                              <h4 className="font-bold text-slate-900 text-sm mb-1 line-clamp-1">{wave.title}</h4>
                              <p className="text-xs text-slate-500 mb-4">{wave.recipients} Deployed Recipients</p>
                              
                              <div>
                                <div className="flex justify-between items-center text-xs mb-1.5">
                                  <span className="font-semibold text-slate-600">Completed Rate</span>
                                  <span className="font-bold text-[#003580]">{rate}%</span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                                  <div
                                    className="h-full rounded-full bg-[#003580]"
                                    style={{ width: `${rate}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </section>

              {/* Filterable assignments table */}
              <section className="rounded-[10px] border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
                <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-4 md:flex-row md:items-center md:justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Individual Survey Assignments</h3>
                  
                  {/* Search and Filters */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Search Input */}
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search Alumni, ID or Survey..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-[8px] border border-slate-200 pl-9 pr-4 py-2 text-sm outline-none focus:border-[#003580]"
                      />
                    </div>

                    {/* Status filter dropdown */}
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-slate-400" />
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="rounded-[8px] border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]"
                      >
                        <option value="ALL">All Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="OVERDUE">Overdue</option>
                        <option value="EXPIRED">Expired</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full border-separate border-spacing-0 text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="border-b border-slate-200 px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Alumni Details</th>
                        <th className="border-b border-slate-200 px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Survey Deployed</th>
                        <th className="border-b border-slate-200 px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Status</th>
                        <th className="border-b border-slate-200 px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Assigned</th>
                        <th className="border-b border-slate-200 px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Due Date</th>
                        <th className="border-b border-slate-200 px-6 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const filtered = assignments.filter((item) => {
                          const name = item.alumni?.fullName || '';
                          const email = item.alumni?.email || '';
                          const studentId = item.alumni?.studentId || '';
                          const surveyTitle = item.survey?.title || '';
                          const matchesSearch = 
                            name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            surveyTitle.toLowerCase().includes(searchQuery.toLowerCase());

                          const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;

                          return matchesSearch && matchesStatus;
                        });

                        if (filtered.length === 0) {
                          return (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-slate-500">
                                No survey assignments match your filters.
                              </td>
                            </tr>
                          );
                        }

                        return filtered.map((item, idx) => {
                          const assignedDate = new Date(item.assignedAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          });
                          const dueDate = new Date(item.dueDate).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          });

                          return (
                            <tr key={item.id || idx} className="border-b border-slate-100 hover:bg-slate-50/50">
                              <td className="px-6 py-4">
                                <div className="font-semibold text-slate-900">{item.alumni?.fullName}</div>
                                <div className="text-xs text-slate-500">{item.alumni?.email}</div>
                                <div className="text-[10px] text-slate-400 font-mono mt-0.5">{item.alumni?.studentId}</div>
                              </td>
                              <td className="px-6 py-4 text-slate-700">
                                <div className="font-semibold">{item.survey?.title}</div>
                                <div className="text-xs text-slate-500">{item.alumni?.department?.name || 'Graduate'}</div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold
                                  ${item.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' : ''}
                                  ${item.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700' : ''}
                                  ${item.status === 'PENDING' ? 'bg-amber-50 text-amber-700' : ''}
                                  ${item.status === 'OVERDUE' ? 'bg-rose-50 text-rose-700 animate-pulse' : ''}
                                  ${item.status === 'EXPIRED' ? 'bg-slate-100 text-slate-600' : ''}
                                `}>
                                  {item.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-slate-600">{assignedDate}</td>
                              <td className="px-6 py-4 text-slate-600">{dueDate}</td>
                              <td className="px-6 py-4 text-center">
                                {item.status !== 'COMPLETED' ? (
                                  <button
                                    onClick={() => {
                                      toast.success(`Reminder email queued for ${item.alumni?.fullName}!`);
                                    }}
                                    className="inline-flex items-center gap-1.5 rounded-[6px] border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
                                  >
                                    <Mail className="h-3 w-3 text-slate-500" /> Remind
                                  </button>
                                ) : (
                                  <span className="text-xs font-semibold text-emerald-600 flex items-center justify-center gap-1">
                                    <CheckCircle className="h-3.5 w-3.5" /> Received
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </div>
      )}

      {activeTab === 'details' && selectedSurvey && (
        <div className="rounded-[10px] border border-slate-200 bg-white shadow-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="text-xl font-bold text-slate-900">Survey Details</h2>
            <button onClick={() => setActiveTab('all')} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="p-6">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="rounded-full bg-[#f3f0ff] px-3 py-1 text-sm font-semibold text-[#6366f1]">
                  {selectedSurvey.type.replace('_', '-')}
                </span>
                <span className="flex items-center gap-1 rounded-full bg-[#eff6ff] px-3 py-1 text-sm font-semibold text-[#3b82f6]">
                  <div className="h-2 w-2 rounded-full bg-[#3b82f6]" /> In Progress
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
                  Created: {new Date(selectedSurvey.createdAt).toISOString().split('T')[0]}
                </span>
              </div>
              
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 mb-2">{selectedSurvey.title}</h1>
                  <p className="text-slate-600 max-w-3xl">{selectedSurvey.description}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => startEditSurvey(selectedSurvey)} className="flex items-center gap-2 rounded-[8px] border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50">
                    <Edit2 className="h-4 w-4" /> Edit Survey
                  </button>
                  <button onClick={() => setIsScheduleModalOpen(true)} className="flex items-center gap-2 rounded-[8px] bg-[#003580] px-4 py-2 font-semibold text-white hover:bg-[#002660]">
                    <Calendar className="h-4 w-4" /> Schedule Launch
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            {(() => {
              const totalQuestions = (selectedSurvey.sections?.reduce((acc: number, sec: any) => acc + (sec.questions?.length || 0), 0) || 0) + (selectedSurvey.questions?.length || 0);
              const sent = selectedSurvey._count?.assignments || 0;
              const responses = selectedSurvey._count?.responses || 0;
              const rate = sent > 0 ? Math.round((responses / sent) * 100) : 0;
              return (
                <>
                  <div className="grid grid-cols-4 gap-4 mb-8">
                    <div className="rounded-[10px] bg-slate-50 p-4 text-center">
                      <div className="text-3xl font-bold text-[#3b82f6]">{responses}</div>
                      <div className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">Responses</div>
                    </div>
                    <div className="rounded-[10px] bg-slate-50 p-4 text-center">
                      <div className="text-3xl font-bold text-[#6366f1]">{sent}</div>
                      <div className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">Sent</div>
                    </div>
                    <div className="rounded-[10px] bg-slate-50 p-4 text-center">
                      <div className="text-3xl font-bold text-[#8b5cf6]">{totalQuestions}</div>
                      <div className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">Questions</div>
                    </div>
                    <div className="rounded-[10px] bg-slate-50 p-4 text-center">
                      <div className="text-3xl font-bold text-[#10b981]">{rate}%</div>
                      <div className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">Response Rate</div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Response Progress</span>
                      <span className="text-sm font-bold text-slate-700">{rate}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-[#ef4444] transition-all" style={{ width: `${rate}%` }} />
                    </div>
                  </div>
                </>
              );
            })()}

            {/* Questions List */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
                Questions ({selectedSurvey.sections?.reduce((acc: number, sec: any) => acc + (sec.questions?.length || 0), 0) + (selectedSurvey.questions?.length || 0)})
              </h3>
              <div className="space-y-3">
                {selectedSurvey.sections?.map((section: any, sIdx: number) => (
                  <React.Fragment key={section.id || sIdx}>
                    {/* Section divider */}
                    <div className="flex items-center gap-3 pt-2">
                      <div className="h-px flex-1 bg-slate-200" />
                      <span className="text-xs font-bold uppercase tracking-wider text-[#003580]">{section.title}</span>
                      <div className="h-px flex-1 bg-slate-200" />
                    </div>
                    {section.questions?.map((q: any, qIdx: number) => {
                      const totalIdx = selectedSurvey.sections.slice(0, sIdx).reduce((acc: number, s: any) => acc + (s.questions?.length || 0), 0) + qIdx + 1;
                      return (
                        <div key={q.id || qIdx} className="flex items-center gap-4 rounded-[10px] border border-slate-100 bg-slate-50/50 p-4 hover:bg-slate-50">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[#fce7f3] text-sm font-bold text-[#db2777]">
                            {totalIdx}
                          </div>
                          <div className="flex-1">
                            <span className="font-medium text-slate-700">{q.questionText}</span>
                          </div>
                          {q.required && (
                            <span className="rounded bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600">REQ</span>
                          )}
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold
                            ${q.questionType === 'RADIO' || q.questionType === 'SELECT' ? 'bg-[#fdf2f8] text-[#db2777]' : ''}
                            ${q.questionType === 'TEXT' || q.questionType === 'TEXTAREA' ? 'bg-[#eff6ff] text-[#3b82f6]' : ''}
                            ${q.questionType === 'RATING' ? 'bg-[#fef9c3] text-[#ca8a04]' : ''}
                            ${q.questionType === 'CHECKBOX' ? 'bg-[#ecfdf5] text-[#059669]' : ''}
                            ${!['RADIO', 'SELECT', 'TEXT', 'TEXTAREA', 'RATING', 'CHECKBOX'].includes(q.questionType) ? 'bg-slate-100 text-slate-600' : ''}
                          `}>
                            {q.questionType.replace('_', ' ')}
                          </span>
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
                
                {/* Fallback for direct questions without sections (legacy support) */}
                {(!selectedSurvey.sections || selectedSurvey.sections.length === 0) && selectedSurvey.questions?.map((q: any, qIdx: number) => (
                  <div key={q.id || qIdx} className="flex items-center gap-4 rounded-[10px] border border-slate-100 bg-slate-50/50 p-4 hover:bg-slate-50">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[#fce7f3] text-sm font-bold text-[#db2777]">
                      {qIdx + 1}
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-slate-700">{q.questionText}</span>
                    </div>
                    {q.required && (
                      <span className="rounded bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600">REQ</span>
                    )}
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {q.questionType.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {(activeTab === 'create' || activeTab === 'edit') && (
        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <section className="rounded-[10px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] h-max">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Survey Details</h3>
            <div className="space-y-4">
              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Survey Title</span>
                <input value={title} onChange={e => setTitle(e.target.value)} className="w-full rounded-[8px] border border-slate-200 px-3 py-2 outline-none focus:border-[#003580]" placeholder="e.g. ASTU 2024 Tracer Study" />
              </label>
              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Description</span>
                <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full rounded-[8px] border border-slate-200 px-3 py-2 outline-none focus:border-[#003580]" rows={3} placeholder="Survey description..." />
              </label>
              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Survey Type (Trigger)</span>
                <select value={type} onChange={e => setType(e.target.value as SurveyType)} className="w-full rounded-[8px] border border-slate-200 px-3 py-2 outline-none focus:border-[#003580]">
                  <option value="SIX_MONTH">6-Month Post Graduation</option>
                  <option value="TWELVE_MONTH">12-Month Post Graduation</option>
                  <option value="EIGHTEEN_MONTH">18-Month Post Graduation</option>
                  <option value="TWENTY_FOUR_MONTH">24-Month Post Graduation</option>
                  <option value="CUSTOM">Custom / Manual Assignment</option>
                </select>
              </label>
            </div>
          </section>

          <section className="rounded-[10px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Survey Builder</h3>
              <button onClick={handleAddSection} className="inline-flex items-center gap-2 rounded-[8px] bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
                <Plus className="h-4 w-4" /> Add Section
              </button>
            </div>

            <div className="space-y-6">
              {sections.map((section, sIdx) => (
                <div key={sIdx} className="rounded-[10px] border border-[#003580]/20 bg-[#003580]/5 p-4">
                  <div className="mb-4 space-y-3 border-b border-[#003580]/10 pb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#003580]/60">Section {sIdx + 1}</span>
                      <button onClick={() => { const up = [...sections]; up.splice(sIdx, 1); setSections(up); }} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-red-500 hover:bg-red-50">
                        <Trash2 className="h-3 w-3" /> Remove Section
                      </button>
                    </div>
                    <input value={section.title} onChange={e => { const up = [...sections]; up[sIdx].title = e.target.value; setSections(up); }} className="w-full bg-transparent text-lg font-bold outline-none placeholder:text-slate-400" placeholder="Section Title (e.g. Personal Information)" />
                    <input value={section.description} onChange={e => { const up = [...sections]; up[sIdx].description = e.target.value; setSections(up); }} className="w-full bg-transparent text-sm text-slate-600 outline-none placeholder:text-slate-400" placeholder="Section Description (Optional)" />
                  </div>

                  <div className="space-y-4">
                    {section.questions.map((q, qIdx) => (
                      <div key={qIdx} className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="grid gap-4 md:grid-cols-[1fr_200px]">
                          <input value={q.questionText} onChange={e => { const up = [...sections]; up[sIdx].questions[qIdx].questionText = e.target.value; setSections(up); }} className="w-full font-medium outline-none placeholder:text-slate-400" placeholder={`Question ${qIdx + 1} Text`} />
                          <select value={q.questionType} onChange={e => { const up = [...sections]; up[sIdx].questions[qIdx].questionType = e.target.value as QuestionType; setSections(up); }} className="rounded-[8px] border border-slate-200 px-3 py-2 text-sm outline-none">
                            <option value="TEXT">Short Text</option>
                            <option value="TEXTAREA">Paragraph</option>
                            <option value="RADIO">Multiple Choice (Radio)</option>
                            <option value="CHECKBOX">Checkboxes</option>
                            <option value="SELECT">Dropdown</option>
                            <option value="RATING">Rating Scale (1-5)</option>
                            <option value="NUMBER">Number</option>
                            <option value="DATE">Date</option>
                          </select>
                        </div>

                        {['RADIO', 'CHECKBOX', 'SELECT'].includes(q.questionType) && (
                          <div className="mt-4 space-y-2 pl-4">
                            {q.options.map((opt, optIdx) => (
                              <div key={optIdx} className="flex items-center gap-2">
                                <div className={`h-4 w-4 border border-slate-300 ${q.questionType === 'RADIO' ? 'rounded-full' : 'rounded-sm'}`} />
                                <input value={opt} onChange={e => { const up = [...sections]; up[sIdx].questions[qIdx].options[optIdx] = e.target.value; setSections(up); }} className="flex-1 border-b border-transparent text-sm outline-none focus:border-slate-300" placeholder={`Option ${optIdx + 1}`} />
                                <button onClick={() => { const up = [...sections]; up[sIdx].questions[qIdx].options.splice(optIdx, 1); setSections(up); }} className="text-slate-400 hover:text-red-500"><X className="h-4 w-4" /></button>
                              </div>
                            ))}
                            <button onClick={() => { const up = [...sections]; up[sIdx].questions[qIdx].options.push(`Option ${q.options.length + 1}`); setSections(up); }} className="text-sm font-semibold text-[#003580] hover:underline">Add Option</button>
                          </div>
                        )}

                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={q.required} onChange={e => { const up = [...sections]; up[sIdx].questions[qIdx].required = e.target.checked; setSections(up); }} className="rounded border-slate-300" />
                            <span className="font-medium text-slate-600">Required</span>
                          </label>
                          <button onClick={() => { const up = [...sections]; up[sIdx].questions.splice(qIdx, 1); setSections(up); }} className="text-red-500 hover:underline">Remove Question</button>
                        </div>
                      </div>
                    ))}
                    <button onClick={() => handleAddQuestion(sIdx)} className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] border border-dashed border-slate-300 py-3 text-sm font-semibold text-slate-500 hover:border-[#003580] hover:text-[#003580]">
                      <Plus className="h-4 w-4" /> Add Question
                    </button>
                  </div>
                </div>
              ))}
              
              {sections.length === 0 && (
                <div className="flex h-32 flex-col items-center justify-center rounded-[10px] border border-dashed border-slate-300 bg-slate-50">
                  <span className="text-sm font-medium text-slate-500">Start by adding a section</span>
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-end border-t border-slate-200 pt-4 gap-3">
              {activeTab === 'edit' && (
                <button type="button" onClick={() => { setActiveTab('details'); resetBuilder(); }} className="rounded-[8px] border border-slate-200 px-6 py-2.5 font-semibold text-slate-600 hover:bg-slate-50">
                  Cancel
                </button>
              )}
              <button disabled={isSubmitting} onClick={handleSaveSurvey} className="inline-flex items-center gap-2 rounded-[8px] bg-[#1D9E75] px-6 py-2.5 font-semibold text-white hover:brightness-110 disabled:opacity-50">
                <Send className="h-4 w-4" /> {isSubmitting ? 'Saving...' : (activeTab === 'edit' ? 'Update Survey' : 'Save & Publish Survey')}
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Schedule Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[16px] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Schedule Survey</h3>
                <p className="text-sm text-slate-500">Set a launch date for automatic activation</p>
              </div>
              <button onClick={() => setIsScheduleModalOpen(false)} className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200">
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6 rounded-[8px] border border-[#3b82f6]/20 bg-[#eff6ff] p-4 text-sm font-medium text-[#1e40af]">
                Set the date to automatically activate this survey and send notifications to graduates.
              </div>
              
              <label className="block space-y-2 mb-8">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Scheduled Launch Date <span className="text-red-500">*</span></span>
                <input type="date" className="w-full rounded-[8px] border border-slate-200 px-4 py-3 outline-none focus:border-[#003580] focus:ring-1 focus:ring-[#003580]" />
              </label>
              
              <div className="flex gap-3">
                <button onClick={() => setIsScheduleModalOpen(false)} className="flex-1 rounded-[8px] border border-slate-200 py-3 font-semibold text-slate-700 hover:bg-slate-50">
                  Cancel
                </button>
                <button onClick={() => {
                  toast.success('Survey successfully scheduled!');
                  setIsScheduleModalOpen(false);
                }} className="flex-1 flex items-center justify-center gap-2 rounded-[8px] bg-slate-100 py-3 font-semibold text-slate-400 hover:bg-slate-200 transition-colors">
                  Schedule <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
