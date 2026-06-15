import React, { useState, useMemo } from 'react';
import {
  TrendingUp, TrendingDown, Briefcase, Clock, DollarSign, Globe, MapPin, Target,
  RefreshCw, Download, ArrowUp, ArrowDown, Minus, Search, Filter, ChevronDown,
  CheckCircle2, AlertTriangle, Info, XCircle
} from 'lucide-react';
import { AnalyticsChart } from '../../../shared/components/AnalyticsChart';
import {
  EmploymentAnalyticsFilters,
  EmploymentKPIMetric,
  EmploymentTrendData,
  EmploymentStatusData,
  ProgramEmploymentData,
  HiringIndustry,
  HiringCompany,
  GeographicDistribution,
  GraduateEmploymentRecord,
  TopEmployer,
  EmploymentInsight
} from '../types/employmentAnalytics.types';

interface EmploymentAnalyticsProps {
  data?: any;
  darkMode?: boolean;
}

export const EmploymentAnalytics: React.FC<EmploymentAnalyticsProps> = ({ data, darkMode = false }) => {
  const [filters, setFilters] = useState<EmploymentAnalyticsFilters>({
    department: 'Computer Science',
    batch: '2024',
    academicYear: '2024',
    employmentStatus: 'All'
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('graduateName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Use data from props or provide empty defaults
  const employmentKPIMetrics: EmploymentKPIMetric[] = data?.kpiMetrics || [];
  const employmentTrendData: EmploymentTrendData[] = data?.trendData || [];
  const employmentStatusData: EmploymentStatusData[] = data?.statusData || [];
  const programEmploymentData: ProgramEmploymentData[] = data?.programData || [];
  const hiringIndustries: HiringIndustry[] = data?.hiringIndustries || [];
  const hiringCompanies: HiringCompany[] = data?.hiringCompanies || [];
  const geographicDistribution: GeographicDistribution[] = data?.geographicDistribution || [];
  const graduateEmploymentRecords: GraduateEmploymentRecord[] = data?.graduateRecords || [];
  const topEmployers: TopEmployer[] = data?.topEmployers || [];
  const employmentInsights: EmploymentInsight[] = data?.insights || [];

  const handleRefresh = () => {
    console.log('Refreshing employment analytics data...');
  };

  const handleExport = () => {
    console.log('Exporting employment analytics...');
  };

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
        return <Info className="h-5 w-5 text-astu-navy" />;
    }
  };

  const renderKPICard = (kpi: EmploymentKPIMetric) => (
    <div className={`p-5 border rounded-xl hover:shadow-lg transition-all duration-300 group ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gradient-to-br from-gray-50 to-white border-gray-200/60'}`}>
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
    return graduateEmploymentRecords.filter(record => {
      const matchesSearch = searchTerm === '' || 
        record.graduateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.company.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [searchTerm]);

  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((a, b) => {
      const aValue = a[sortField as keyof GraduateEmploymentRecord];
      const bValue = b[sortField as keyof GraduateEmploymentRecord];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      return 0;
    });
  }, [filteredRecords, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className={`rounded-2xl p-6 border shadow-lg relative overflow-hidden ${darkMode ? 'bg-slate-900/60 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">Employment Analytics</h2>
            <p className="text-xs mt-1 text-gray-400 dark:text-gray-500 font-medium">Comprehensive graduate employment performance metrics and career tracking data</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto mt-2 md:mt-0">
            <button
              onClick={handleRefresh}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-xs hover:scale-105 active:scale-95 transition-all duration-300 ${darkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-750 text-gray-200' : 'bg-gray-100 border-gray-200 hover:bg-gray-200 text-gray-700'}`}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#003580] to-[#0a4fa6] hover:from-[#0a4fa6] hover:to-[#003580] text-white rounded-xl shadow-md shadow-emerald-900/10 hover:shadow-lg transition-all duration-300 font-bold text-xs"
            >
              <Download className="h-4 w-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border-t border-gray-200/5 dark:border-white/5 pt-5">
          <select
            value={filters.department}
            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            className={`px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-semibold border ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'}`}
          >
            <option value="Computer Science">Computer Science</option>
            <option value="Software Engineering">Software Engineering</option>
            <option value="Electrical Engineering">Electrical Engineering</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
          </select>
          <select
            value={filters.batch}
            onChange={(e) => setFilters({ ...filters, batch: e.target.value })}
            className={`px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-semibold border ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'}`}
          >
            <option value="2024">Batch: 2024</option>
            <option value="2023">Batch: 2023</option>
            <option value="2022">Batch: 2022</option>
          </select>
          <select
            value={filters.academicYear}
            onChange={(e) => setFilters({ ...filters, academicYear: e.target.value })}
            className={`px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-semibold border ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'}`}
          >
            <option value="2024">Academic Year: 2024</option>
            <option value="2023">Academic Year: 2023</option>
            <option value="2022">Academic Year: 2022</option>
          </select>
          <select
            value={filters.employmentStatus}
            onChange={(e) => setFilters({ ...filters, employmentStatus: e.target.value })}
            className={`px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-semibold border ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'}`}
          >
            <option value="All">All Status</option>
            <option value="Employed">Employed</option>
            <option value="Unemployed">Unemployed</option>
            <option value="Self-Employed">Self-Employed</option>
            <option value="Further Study">Further Study</option>
          </select>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {employmentKPIMetrics.map(renderKPICard)}
      </div>

      {/* Chart Section 1: Employment Trend & Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart
          type="line"
          data={employmentTrendData as any}
          xKey="year"
          series={[
            { key: 'employmentRate', label: 'Employment Rate (%)', color: '#10B981' }
          ]}
          title="Employment Trend Over Time"
          subtitle="Graduate employment rate by graduation year"
          height={280}
        />
        <AnalyticsChart
          type="pie"
          data={employmentStatusData as any}
          xKey="status"
          series={[
            { key: 'count', label: 'Graduates' }
          ]}
          title="Employment Status Distribution"
          subtitle="Current employment status of graduates"
          height={280}
        />
      </div>

      {/* Chart Section 2: Program Performance & Top Industries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart
          type="bar"
          data={programEmploymentData as any}
          xKey="program"
          series={[
            { key: 'employmentRate', label: 'Employment Rate (%)', color: '#3B82F6' }
          ]}
          title="Employment Rate by Program"
          subtitle="Program-level employment performance"
          height={280}
        />
        <div className={`rounded-2xl p-6 border shadow-lg ${darkMode ? 'bg-slate-900/60 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
          <h3 className="text-lg font-extrabold tracking-tight mb-5">Top Hiring Industries</h3>
          <div className="space-y-4">
            {hiringIndustries.map((industry, index) => (
              <div key={index} className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-extrabold tracking-tight text-gray-700 dark:text-gray-300">{industry.name}</p>
                  <p className="text-xs font-bold text-blue-500">{industry.percentage}%</p>
                </div>
                <div className={`w-full h-2.5 rounded-full overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
                  <div className="bg-gradient-to-r from-blue-500 to-blue-400 h-full rounded-full" style={{ width: `${industry.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Hiring Companies */}
      <div className={`rounded-2xl p-6 border shadow-lg ${darkMode ? 'bg-slate-900/60 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
        <h3 className="text-lg font-extrabold tracking-tight mb-5">Top Hiring Companies</h3>
        <div className="space-y-3">
          {hiringCompanies.map((company, index) => (
            <div key={index} className={`flex items-center justify-between p-4 border rounded-2xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-gray-50/50 border-gray-150'}`}>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto mt-2 md:mt-0">
                <div className="w-9 h-9 bg-blue-500/10 rounded-xl flex items-center justify-center font-bold text-blue-500 dark:text-blue-400 text-sm border border-blue-500/20">
                  {index + 1}
                </div>
                <div>
                  <p className="text-sm font-extrabold tracking-tight">{company.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-550 mt-0.5">{company.industry}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm font-extrabold tracking-tight">{company.graduatesHired} hired</p>
                  <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 text-[10px] font-bold mt-1 ${company.changeDirection === 'up' ? '' : 'bg-rose-500/10 text-rose-500'}`}>
                    {getTrendIcon(company.changeDirection)}
                    <span>{Math.abs(company.change)}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Geographic Distribution */}
      <div className={`rounded-2xl p-6 border shadow-lg ${darkMode ? 'bg-slate-900/60 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
        <h3 className="text-lg font-extrabold tracking-tight mb-5">Geographic Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {geographicDistribution.map((region, index) => (
            <div key={index} className={`p-5 border rounded-2xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-gray-50/50 border-gray-150'}`}>
              <p className="text-sm font-extrabold tracking-tight mb-3">{region.region}</p>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-450 dark:text-gray-500 font-semibold">Graduates</p>
                <p className="text-sm font-extrabold">{region.count}</p>
              </div>
              <div className={`w-full h-2.5 rounded-full overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
                <div className="bg-gradient-to-r from-astu-navy to-blue-400 h-full rounded-full" style={{ width: `${region.percentage}%` }}></div>
              </div>
              <p className="text-xs font-bold text-blue-500 mt-2">{region.percentage}% distribution</p>
            </div>
          ))}
        </div>
      </div>

      {/* Graduate Employment Records Table */}
      <div className={`rounded-2xl p-6 border shadow-lg ${darkMode ? 'bg-slate-900/60 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
          <h3 className="text-lg font-extrabold tracking-tight">Graduate Employment Records</h3>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search name, company, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-11 pr-4 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all w-full md:w-64 border ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white'}`}
              />
            </div>
          </div>
        </div>
        <div className="dept-table-wrapper overflow-x-auto">
          <table className="dept-table w-full">
            <thead>
              <tr>
                <th className="cursor-pointer" onClick={() => handleSort('studentId')}>
                  Student ID
                </th>
                <th className="cursor-pointer" onClick={() => handleSort('graduateName')}>
                  Name
                </th>
                <th>Department</th>
                <th>Status</th>
                <th>Company</th>
                <th>Job Title</th>
                <th>Country</th>
                <th>Salary Range</th>
                <th>Time-to-Hire</th>
              </tr>
            </thead>
            <tbody>
              {sortedRecords.map((record) => (
                <tr key={record.id}>
                  <td className="font-mono text-xs font-semibold">{record.studentId}</td>
                  <td className="font-extrabold">{record.graduateName}</td>
                  <td className="text-gray-400 dark:text-gray-450 font-medium">{record.department}</td>
                  <td>
                    <span className={`dept-badge ${
                      record.employmentStatus === 'Employed' ? 'dept-badge-success' :
                      record.employmentStatus === 'Unemployed' ? 'dept-badge-danger' :
                      record.employmentStatus === 'Self-Employed' ? 'dept-badge-info' :
                      'dept-badge-warning'
                    }`}>
                      {record.employmentStatus}
                    </span>
                  </td>
                  <td className="font-semibold">{record.company}</td>
                  <td className="text-gray-400 dark:text-gray-450">{record.jobTitle}</td>
                  <td className="text-gray-450 dark:text-gray-500">{record.country}</td>
                  <td className="font-semibold text-blue-500">{record.salaryRange}</td>
                  <td className="text-gray-450 dark:text-gray-500">{record.timeToHire}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Employers Table */}
      <div className={`rounded-2xl p-6 border shadow-lg ${darkMode ? 'bg-slate-900/60 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
        <h3 className="text-lg font-extrabold tracking-tight mb-5">Top Employers</h3>
        <div className="dept-table-wrapper overflow-x-auto">
          <table className="dept-table w-full">
            <thead>
              <tr>
                <th>Employer</th>
                <th>Graduates Hired</th>
                <th>Industry</th>
                <th>Average Salary</th>
                <th>Last Hire Date</th>
              </tr>
            </thead>
            <tbody>
              {topEmployers.map((employer, index) => (
                <tr key={index}>
                  <td className="font-extrabold">{employer.employer}</td>
                  <td className="font-bold text-blue-500">{employer.graduatesHired}</td>
                  <td className="text-gray-450 dark:text-gray-500 font-semibold">{employer.industry}</td>
                  <td className="font-bold text-blue-500">{employer.averageSalary}</td>
                  <td className="text-gray-400 dark:text-gray-500 font-medium">{employer.lastHireDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights Panel */}
      <div className={`rounded-2xl p-6 border shadow-lg ${darkMode ? 'bg-slate-900/60 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
        <h3 className="text-lg font-extrabold tracking-tight mb-5">Executive Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employmentInsights.map((insight) => (
            <div key={insight.id} className={`p-5 border rounded-2xl transition-all duration-300 hover:shadow-lg ${
              darkMode ? 'bg-slate-900/40 border-slate-800 text-white' :
              insight.type === 'success' ? 'bg-blue-50/50 border-blue-100 text-gray-900' :
              insight.type === 'warning' ? 'bg-amber-50/50 border-amber-100 text-gray-900' :
              insight.type === 'concern' ? 'bg-rose-50/50 border-rose-100 text-gray-900' :
              'bg-blue-50/50 border-blue-100 text-gray-900'
            }`}>
              <div className="flex items-start gap-3.5 mb-3">
                <div className={`p-1.5 rounded-lg border ${
                  insight.type === 'success' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                  insight.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                  insight.type === 'concern' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
                  'bg-blue-500/10 border-blue-500/20 text-blue-500'
                }`}>
                  {getInsightIcon(insight.type)}
                </div>
                <div>
                  <p className="text-sm font-extrabold tracking-tight">{insight.title}</p>
                  <p className="text-xs text-gray-450 dark:text-gray-400 mt-1 leading-relaxed">{insight.description}</p>
                </div>
              </div>
              <div className={`flex items-center justify-between mt-4 pt-3.5 border-t border-gray-200/5 dark:border-white/5`}>
                <span className="text-xs text-gray-400 font-semibold">{insight.metric}</span>
                <span className="text-xs font-extrabold">{insight.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmploymentAnalytics;
