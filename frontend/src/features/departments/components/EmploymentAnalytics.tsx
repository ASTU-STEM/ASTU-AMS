import React, { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  TrendingUp, TrendingDown, Briefcase, Clock, DollarSign, Globe, MapPin, Target,
  RefreshCw, Download, ArrowUp, ArrowDown, Minus, Search, Filter, ChevronDown, ChevronLeft, ChevronRight,
  CheckCircle2, AlertTriangle, Info, XCircle, Loader2, Lock, SlidersHorizontal, X, Building2,
  User, Mail, Phone, ExternalLink, FileText, Award, GraduationCap, ShieldCheck, Linkedin, Github
} from 'lucide-react';
import { AnalyticsChart } from '../../../components/AnalyticsChart';
import { departmentService } from '../services/department.service';
import { useAuth } from '../../../contexts/AuthContext';
import {
  EmploymentAnalyticsFilters,
  EmploymentKPIMetric,
  GraduateEmploymentRecord
} from '../types/employmentAnalytics.types';

interface EmploymentAnalyticsProps {
  data?: any;
  darkMode?: boolean;
}

export const EmploymentAnalytics: React.FC<EmploymentAnalyticsProps> = ({ darkMode = false }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const assignedDept = user?.department || 'Software Engineering';

  const [filters, setFilters] = useState<EmploymentAnalyticsFilters & {
    startYear?: string;
    endYear?: string;
    industry?: string;
    location?: string;
    salaryMin?: string;
    tracerPeriod?: string;
  }>({
    department: assignedDept,
    batch: '2024',
    academicYear: '2024',
    employmentStatus: 'All',
    startYear: '',
    endYear: '',
    industry: 'All',
    location: 'All',
    salaryMin: '',
    tracerPeriod: 'All',
  });

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [dashboardData, setDashboardData] = useState<any>(null);

  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const [showAllCompanies, setShowAllCompanies] = useState(false);
  const [topEmployerSearchTerm, setTopEmployerSearchTerm] = useState('');
  const [showAllTopEmployers, setShowAllTopEmployers] = useState(false);

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv' | 'json'>('pdf');
  const [exportScope, setExportScope] = useState<'all' | 'roster' | 'employers' | 'skills'>('all');
  const [exportStatusFilter, setExportStatusFilter] = useState<string>('ALL');
  const [includeLogo, setIncludeLogo] = useState(true);
  const [includeInsights, setIncludeInsights] = useState(true);
  const [exporting, setExporting] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('graduateName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [selectedAlumni, setSelectedAlumni] = useState<GraduateEmploymentRecord | null>(null);
  const [activeAlumniTab, setActiveAlumniTab] = useState<'profile' | 'career' | 'portfolio' | 'settings'>('profile');

  // Requirement 2: 20 Years before and 20 Years after current year
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

  const fetchAnalytics = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      const activeDept = isAdmin ? (filters.department || assignedDept) : assignedDept;

      const params: Record<string, string> = {
        department: activeDept,
        academicYear: filters.academicYear || 'All',
      };

      if (filters.startYear) params.startYear = filters.startYear;
      if (filters.endYear) params.endYear = filters.endYear;
      if (filters.employmentStatus && filters.employmentStatus !== 'All') params.status = filters.employmentStatus;
      if (filters.industry && filters.industry !== 'All') params.industry = filters.industry;
      if (filters.location && filters.location !== 'All') params.location = filters.location;
      if (filters.salaryMin) params.salaryMin = filters.salaryMin;
      if (filters.tracerPeriod && filters.tracerPeriod !== 'All') params.tracerPeriod = filters.tracerPeriod;
      if (searchTerm) params.search = searchTerm;

      if (isManualRefresh) {
        params._t = Date.now().toString();
      }

      const res = await departmentService.getOverview(params);
      setDashboardData(res);

      if (isManualRefresh) {
        toast.success('Employment analytics telemetry refreshed from database!');
      }
    } catch (err) {
      console.error('Failed to load employment analytics:', err);
      toast.error('Failed to load employment analytics from database.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters, isAdmin, assignedDept, searchTerm]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleRefresh = () => {
    fetchAnalytics(true);
  };

  const handleExport = () => {
    setIsExportModalOpen(true);
  };

  const handleExportSubmit = async () => {
    try {
      setExporting(true);
      let sections = ['kpis', 'hiringCompanies', 'status', 'programs', 'geo', 'insights', 'roster'];
      if (exportScope === 'roster') {
        sections = ['roster'];
      } else if (exportScope === 'employers') {
        sections = ['hiringCompanies', 'topIndustries'];
      } else if (exportScope === 'skills') {
        sections = ['status', 'programs', 'insights'];
      }

      await departmentService.downloadReport({
        format: exportFormat,
        department: filters.department || assignedDept,
        academicYear: filters.academicYear || 'All',
        tracerPeriod: filters.tracerPeriod || 'All',
        alumniStatus: exportStatusFilter,
        sections,
        dashboardData,
        reportType: 'employment-analytics',
      });

      toast.success(`Exported Employment Analytics report in ${exportFormat.toUpperCase()} format!`);
      setIsExportModalOpen(false);
    } catch (err) {
      console.error('Export failed:', err);
      toast.error('Failed to export employment analytics.');
    } finally {
      setExporting(false);
    }
  };

  const empData = dashboardData?.employmentAnalytics || {};
  const kpiMetrics: EmploymentKPIMetric[] = empData.kpiMetrics || [];
  const trendData = empData.employmentTrendData || dashboardData?.employmentTrendData || [];
  const statusData = empData.employmentStatusData || [];
  const programData = empData.programEmploymentData || [];
  const topIndustries = empData.hiringIndustries || dashboardData?.topIndustries || [];
  const topCompanies = useMemo(() => empData.hiringCompanies || dashboardData?.topHiringCompanies || [], [empData.hiringCompanies, dashboardData?.topHiringCompanies]);
  const geoDistribution = empData.geographicDistribution || [];
  const recordsList: GraduateEmploymentRecord[] = useMemo(() => empData.graduateEmploymentRecords || [], [empData.graduateEmploymentRecords]);
  const topEmployers = useMemo(() => empData.topEmployers || [], [empData.topEmployers]);
  const insights = empData.employmentInsights || [];

  const filteredTopCompanies = useMemo(() => {
    if (!topCompanies || !Array.isArray(topCompanies)) return [];
    return topCompanies.filter((company: any) => {
      const q = companySearchTerm.toLowerCase().trim();
      if (!q) return true;
      return (
        (company.name || '').toLowerCase().includes(q) ||
        (company.industry || '').toLowerCase().includes(q)
      );
    });
  }, [topCompanies, companySearchTerm]);

  const displayedCompanies = useMemo(() => {
    if (showAllCompanies || companySearchTerm) {
      return filteredTopCompanies;
    }
    return filteredTopCompanies.slice(0, 5);
  }, [filteredTopCompanies, showAllCompanies, companySearchTerm]);

  const filteredTopEmployers = useMemo(() => {
    if (!topEmployers || !Array.isArray(topEmployers)) return [];
    return topEmployers.filter((employer: any) => {
      const q = topEmployerSearchTerm.toLowerCase().trim();
      if (!q) return true;
      return (
        (employer.employer || '').toLowerCase().includes(q) ||
        (employer.industry || '').toLowerCase().includes(q)
      );
    });
  }, [topEmployers, topEmployerSearchTerm]);

  const displayedTopEmployers = useMemo(() => {
    if (showAllTopEmployers || topEmployerSearchTerm) {
      return filteredTopEmployers;
    }
    return filteredTopEmployers.slice(0, 5);
  }, [filteredTopEmployers, showAllTopEmployers, topEmployerSearchTerm]);

  const availableDepts = dashboardData?.availableDepartments || [
    { name: 'Computer Science', code: 'COM' },
    { name: 'Software Engineering', code: 'SWE' },
    { name: 'Electrical and Computer Engineering', code: 'ECE' },
    { name: 'Mechanical Engineering', code: 'MEG' },
    { name: 'Civil Engineering', code: 'CVE' },
    { name: 'Chemical Engineering', code: 'CHE' },
    { name: 'Applied Geology', code: 'GEO' },
  ];
  const availableYears = dashboardData?.availableAcademicYears || ['2024', '2023', '2022', 'All'];

  const getIcon = (iconName: string) => {
    const iconMap: Record<string, React.ElementType> = {
      'TrendingUp': TrendingUp,
      'TrendingDown': TrendingDown,
      'Briefcase': Briefcase,
      'Clock': Clock,
      'DollarSign': DollarSign,
      'Globe': Globe,
      'MapPin': MapPin,
      'Target': Target
    };
    const Icon = iconMap[iconName] || TrendingUp;
    return <Icon className="h-5 w-5" />;
  };

  const getTrendIcon = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up':
        return <ArrowUp className="h-4 w-4 text-astu-green" />;
      case 'down':
        return <ArrowDown className="h-4 w-4 text-astu-red" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getInsightIcon = (type: 'success' | 'warning' | 'info' | 'concern') => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-astu-green" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'concern':
        return <XCircle className="h-5 w-5 text-astu-red" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const renderKPICard = (kpi: EmploymentKPIMetric) => (
    <div key={kpi.id || kpi.label} className={`p-5 border rounded-xl hover:shadow-lg transition-all duration-300 group ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gradient-to-br from-gray-50 to-white border-gray-200/60'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg group-hover:bg-gray-200 transition-colors ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
          <div className={kpi.color === 'astu-green' ? 'text-astu-green' : kpi.color === 'astu-navy' ? 'text-astu-navy' : kpi.color === 'astu-red' ? 'text-astu-red' : 'text-gray-600'}>
            {getIcon(kpi.icon)}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {getTrendIcon(kpi.trendDirection)}
          <span className={`text-xs font-semibold ${kpi.trendDirection === 'up' ? 'text-astu-green' : kpi.trendDirection === 'down' ? 'text-astu-red' : 'text-gray-400'}`}>
            {Math.abs(kpi.trend)}%
          </span>
        </div>
      </div>
      <p className={`text-xs uppercase tracking-wider mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{kpi.label}</p>
      <p className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{kpi.value}</p>
      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{kpi.comparison}</p>
    </div>
  );

  const filteredRecords = useMemo(() => {
    return recordsList.filter(record => {
      const matchesStatus = filters.employmentStatus === 'All' ? true :
        (record.employmentStatus || '').toLowerCase() === filters.employmentStatus.toLowerCase();

      const query = searchTerm.toLowerCase().trim();
      const matchesSearch = !query ||
        (record.graduateName || '').toLowerCase().includes(query) ||
        (record.studentId || '').toLowerCase().includes(query) ||
        (record.company || '').toLowerCase().includes(query) ||
        (record.jobTitle || '').toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [recordsList, filters.employmentStatus, searchTerm]);

  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((a, b) => {
      const aValue = a[sortField as keyof GraduateEmploymentRecord] || '';
      const bValue = b[sortField as keyof GraduateEmploymentRecord] || '';
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      return 0;
    });
  }, [filteredRecords, sortField, sortDirection]);

  const [recordsPage, setRecordsPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);

  useEffect(() => {
    setRecordsPage(1);
  }, [searchTerm, filters.employmentStatus, filters.department, filters.academicYear]);

  const totalRecordsPages = useMemo(() => {
    return Math.max(1, Math.ceil(sortedRecords.length / recordsPerPage));
  }, [sortedRecords.length, recordsPerPage]);

  const paginatedRecords = useMemo(() => {
    const start = (recordsPage - 1) * recordsPerPage;
    return sortedRecords.slice(start, start + recordsPerPage);
  }, [sortedRecords, recordsPage, recordsPerPage]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#003580]" />
        <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
          Calculating live employment analytics telemetry from database...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Employment Analytics</h2>
            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Comprehensive graduate employment performance metrics calculated directly from database</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 font-medium text-sm cursor-pointer disabled:opacity-50 ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 bg-astu-navy hover:bg-blue-900 text-white rounded-xl transition-all duration-300 font-medium text-sm cursor-pointer"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
          {/* Department Selection: Locked for Department Head, Interactive for Admin */}
          {!isAdmin ? (
            <div className={`px-4 py-2.5 rounded-xl border text-sm font-extrabold flex items-center justify-between gap-2 ${darkMode ? 'bg-slate-700/80 border-slate-600 text-blue-400' : 'bg-blue-50 border-blue-200 text-astu-navy'}`}>
              <div className="flex items-center gap-2 truncate">
                <Lock className="h-4 w-4 shrink-0 text-astu-navy dark:text-blue-400" />
                <span className="truncate">{assignedDept}</span>
              </div>
              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 shrink-0">
                LOCKED SCOPE
              </span>
            </div>
          ) : (
            <select
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              className={`px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-astu-navy/50 transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white'}`}
            >
              {availableDepts.map((d: any) => (
                <option key={d.code} value={d.name}>{d.name} ({d.code})</option>
              ))}
            </select>
          )}

          {/* Academic Cohort Year Dropdown with 40-Year Range (20 years before & 20 years after now) */}
          <select
            value={filters.academicYear}
            onChange={(e) => setFilters({ ...filters, academicYear: e.target.value })}
            className={`px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-astu-navy/50 transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white'}`}
          >
            {full40YearOptions.map((yr: string) => (
              <option key={yr} value={yr}>{yr === 'All' ? 'All Graduating Classes (2006-2046)' : `${yr} Graduating Class`}</option>
            ))}
          </select>

          {/* Quick Status Dropdown */}
          <select
            value={filters.employmentStatus}
            onChange={(e) => setFilters({ ...filters, employmentStatus: e.target.value })}
            className={`px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-astu-navy/50 transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white'}`}
          >
            <option value="All">All Statuses</option>
            <option value="Employed">Employed</option>
            <option value="Unemployed">Unemployed</option>
            <option value="Self-Employed">Self-Employed</option>
            <option value="Further Study">Further Study</option>
          </select>

          {/* REQUIREMENT 3: "Filter More" Modal Button */}
          <button
            type="button"
            onClick={() => setIsFilterModalOpen(true)}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
              (filters.startYear || filters.endYear || (filters.industry && filters.industry !== 'All') || (filters.location && filters.location !== 'All') || filters.salaryMin || (filters.tracerPeriod && filters.tracerPeriod !== 'All'))
                ? 'bg-astu-navy text-white border-astu-navy shadow-md hover:bg-blue-900'
                : darkMode
                ? 'bg-slate-700 border-slate-600 text-gray-200 hover:bg-slate-600'
                : 'bg-gray-100 border-gray-200 text-gray-800 hover:bg-gray-200'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4 text-astu-navy dark:text-blue-400" />
            <span>Filter More</span>
            {(filters.startYear || filters.endYear || (filters.industry && filters.industry !== 'All') || (filters.location && filters.location !== 'All') || filters.salaryMin || (filters.tracerPeriod && filters.tracerPeriod !== 'All')) && (
              <span className="ml-1 px-2 py-0.5 text-[10px] font-black bg-emerald-500 text-white rounded-full">
                Active
              </span>
            )}
          </button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiMetrics.map(renderKPICard)}
      </div>

      {/* Chart Section 1: Employment Trend & Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart
          type="line"
          data={trendData as any}
          xKey="year"
          series={[
            { key: 'employmentRate', label: 'Employment Rate (%)', color: '#008080' }
          ]}
          title="Employment Trend Over Time"
          subtitle="Graduate employment rate by graduation year calculated from database"
          height={280}
          darkMode={darkMode}
        />
        <AnalyticsChart
          type="pie"
          data={statusData as any}
          xKey="status"
          series={[
            { key: 'count', label: 'Graduates' }
          ]}
          title="Employment Status Distribution"
          subtitle="Current employment status distribution calculated from database"
          height={280}
          darkMode={darkMode}
        />
      </div>

      {/* Chart Section 2: Program Performance & Top Industries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart
          type="bar"
          data={programData as any}
          xKey="code"
          series={[
            { key: 'employmentRate', label: 'Employment Rate (%)', color: '#002244' }
          ]}
          title="Employment Rate by Program"
          subtitle="ASTU department program employment performance"
          height={280}
          darkMode={darkMode}
        />
        <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
          <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Top Hiring Industries</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1.5">
            {topIndustries.map((industry: any, index: number) => (
              <div key={index} className="space-y-2">
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

      {/* Top Hiring Companies */}
      <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Top Hiring Companies</h3>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-astu-navy/10 text-astu-navy'}`}>
              {topCompanies.length} {topCompanies.length === 1 ? 'Company' : 'Companies'}
            </span>
          </div>
          
          {topCompanies.length > 3 && (
            <div className="relative w-full sm:w-64">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Filter companies..."
                value={companySearchTerm}
                onChange={(e) => setCompanySearchTerm(e.target.value)}
                className={`w-full pl-9 pr-3 py-1.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-astu-navy/50 transition-all ${
                  darkMode ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white border'
                }`}
              />
              {companySearchTerm && (
                <button
                  onClick={() => setCompanySearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {displayedCompanies.length === 0 ? (
          <div className={`text-center py-8 rounded-xl border border-dashed ${darkMode ? 'bg-slate-800/50 border-slate-700 text-slate-400' : 'bg-gray-50/50 border-gray-200 text-gray-500'}`}>
            <Building2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold">No hiring companies found</p>
            <p className="text-xs mt-1">
              {companySearchTerm ? 'No companies match your search query.' : 'No employer placement records recorded for this department yet.'}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1.5 custom-scrollbar">
              {displayedCompanies.map((company: any, index: number) => {
                const graduateCount = Number(company.graduateCount || company.graduatesHired || 0);
                const percentage = Number(company.percentage || 0);
                
                return (
                  <div
                    key={company.name || index}
                    className={`flex items-center justify-between p-3.5 border rounded-xl transition-all duration-200 hover:shadow-sm ${
                      darkMode ? 'bg-slate-700/80 border-slate-600 hover:bg-slate-700' : 'bg-gradient-to-br from-gray-50 to-white border-gray-200/70 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 shrink-0 bg-astu-navy/10 rounded-lg flex items-center justify-center font-bold text-astu-navy text-xs border border-astu-navy/20">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{company.name}</p>
                        <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{company.industry || 'General Sector'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0 text-right">
                      <div>
                        <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {graduateCount} {graduateCount === 1 ? 'hired' : 'hired'}
                        </p>
                        <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                          {percentage}% of cohort
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredTopCompanies.length > 5 && !companySearchTerm && (
              <div className="mt-4 text-center border-t border-gray-100 dark:border-slate-700 pt-3">
                <button
                  onClick={() => setShowAllCompanies(!showAllCompanies)}
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer ${
                    darkMode
                      ? 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                      : 'bg-gray-100 hover:bg-gray-200 text-astu-navy'
                  }`}
                >
                  {showAllCompanies ? (
                    <>Show Top 5 Only</>
                  ) : (
                    <>Show All ({filteredTopCompanies.length}) Companies <ChevronDown className="h-3.5 w-3.5" /></>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Geographic Distribution */}
      <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Geographic Distribution</h3>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-astu-navy/10 text-astu-navy'}`}>
              Calculated from DB
            </span>
          </div>
          <span className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Total Tracked: {geoDistribution.reduce((acc: number, item: any) => acc + (Number(item.count) || 0), 0)} Graduates
          </span>
        </div>

        {geoDistribution.length === 0 ? (
          <div className={`text-center py-8 rounded-xl border border-dashed ${darkMode ? 'bg-slate-800/50 border-slate-700 text-slate-400' : 'bg-gray-50/50 border-gray-200 text-gray-500'}`}>
            <Globe className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold">No geographic location data available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {geoDistribution.map((region: any, index: number) => {
              const count = Number(region.count || 0);
              const percentage = Number(region.percentage || 0);
              
              let RegionIcon = MapPin;
              if ((region.region || '').toLowerCase().includes('regional') || (region.region || '').toLowerCase().includes('addis')) {
                RegionIcon = Building2;
              } else if ((region.region || '').toLowerCase().includes('international') || (region.region || '').toLowerCase().includes('abroad')) {
                RegionIcon = Globe;
              }

              return (
                <div
                  key={region.region || index}
                  className={`p-4 border rounded-xl transition-all duration-200 ${
                    darkMode ? 'bg-slate-700/80 border-slate-600' : 'bg-gradient-to-br from-gray-50 to-white border-gray-200/70'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1.5 rounded-lg ${darkMode ? 'bg-slate-600 text-slate-300' : 'bg-astu-navy/10 text-astu-navy'}`}>
                      <RegionIcon className="h-4 w-4" />
                    </div>
                    <p className={`text-sm font-semibold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`} title={region.region}>
                      {region.region}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Graduates</p>
                    <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{count}</p>
                  </div>
                  
                  <div className={`w-full h-2 rounded-full overflow-hidden ${darkMode ? 'bg-slate-600' : 'bg-gray-200'}`}>
                    <div
                      className="bg-astu-navy h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">{percentage}% of total</p>
                    <p className={`text-[10px] ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{count} {count === 1 ? 'alumnus' : 'alumni'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Graduate Employment Records Table */}
      <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div>
              <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Graduate Employment Records</h3>
              <p className="text-xs text-slate-500">Live database profiles for {filters.department}</p>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-astu-navy/10 text-astu-navy'}`}>
              {sortedRecords.length} Records
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Page Size Selector */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span>Show</span>
              <select
                value={recordsPerPage}
                onChange={(e) => {
                  setRecordsPerPage(Number(e.target.value));
                  setRecordsPage(1);
                }}
                className={`py-1.5 px-2 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-astu-navy/50 transition-all border ${
                  darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                }`}
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search name, ID, company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-9 pr-8 py-1.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-astu-navy/50 transition-all border ${
                  darkMode ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white'
                }`}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[460px] overflow-y-auto custom-scrollbar border rounded-xl border-gray-200/70 dark:border-slate-700">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className={`${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-100/90 border-gray-200 text-gray-900'} border-b text-xs uppercase tracking-wider`}>
                <th className="px-4 py-3 text-left font-bold cursor-pointer hover:bg-gray-200/50 dark:hover:bg-slate-600 transition-colors" onClick={() => handleSort('studentId')}>
                  Student ID
                </th>
                <th className="px-4 py-3 text-left font-bold cursor-pointer hover:bg-gray-200/50 dark:hover:bg-slate-600 transition-colors" onClick={() => handleSort('graduateName')}>
                  Name
                </th>
                <th className="px-4 py-3 text-left font-bold">Department</th>
                <th className="px-4 py-3 text-left font-bold">Status</th>
                <th className="px-4 py-3 text-left font-bold">Company</th>
                <th className="px-4 py-3 text-left font-bold">Job Title</th>
                <th className="px-4 py-3 text-left font-bold">Country</th>
                <th className="px-4 py-3 text-left font-bold">Salary</th>
                <th className="px-4 py-3 text-left font-bold">Time-to-Hire</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 font-medium">
                    <div className="max-w-sm mx-auto space-y-1">
                      <p className="text-sm font-semibold">No alumni records found</p>
                      <p className="text-xs text-slate-400">No graduate employment records matching current filters in database.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((record) => {
                  const isEmployed = record.employmentStatus === 'Employed';
                  const isSelfEmployed = record.employmentStatus === 'Self-Employed';
                  const isUnemployed = record.employmentStatus === 'Unemployed';
                  const isFurtherStudy = record.employmentStatus === 'Further Study';

                  return (
                    <tr
                      key={record.id || record.studentId}
                      onClick={() => {
                        setSelectedAlumni(record);
                        setActiveAlumniTab('profile');
                      }}
                      title="Click to view full alumni details, profile & settings"
                      className={`transition-colors cursor-pointer hover:bg-astu-navy/5 dark:hover:bg-slate-700/80 ${darkMode ? 'hover:bg-slate-700/60' : ''}`}
                    >
                      <td className={`px-4 py-3 font-mono text-xs font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{record.studentId}</td>
                      <td className={`px-4 py-3 font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{record.graduateName}</td>
                      <td className={`px-4 py-3 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{record.department}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full inline-flex items-center gap-1 ${
                          isEmployed ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300' :
                          isUnemployed ? 'bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300' :
                          isSelfEmployed ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300' :
                          isFurtherStudy ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300' :
                          'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300'
                        }`}>
                          {record.employmentStatus}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                        {isUnemployed ? <span className="text-slate-400 italic">Unemployed</span> : record.company}
                      </td>
                      <td className={`px-4 py-3 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {isUnemployed ? <span className="text-slate-400 italic">Graduate Candidate</span> : record.jobTitle}
                      </td>
                      <td className={`px-4 py-3 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{record.country}</td>
                      <td className="px-4 py-3 text-xs font-bold">
                        {isUnemployed ? (
                          <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-slate-100 dark:bg-slate-700/80 text-slate-500 border border-slate-200 dark:border-slate-600 inline-block">
                            Unemployed (N/A)
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                            {record.salaryRange && record.salaryRange !== 'N/A' ? record.salaryRange : 'ETB 24,000'}
                          </span>
                        )}
                      </td>
                      <td className={`px-4 py-3 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {isUnemployed ? (
                          <span className="text-slate-400 italic">Seeking Placement</span>
                        ) : (
                          record.timeToHire
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        {sortedRecords.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-3 border-t border-gray-100 dark:border-slate-700 text-xs">
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Showing <span className="font-semibold text-gray-900 dark:text-white">{(recordsPage - 1) * recordsPerPage + 1}</span> to{' '}
              <span className="font-semibold text-gray-900 dark:text-white">{Math.min(recordsPage * recordsPerPage, sortedRecords.length)}</span> of{' '}
              <span className="font-semibold text-gray-900 dark:text-white">{sortedRecords.length}</span> records
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setRecordsPage((p) => Math.max(1, p - 1))}
                disabled={recordsPage === 1}
                className={`p-1.5 rounded-lg border transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                  darkMode ? 'border-slate-700 hover:bg-slate-700 text-white' : 'border-gray-200 hover:bg-gray-100 text-gray-700'
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className={`font-semibold px-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Page {recordsPage} of {totalRecordsPages}
              </span>
              <button
                onClick={() => setRecordsPage((p) => Math.min(totalRecordsPages, p + 1))}
                disabled={recordsPage === totalRecordsPages}
                className={`p-1.5 rounded-lg border transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                  darkMode ? 'border-slate-700 hover:bg-slate-700 text-white' : 'border-gray-200 hover:bg-gray-100 text-gray-700'
                }`}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Top Employers Table */}
      <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Top Employers</h3>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-astu-navy/10 text-astu-navy'}`}>
              Calculated from DB
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Filter for Top Employers */}
            <div className="relative w-48 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Filter employers..."
                value={topEmployerSearchTerm}
                onChange={(e) => setTopEmployerSearchTerm(e.target.value)}
                className={`w-full pl-9 pr-7 py-1.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-astu-navy/50 ${
                  darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                }`}
              />
              {topEmployerSearchTerm && (
                <button
                  onClick={() => setTopEmployerSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto max-h-80 overflow-y-auto custom-scrollbar border rounded-xl border-gray-200/70 dark:border-slate-700">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className={`${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gray-100 border-gray-200'} border-b`}>
                <th className={`px-4 py-3 text-left font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Employer</th>
                <th className={`px-4 py-3 text-left font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Graduates Hired</th>
                <th className={`px-4 py-3 text-left font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Industry</th>
                <th className={`px-4 py-3 text-left font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Average Salary</th>
                <th className={`px-4 py-3 text-left font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Last Hire Date</th>
              </tr>
            </thead>
            <tbody>
              {displayedTopEmployers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 font-medium">
                    <div className="max-w-xs mx-auto space-y-1">
                      <Building2 className="w-8 h-8 mx-auto opacity-40 mb-1" />
                      <p className="text-sm font-semibold">No top employer records found</p>
                      <p className="text-xs text-slate-400">
                        {topEmployerSearchTerm ? 'No employers match your search query.' : 'No employer placement records in database.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                displayedTopEmployers.map((employer: any, index: number) => (
                  <tr key={index} className={`border-b hover:bg-gray-50/80 transition-colors ${darkMode ? 'border-slate-700 hover:bg-slate-700/80' : 'border-gray-100'}`}>
                    <td className={`px-4 py-3 font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{employer.employer}</td>
                    <td className={`px-4 py-3 font-bold ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>{employer.graduatesHired} graduates</td>
                    <td className={`px-4 py-3 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{employer.industry}</td>
                    <td className={`px-4 py-3 text-xs font-bold text-emerald-600 dark:text-emerald-400`}>{employer.averageSalary}</td>
                    <td className={`px-4 py-3 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{employer.lastHireDate}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredTopEmployers.length > 5 && !topEmployerSearchTerm && (
          <div className="mt-3 text-center border-t border-gray-100 dark:border-slate-700 pt-3">
            <button
              onClick={() => setShowAllTopEmployers(!showAllTopEmployers)}
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer ${
                darkMode
                  ? 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                  : 'bg-gray-100 hover:bg-gray-200 text-astu-navy'
              }`}
            >
              {showAllTopEmployers ? (
                <>Show Top 5 Only</>
              ) : (
                <>Show All ({filteredTopEmployers.length}) Employers <ChevronDown className="h-3.5 w-3.5" /></>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Insights Panel */}
      <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
        <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Executive Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.map((insight: any) => (
            <div key={insight.id || insight.title} className={`p-4 border rounded-xl ${
              darkMode ? 'bg-slate-700 border-slate-600' :
              insight.type === 'success' ? 'bg-emerald-50 border-emerald-200' :
              insight.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
              insight.type === 'concern' ? 'bg-red-50 border-red-200' :
              'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-start gap-3 mb-2">
                {getInsightIcon(insight.type)}
                <div>
                  <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{insight.title}</p>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{insight.description}</p>
                </div>
              </div>
              <div className={`flex items-center justify-between mt-3 pt-3 border-t ${darkMode ? 'border-slate-600' : 'border-gray-200/50'}`}>
                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{insight.metric}</span>
                <span className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{insight.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Telemetry Filters Modal */}
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
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Scope Target: {filters.department}</p>
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
                    value={filters.employmentStatus || 'All'}
                    onChange={(e) => setFilters({ ...filters, employmentStatus: e.target.value })}
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
                    batch: '2024',
                    academicYear: 'All',
                    employmentStatus: 'All',
                    startYear: '',
                    endYear: '',
                    industry: 'All',
                    location: 'All',
                    salaryMin: '',
                    tracerPeriod: 'All',
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
                  fetchAnalytics(true);
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
      {/* RICH ALUMNI DETAILS MODAL */}
      {selectedAlumni && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className={`relative w-full max-w-4xl rounded-3xl shadow-2xl border overflow-hidden flex flex-col max-h-[90vh] transition-all animate-in fade-in zoom-in-95 duration-200 ${
            darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-200/80 text-gray-900'
          }`}>
            
            {/* Modal Header Banner */}
            <div className="bg-gradient-to-r from-[#002244] via-[#003580] to-[#0055b3] p-6 text-white relative shrink-0">
              <button
                onClick={() => setSelectedAlumni(null)}
                className="absolute right-5 top-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Close modal"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pr-10">
                {/* Avatar / Profile Picture */}
                <div className="relative shrink-0">
                  {selectedAlumni.profilePicture ? (
                    <img
                      src={selectedAlumni.profilePicture}
                      alt={selectedAlumni.graduateName}
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-white/40 shadow-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/30 flex items-center justify-center font-black text-2xl text-white shadow-lg">
                      {selectedAlumni.graduateName?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'AL'}
                    </div>
                  )}
                  {selectedAlumni.isVerified && (
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full shadow-md" title="Verified Alumni Profile">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                  )}
                </div>

                {/* Main Name & Key Pills */}
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-extrabold tracking-tight truncate">{selectedAlumni.graduateName}</h2>
                    <span className="bg-white/20 font-mono text-xs font-bold px-2.5 py-0.5 rounded-full border border-white/20">
                      {selectedAlumni.studentId}
                    </span>
                    <span className={`text-xs font-bold px-3 py-0.5 rounded-full shadow-sm ${
                      selectedAlumni.employmentStatus === 'Employed' ? 'bg-emerald-500 text-white' :
                      selectedAlumni.employmentStatus === 'Self-Employed' ? 'bg-blue-500 text-white' :
                      selectedAlumni.employmentStatus === 'Further Study' ? 'bg-purple-500 text-white' :
                      'bg-red-500 text-white'
                    }`}>
                      {selectedAlumni.employmentStatus}
                    </span>
                  </div>

                  <p className="text-xs text-white/80 font-medium">
                    {selectedAlumni.department} ({selectedAlumni.departmentCode || 'ASTU'}) • Class of {selectedAlumni.graduationYear || '2024'}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-white/90">
                    <span className="inline-flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
                      <GraduationCap className="h-3.5 w-3.5" /> CGPA: <strong className="text-emerald-300">{selectedAlumni.cgpa || 'N/A'}</strong>
                    </span>
                    <span className="inline-flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
                      <MapPin className="h-3.5 w-3.5" /> {selectedAlumni.country || 'Ethiopia'}
                    </span>
                    {selectedAlumni.company !== 'N/A' && (
                      <span className="inline-flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
                        <Building2 className="h-3.5 w-3.5" /> {selectedAlumni.company}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Sub-Header Tabs */}
            <div className={`flex border-b px-6 overflow-x-auto shrink-0 ${darkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-slate-50 border-gray-200'}`}>
              <button
                onClick={() => setActiveAlumniTab('profile')}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeAlumniTab === 'profile'
                    ? 'border-astu-navy text-astu-navy dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <User className="h-4 w-4" />
                Personal Profile & Bio
              </button>
              <button
                onClick={() => setActiveAlumniTab('career')}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeAlumniTab === 'career'
                    ? 'border-astu-navy text-astu-navy dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <Briefcase className="h-4 w-4" />
                Career & Experience
              </button>
              <button
                onClick={() => setActiveAlumniTab('portfolio')}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeAlumniTab === 'portfolio'
                    ? 'border-astu-navy text-astu-navy dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <Award className="h-4 w-4" />
                Skills & Certifications ({selectedAlumni.skills?.length || 0})
              </button>
              <button
                onClick={() => setActiveAlumniTab('settings')}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeAlumniTab === 'settings'
                    ? 'border-astu-navy text-astu-navy dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Portal Preferences & Settings
              </button>
            </div>

            {/* Modal Scrollable Body Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">

              {/* TAB 1: PERSONAL PROFILE & BIO */}
              {activeAlumniTab === 'profile' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Personal Bio */}
                  <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200/80'}`}>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">Personal Biography</h4>
                    <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                      {selectedAlumni.bio || 'No biography recorded in alumni profile settings yet.'}
                    </p>
                  </div>

                  {/* Personal Information Grid */}
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">Identity & Demographics</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-gray-200'}`}>
                        <span className="text-[11px] text-slate-400 block font-medium">Email Address</span>
                        <span className="text-xs font-bold truncate block">{selectedAlumni.email}</span>
                      </div>
                      <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-gray-200'}`}>
                        <span className="text-[11px] text-slate-400 block font-medium">Phone Number</span>
                        <span className="text-xs font-bold truncate block">{selectedAlumni.phone}</span>
                      </div>
                      <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-gray-200'}`}>
                        <span className="text-[11px] text-slate-400 block font-medium">Gender</span>
                        <span className="text-xs font-bold capitalize block">{selectedAlumni.gender}</span>
                      </div>
                      <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-gray-200'}`}>
                        <span className="text-[11px] text-slate-400 block font-medium">Date of Birth</span>
                        <span className="text-xs font-bold block">{selectedAlumni.dateOfBirth}</span>
                      </div>
                      <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-gray-200'}`}>
                        <span className="text-[11px] text-slate-400 block font-medium">Nationality</span>
                        <span className="text-xs font-bold block">{selectedAlumni.nationality}</span>
                      </div>
                      <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-gray-200'}`}>
                        <span className="text-[11px] text-slate-400 block font-medium">Marital Status</span>
                        <span className="text-xs font-bold block">{selectedAlumni.maritalStatus}</span>
                      </div>
                      <div className={`p-3.5 rounded-xl border col-span-full ${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-gray-200'}`}>
                        <span className="text-[11px] text-slate-400 block font-medium">Current Address / Location</span>
                        <span className="text-xs font-bold block">{selectedAlumni.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Languages Spoken */}
                  {selectedAlumni.languages && selectedAlumni.languages.length > 0 && (
                    <div>
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">Languages Spoken</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedAlumni.languages.map((lang: string, i: number) => (
                          <span key={i} className={`text-xs font-bold px-3 py-1 rounded-lg border ${
                            darkMode ? 'bg-slate-700 border-slate-600 text-blue-300' : 'bg-blue-50 border-blue-200 text-astu-navy'
                          }`}>
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Social & Contact Actions */}
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">Contact & Social Networks</h4>
                    <div className="flex flex-wrap items-center gap-3">
                      {selectedAlumni.email && selectedAlumni.email !== 'N/A' && (
                        <a href={`mailto:${selectedAlumni.email}`} className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl bg-astu-navy text-white hover:bg-blue-900 transition-all shadow-sm">
                          <Mail className="h-4 w-4" /> Send Email
                        </a>
                      )}
                      {selectedAlumni.phone && selectedAlumni.phone !== 'N/A' && (
                        <a href={`tel:${selectedAlumni.phone}`} className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-sm">
                          <Phone className="h-4 w-4" /> Call Phone
                        </a>
                      )}
                      {selectedAlumni.linkedIn && (
                        <a href={selectedAlumni.linkedIn} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl bg-[#0077b5] text-white hover:brightness-110 transition-all">
                          <Linkedin className="h-4 w-4" /> LinkedIn
                        </a>
                      )}
                      {selectedAlumni.gitHub && (
                        <a href={selectedAlumni.gitHub} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all">
                          <Github className="h-4 w-4" /> GitHub
                        </a>
                      )}
                      {selectedAlumni.portfolio && (
                        <a href={selectedAlumni.portfolio} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-all">
                          <Globe className="h-4 w-4" /> Portfolio
                        </a>
                      )}
                      {selectedAlumni.resumeUrl && (
                        <a href={selectedAlumni.resumeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl bg-amber-600 text-white hover:bg-amber-700 transition-all">
                          <FileText className="h-4 w-4" /> Download Resume
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CAREER & WORK EXPERIENCE */}
              {activeAlumniTab === 'career' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Current Position Snapshot */}
                  <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-700/60 border-slate-600' : 'bg-gradient-to-br from-gray-50 to-blue-50/30 border-blue-100'}`}>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-astu-navy dark:text-blue-400 mb-3">Current Employment Status Snapshot</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 block font-medium">Company Name</span>
                        <strong className="text-sm block font-bold">{selectedAlumni.company}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Job Title / Role</span>
                        <strong className="text-sm block font-bold">{selectedAlumni.jobTitle}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Salary Telemetry</span>
                        <strong className="text-sm block font-bold text-emerald-600 dark:text-emerald-400">{selectedAlumni.salaryRange}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Time-to-Hire</span>
                        <strong className="text-sm block font-bold">{selectedAlumni.timeToHire}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Work Experience History */}
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">Work Experience Timeline</h4>
                    {selectedAlumni.experiences && selectedAlumni.experiences.length > 0 ? (
                      <div className="space-y-4">
                        {selectedAlumni.experiences.map((exp: any, idx: number) => (
                          <div key={exp.id || idx} className={`p-4 rounded-xl border relative pl-6 border-l-4 border-l-astu-navy ${
                            darkMode ? 'bg-slate-700/40 border-slate-600' : 'bg-white border-gray-200'
                          }`}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                              <h5 className="text-sm font-bold">{exp.title || 'Position Role'}</h5>
                              <span className="text-xs font-semibold text-slate-400">
                                {exp.startDate ? new Date(exp.startDate).getFullYear() : ''} - {exp.isCurrent ? 'Present' : exp.endDate ? new Date(exp.endDate).getFullYear() : 'N/A'}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-astu-navy dark:text-blue-400 mb-2">
                              {exp.companyName} {exp.location ? `• ${exp.location}` : ''}
                            </p>
                            {exp.description && (
                              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{exp.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={`p-6 text-center rounded-xl border border-dashed text-xs text-slate-400 ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                        No work experience history records submitted in portal profile yet.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: SKILLS, PROJECTS & CERTIFICATIONS */}
              {activeAlumniTab === 'portfolio' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Skills Tags */}
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">Technical & Professional Skills</h4>
                    {selectedAlumni.skills && selectedAlumni.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedAlumni.skills.map((skill: string, i: number) => (
                          <span key={i} className="text-xs font-bold px-3 py-1.5 rounded-xl bg-astu-navy/10 text-astu-navy border border-astu-navy/20 dark:bg-slate-700 dark:text-blue-300 dark:border-slate-600">
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No skills listed yet.</p>
                    )}
                  </div>

                  {/* Certifications List */}
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">Certifications & Credentials</h4>
                    {selectedAlumni.certifications && selectedAlumni.certifications.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedAlumni.certifications.map((cert: any, i: number) => (
                          <div key={cert.id || i} className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-700/40 border-slate-600' : 'bg-white border-gray-200'}`}>
                            <p className="text-xs font-bold">{cert.name}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">{cert.issuer} {cert.issueDate ? `• ${cert.issueDate}` : ''}</p>
                            {cert.credentialUrl && (
                              <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 mt-1 hover:underline">
                                View Credential <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No certification records logged.</p>
                    )}
                  </div>

                  {/* Projects Portfolio */}
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">Key Projects & Portfolio Work</h4>
                    {selectedAlumni.projects && selectedAlumni.projects.length > 0 ? (
                      <div className="space-y-3">
                        {selectedAlumni.projects.map((proj: any, i: number) => (
                          <div key={proj.id || i} className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-700/40 border-slate-600' : 'bg-white border-gray-200'}`}>
                            <div className="flex items-center justify-between">
                              <h5 className="text-xs font-bold">{proj.title}</h5>
                              {proj.projectUrl && (
                                <a href={proj.projectUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1">
                                  Link <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-300 mt-1">{proj.description}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No portfolio projects uploaded.</p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: PORTAL PREFERENCES & SETTINGS */}
              {activeAlumniTab === 'settings' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-4">
                      Alumni Portal Profile & Settings Preferences
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                        <span className="text-[11px] text-slate-400 block font-medium">Preferred Target Role</span>
                        <strong className="text-xs font-bold block mt-0.5">{selectedAlumni.preferences?.currentRole || selectedAlumni.preferences?.preferredJobTypes || selectedAlumni.jobTitle}</strong>
                      </div>

                      <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                        <span className="text-[11px] text-slate-400 block font-medium">Target Industry Sector</span>
                        <strong className="text-xs font-bold block mt-0.5">{selectedAlumni.preferences?.industry || 'Technology & Engineering'}</strong>
                      </div>

                      <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                        <span className="text-[11px] text-slate-400 block font-medium">Preferred Work Location</span>
                        <strong className="text-xs font-bold block mt-0.5">{selectedAlumni.preferences?.location || selectedAlumni.preferences?.preferredLocations || selectedAlumni.country}</strong>
                      </div>

                      <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                        <span className="text-[11px] text-slate-400 block font-medium">Employment Type Preference</span>
                        <strong className="text-xs font-bold block mt-0.5">{selectedAlumni.preferences?.employmentType || 'Full-Time / Direct Placement'}</strong>
                      </div>

                      <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                        <span className="text-[11px] text-slate-400 block font-medium">Desired Minimum Salary</span>
                        <strong className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                          {selectedAlumni.preferences?.desiredSalaryMin ? `ETB ${Number(selectedAlumni.preferences.desiredSalaryMin).toLocaleString()}` : selectedAlumni.salaryRange}
                        </strong>
                      </div>

                      <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                        <span className="text-[11px] text-slate-400 block font-medium">Profile Privacy Settings</span>
                        <strong className="text-xs font-bold block mt-0.5">
                          {selectedAlumni.preferences?.privacySettings?.publicProfile === false ? 'Private Profile' : 'Public Department Directory Verified'}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className={`p-4 px-6 border-t flex justify-between items-center shrink-0 ${darkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
              <span className="text-xs text-slate-400">
                Alumni ID: {selectedAlumni.id}
              </span>
              <button
                onClick={() => setSelectedAlumni(null)}
                className="px-5 py-2 text-xs font-bold bg-astu-navy hover:bg-blue-900 text-white rounded-xl shadow-md transition-all cursor-pointer"
              >
                Close Profile
              </button>
            </div>

          </div>
        </div>
      )}

      {/* PROFESSIONAL ANALYTICS EXPORT MODAL */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className={`relative w-full max-w-3xl rounded-3xl shadow-2xl border overflow-hidden flex flex-col max-h-[90vh] transition-all ${
            darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            
            {/* Modal Header Banner */}
            <div className="bg-gradient-to-r from-[#002244] via-[#003580] to-[#0055b3] p-6 text-white relative shrink-0">
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="absolute right-5 top-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Close modal"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
                  <Download className="h-6 w-6 text-blue-300" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight">Department Analytics Export Center</h2>
                  <p className="text-xs text-blue-100 font-medium mt-0.5">
                    Generate &amp; download verified institutional reports for {filters.department}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">

              {/* 1. Format Selection */}
              <div>
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 block">
                  1. Select Export Format
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={() => setExportFormat('pdf')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      exportFormat === 'pdf'
                        ? 'border-astu-navy bg-blue-50/70 dark:bg-slate-800 dark:border-blue-400 ring-2 ring-astu-navy/30'
                        : darkMode ? 'bg-slate-800/60 border-slate-700 hover:bg-slate-800' : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <FileText className={`h-5 w-5 ${exportFormat === 'pdf' ? 'text-astu-navy dark:text-blue-400' : 'text-slate-400'}`} />
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-astu-navy dark:text-blue-300">PRINT / PDF</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold">PDF Report</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Official ASTU document with seal logo &amp; headers</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportFormat('excel')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      exportFormat === 'excel'
                        ? 'border-emerald-600 bg-emerald-50/70 dark:bg-slate-800 dark:border-emerald-400 ring-2 ring-emerald-500/30'
                        : darkMode ? 'bg-slate-800/60 border-slate-700 hover:bg-slate-800' : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <FileText className={`h-5 w-5 ${exportFormat === 'excel' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">EXCEL</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold">Excel (.xls)</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Formatted multi-sheet spreadsheet for analysis</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportFormat('csv')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      exportFormat === 'csv'
                        ? 'border-amber-600 bg-amber-50/70 dark:bg-slate-800 dark:border-amber-400 ring-2 ring-amber-500/30'
                        : darkMode ? 'bg-slate-800/60 border-slate-700 hover:bg-slate-800' : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <FileText className={`h-5 w-5 ${exportFormat === 'csv' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`} />
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">CSV DATA</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold">CSV Table</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Flat tabular CSV file for data science tools</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportFormat('json')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      exportFormat === 'json'
                        ? 'border-purple-600 bg-purple-50/70 dark:bg-slate-800 dark:border-purple-400 ring-2 ring-purple-500/30'
                        : darkMode ? 'bg-slate-800/60 border-slate-700 hover:bg-slate-800' : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <FileText className={`h-5 w-5 ${exportFormat === 'json' ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'}`} />
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300">JSON</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold">JSON Packet</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Machine-readable raw API telemetry payload</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* 2. Data Scope Selection */}
              <div>
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 block">
                  2. Select Report Content Scope
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                    exportScope === 'all'
                      ? 'border-astu-navy bg-blue-50/50 dark:bg-slate-800 dark:border-blue-400'
                      : darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-gray-200'
                  }`}>
                    <input
                      type="radio"
                      name="exportScope"
                      checked={exportScope === 'all'}
                      onChange={() => setExportScope('all')}
                      className="text-astu-navy focus:ring-astu-navy"
                    />
                    <div>
                      <span className="text-xs font-bold block">All Analytics &amp; Roster Telemetry</span>
                      <span className="text-[11px] text-slate-400 block">Complete report including KPIs, trends, top employers &amp; full alumni roster</span>
                    </div>
                  </label>

                  <label className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                    exportScope === 'roster'
                      ? 'border-astu-navy bg-blue-50/50 dark:bg-slate-800 dark:border-blue-400'
                      : darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-gray-200'
                  }`}>
                    <input
                      type="radio"
                      name="exportScope"
                      checked={exportScope === 'roster'}
                      onChange={() => setExportScope('roster')}
                      className="text-astu-navy focus:ring-astu-navy"
                    />
                    <div>
                      <span className="text-xs font-bold block">Alumni Roster Records Only</span>
                      <span className="text-[11px] text-slate-400 block">Export graduate employment records, companies, titles &amp; salaries</span>
                    </div>
                  </label>

                  <label className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                    exportScope === 'employers'
                      ? 'border-astu-navy bg-blue-50/50 dark:bg-slate-800 dark:border-blue-400'
                      : darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-gray-200'
                  }`}>
                    <input
                      type="radio"
                      name="exportScope"
                      checked={exportScope === 'employers'}
                      onChange={() => setExportScope('employers')}
                      className="text-astu-navy focus:ring-astu-navy"
                    />
                    <div>
                      <span className="text-xs font-bold block">Top Employers &amp; Corporate Industry Partners</span>
                      <span className="text-[11px] text-slate-400 block">Employer hiring counts, industry sectors &amp; average salaries</span>
                    </div>
                  </label>

                  <label className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                    exportScope === 'skills'
                      ? 'border-astu-navy bg-blue-50/50 dark:bg-slate-800 dark:border-blue-400'
                      : darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-gray-200'
                  }`}>
                    <input
                      type="radio"
                      name="exportScope"
                      checked={exportScope === 'skills'}
                      onChange={() => setExportScope('skills')}
                      className="text-astu-navy focus:ring-astu-navy"
                    />
                    <div>
                      <span className="text-xs font-bold block">Curriculum Skill Match &amp; ABET Alignment Matrix</span>
                      <span className="text-[11px] text-slate-400 block">Skill coverage telemetry, industry demand percentages &amp; recommendations</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* 3. Scope Filters & Customizations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1.5 block">
                    Filter Alumni Account Status
                  </label>
                  <select
                    value={exportStatusFilter}
                    onChange={(e) => setExportStatusFilter(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-astu-navy/50 ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-slate-900'
                    }`}
                  >
                    <option value="ALL">All Account Statuses</option>
                    <option value="ACTIVE">Verified Active Alumni Only</option>
                    <option value="PENDING VERIFICATION">Pending Verification Only</option>
                    <option value="INACTIVE">Inactive Records Only</option>
                  </select>
                </div>

                <div className="space-y-2 pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                    <input
                      type="checkbox"
                      checked={includeLogo}
                      onChange={(e) => setIncludeLogo(e.target.checked)}
                      className="rounded text-astu-navy focus:ring-astu-navy"
                    />
                    <span>Include Official ASTU University Seal &amp; Header</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                    <input
                      type="checkbox"
                      checked={includeInsights}
                      onChange={(e) => setIncludeInsights(e.target.checked)}
                      className="rounded text-astu-navy focus:ring-astu-navy"
                    />
                    <span>Include Executive Insights &amp; Recommendations</span>
                  </label>
                </div>
              </div>

              {/* Export Summary Box */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-blue-50/60 border-blue-200'
              }`}>
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-astu-navy dark:text-blue-400" />
                  <div>
                    <p className="text-xs font-bold">Target Department: {filters.department}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Cohort: {filters.academicYear === 'All' ? 'All Classes (2006-2046)' : `${filters.academicYear} Class`} • Format: {exportFormat.toUpperCase()}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-500 text-white shadow-xs">
                  READY
                </span>
              </div>

            </div>

            {/* Modal Footer */}
            <div className={`p-4 px-6 border-t flex items-center justify-between shrink-0 ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-gray-50 border-gray-200'
            }`}>
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className={`px-4 py-2 text-xs font-extrabold rounded-xl border transition-colors cursor-pointer ${
                  darkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={exporting}
                onClick={handleExportSubmit}
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-extrabold bg-astu-navy hover:bg-blue-900 text-white rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {exporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating Report...
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
      )}
    </div>
  );
};

export default EmploymentAnalytics;
