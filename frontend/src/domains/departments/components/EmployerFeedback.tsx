import React, { useState } from 'react';
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

export const EmployerFeedback: React.FC<EmployerFeedbackProps> = ({ data, darkMode = false }) => {
  const [filters, setFilters] = useState<EmployerFeedbackFilterState>({
    department: 'Computer Science',
    academicYear: '2024',
    industry: 'All',
    satisfaction: 'All'
  });

  // Use data from props or provide empty defaults
  const employerFeedbackKPIMetrics = data?.kpiMetrics || [];
  const satisfactionMetrics = data?.satisfactionMetrics || [];
  const competencyScores = data?.competencyScores || [];
  const industryDemandSkills = data?.industryDemandSkills || [];
  const employerRecommendations = data?.recommendations || [];
  const employerEngagement = data?.engagement || [];
  const employerInsights = data?.insights || [];
  const employerFeedbackRecords = data?.records || [];

  const handleFilterChange = (newFilters: EmployerFeedbackFilterState) => {
    setFilters(newFilters);
  };

  const handleRefresh = () => {
    console.log('Refreshing data...');
  };

  const handleExport = () => {
    console.log('Exporting employer feedback data...');
  };

  const handleExportOption = (option: EmployerExportOption) => {
    console.log('Exporting:', option);
    // Implement actual export logic
  };

  const handleSaveView = () => {
    console.log('Saving view...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Employer Feedback & Industry Intelligence</h2>
            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Industry insights and employer evaluations of ASTU graduates</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto mt-2 md:mt-0">
            <button
              onClick={handleRefresh}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 font-medium text-sm ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
            >
              Refresh Data
            </button>
            <button
              onClick={handleSaveView}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 font-medium text-sm ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
            >
              Save View
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 bg-astu-navy hover:bg-blue-900 text-white rounded-xl transition-all duration-300 font-medium text-sm"
            >
              Export Report
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <select
            value={filters.department}
            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            className={`px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-astu-navy/50 transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white'}`}
          >
            <option value="">All Departments</option>
            <option value="Software Engineering">Software Engineering</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
            <option value="Electrical Engineering">Electrical Engineering</option>
          </select>
          <select
            value={filters.industry}
            onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
            className={`px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-astu-navy/50 transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white'}`}
          >
            <option value="">All Industries</option>
            <option value="Technology">Technology</option>
            <option value="Telecommunications">Telecommunications</option>
            <option value="Finance">Finance</option>
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

      {/* KPI Section */}
      {employerFeedbackKPIMetrics.length > 0 ? (
        <TracerKPI metrics={employerFeedbackKPIMetrics} />
      ) : (
        <div className={`rounded-2xl p-8 border border-dashed ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50/50 border-gray-300'}`}>
          <div className="flex flex-col items-center justify-center text-center py-6">
            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-4 ${darkMode ? 'bg-slate-700' : 'bg-white shadow-sm border border-gray-100'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={darkMode ? 'text-slate-400' : 'text-blue-500'}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </div>
            <h3 className={`text-base font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>No KPI metrics available</h3>
            <p className={`text-xs max-w-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Metrics and analytics for this section are currently being aggregated. Please check back later.</p>
          </div>
        </div>
      )}

      {/* Employer Satisfaction Analytics */}
      {satisfactionMetrics.length > 0 ? (
        <EmployerSatisfactionAnalytics data={satisfactionMetrics} />
      ) : (
        <div className={`rounded-2xl p-8 border border-dashed ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50/50 border-gray-300'}`}>
          <div className="flex flex-col items-center justify-center text-center py-6">
            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-4 ${darkMode ? 'bg-slate-700' : 'bg-white shadow-sm border border-gray-100'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={darkMode ? 'text-slate-400' : 'text-blue-500'}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </div>
            <h3 className={`text-base font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>No satisfaction metrics available</h3>
            <p className={`text-xs max-w-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Metrics and analytics for this section are currently being aggregated. Please check back later.</p>
          </div>
        </div>
      )}

      {/* Competency Assessment */}
      {competencyScores.length > 0 ? (
        <CompetencyAssessment data={competencyScores} />
      ) : (
        <div className={`rounded-2xl p-8 border border-dashed ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50/50 border-gray-300'}`}>
          <div className="flex flex-col items-center justify-center text-center py-6">
            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-4 ${darkMode ? 'bg-slate-700' : 'bg-white shadow-sm border border-gray-100'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={darkMode ? 'text-slate-400' : 'text-blue-500'}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </div>
            <h3 className={`text-base font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>No competency scores available</h3>
            <p className={`text-xs max-w-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Metrics and analytics for this section are currently being aggregated. Please check back later.</p>
          </div>
        </div>
      )}

      {/* Industry Demand Analytics */}
      {industryDemandSkills.length > 0 ? (
        <IndustryDemandAnalytics data={industryDemandSkills} />
      ) : (
        <div className={`rounded-2xl p-8 border border-dashed ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50/50 border-gray-300'}`}>
          <div className="flex flex-col items-center justify-center text-center py-6">
            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-4 ${darkMode ? 'bg-slate-700' : 'bg-white shadow-sm border border-gray-100'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={darkMode ? 'text-slate-400' : 'text-blue-500'}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </div>
            <h3 className={`text-base font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>No industry demand data available</h3>
            <p className={`text-xs max-w-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Metrics and analytics for this section are currently being aggregated. Please check back later.</p>
          </div>
        </div>
      )}

      {/* Employer Recommendations */}
      {employerRecommendations.length > 0 ? (
        <EmployerRecommendations data={employerRecommendations} />
      ) : (
        <div className={`rounded-2xl p-8 border border-dashed ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50/50 border-gray-300'}`}>
          <div className="flex flex-col items-center justify-center text-center py-6">
            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-4 ${darkMode ? 'bg-slate-700' : 'bg-white shadow-sm border border-gray-100'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={darkMode ? 'text-slate-400' : 'text-blue-500'}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </div>
            <h3 className={`text-base font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>No employer recommendations available</h3>
            <p className={`text-xs max-w-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Metrics and analytics for this section are currently being aggregated. Please check back later.</p>
          </div>
        </div>
      )}

      {/* Employer Engagement Analytics */}
      {employerEngagement.length > 0 ? (
        <EmployerEngagementAnalytics data={employerEngagement} />
      ) : (
        <div className={`rounded-2xl p-8 border border-dashed ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50/50 border-gray-300'}`}>
          <div className="flex flex-col items-center justify-center text-center py-6">
            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-4 ${darkMode ? 'bg-slate-700' : 'bg-white shadow-sm border border-gray-100'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={darkMode ? 'text-slate-400' : 'text-blue-500'}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </div>
            <h3 className={`text-base font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>No employer engagement data available</h3>
            <p className={`text-xs max-w-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Metrics and analytics for this section are currently being aggregated. Please check back later.</p>
          </div>
        </div>
      )}

      {/* Executive Insights Panel */}
      {employerInsights.length > 0 ? (
        <EmployerInsightsPanel insights={employerInsights} />
      ) : (
        <div className={`rounded-2xl p-8 border border-dashed ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50/50 border-gray-300'}`}>
          <div className="flex flex-col items-center justify-center text-center py-6">
            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-4 ${darkMode ? 'bg-slate-700' : 'bg-white shadow-sm border border-gray-100'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={darkMode ? 'text-slate-400' : 'text-blue-500'}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </div>
            <h3 className={`text-base font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>No employer insights available</h3>
            <p className={`text-xs max-w-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Metrics and analytics for this section are currently being aggregated. Please check back later.</p>
          </div>
        </div>
      )}

      {/* Employer Feedback Table */}
      {employerFeedbackRecords.length > 0 ? (
        <EmployerFeedbackTable records={employerFeedbackRecords} />
      ) : (
        <div className={`rounded-2xl p-8 border border-dashed ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50/50 border-gray-300'}`}>
          <div className="flex flex-col items-center justify-center text-center py-6">
            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-4 ${darkMode ? 'bg-slate-700' : 'bg-white shadow-sm border border-gray-100'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={darkMode ? 'text-slate-400' : 'text-blue-500'}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </div>
            <h3 className={`text-base font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>No employer feedback records available</h3>
            <p className={`text-xs max-w-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Metrics and analytics for this section are currently being aggregated. Please check back later.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerFeedback;
