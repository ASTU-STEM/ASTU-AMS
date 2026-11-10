import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Bookmark, Download, Lock, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../contexts/AuthContext';
import { departmentService } from '../services/department.service';
import { EmployerFeedbackFilterState, EmployerExportOption } from '../types/employerFeedback.types';

// Sub-components
import { TracerKPI } from './TracerKPI';
import { EmployerSatisfactionAnalytics } from './EmployerSatisfactionAnalytics';
import { CompetencyAssessment } from './CompetencyAssessment';
import { IndustryDemandAnalytics } from './IndustryDemandAnalytics';
import { EmployerRecommendations } from './EmployerRecommendations';
import { EmployerEngagementAnalytics } from './EmployerEngagementAnalytics';
import { EmployerInsightsPanel } from './EmployerInsightsPanel';
import { EmployerFeedbackTable } from './EmployerFeedbackTable';
import { EmployerFeedbackExport } from './EmployerFeedbackExport';

interface EmployerFeedbackProps {
  data?: any;
  darkMode?: boolean;
}

export const EmployerFeedback: React.FC<EmployerFeedbackProps> = ({ data: initialPropData, darkMode = false }) => {
  const { user } = useAuth();
  
  // Single department lock: non-admin users can ONLY see their assigned department
  const userDept = user?.department || 'Software Engineering';

  // Load saved view from localStorage if available
  const getInitialFilters = (): EmployerFeedbackFilterState => {
    try {
      const saved = localStorage.getItem('astu_employer_feedback_saved_view');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          department: userDept // Always lock department
        };
      }
    } catch (e) {
      // fallback
    }
    return {
      department: userDept,
      graduationBatch: '',
      industry: '',
      employer: '',
      employmentType: '',
      dateRange: '',
      ratingRange: ''
    };
  };

  const [filters, setFilters] = useState<EmployerFeedbackFilterState>(getInitialFilters);
  const [showExport, setShowExport] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [feedbackAnalytics, setFeedbackAnalytics] = useState<any>(null);

  // Fetch live employer feedback telemetry calculated from DB
  const fetchFeedbackData = useCallback(async (isSilent = false) => {
    if (isSilent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await departmentService.getOverview({
        department: userDept,
        industry: filters.industry !== '' ? filters.industry : undefined
      });

      if (response && response.employerFeedbackAnalytics) {
        setFeedbackAnalytics(response.employerFeedbackAnalytics);
      } else if (response && response.data?.employerFeedbackAnalytics) {
        setFeedbackAnalytics(response.data.employerFeedbackAnalytics);
      } else if (initialPropData?.employerFeedbackAnalytics) {
        setFeedbackAnalytics(initialPropData.employerFeedbackAnalytics);
      } else if (initialPropData) {
        setFeedbackAnalytics(initialPropData);
      }
    } catch (err) {
      console.error('Error fetching employer feedback telemetry:', err);
      toast.error('Could not fetch employer feedback telemetry from database');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userDept, filters.industry, initialPropData]);

  useEffect(() => {
    fetchFeedbackData();
  }, [fetchFeedbackData]);

  const handleRefresh = () => {
    fetchFeedbackData(true).then(() => {
      toast.success('Employer feedback telemetry refreshed from database');
    });
  };

  const handleSaveView = () => {
    try {
      localStorage.setItem('astu_employer_feedback_saved_view', JSON.stringify(filters));
      toast.success('Current view and filters saved as default preference');
    } catch (e) {
      toast.error('Failed to save view preferences');
    }
  };

  const handleExport = () => {
    setShowExport(true);
  };

  const handleExportOption = (option: EmployerExportOption) => {
    console.log('Exporting employer feedback option:', option);
  };

  // Filter dynamic analytics telemetry
  const rawRecords = feedbackAnalytics?.records || [];

  const filteredRecords = rawRecords.filter((record: any) => {
    const matchesIndustry = !filters.industry || record.industry === filters.industry;
    const matchesRating = !filters.ratingRange || (
      filters.ratingRange === 'high' ? record.rating >= 8 :
      filters.ratingRange === 'medium' ? record.rating >= 5 && record.rating < 8 :
      record.rating < 5
    );
    return matchesIndustry && matchesRating;
  });

  const kpis = feedbackAnalytics?.kpiMetrics || [];
  const satisfactionMetrics = feedbackAnalytics?.satisfactionMetrics || [];
  const competencyScores = feedbackAnalytics?.competencyScores || [];
  const industryDemandSkills = feedbackAnalytics?.industryDemandSkills || [];
  const employerRecommendations = feedbackAnalytics?.employerRecommendations || [];
  const employerEngagement = feedbackAnalytics?.employerEngagement || [];
  const employerInsights = feedbackAnalytics?.employerInsights || [];

  // Extract unique industries from telemetry for filter options
  const uniqueIndustries = Array.from(new Set(rawRecords.map((r: any) => r.industry).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Employer Feedback & Industry Intelligence
              </h2>
              <span className="flex items-center gap-1 text-xs px-3 py-1 rounded-full font-semibold bg-astu-navy/10 text-astu-navy dark:bg-blue-900/40 dark:text-blue-300">
                <Building2 className="h-3.5 w-3.5" />
                {userDept} Only
              </span>
            </div>
            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Real-time employer evaluations, competency scores, and ABET accreditation metrics calculated from database
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 font-medium text-sm ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-astu-navy' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh Data'}
            </button>
            <button
              onClick={handleSaveView}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 font-medium text-sm ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
            >
              <Bookmark className="h-4 w-4 text-amber-500" />
              Save View
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 bg-astu-navy hover:bg-blue-900 text-white rounded-xl transition-all duration-300 font-medium text-sm shadow-md"
            >
              <Download className="h-4 w-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Locked Department Dropdown */}
          <div className="relative">
            <select
              value={userDept}
              disabled={true}
              title={`Department is locked to your assigned department (${userDept})`}
              className={`w-full px-4 py-2.5 rounded-xl text-sm font-semibold focus:outline-none transition-all cursor-not-allowed opacity-90 ${darkMode ? 'bg-slate-700/80 border-slate-600 text-blue-300' : 'bg-blue-50/80 border-blue-200 text-astu-navy'}`}
            >
              <option value={userDept}>{userDept}</option>
            </select>
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-astu-navy/60 dark:text-blue-300/60 pointer-events-none" />
          </div>

          <select
            value={filters.industry}
            onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
            className={`px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-astu-navy/50 transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white'}`}
          >
            <option value="">All Industries</option>
            {uniqueIndustries.map((ind: any) => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>

          <select
            value={filters.graduationBatch}
            onChange={(e) => setFilters({ ...filters, graduationBatch: e.target.value })}
            className={`px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-astu-navy/50 transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white'}`}
          >
            <option value="">All Batches</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>

          <select
            value={filters.ratingRange}
            onChange={(e) => setFilters({ ...filters, ratingRange: e.target.value })}
            className={`px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-astu-navy/50 transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white'}`}
          >
            <option value="">All Ratings</option>
            <option value="high">High (8-10)</option>
            <option value="medium">Medium (5-7)</option>
            <option value="low">Low (1-4)</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className={`p-12 text-center rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700 text-gray-300' : 'bg-white border-gray-200 text-gray-600'}`}>
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-astu-navy mb-4" />
          <p className="font-semibold text-base">Fetching live employer feedback telemetry from PostgreSQL database...</p>
        </div>
      ) : (
        <>
          {/* KPI Section */}
          <TracerKPI metrics={kpis} darkMode={darkMode} />

          {/* Employer Satisfaction Analytics */}
          <EmployerSatisfactionAnalytics data={satisfactionMetrics} />

          {/* Competency Assessment */}
          <CompetencyAssessment data={competencyScores} />

          {/* Industry Demand Analytics */}
          <IndustryDemandAnalytics data={industryDemandSkills} />

          {/* Employer Recommendations */}
          <EmployerRecommendations data={employerRecommendations} />

          {/* Employer Engagement Analytics */}
          <EmployerEngagementAnalytics data={employerEngagement} />

          {/* Executive Insights Panel */}
          <EmployerInsightsPanel insights={employerInsights} />

          {/* Employer Feedback Table */}
          <EmployerFeedbackTable
            records={filteredRecords}
            lockedDepartment={userDept}
            onOpenExport={handleExport}
            darkMode={darkMode}
          />
        </>
      )}

      {/* Export Modal with ASTU Seal Logo Branding */}
      {showExport && (
        <EmployerFeedbackExport
          data={feedbackAnalytics}
          departmentName={userDept}
          darkMode={darkMode}
          onExport={handleExportOption}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
};

export default EmployerFeedback;

