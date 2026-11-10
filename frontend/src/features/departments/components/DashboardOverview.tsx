import React, { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  GraduationCap, TrendingUp, Clock, DollarSign, FileCheck, Star,
  Building2, Briefcase, RefreshCw, Download, ChevronRight,
  ArrowUp, ArrowDown, Minus, FileText, MessageSquare, AlertCircle, Loader2,
  Users, UserCheck, UserX, Search, X, Lock, SlidersHorizontal, Send, BarChart2
} from 'lucide-react';
import { AnalyticsChart } from '../../../components/AnalyticsChart';
import { DashboardBroadcastHero } from '../../../components/DashboardBroadcastHero';
import { departmentService } from '../services/department.service';
import { useAuth } from '../../../contexts/AuthContext';
import {
  DashboardOverviewFilters,
  KPICard,
  SkillGapItem,
  EmployerFeedbackScore,
  CurriculumInsight,
  RecentActivity
} from '../types/dashboardOverview.types';

interface DashboardOverviewProps {
  darkMode?: boolean;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ darkMode = false }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const assignedDept = user?.department || 'Software Engineering';

  const [filters, setFilters] = useState<DashboardOverviewFilters & {
    department?: string;
    startYear?: string;
    endYear?: string;
    status?: string;
    industry?: string;
    location?: string;
    salaryMin?: string;
  }>({
    department: assignedDept,
    academicYear: '2024',
    tracerPeriod: '6-month',
    startYear: '',
    endYear: '',
    status: 'All',
    industry: 'All',
    location: 'All',
    salaryMin: '',
  });

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [dashboardData, setDashboardData] = useState<any>(null);

  // Alumni Roster Modal States
  const [isRosterModalOpen, setIsRosterModalOpen] = useState<boolean>(false);
  const [rosterFilter, setRosterFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'PENDING VERIFICATION'>('ALL');
  const [rosterSearch, setRosterSearch] = useState<string>('');

  // Export Options Modal States
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv' | 'json'>('pdf');
  const [exportDept, setExportDept] = useState<string>('');
  const [exportYear, setExportYear] = useState<string>('2024');
  const [exportTracer, setExportTracer] = useState<string>('6-month');
  const [exportRosterStatus, setExportRosterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'PENDING VERIFICATION'>('ALL');
  const [exportSections, setExportSections] = useState<Record<string, boolean>>({
    kpis: true,
    hiringCompanies: true,
    topIndustries: true,
    skillGap: true,
    feedback: true,
    curriculum: true,
    roster: true,
    tracer: true,
  });
  const [exporting, setExporting] = useState<boolean>(false);

  // Requirement 2: 20 Years before and 20 Years after current year (2006 to 2046)
  const currentYr = new Date().getFullYear();
  const minYr = currentYr - 20;
  const maxYr = currentYr + 20;

  const full40YearOptions = useMemo(() => {
    const list: string[] = ['All'];
    for (let y = maxYr; y >= minYr; y--) {
      list.push(y.toString());
    }
    return list;
  }, [minYr, maxYr]);

  const fetchOverview = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      const activeDept = isAdmin ? (filters.department || assignedDept) : assignedDept;

      const params: Record<string, string> = {
        department: activeDept,
        academicYear: filters.academicYear || 'All',
        tracerPeriod: filters.tracerPeriod || 'All',
      };

      if (filters.startYear) params.startYear = filters.startYear;
      if (filters.endYear) params.endYear = filters.endYear;
      if (filters.status && filters.status !== 'All') params.status = filters.status;
      if (filters.industry && filters.industry !== 'All') params.industry = filters.industry;
      if (filters.location && filters.location !== 'All') params.location = filters.location;
      if (filters.salaryMin) params.salaryMin = filters.salaryMin;

      if (isManualRefresh) {
        params._t = Date.now().toString();
      }

      const data = await departmentService.getOverview(params);

      setDashboardData(data);
      if (isManualRefresh) {
        toast.success('Dashboard metrics & live database telemetry refreshed!');
      }
    } catch (err) {
      console.error('Failed to load department overview:', err);
      toast.error('Failed to load live department analytics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters, isAdmin, assignedDept]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const handleRefresh = () => {
    fetchOverview(true);
  };

  const handleExport = () => {
    setExportDept(dashboardData?.department?.name || filters.department || user?.department || 'Software Engineering');
    setExportYear(filters.academicYear || '2024');
    setExportTracer(filters.tracerPeriod || '6-month');
    setIsExportModalOpen(true);
  };

  const executeExport = async () => {
    try {
      setExporting(true);
      const activeDeptCode = dashboardData?.department?.code || 'SWE';
      await departmentService.downloadReport({
        format: exportFormat,
        department: exportDept,
        academicYear: exportYear,
        tracerPeriod: exportTracer,
        alumniStatus: exportRosterStatus,
        sections: Object.keys(exportSections).filter((k) => exportSections[k]),
        dashboardData,
      });
      toast.success(`Official ASTU ${activeDeptCode} report exported successfully as ${exportFormat.toUpperCase()}!`);
      setIsExportModalOpen(false);
    } catch (err) {
      console.error('Export failed:', err);
      toast.error('Failed to export report.');
    } finally {
      setExporting(false);
    }
  };

  const openRosterModal = (filterType: 'ALL' | 'ACTIVE' | 'INACTIVE' | 'PENDING VERIFICATION') => {
    setRosterFilter(filterType);
    setRosterSearch('');
    setIsRosterModalOpen(true);
  };

  const getIcon = (iconName: string) => {
    const iconMap: Record<string, React.ElementType> = {
      'GraduationCap': GraduationCap,
      'TrendingUp': TrendingUp,
      'Clock': Clock,
      'DollarSign': DollarSign,
      'FileCheck': FileCheck,
      'Star': Star,
      'Building2': Building2,
      'Briefcase': Briefcase,
      'FileText': FileText,
      'MessageSquare': MessageSquare,
      'AlertCircle': AlertCircle,
      'Send': Send,
      'Download': Download,
      'BarChart2': BarChart2,
      'UserCheck': UserCheck,
    };
    const Icon = iconMap[iconName] || TrendingUp;
    return <Icon className="h-5 w-5" />;
  };

  const getTrendIcon = (direction?: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up':
        return <ArrowUp className="h-4 w-4 text-astu-green" />;
      case 'down':
        return <ArrowDown className="h-4 w-4 text-astu-red" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const renderSparkline = (data?: number[], color?: string) => {
    if (!data || data.length === 0) return null;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    return (
      <svg width="60" height="24" className="overflow-visible">
        <polyline
          points={data.map((value, index) => {
            const x = (index / (data.length - 1)) * 60;
            const y = 24 - ((value - min) / range) * 20;
            return `${x},${y}`;
          }).join(' ')}
          fill="none"
          stroke={color === 'astu-green' ? '#008080' : color === 'astu-navy' ? '#002244' : color === 'astu-red' ? '#B22222' : '#003580'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  const renderKPICard = (kpi: KPICard) => {
    const isGraduatesCard = kpi.id === 'kpi-graduates' || kpi.label === 'TOTAL GRADUATES';
    return (
      <div
        key={kpi.id || kpi.label}
        onClick={() => { if (isGraduatesCard) openRosterModal('ALL'); }}
        className={`p-5 border rounded-2xl transition-all duration-300 group ${isGraduatesCard ? 'cursor-pointer hover:border-[#003580] hover:ring-2 hover:ring-[#003580]/20' : 'hover:shadow-md'} ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200/80 shadow-xs'}`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2.5 rounded-xl transition-colors ${darkMode ? 'bg-slate-700 text-blue-400' : 'bg-[#003580]/10 text-[#003580]'}`}>
            {getIcon(kpi.icon)}
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200">
            {getTrendIcon(kpi.trendDirection)}
            <span className={`text-[10px] font-extrabold ${kpi.trendDirection === 'up' ? 'text-emerald-600' : kpi.trendDirection === 'down' ? 'text-rose-600' : 'text-slate-500'}`}>
              {Math.abs(kpi.trend)}%
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className={`text-[10px] uppercase font-extrabold tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{kpi.label}</p>
          <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 uppercase">
            VERIFIED
          </span>
        </div>
        <p className={`text-2xl font-extrabold my-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{kpi.value}</p>
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <p className={`text-[11px] font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{kpi.comparison}</p>
          {renderSparkline(kpi.sparkline, kpi.color)}
        </div>
      </div>
    );
  };

  const renderSkillGapItem = (item: SkillGapItem) => (
    <div key={item.skill} className={`p-4 border rounded-xl hover:shadow-md transition-all duration-300 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gradient-to-br from-gray-50 to-white border-gray-200/60'}`}>
      <div className="flex items-center justify-between mb-2">
        <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.skill}</p>
        <div className="flex items-center gap-1">
          {getTrendIcon(item.trendDirection)}
          <span className={`text-xs font-semibold ${item.trendDirection === 'up' ? 'text-astu-red' : 'text-astu-green'}`}>
            {Math.abs(item.trend)}%
          </span>
        </div>
      </div>
      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Demand</span>
            <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.demand}%</span>
          </div>
          <div className={`w-full h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
            <div className="bg-astu-navy h-full rounded-full" style={{ width: `${item.demand}%` }}></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Coverage</span>
            <span className={`font-semibold ${item.coverage < 50 ? 'text-astu-red' : 'text-astu-green'}`}>{item.coverage}%</span>
          </div>
          <div className={`w-full h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
            <div className={`h-full rounded-full ${item.coverage < 50 ? 'bg-astu-red' : 'bg-astu-green'}`} style={{ width: `${item.coverage}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFeedbackScore = (scoreData: EmployerFeedbackScore) => (
    <div key={scoreData.category} className={`p-4 border rounded-xl ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gradient-to-br from-gray-50 to-white border-gray-200/60'}`}>
      <p className={`text-xs uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{scoreData.category}</p>
      <div className="flex items-center justify-between">
        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{scoreData.score}</p>
        <div className="flex items-center gap-1">
          {getTrendIcon(scoreData.trendDirection)}
          <span className={`text-xs font-semibold ${scoreData.trendDirection === 'up' ? 'text-astu-green' : 'text-astu-red'}`}>
            {Math.abs(scoreData.trend)}%
          </span>
        </div>
      </div>
      <div className="mt-2 flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= Math.floor(scoreData.score) ? 'text-yellow-400 fill-yellow-400' : darkMode ? 'text-slate-600' : 'text-gray-300'}`}
          />
        ))}
      </div>
    </div>
  );

  const renderCurriculumInsight = (insight: CurriculumInsight) => (
    <div key={insight.title} className={`p-4 border rounded-xl ${
      darkMode ? 'bg-slate-800 border-slate-700' :
      insight.type === 'strength' ? 'bg-emerald-50 border-emerald-200' :
      insight.type === 'weakness' ? 'bg-red-50 border-red-200' :
      insight.priority === 'high' ? 'bg-yellow-50 border-yellow-200' :
      insight.priority === 'medium' ? 'bg-blue-50 border-blue-200' :
      'bg-gray-50 border-gray-200'
    }`}>
      <div className="flex items-start justify-between mb-2">
        <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{insight.title}</p>
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
          insight.priority === 'high' ? 'bg-astu-red text-white' :
          insight.priority === 'medium' ? 'bg-blue-600 text-white' :
          'bg-gray-600 text-white'
        }`}>
          {insight.priority}
        </span>
      </div>
      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{insight.description}</p>
    </div>
  );

  const renderRecentActivity = (activity: RecentActivity) => (
    <div key={activity.id} className={`flex items-start gap-4 p-4 border rounded-xl hover:shadow-md transition-all duration-300 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gradient-to-br from-gray-50 to-white border-gray-200/60'}`}>
      <div className={`p-2 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
        <div className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
          {getIcon(activity.icon)}
        </div>
      </div>
      <div className="flex-1">
        <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{activity.title}</p>
        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{activity.description}</p>
      </div>
      <p className={`text-xs whitespace-nowrap ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>{activity.timestamp}</p>
    </div>
  );

  const metrics = dashboardData?.commandCenterMetrics;
  const activeDeptName = dashboardData?.department?.name || filters.department || user?.department || 'Computer Science';
  const activeDeptCode = dashboardData?.department?.code || (activeDeptName.toLowerCase().includes('software') ? 'SWE' : 'COM');
  const availableYears = dashboardData?.availableAcademicYears || ['2024', '2023', '2022', '2021', 'All'];
  const availableMilestones = dashboardData?.availableTracerMilestones || [
    { id: '6-month', label: '6-Month Post-Graduation Tracer' },
    { id: '12-month', label: '12-Month Post-Graduation Tracer' },
    { id: '18-month', label: '18-Month Post-Graduation Tracer' },
    { id: '24-month', label: '24-Month Post-Graduation Tracer' },
    { id: 'All', label: 'All Milestones' },
  ];

  // Roster Filter Calculation for Modal
  const alumniRosterList = dashboardData?.alumniRoster || [];
  const filteredRoster = alumniRosterList.filter((alumni: any) => {
    const matchesFilter =
      rosterFilter === 'ALL' ? true :
      rosterFilter === 'ACTIVE' ? (alumni.status === 'ACTIVE' || alumni.isVerified) :
      rosterFilter === 'INACTIVE' ? (alumni.status === 'INACTIVE' || (!alumni.isVerified && alumni.status !== 'ACTIVE' && alumni.status !== 'PENDING VERIFICATION')) :
      rosterFilter === 'PENDING VERIFICATION' ? (alumni.status === 'PENDING VERIFICATION' || alumni.status === 'PENDING') : true;

    const query = rosterSearch.toLowerCase().trim();
    const matchesSearch =
      !query ? true :
      (alumni.name || '').toLowerCase().includes(query) ||
      (alumni.studentId || '').toLowerCase().includes(query) ||
      (alumni.email || '').toLowerCase().includes(query) ||
      (alumni.companyName || '').toLowerCase().includes(query) ||
      (alumni.currentRole || '').toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  if (loading && !dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] p-8 text-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#003580]" />
        <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
          Calculating live department analytics & accreditation metrics from database...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Official Alumni Officer Broadcast Hero Banner */}
      <DashboardBroadcastHero actorRole="DEPARTMENT_HEAD" className="mb-2" />

      {/* Department Command Center Banner */}
      <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-r from-[#003580] via-[#004b99] to-[#0066cc] p-6 text-white shadow-md relative overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white">
              DEPARTMENT ACCREDITATION &amp; OUTCOMES HUB
            </span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">{activeDeptName} Department Command Center</h2>
            <p className="mt-1 max-w-3xl text-xs leading-relaxed text-white/90">
              Executive monitoring of graduate employment rates, curriculum skill alignment, ABET accreditation evidence, and department survey completions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl transition-all duration-300 font-bold text-xs disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#1D9E75] hover:brightness-110 text-white rounded-xl transition-all duration-300 font-bold text-xs shadow-sm cursor-pointer"
            >
              <Download className="h-4 w-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Command Center 4-Card Quick Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/15">
          <div
            onClick={() => openRosterModal('ALL')}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-4 rounded-xl border border-white/15 cursor-pointer transition-all group"
          >
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/70">DEPARTMENT GRADUATES</span>
            <p className="text-2xl font-extrabold mt-1 text-white group-hover:scale-105 transition-transform">
              {metrics?.departmentGraduates !== undefined ? metrics.departmentGraduates.toLocaleString() : '0'}
            </p>
            <p className="text-[10px] text-emerald-300 font-semibold mt-0.5">
              ✓ {metrics?.verifiedPercentage ?? 0}% Verified SIS Census
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/15">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/70">EMPLOYMENT RATE</span>
            <p className="text-2xl font-extrabold mt-1 text-white">
              {metrics?.employmentRate ?? 0}%
            </p>
            <p className="text-[10px] text-emerald-300 font-semibold mt-0.5">↑ Live DB Telemetry</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/15">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/70">EMPLOYER SATISFACTION</span>
            <p className="text-2xl font-extrabold mt-1 text-white">
              {metrics?.employerSatisfaction ?? 'N/A'}
            </p>
            <p className="text-[10px] text-amber-300 font-semibold mt-0.5">★ ABET Quality Target Met</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/15">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/70">ACTIVE PARTNERSHIPS</span>
            <p className="text-2xl font-extrabold mt-1 text-white">
              {metrics?.activePartnerships ?? 0} Companies
            </p>
            <p className="text-[10px] text-emerald-300 font-semibold mt-0.5">
              {metrics?.activeJobRequisitions ?? 0} Job Requisitions
            </p>
          </div>
        </div>
      </div>

      {/* Dynamic Filters Bar */}
      <div className={`rounded-2xl p-4 shadow-xs border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          {/* Department Scope Selection */}
          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1 block">Assigned Department</label>
            {!isAdmin ? (
              <div className={`w-full px-3.5 py-2 text-xs font-extrabold flex items-center justify-between border rounded-xl ${darkMode ? 'bg-slate-800/90 border-slate-700 text-blue-400' : 'bg-slate-50 border-slate-200 text-[#003580]'}`}>
                <div className="flex items-center gap-2 truncate">
                  <Lock className="h-4 w-4 shrink-0 text-[#003580] dark:text-blue-400" />
                  <span className="truncate">{activeDeptName} ({activeDeptCode})</span>
                </div>
                <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/80 shrink-0">
                  LOCKED
                </span>
              </div>
            ) : (
              <select
                value={filters.department || activeDeptName}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                className={`w-full px-3.5 py-2 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-astu-navy/50 transition-all ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
              >
                {(dashboardData?.availableDepartments || [
                  { name: 'Computer Science', code: 'COM' },
                  { name: 'Software Engineering', code: 'SWE' },
                  { name: 'Electrical and Computer Engineering', code: 'ECE' },
                  { name: 'Mechanical Engineering', code: 'MEG' },
                  { name: 'Civil Engineering', code: 'CVE' },
                  { name: 'Chemical Engineering', code: 'CHE' },
                  { name: 'Applied Geology', code: 'GEO' },
                ]).map((d: any) => (
                  <option key={d.code} value={d.name}>{d.name} ({d.code})</option>
                ))}
              </select>
            )}
          </div>

          {/* Academic Cohort Year (20 years before & 20 years after now) */}
          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1 block">Academic Cohort Year</label>
            <select
              value={filters.academicYear}
              onChange={(e) => setFilters({ ...filters, academicYear: e.target.value })}
              className={`w-full px-3.5 py-2 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-astu-navy/50 transition-all ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
            >
              {full40YearOptions.map((yr: string) => (
                <option key={yr} value={yr}>
                  {yr === 'All' ? 'All Graduating Classes (2006-2046)' : `${yr} Graduating Class`}
                </option>
              ))}
            </select>
          </div>

          {/* Tracer Study Milestone */}
          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1 block">Tracer Study Milestone</label>
            <select
              value={filters.tracerPeriod}
              onChange={(e) => setFilters({ ...filters, tracerPeriod: e.target.value })}
              className={`w-full px-3.5 py-2 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-astu-navy/50 transition-all ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
            >
              {availableMilestones.map((m: any) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filter More Button */}
          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1 block">Advanced Controls</label>
            <button
              type="button"
              onClick={() => setIsFilterModalOpen(true)}
              className={`w-full px-4 py-2 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                (filters.startYear || filters.endYear || (filters.status && filters.status !== 'All') || (filters.industry && filters.industry !== 'All') || (filters.location && filters.location !== 'All') || filters.salaryMin)
                  ? 'bg-astu-navy text-white border-astu-navy shadow-md hover:bg-blue-900'
                  : darkMode
                  ? 'bg-slate-800 border-slate-700 text-gray-200 hover:bg-slate-700'
                  : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4 text-astu-navy dark:text-blue-400" />
              <span>Filter More</span>
              {(filters.startYear || filters.endYear || (filters.status && filters.status !== 'All') || (filters.industry && filters.industry !== 'All') || (filters.location && filters.location !== 'All') || filters.salaryMin) && (
                <span className="ml-1 px-1.5 py-0.5 text-[9px] font-black bg-emerald-500 text-white rounded-full">
                  Active
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Account Status Breakdown Bar */}
      <div className={`rounded-2xl p-4 border shadow-xs ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[#003580] dark:text-blue-400" />
            <h3 className={`text-xs font-black uppercase tracking-wider ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Department Alumni Account Status & Roster Breakdown
            </h3>
          </div>
          <span className="text-[10px] font-extrabold text-indigo-600 dark:text-blue-400 uppercase tracking-wider">
            Click any status card to view detailed alumni profile records
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => openRosterModal('ACTIVE')}
            className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/40 dark:from-emerald-950/40 dark:to-slate-900 text-left hover:shadow-md transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">Active Accounts</span>
              <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-950 dark:text-white">{metrics?.activeCount ?? 0}</span>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">Verified & Active</span>
            </div>
            <span className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 inline-flex items-center gap-1 group-hover:underline">
              View Active Roster <ChevronRight className="h-3 w-3" />
            </span>
          </button>

          <button
            type="button"
            onClick={() => openRosterModal('INACTIVE')}
            className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 dark:from-amber-950/40 dark:to-slate-900 text-left hover:shadow-md transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-400">Inactive Accounts</span>
              <UserX className="h-4 w-4 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-amber-950 dark:text-white">{metrics?.inactiveCount ?? 0}</span>
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">Unverified / Dormant</span>
            </div>
            <span className="text-[9px] font-extrabold text-amber-600 dark:text-amber-400 mt-1 inline-flex items-center gap-1 group-hover:underline">
              View Inactive Roster <ChevronRight className="h-3 w-3" />
            </span>
          </button>

          <button
            type="button"
            onClick={() => openRosterModal('PENDING VERIFICATION')}
            className="p-3.5 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-gradient-to-br from-purple-50/80 via-white to-purple-50/40 dark:from-purple-950/40 dark:to-slate-900 text-left hover:shadow-md transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-800 dark:text-purple-400">Pending Review</span>
              <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-purple-950 dark:text-white">{metrics?.pendingCount ?? 0}</span>
              <span className="text-[10px] font-bold text-purple-700 dark:text-purple-400">Awaiting Verification</span>
            </div>
            <span className="text-[9px] font-extrabold text-purple-600 dark:text-purple-400 mt-1 inline-flex items-center gap-1 group-hover:underline">
              View Pending Roster <ChevronRight className="h-3 w-3" />
            </span>
          </button>

          <button
            type="button"
            onClick={() => openRosterModal('ALL')}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-800 dark:to-slate-900 text-left hover:shadow-md transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">Total Department Roster</span>
              <Users className="h-4 w-4 text-[#003580] dark:text-blue-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{metrics?.departmentGraduates ?? 0}</span>
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Total Alumni</span>
            </div>
            <span className="text-[9px] font-extrabold text-[#003580] dark:text-blue-400 mt-1 inline-flex items-center gap-1 group-hover:underline">
              View Full Roster <ChevronRight className="h-3 w-3" />
            </span>
          </button>
        </div>
      </div>

      {/* 8 KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(dashboardData?.kpiCards || []).map(renderKPICard)}
      </div>

      {/* Row 1: Dynamic Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart
          type="line"
          data={(dashboardData?.employmentTrendData || []) as any}
          xKey="year"
          series={[
            { key: 'employmentRate', label: 'Employment Rate (%)', color: '#008080' }
          ]}
          title="Employment Trend"
          subtitle="Graduate employment rate by year calculated from database"
          height={280}
          darkMode={darkMode}
        />
        <AnalyticsChart
          type="pie"
          data={(dashboardData?.tracerCompletionData || []) as any}
          xKey="status"
          series={[
            { key: 'count', label: 'Surveys' }
          ]}
          title="Tracer Study Completion"
          subtitle="Survey completion status distribution"
          height={280}
          darkMode={darkMode}
        />
      </div>

      {/* Row 2: Top Companies & Industries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Top Hiring Companies</h3>
            <span className="text-[10px] font-extrabold text-[#003580] dark:text-blue-400 uppercase tracking-wider">
              Click company to view hires
            </span>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1.5">
            {(dashboardData?.topHiringCompanies || []).map((company: any, index: number) => (
              <div
                key={company.name || index}
                onClick={() => {
                  setRosterSearch(company.name);
                  setRosterFilter('ALL');
                  setIsRosterModalOpen(true);
                }}
                className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer hover:shadow-md hover:border-[#003580]/40 transition-all group ${darkMode ? 'bg-slate-700 border-slate-600 hover:bg-slate-600' : 'bg-gradient-to-br from-gray-50 to-white border-gray-200/60'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-astu-navy/10 rounded-lg flex items-center justify-center font-bold text-astu-navy text-sm group-hover:scale-105 transition-transform">
                    {index + 1}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold group-hover:text-[#003580] dark:group-hover:text-blue-400 transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>{company.name}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{company.graduateCount} graduates hired</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {getTrendIcon(company.trendDirection)}
                    <span className={`text-xs font-semibold ${company.trendDirection === 'up' ? 'text-astu-green' : 'text-astu-red'}`}>
                      {Math.abs(company.trend)}%
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-[#003580] group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
          <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Top Industries</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1.5">
            {(dashboardData?.topIndustries || []).map((industry: any, index: number) => (
              <div key={industry.name || index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{industry.name}</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{industry.percentage}%</p>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                  <div className="bg-astu-navy h-full rounded-full" style={{ width: `${industry.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Skill Gap Summary */}
      <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
        <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Skill Gap Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[380px] overflow-y-auto pr-1.5">
          {(dashboardData?.skillGapItems || []).map(renderSkillGapItem)}
        </div>
      </div>

      {/* Row 4: Employer Feedback Snapshot */}
      <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
        <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Employer Feedback Snapshot</h3>
        {(dashboardData?.employerFeedbackScores || []).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {(dashboardData?.employerFeedbackScores || []).map(renderFeedbackScore)}
          </div>
        ) : (
          <div className={`p-6 text-center border rounded-xl ${darkMode ? 'bg-slate-800/50 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
            <p className="text-xs font-semibold">No employer feedback evaluation records logged yet for this department in the database.</p>
          </div>
        )}
      </div>

      {/* Row 5: Curriculum Insight Summary */}
      <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
        <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Curriculum Insight Summary</h3>
        {(dashboardData?.curriculumInsights || []).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[380px] overflow-y-auto pr-1.5">
            {(dashboardData?.curriculumInsights || []).map(renderCurriculumInsight)}
          </div>
        ) : (
          <div className={`p-6 text-center border rounded-xl ${darkMode ? 'bg-slate-800/50 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
            <p className="text-xs font-semibold">No curriculum insight telemetry generated yet for this department in the database.</p>
          </div>
        )}
      </div>

      {/* Recent Activity Panel */}
      <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Recent Activity</h3>
          {(dashboardData?.recentActivities || []).length > 0 && (
            <span className="text-[10px] font-extrabold text-[#003580] dark:text-blue-400 uppercase tracking-wider">
              {(dashboardData?.recentActivities || []).length} events recorded
            </span>
          )}
        </div>
        {(dashboardData?.recentActivities || []).length > 0 ? (
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1.5">
            {(dashboardData?.recentActivities || []).map(renderRecentActivity)}
          </div>
        ) : (
          <div className={`p-6 text-center border rounded-xl ${darkMode ? 'bg-slate-800/50 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
            <p className="text-xs font-semibold">No recent activity events recorded for this department in the database.</p>
          </div>
        )}
      </div>

      {/* Interactive Alumni Roster Modal */}
      {isRosterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className={`w-full max-w-4xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#003580] text-white shadow-xs">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">{activeDeptName} ({activeDeptCode}) Alumni Roster</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Live database profile records for {filters.academicYear === 'All' ? 'All Cohorts' : `${filters.academicYear} Graduating Class`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsRosterModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Filters & Search Bar */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                  placeholder="Search by name, ID, email, company..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-[#003580]"
                />
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
                {(['ALL', 'ACTIVE', 'INACTIVE', 'PENDING VERIFICATION'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setRosterFilter(tab)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                      rosterFilter === tab
                        ? 'bg-[#003580] text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {tab === 'ALL' ? `All (${alumniRosterList.length})` :
                     tab === 'ACTIVE' ? `Active (${metrics?.activeCount ?? 0})` :
                     tab === 'INACTIVE' ? `Inactive (${metrics?.inactiveCount ?? 0})` :
                     `Pending (${metrics?.pendingCount ?? 0})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Content / Table */}
            <div className="p-4 overflow-y-auto flex-1">
              {filteredRoster.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <Users className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto" />
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    No alumni records found matching target filter or search query.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                        <th className="py-2.5 px-3">Alumni Member</th>
                        <th className="py-2.5 px-3">Student ID</th>
                        <th className="py-2.5 px-3">Batch</th>
                        <th className="py-2.5 px-3">Account Status</th>
                        <th className="py-2.5 px-3">Verification</th>
                        <th className="py-2.5 px-3">Employment & Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredRoster.map((alumni: any) => (
                        <tr key={alumni.id || alumni.studentId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900 dark:text-white">{alumni.name}</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">{alumni.email}</div>
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300 font-semibold">
                            {alumni.studentId}
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">
                            {alumni.graduationYear}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              alumni.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200'
                                : alumni.status === 'PENDING VERIFICATION'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200'
                            }`}>
                              {alumni.status}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              alumni.isVerified
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200'
                            }`}>
                              {alumni.isVerified ? 'VERIFIED' : 'UNVERIFIED'}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-slate-800 dark:text-slate-200">{alumni.employmentStatus}</div>
                            {alumni.companyName !== 'N/A' && (
                              <div className="text-[11px] text-slate-500 dark:text-slate-400">{alumni.currentRole} @ {alumni.companyName}</div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Showing {filteredRoster.length} of {alumniRosterList.length} total database records
              </span>
              <button
                onClick={() => setIsRosterModalOpen(false)}
                className="px-4 py-1.5 bg-[#003580] text-white rounded-xl text-xs font-bold hover:bg-[#002866] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Export Options Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-[#003580] via-[#004b99] to-[#0066cc] text-white">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/15 text-white">
                  <Download className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Export Department Accreditation & Telemetry Report</h3>
                  <p className="text-xs text-white/80">Select export formats, scope filtering, and report data sections</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
              {/* 1. Format Selection */}
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2.5">
                  1. Select Export File Format
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'pdf', label: 'PDF Document', desc: 'Executive Printable PDF', icon: FileText, color: 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950 dark:border-rose-900' },
                    { id: 'excel', label: 'Excel (.xls)', desc: 'Multi-Sheet Spreadsheet', icon: FileCheck, color: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-900' },
                    { id: 'csv', label: 'CSV Data', desc: 'Raw Comma-Separated', icon: Download, color: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-900' },
                    { id: 'json', label: 'JSON Telemetry', desc: 'Structured Data Payload', icon: Building2, color: 'text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-900' },
                  ].map((fmt) => {
                    const FmtIcon = fmt.icon;
                    const isSelected = exportFormat === fmt.id;
                    return (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => setExportFormat(fmt.id as any)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'ring-2 ring-[#003580] border-[#003580] bg-[#003580]/5 font-bold shadow-xs'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className={`p-2 rounded-lg w-fit mb-2 ${fmt.color}`}>
                          <FmtIcon className="h-4 w-4" />
                        </div>
                        <p className="text-xs font-bold">{fmt.label}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{fmt.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Scope & Filter Options */}
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2.5">
                  2. Report Scope & Advanced Filters
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">Department Scope</label>
                    <select
                      value={exportDept}
                      onChange={(e) => setExportDept(e.target.value)}
                      className="w-full p-2 text-xs font-semibold border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                    >
                      {(dashboardData?.availableDepartments || []).map((d: any) => (
                        <option key={d.code} value={d.name}>{d.name} ({d.code})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">Cohort Year</label>
                    <select
                      value={exportYear}
                      onChange={(e) => setExportYear(e.target.value)}
                      className="w-full p-2 text-xs font-semibold border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                    >
                      {availableYears.map((yr: string) => (
                        <option key={yr} value={yr}>{yr === 'All' ? 'All Graduating Classes' : `${yr} Graduating Class`}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">Alumni Account Status</label>
                    <select
                      value={exportRosterStatus}
                      onChange={(e) => setExportRosterStatus(e.target.value as any)}
                      className="w-full p-2 text-xs font-semibold border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                    >
                      <option value="ALL">All Roster Accounts</option>
                      <option value="ACTIVE">Active & Verified Accounts Only</option>
                      <option value="INACTIVE">Inactive / Unverified Only</option>
                      <option value="PENDING VERIFICATION">Pending Verification Only</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. Included Data Sections */}
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2.5">
                  3. Select Included Report Sections
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'kpis', label: 'Command Center KPIs' },
                    { id: 'hiringCompanies', label: 'Top Hiring Companies' },
                    { id: 'topIndustries', label: 'Top Industries' },
                    { id: 'skillGap', label: 'Skill Gap Matrix' },
                    { id: 'feedback', label: 'Employer Feedback' },
                    { id: 'curriculum', label: 'Curriculum Insights' },
                    { id: 'roster', label: 'Alumni Roster Records' },
                    { id: 'tracer', label: 'Tracer Study Stats' },
                  ].map((sec) => (
                    <label key={sec.id} className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={Boolean(exportSections[sec.id])}
                        onChange={(e) => setExportSections({ ...exportSections, [sec.id]: e.target.checked })}
                        className="rounded text-[#003580] focus:ring-[#003580]"
                      />
                      <span className="text-xs font-semibold">{sec.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <span className="text-xs text-slate-500 font-medium">
                Official ASTU {activeDeptCode} Accreditation Exporter
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeExport}
                  disabled={exporting}
                  className="flex items-center gap-2 px-5 py-2 bg-[#1D9E75] hover:brightness-110 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {exporting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Download {exportFormat.toUpperCase()} Report
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Telemetry & Cohort Filters Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-astu-navy to-[#004b99] text-white">
              <div className="flex items-center gap-2.5">
                <SlidersHorizontal className="h-5 w-5 text-blue-300" />
                <div>
                  <h3 className="text-base font-bold">Advanced Telemetry &amp; Cohort Filters</h3>
                  <p className="text-[11px] text-blue-100 font-medium">Configure multi-dimensional filters calculated directly from database records</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Department Scope Notice */}
              <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Building2 className="h-4 w-4 text-astu-navy dark:text-blue-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Scope Target: {activeDeptName}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {!isAdmin ? 'Telemetry is strictly locked to your assigned department portal.' : 'Administrative mode active (Cross-department selection allowed)'}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200">
                  {!isAdmin ? 'LOCKED' : 'ADMIN ACCESS'}
                </span>
              </div>

              {/* Cohort Graduation Year Range (20 years before & 20 years after now: 2006 to 2046) */}
              <div>
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 block">
                  Graduation Cohort Year Range (20 Years Prior &amp; 20 Years Future: 2006 - 2046)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold mb-1 block">Start Year Floor</span>
                    <select
                      value={filters.startYear || ''}
                      onChange={(e) => setFilters({ ...filters, startYear: e.target.value })}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-astu-navy/50 ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                    >
                      <option value="">No Minimum (2006)</option>
                      {full40YearOptions.filter(y => y !== 'All').map(y => (
                        <option key={`start-${y}`} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold mb-1 block">End Year Ceiling</span>
                    <select
                      value={filters.endYear || ''}
                      onChange={(e) => setFilters({ ...filters, endYear: e.target.value })}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-astu-navy/50 ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                    >
                      <option value="">No Maximum (2046)</option>
                      {full40YearOptions.filter(y => y !== 'All').map(y => (
                        <option key={`end-${y}`} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Employment Status & Tracer Period */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 block">
                    Employment Status
                  </label>
                  <select
                    value={filters.status || 'All'}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-astu-navy/50 ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  >
                    <option value="All">All Employment Statuses</option>
                    <option value="Employed">Employed (Full-time / Part-time)</option>
                    <option value="Unemployed">Unemployed / Job Seeking</option>
                    <option value="Self-Employed">Self-Employed / Entrepreneur / Freelance</option>
                    <option value="Further Study">Further Study / MSc / PhD Candidate</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 block">
                    Tracer Study Milestone
                  </label>
                  <select
                    value={filters.tracerPeriod || 'All'}
                    onChange={(e) => setFilters({ ...filters, tracerPeriod: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-astu-navy/50 ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  >
                    <option value="All">All Tracer Milestones</option>
                    <option value="6-month">6-Month Post-Graduation Tracer</option>
                    <option value="12-month">12-Month Post-Graduation Tracer</option>
                    <option value="18-month">18-Month Post-Graduation Tracer</option>
                    <option value="24-month">24-Month Post-Graduation Tracer</option>
                  </select>
                </div>
              </div>

              {/* Geographic Region & Industry Sector */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 block">
                    Geographic Region
                  </label>
                  <select
                    value={filters.location || 'All'}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-astu-navy/50 ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  >
                    <option value="All">All Geographic Regions</option>
                    <option value="Local (Adama & Vicinity)">Local (Adama &amp; Vicinity)</option>
                    <option value="Regional (Addis Ababa & Oromia)">Regional (Addis Ababa &amp; Oromia)</option>
                    <option value="International (Abroad / Global Remote)">International (Abroad / Global Remote)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 block">
                    Industry Sector
                  </label>
                  <select
                    value={filters.industry || 'All'}
                    onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-astu-navy/50 ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  >
                    <option value="All">All Industry Sectors</option>
                    <option value="Telecommunications">Telecommunications</option>
                    <option value="Software & IT Services">Software &amp; IT Services</option>
                    <option value="Financial Services & Banking">Financial Services &amp; Banking</option>
                    <option value="Engineering & Infrastructure">Engineering &amp; Infrastructure</option>
                    <option value="Manufacturing & Energy">Manufacturing &amp; Energy</option>
                    <option value="Government & Education">Government &amp; Education</option>
                  </select>
                </div>
              </div>

              {/* Minimum Salary Floor */}
              <div>
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 block">
                  Minimum Monthly Salary Floor (ETB)
                </label>
                <select
                  value={filters.salaryMin || ''}
                  onChange={(e) => setFilters({ ...filters, salaryMin: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-astu-navy/50 ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                >
                  <option value="">All Salary Ranges</option>
                  <option value="10000">&gt; ETB 10,000 / month</option>
                  <option value="20000">&gt; ETB 20,000 / month</option>
                  <option value="35000">&gt; ETB 35,000 / month</option>
                  <option value="50000">&gt; ETB 50,000+ / month</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`flex items-center justify-between px-6 py-4 border-t ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <button
                type="button"
                onClick={() => {
                  setFilters({
                    department: assignedDept,
                    academicYear: 'All',
                    tracerPeriod: 'All',
                    startYear: '',
                    endYear: '',
                    status: 'All',
                    industry: 'All',
                    location: 'All',
                    salaryMin: '',
                  });
                  toast.success('All advanced filters reset to default');
                }}
                className={`px-4 py-2 text-xs font-extrabold rounded-xl border transition-colors cursor-pointer ${darkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-200'}`}
              >
                Reset All Filters
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsFilterModalOpen(false);
                  fetchOverview(true);
                  toast.success('Applied advanced database telemetry filters!');
                }}
                className="px-6 py-2.5 text-xs font-extrabold bg-astu-navy hover:bg-blue-900 text-white rounded-xl shadow-md transition-all cursor-pointer"
              >
                Apply Advanced Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;
