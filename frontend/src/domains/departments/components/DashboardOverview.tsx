import React, { useState, useMemo } from 'react';
import {
  GraduationCap, TrendingUp, Clock, DollarSign, FileCheck, Star,
  Building2, Briefcase, RefreshCw, Download, ChevronRight,
  ArrowUp, ArrowDown, Minus, FileText, MessageSquare, AlertCircle
} from 'lucide-react';
import { AnalyticsChart } from '../../../shared/components/AnalyticsChart';
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

interface DashboardOverviewProps {
  data?: any;
  darkMode?: boolean;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ data, darkMode = false }) => {
  const [filters, setFilters] = useState<DashboardOverviewFilters>({
    department: 'Computer Science',
    academicYear: '2024',
    tracerPeriod: '6-month',
  });

  // Use data from props or provide empty defaults
  const dashboardKPICards: KPICard[] = data?.kpiCards || [];
  const employmentTrendData: EmploymentTrendData[] = data?.trendData || [];
  const tracerCompletionData: TracerCompletionData[] = data?.tracerData || [];
  const topHiringCompanies: TopHiringCompany[] = data?.topCompanies || [];
  const topIndustries: TopIndustry[] = data?.topIndustries || [];
  const skillGapItems: SkillGapItem[] = data?.skillGaps || [];
  const employerFeedbackScores: EmployerFeedbackScore[] = data?.feedbackScores || [];
  const curriculumInsights: CurriculumInsight[] = data?.curriculumInsights || [];
  const recentActivities: RecentActivity[] = data?.recentActivities || [];

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
      <svg width="70" height="28" className="overflow-visible">
        <polyline
          points={data.map((value, index) => {
            const x = (index / (data.length - 1)) * 70;
            const y = 28 - ((value - min) / range) * 24;
            return `${x},${y}`;
          }).join(' ')}
          fill="none"
          stroke={color === 'astu-green' ? '#10B981' : color === 'astu-navy' ? '#3B82F6' : color === 'astu-red' ? '#F43F5E' : '#94A3B8'}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  const renderKPICard = (kpi: KPICard) => {
    const colorStyles = kpi.color === 'astu-green' 
      ? { text: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' }
      : kpi.color === 'astu-navy' 
      ? { text: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' }
      : kpi.color === 'astu-red' 
      ? { text: 'text-rose-500', bg: 'bg-rose-500/10 border-rose-500/20' }
      : { text: 'text-slate-500', bg: 'bg-slate-500/10 border-slate-500/20' };

    return (
      <div key={kpi.label} className={`p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dept-kpi-glowing dept-glass-card ${darkMode ? 'border-slate-800 bg-slate-900/40 text-white' : 'border-gray-200 bg-white text-gray-900'}`}>
        <div className="flex items-start justify-between mb-4">
          <div className={`p-2.5 rounded-xl border ${colorStyles.bg} ${colorStyles.text}`}>
            {getIcon(kpi.icon)}
          </div>
          <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-lg border text-xs font-bold ${
            kpi.trendDirection === 'up' 
              ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' 
              : kpi.trendDirection === 'down'
              ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
              : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
          }`}>
            {getTrendIcon(kpi.trendDirection)}
            <span>{Math.abs(kpi.trend)}%</span>
          </div>
        </div>
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">{kpi.label}</p>
        <p className="text-2xl font-extrabold tracking-tight mb-3">{kpi.value}</p>
        <div className="flex items-center justify-between border-t border-gray-200/5 dark:border-white/5 pt-3">
          <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">{kpi.comparison}</p>
          {renderSparkline(kpi.sparkline, kpi.color)}
        </div>
      </div>
    );
  };

  const renderSkillGapItem = (item: SkillGapItem) => (
    <div key={item.skill} className={`p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${darkMode ? 'bg-slate-900/30 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-extrabold tracking-tight">{item.skill}</p>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/25 text-xs font-bold">
          {getTrendIcon(item.trendDirection)}
          <span>{Math.abs(item.trend)}% gap</span>
        </div>
      </div>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs mb-1 font-semibold text-gray-400">
            <span>Workforce Demand</span>
            <span className="text-slate-700 dark:text-slate-300">{item.demand}%</span>
          </div>
          <div className={`w-full h-2 rounded-full overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
            <div className="bg-gradient-to-r from-astu-navy to-blue-400 h-full rounded-full" style={{ width: `${item.demand}%` }}></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1 font-semibold text-gray-400">
            <span>Curriculum Coverage</span>
            <span className={item.coverage < 50 ? 'text-rose-500' : 'text-blue-500'}>{item.coverage}%</span>
          </div>
          <div className={`w-full h-2 rounded-full overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
            <div className={`h-full rounded-full bg-gradient-to-r ${item.coverage < 50 ? 'from-rose-500 to-rose-450' : 'from-blue-500 to-blue-400'}`} style={{ width: `${item.coverage}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFeedbackScore = (scoreData: EmployerFeedbackScore) => (
    <div key={scoreData.category} className={`p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg ${darkMode ? 'bg-slate-900/30 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
      <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">{scoreData.category}</p>
      <div className="flex items-center justify-between">
        <p className="text-3xl font-extrabold tracking-tight">{scoreData.score}</p>
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold ${
          scoreData.trendDirection === 'up'
            ? 'bg-blue-500/10 text-blue-500'
            : 'bg-rose-500/10 text-rose-500'
        }`}>
          {getTrendIcon(scoreData.trendDirection)}
          <span>{Math.abs(scoreData.trend)}%</span>
        </div>
      </div>
      <div className="mt-3 flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4.5 w-4.5 transition-all duration-350 hover:scale-110 ${star <= Math.floor(scoreData.score) ? 'text-yellow-400 fill-yellow-400' : darkMode ? 'text-slate-700' : 'text-gray-200'}`}
          />
        ))}
      </div>
    </div>
  );

  const renderCurriculumInsight = (insight: CurriculumInsight) => {
    const severityStyles = insight.priority === 'high'
      ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
      : insight.priority === 'medium'
      ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
      : 'bg-slate-500/10 text-slate-500 border-slate-500/20';

    return (
      <div key={insight.title} className={`p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
        darkMode 
          ? 'bg-slate-900/30 border-slate-800 text-white' 
          : insight.type === 'strength' 
          ? 'bg-blue-50/50 border-blue-100 text-gray-900' 
          : insight.type === 'weakness'
          ? 'bg-rose-50/50 border-rose-100 text-gray-900'
          : 'bg-white border-gray-200 text-gray-900'
      }`}>
        <div className="flex items-start justify-between mb-3 gap-2">
          <p className="text-sm font-extrabold tracking-tight">{insight.title}</p>
          <span className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded border ${severityStyles}`}>
            {insight.priority}
          </span>
        </div>
        <p className="text-xs leading-relaxed text-gray-400 dark:text-gray-400">{insight.description}</p>
      </div>
    );
  };

  const renderRecentActivity = (activity: RecentActivity) => (
    <div key={activity.id} className={`flex items-start gap-4 p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg ${darkMode ? 'bg-slate-900/30 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
      <div className={`p-2.5 rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700 text-gray-300' : 'bg-gray-100 border-gray-200 text-gray-600'}`}>
        {getIcon(activity.icon)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-extrabold tracking-tight truncate">{activity.title}</p>
        <p className="text-xs text-gray-400 dark:text-gray-450 mt-1">{activity.description}</p>
      </div>
      <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider whitespace-nowrap mt-1">{activity.timestamp}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Premium Gradient Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a4fa6] via-[#003580] to-[#1D9E75] p-7 shadow-[0_8px_32px_rgba(29,158,117,0.25)]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-bold text-white uppercase tracking-wider mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E8A020] animate-pulse" />
              Department Analytics
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight text-white leading-tight">Dashboard Overview</h1>
            <p className="mt-1 text-sm text-white/70 leading-relaxed max-w-xl">
              Executive summary of department performance, tracer studies, and academic alignment outcomes.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button onClick={handleRefresh}
              className="flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20 transition-all">
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
            <button onClick={handleExport}
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-[#003580] hover:bg-blue-50 transition-all shadow-lg">
              <Download className="h-4 w-4" /> Export Summary
            </button>
          </div>
        </div>

        {/* Filters inside header */}
        <div className="relative mt-5 grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-white/15 pt-5">
          {[
            { value: filters.department, key: 'department', options: ['Computer Science', 'Software Engineering', 'Electrical Engineering', 'Mechanical Engineering'], label: 'Department' },
            { value: filters.academicYear, key: 'academicYear', options: ['2024', '2023', '2022'], label: 'Academic Year' },
            { value: filters.tracerPeriod, key: 'tracerPeriod', options: ['6-month', '12-month', '24-month'], label: 'Tracer Period' },
          ].map(field => (
            <select key={field.key} value={field.value}
              onChange={e => setFilters({ ...filters, [field.key]: e.target.value })}
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white placeholder:text-white/50 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all backdrop-blur-sm">
              {field.options.map(opt => (
                <option key={opt} value={opt} className="text-slate-800">{field.key === 'academicYear' ? `Academic Year: ${opt}` : field.key === 'tracerPeriod' ? `${opt} Tracer Survey` : opt}</option>
              ))}
            </select>
          ))}
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardKPICards.map(renderKPICard)}
      </div>

      {/* Row 1: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart
          type="line"
          data={employmentTrendData as any}
          xKey="year"
          series={[
            { key: 'employmentRate', label: 'Employment Rate (%)', color: '#10B981' }
          ]}
          title="Employment Trend"
          subtitle="Graduate employment rate trajectories by year"
          height={280}
        />
        <AnalyticsChart
          type="pie"
          data={tracerCompletionData as any}
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
        <div className={`rounded-2xl p-6 border shadow-lg ${darkMode ? 'bg-slate-900/60 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
          <h3 className="text-lg font-extrabold tracking-tight mb-5">Top Hiring Companies</h3>
          <div className="space-y-4">
            {topHiringCompanies.map((company, index) => (
              <div key={index} className={`flex items-center justify-between p-4 border rounded-2xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-gray-50/50 border-gray-150'}`}>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto mt-2 md:mt-0">
                  <div className="w-9 h-9 bg-blue-500/10 rounded-xl flex items-center justify-center font-bold text-blue-500 dark:text-blue-400 text-sm border border-blue-500/20">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-extrabold tracking-tight">{company.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{company.graduateCount} ASTU graduates</p>
                  </div>
                </div>
                <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                  company.trendDirection === 'up' 
                    ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                    : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                }`}>
                  {getTrendIcon(company.trendDirection)}
                  <span>{Math.abs(company.trend)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`rounded-2xl p-6 border shadow-lg ${darkMode ? 'bg-slate-900/60 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
          <h3 className="text-lg font-extrabold tracking-tight mb-5">Top Industries</h3>
          <div className="space-y-4">
            {topIndustries.map((industry, index) => (
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

      {/* Row 3: Skill Gap Summary */}
      <div className={`rounded-2xl p-6 border shadow-lg ${darkMode ? 'bg-slate-900/60 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
        <h3 className="text-lg font-extrabold tracking-tight mb-5">Skill Gap Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skillGapItems.map(renderSkillGapItem)}
        </div>
      </div>

      {/* Row 4: Employer Feedback Snapshot */}
      <div className={`rounded-2xl p-6 border shadow-lg ${darkMode ? 'bg-slate-900/60 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
        <h3 className="text-lg font-extrabold tracking-tight mb-5">Employer Feedback Snapshot</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {employerFeedbackScores.map(renderFeedbackScore)}
        </div>
      </div>

      {/* Row 5: Curriculum Insight Summary */}
      <div className={`rounded-2xl p-6 border shadow-lg ${darkMode ? 'bg-slate-900/60 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
        <h3 className="text-lg font-extrabold tracking-tight mb-5">Curriculum Insight Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {curriculumInsights.map(renderCurriculumInsight)}
        </div>
      </div>

      {/* Recent Activity Panel */}
      <div className={`rounded-2xl p-6 border shadow-lg ${darkMode ? 'bg-slate-900/60 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
        <h3 className="text-lg font-extrabold tracking-tight mb-5">Recent Activity</h3>
        <div className="space-y-4">
          {recentActivities.map(renderRecentActivity)}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
