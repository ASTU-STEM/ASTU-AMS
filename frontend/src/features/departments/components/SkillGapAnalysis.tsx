import React, { useState } from 'react';
import { SkillGapFilterState, SkillGapExportOption } from '../types/skillGap.types';

// Sub-components
import { TracerKPI } from './TracerKPI';
import { SkillGapOverview } from './SkillGapOverview';
import { DemandSupplyAnalytics } from './DemandSupplyAnalytics';
import { DepartmentGapAnalytics } from './DepartmentGapAnalytics';
import { EmergingTechnologyAnalytics } from './EmergingTechnologyAnalytics';
import { CertificationTrainingAnalytics } from './CertificationTrainingAnalytics';
import { SkillGapRecommendations } from './SkillGapRecommendations';
import { SkillGapInsightsPanel } from './SkillGapInsightsPanel';
import { SkillGapTable } from './SkillGapTable';
import { SkillGapExport } from './SkillGapExport';

// Mock data
import {
  mockSkillGapKPIMetrics,
  mockSkillGapOverview,
  mockDemandSupplySkills,
  mockDepartmentGaps,
  mockEmergingTechnologies,
  mockCertificationGaps,
  mockSkillGapRecommendations,
  mockSkillGapInsights,
  mockSkillGapRecords
} from '../services/mockSkillGapData';

interface SkillGapAnalysisProps {
  data?: any;
  darkMode?: boolean;
}

export const SkillGapAnalysis: React.FC<SkillGapAnalysisProps> = ({ data, darkMode = false }) => {
  const [filters, setFilters] = useState<SkillGapFilterState>({
    department: '',
    program: '',
    graduationBatch: '',
    industry: '',
    skillCategory: '',
    gapSeverity: '',
    dateRange: ''
  });
  const [showExport, setShowExport] = useState(false);

  const handleFilterChange = (newFilters: SkillGapFilterState) => {
    setFilters(newFilters);
  };

  const handleRefresh = () => {
    console.log('Refreshing data...');
  };

  const handleExport = () => {
    setShowExport(true);
  };

  const handleExportOption = (option: SkillGapExportOption) => {
    console.log('Exporting:', option);
    // Implement actual export logic
  };

  const handleSaveView = () => {
    console.log('Saving view...');
  };

  const handleGenerateRecommendations = () => {
    console.log('Generating curriculum recommendations...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Skill Gap Analysis & Workforce Demand Intelligence</h2>
            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Identify missing graduate competencies and align curriculum with labor market needs</p>
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
              onClick={handleGenerateRecommendations}
              className="flex items-center gap-2 px-4 py-2.5 bg-astu-navy hover:bg-blue-900 text-white rounded-xl transition-all duration-300 font-medium text-sm"
            >
              Generate Recommendations
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
            <option value="Computer Science">Computer Science</option>
            <option value="Electrical Engineering">Electrical Engineering</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
          </select>
          <select
            value={filters.industry}
            onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
            className={`px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-astu-navy/50 transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white'}`}
          >
            <option value="">All Industries</option>
            <option value="Technology">Technology</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Finance">Finance</option>
          </select>
          <select
            value={filters.skillCategory}
            onChange={(e) => setFilters({ ...filters, skillCategory: e.target.value })}
            className={`px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-astu-navy/50 transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white'}`}
          >
            <option value="">All Categories</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="DevOps">DevOps</option>
            <option value="AI">AI</option>
            <option value="Data">Data</option>
          </select>
          <select
            value={filters.gapSeverity}
            onChange={(e) => setFilters({ ...filters, gapSeverity: e.target.value })}
            className={`px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-astu-navy/50 transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white'}`}
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* KPI Section */}
      <TracerKPI metrics={mockSkillGapKPIMetrics} darkMode={darkMode} />

      {/* Skill Gap Overview */}
      <SkillGapOverview data={mockSkillGapOverview} darkMode={darkMode} />

      {/* Demand vs Supply Analytics */}
      <DemandSupplyAnalytics data={mockDemandSupplySkills} darkMode={darkMode} />

      {/* Department Gap Analytics */}
      <DepartmentGapAnalytics data={mockDepartmentGaps} darkMode={darkMode} />

      {/* Emerging Technology Analytics */}
      <EmergingTechnologyAnalytics data={mockEmergingTechnologies} darkMode={darkMode} />

      {/* Certification & Training Analytics */}
      <CertificationTrainingAnalytics data={mockCertificationGaps} darkMode={darkMode} />

      {/* Priority Recommendations */}
      <SkillGapRecommendations data={mockSkillGapRecommendations} darkMode={darkMode} />

      {/* Executive Insights Panel */}
      <SkillGapInsightsPanel insights={mockSkillGapInsights} darkMode={darkMode} />

      {/* Skill Gap Table */}
      <SkillGapTable records={mockSkillGapRecords} darkMode={darkMode} />

      {/* Export Modal */}
      {showExport && (
        <SkillGapExport
          onExport={handleExportOption}
          onClose={() => setShowExport(false)}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};

export default SkillGapAnalysis;
