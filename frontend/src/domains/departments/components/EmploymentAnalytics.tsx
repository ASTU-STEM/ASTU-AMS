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
import {
  mockEmploymentKPIMetrics,
  mockEmploymentTrendData,
  mockEmploymentStatusData,
  mockProgramEmploymentData,
  mockHiringIndustries,
  mockHiringCompanies,
  mockGeographicDistribution,
  mockGraduateEmploymentRecords,
  mockTopEmployers,
  mockEmploymentInsights
} from '../services/mockEmploymentAnalyticsData';

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
        return <Info className="h-5 w-5 text-blue-600" />;
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
    return mockGraduateEmploymentRecords.filter(record => {
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
      <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Employment Analytics</h2>
            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Comprehensive graduate employment performance metrics</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 font-medium text-sm ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 bg-astu-navy hover:bg-blue-900 text-white rounded-xl transition-all duration-300 font-medium text-sm"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <select
            value={filters.department}
            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            className={`px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-astu-navy/50 transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white'}`}
          >
            <option value="Computer Science">Computer Science</option>
            <option value="Software Engineering">Software Engineering</option>
            <option value="Electrical Engineering">Electrical Engineering</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
          </select>
          <select
            value={filters.batch}
            onChange={(e) => setFilters({ ...filters, batch: e.target.value })}
            className={`px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-astu-navy/50 transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white'}`}
          >
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>
          <select
            value={filters.academicYear}
            onChange={(e) => setFilters({ ...filters, academicYear: e.target.value })}
            className={`px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-astu-navy/50 transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white'}`}
          >
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>
          <select
            value={filters.employmentStatus}
            onChange={(e) => setFilters({ ...filters, employmentStatus: e.target.value })}
            className={`px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-astu-navy/50 transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white'}`}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockEmploymentKPIMetrics.map(renderKPICard)}
      </div>

      {/* Chart Section 1: Employment Trend & Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart
          type="line"
          data={mockEmploymentTrendData as any}
          xKey="year"
          series={[
            { key: 'employmentRate', label: 'Employment Rate (%)', color: '#008080' }
          ]}
          title="Employment Trend Over Time"
          subtitle="Graduate employment rate by graduation year"
          height={280}
        />
        <AnalyticsChart
          type="pie"
          data={mockEmploymentStatusData as any}
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
          data={mockProgramEmploymentData as any}
          xKey="program"
          series={[
            { key: 'employmentRate', label: 'Employment Rate (%)', color: '#002244' }
          ]}
          title="Employment Rate by Program"
          subtitle="Program-level employment performance"
          height={280}
        />
        <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
          <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Top Hiring Industries</h3>
          <div className="space-y-3">
            {mockHiringIndustries.map((industry, index) => (
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
        <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Top Hiring Companies</h3>
        <div className="space-y-3">
          {mockHiringCompanies.map((company, index) => (
            <div key={index} className={`flex items-center justify-between p-3 border rounded-xl ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-br from-gray-50 to-white border-gray-200/60'}`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-astu-navy/10 rounded-lg flex items-center justify-center font-bold text-astu-navy text-sm">
                  {index + 1}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{company.name}</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{company.industry}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{company.graduatesHired} hired</p>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(company.changeDirection)}
                    <span className={`text-xs font-semibold ${company.changeDirection === 'up' ? 'text-astu-green' : 'text-astu-red'}`}>
                      {Math.abs(company.change)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Geographic Distribution */}
      <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
        <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Geographic Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockGeographicDistribution.map((region, index) => (
            <div key={index} className={`p-4 border rounded-xl ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-br from-gray-50 to-white border-gray-200/60'}`}>
              <p className={`text-sm font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{region.region}</p>
              <div className="flex items-center justify-between mb-2">
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Graduates</p>
                <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{region.count}</p>
              </div>
              <div className={`w-full h-2 rounded-full overflow-hidden ${darkMode ? 'bg-slate-600' : 'bg-gray-200'}`}>
                <div className="bg-astu-navy h-full rounded-full" style={{ width: `${region.percentage}%` }}></div>
              </div>
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{region.percentage}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* Graduate Employment Records Table */}
      <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Graduate Employment Records</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-astu-navy/50 transition-all w-64 ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white'}`}
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-200'} border-b`}>
                <th className={`px-4 py-3 text-left font-semibold cursor-pointer hover:bg-gray-100 ${darkMode ? 'text-white hover:bg-slate-600' : 'text-gray-900'}`} onClick={() => handleSort('studentId')}>
                  Student ID
                </th>
                <th className={`px-4 py-3 text-left font-semibold cursor-pointer hover:bg-gray-100 ${darkMode ? 'text-white hover:bg-slate-600' : 'text-gray-900'}`} onClick={() => handleSort('graduateName')}>
                  Name
                </th>
                <th className={`px-4 py-3 text-left font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Department</th>
                <th className={`px-4 py-3 text-left font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Status</th>
                <th className={`px-4 py-3 text-left font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Company</th>
                <th className={`px-4 py-3 text-left font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Job Title</th>
                <th className={`px-4 py-3 text-left font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Country</th>
                <th className={`px-4 py-3 text-left font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Salary Range</th>
                <th className={`px-4 py-3 text-left font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Time-to-Hire</th>
              </tr>
            </thead>
            <tbody>
              {sortedRecords.map((record) => (
                <tr key={record.id} className={`border-b hover:bg-gray-50 ${darkMode ? 'border-slate-700 hover:bg-slate-700' : 'border-gray-100'}`}>
                  <td className={`px-4 py-3 font-mono text-xs ${darkMode ? 'text-white' : 'text-gray-900'}`}>{record.studentId}</td>
                  <td className={`px-4 py-3 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{record.graduateName}</td>
                  <td className={`px-4 py-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{record.department}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      record.employmentStatus === 'Employed' ? 'bg-emerald-100 text-emerald-700' :
                      record.employmentStatus === 'Unemployed' ? 'bg-red-100 text-red-700' :
                      record.employmentStatus === 'Self-Employed' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {record.employmentStatus}
                    </span>
                  </td>
                  <td className={`px-4 py-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{record.company}</td>
                  <td className={`px-4 py-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{record.jobTitle}</td>
                  <td className={`px-4 py-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{record.country}</td>
                  <td className={`px-4 py-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{record.salaryRange}</td>
                  <td className={`px-4 py-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{record.timeToHire}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Employers Table */}
      <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
        <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Top Employers</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-200'} border-b`}>
                <th className={`px-4 py-3 text-left font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Employer</th>
                <th className={`px-4 py-3 text-left font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Graduates Hired</th>
                <th className={`px-4 py-3 text-left font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Industry</th>
                <th className={`px-4 py-3 text-left font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Average Salary</th>
                <th className={`px-4 py-3 text-left font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Last Hire Date</th>
              </tr>
            </thead>
            <tbody>
              {mockTopEmployers.map((employer, index) => (
                <tr key={index} className={`border-b hover:bg-gray-50 ${darkMode ? 'border-slate-700 hover:bg-slate-700' : 'border-gray-100'}`}>
                  <td className={`px-4 py-3 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{employer.employer}</td>
                  <td className={`px-4 py-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{employer.graduatesHired}</td>
                  <td className={`px-4 py-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{employer.industry}</td>
                  <td className={`px-4 py-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{employer.averageSalary}</td>
                  <td className={`px-4 py-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{employer.lastHireDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights Panel */}
      <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
        <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Executive Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockEmploymentInsights.map((insight) => (
            <div key={insight.id} className={`p-4 border rounded-xl ${
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
    </div>
  );
};

export default EmploymentAnalytics;
