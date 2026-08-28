import React, { useState, useMemo } from 'react';
import {
  GraduationCap, TrendingUp, Clock, DollarSign, FileCheck, Star,
  Building2, Briefcase, RefreshCw, Download, ChevronRight,
  ArrowUp, ArrowDown, Minus, FileText, MessageSquare, AlertCircle
} from 'lucide-react';
import { AnalyticsChart } from '../../../components/AnalyticsChart';
import {
  DashboardOverviewFilters,
  KPICard,
  EmploymentTrendData,
  TracerCompletionData,
  TopHiringCompany,
  TopIndustry,
  SkillGapItem,
  EmployerFeedbackScore,
  CurriculumInsight,
  RecentActivity
} from '../types/dashboardOverview.types';
import {
  mockDashboardKPICards,
  mockEmploymentTrendData,
  mockTracerCompletionData,
  mockTopHiringCompanies,
  mockTopIndustries,
  mockSkillGapItems,
  mockEmployerFeedbackScores,
  mockCurriculumInsights,
  mockRecentActivities
} from '../services/mockDashboardOverviewData';

interface DashboardOverviewProps {
  darkMode?: boolean;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ darkMode = false }) => {
  const [filters, setFilters] = useState<DashboardOverviewFilters>({
    department: 'Computer Science',
    academicYear: '2024',
    tracerPeriod: '6-month'
  });

  const handleRefresh = () => {
    console.log('Refreshing data...');
  };

  const handleExport = () => {
    console.log('Exporting dashboard...');
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
      'AlertCircle': AlertCircle
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

  const renderSparkline = (data: number[], color: string) => {
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
          stroke={color === 'astu-green' ? '#008080' : color === 'astu-navy' ? '#002244' : color === 'astu-red' ? '#B22222' : '#666'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  const renderKPICard = (kpi: KPICard) => (
    <div className={`p-5 border rounded-2xl hover:shadow-md transition-all duration-300 group ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200/80 shadow-xs'}`}>
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

  return (
    <div className="space-y-6">
      {/* Department Command Center Banner */}
      <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-r from-[#003580] via-[#004b99] to-[#0066cc] p-6 text-white shadow-md">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white">
              DEPARTMENT ACCREDITATION &amp; OUTCOMES HUB
            </span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">Software Engineering Department Command Center</h2>
            <p className="mt-1 max-w-3xl text-xs leading-relaxed text-white/90">
              Executive monitoring of graduate employment rates, curriculum skill alignment, ABET accreditation evidence, and department survey completions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl transition-all duration-300 font-bold text-xs"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#1D9E75] hover:brightness-110 text-white rounded-xl transition-all duration-300 font-bold text-xs shadow-sm"
            >
              <Download className="h-4 w-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Command Center 4-Card Quick Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/15">
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/15">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/70">DEPARTMENT GRADUATES</span>
            <p className="text-2xl font-extrabold mt-1 text-white">1,247</p>
            <p className="text-[10px] text-emerald-300 font-semibold mt-0.5">✓ 98% Verified SIS Census</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/15">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/70">EMPLOYMENT RATE</span>
            <p className="text-2xl font-extrabold mt-1 text-white">85%</p>
            <p className="text-[10px] text-emerald-300 font-semibold mt-0.5">↑ +8% vs last year</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/15">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/70">EMPLOYER SATISFACTION</span>
            <p className="text-2xl font-extrabold mt-1 text-white">4.2 / 5</p>
            <p className="text-[10px] text-amber-300 font-semibold mt-0.5">★ ABET Quality Target Met</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/15">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/70">ACTIVE PARTNERSHIPS</span>
            <p className="text-2xl font-extrabold mt-1 text-white">45 Companies</p>
            <p className="text-[10px] text-emerald-300 font-semibold mt-0.5">128 Job Requisitions</p>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className={`rounded-2xl p-4 shadow-xs border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1 block">Department Program</label>
            <select
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-astu-navy/50 transition-all ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
            >
              <option value="Computer Science">Software Engineering (SWE)</option>
              <option value="Electrical Engineering">Electrical &amp; Computer Eng (ECE)</option>
              <option value="Mechanical Engineering">Mechanical Engineering (MEG)</option>
              <option value="Civil Engineering">Civil Engineering (CVE)</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1 block">Academic Cohort Year</label>
            <select
              value={filters.academicYear}
              onChange={(e) => setFilters({ ...filters, academicYear: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-astu-navy/50 transition-all ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
            >
              <option value="2024">2024 Graduating Class</option>
              <option value="2023">2023 Graduating Class</option>
              <option value="2022">2022 Graduating Class</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1 block">Tracer Study Milestone</label>
            <select
              value={filters.tracerPeriod}
              onChange={(e) => setFilters({ ...filters, tracerPeriod: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-astu-navy/50 transition-all ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
            >
              <option value="6-month">6-Month Post-Graduation Tracer</option>
              <option value="12-month">12-Month Post-Graduation Tracer</option>
              <option value="24-month">24-Month Post-Graduation Tracer</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockDashboardKPICards.map(renderKPICard)}
      </div>

      {/* Row 1: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart
          type="line"
          data={mockEmploymentTrendData as any}
          xKey="year"
          series={[
            { key: 'employmentRate', label: 'Employment Rate (%)', color: '#008080' }
          ]}
          title="Employment Trend"
          subtitle="Graduate employment rate by year"
          height={280}
        />
        <AnalyticsChart
          type="pie"
          data={mockTracerCompletionData as any}
          xKey="status"
          series={[
            { key: 'count', label: 'Surveys' }
          ]}
          title="Tracer Study Completion"
          subtitle="Survey completion status distribution"
          height={280}
        />
      </div>

      {/* Row 2: Top Companies & Industries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
          <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Top Hiring Companies</h3>
          <div className="space-y-3">
            {mockTopHiringCompanies.map((company, index) => (
              <div key={index} className={`flex items-center justify-between p-3 border rounded-xl ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-br from-gray-50 to-white border-gray-200/60'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-astu-navy/10 rounded-lg flex items-center justify-center font-bold text-astu-navy text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{company.name}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{company.graduateCount} graduates</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(company.trendDirection)}
                  <span className={`text-xs font-semibold ${company.trendDirection === 'up' ? 'text-astu-green' : 'text-astu-red'}`}>
                    {Math.abs(company.trend)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
          <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Top Industries</h3>
          <div className="space-y-3">
            {mockTopIndustries.map((industry, index) => (
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

      {/* Row 3: Skill Gap Summary */}
      <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
        <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Skill Gap Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockSkillGapItems.map(renderSkillGapItem)}
        </div>
      </div>

      {/* Row 4: Employer Feedback Snapshot */}
      <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
        <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Employer Feedback Snapshot</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {mockEmployerFeedbackScores.map(renderFeedbackScore)}
        </div>
      </div>

      {/* Row 5: Curriculum Insight Summary */}
      <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
        <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Curriculum Insight Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockCurriculumInsights.map(renderCurriculumInsight)}
        </div>
      </div>

      {/* Recent Activity Panel */}
      <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
        <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Recent Activity</h3>
        <div className="space-y-3">
          {mockRecentActivities.map(renderRecentActivity)}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
