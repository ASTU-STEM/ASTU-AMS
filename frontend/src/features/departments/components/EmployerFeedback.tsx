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

// Mock data
import {
  mockEmployerFeedbackKPIMetrics,
  mockSatisfactionMetrics,
  mockCompetencyScores,
  mockIndustryDemandSkills,
  mockEmployerRecommendations,
  mockEmployerEngagement,
  mockEmployerInsights,
  mockEmployerFeedbackRecords
} from '../services/mockEmployerFeedbackData';

interface EmployerFeedbackProps {
  data?: any;
  darkMode?: boolean;
}

export const EmployerFeedback: React.FC<EmployerFeedbackProps> = ({ data, darkMode = false }) => {
  const [filters, setFilters] = useState<EmployerFeedbackFilterState>({
    department: '',
    graduationBatch: '',
    industry: '',
    employer: '',
    employmentType: '',
    dateRange: '',
    ratingRange: ''
  });
  const [showExport, setShowExport] = useState(false);

  const handleFilterChange = (newFilters: EmployerFeedbackFilterState) => {
    setFilters(newFilters);
  };

  const handleRefresh = () => {
    console.log('Refreshing data...');
  };

  const handleExport = () => {
    setShowExport(true);
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
          <div className="flex items-center gap-3">
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
      <TracerKPI metrics={mockEmployerFeedbackKPIMetrics} />

      {/* Employer Satisfaction Analytics */}
      <EmployerSatisfactionAnalytics data={mockSatisfactionMetrics} />

      {/* Competency Assessment */}
      <CompetencyAssessment data={mockCompetencyScores} />

      {/* Industry Demand Analytics */}
      <IndustryDemandAnalytics data={mockIndustryDemandSkills} />

      {/* Employer Recommendations */}
      <EmployerRecommendations data={mockEmployerRecommendations} />

      {/* Employer Engagement Analytics */}
      <EmployerEngagementAnalytics data={mockEmployerEngagement} />

      {/* Executive Insights Panel */}
      <EmployerInsightsPanel insights={mockEmployerInsights} />

      {/* Employer Feedback Table */}
      <EmployerFeedbackTable records={mockEmployerFeedbackRecords} />

      {/* Export Modal */}
      {showExport && (
        <EmployerFeedbackExport
          onExport={handleExportOption}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
};

export default EmployerFeedback;
