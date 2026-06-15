import React, { useState } from 'react';
import { Activity, TrendingUp, Building2, Award, Lightbulb, Info, Table } from "lucide-react";
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

interface SkillGapAnalysisProps {
  data?: any;
  darkMode?: boolean;
}

export const SkillGapAnalysis: React.FC<SkillGapAnalysisProps> = ({ data, darkMode = false }) => {
  const [filters, setFilters] = useState<SkillGapFilterState>({
    department: 'Computer Science',
    program: 'All',
    graduationBatch: '2024',
    industry: 'All',
    skillCategory: 'All',
    gapSeverity: 'All',
    dateRange: 'All',
  });

  // Use data from props or provide empty defaults
  const skillGapKPIMetrics = data?.kpiMetrics || [];
  const skillGapOverview = data?.overview || {};
  const demandSupplySkills = data?.demandSupplySkills || [];
  const departmentGaps = data?.departmentGaps || [];
  const emergingTechnologies = data?.emergingTechnologies || [];
  const certificationGaps = data?.certificationGaps || [];
  const skillGapRecommendations = data?.recommendations || [];
  const skillGapInsights = data?.insights || [];
  const skillGapRecords = data?.records || [];

  const handleFilterChange = (newFilters: SkillGapFilterState) => {
    setFilters(newFilters);
  };

  const handleRefresh = () => {
    console.log('Refreshing data...');
  };

  const handleExport = () => {
    console.log('Exporting skill gap data...');
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
              onClick={handleGenerateRecommendations}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#003580] hover:bg-[#0a4fa6] text-white rounded-xl transition-all duration-300 font-medium text-sm"
            >
              Generate Recommendations
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#003580] hover:bg-[#0a4fa6] text-white rounded-xl transition-all duration-300 font-medium text-sm"
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
            className={`px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003580]/50 transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white'}`}
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
            className={`px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003580]/50 transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white'}`}
          >
            <option value="">All Industries</option>
            <option value="Technology">Technology</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Finance">Finance</option>
          </select>
          <select
            value={filters.skillCategory}
            onChange={(e) => setFilters({ ...filters, skillCategory: e.target.value })}
            className={`px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003580]/50 transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white'}`}
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
            className={`px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003580]/50 transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white'}`}
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
      {skillGapKPIMetrics.length > 0 ? (
        <TracerKPI metrics={skillGapKPIMetrics} darkMode={darkMode} />
      ) : (
        <div className={`rounded-2xl p-8 border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <div className="flex flex-col items-center justify-center text-center py-8">
            <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-4 ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
              <Activity className={`h-8 w-8 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`} />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>No Skill Gap Metrics Available</h3>
            <p className={`text-sm max-w-md ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Skill gap analysis data will appear here once graduates and employers provide feedback on curriculum competencies.</p>
          </div>
        </div>
      )}

      {/* Skill Gap Overview */}
      {Object.keys(skillGapOverview).length > 0 ? (
        <SkillGapOverview data={skillGapOverview} darkMode={darkMode} />
      ) : (
        <div className={`rounded-2xl p-8 border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <div className="flex flex-col items-center justify-center text-center py-8">
            <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-4 ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
              <TrendingUp className={`h-8 w-8 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`} />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>No Overview Data Available</h3>
            <p className={`text-sm max-w-md ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Overview statistics will be displayed once sufficient data is collected from skill gap assessments.</p>
          </div>
        </div>
      )}

      {/* Demand vs Supply Analytics */}
      {demandSupplySkills.length > 0 ? (
        <DemandSupplyAnalytics data={demandSupplySkills} darkMode={darkMode} />
      ) : (
        <div className={`rounded-2xl p-8 border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <div className="flex flex-col items-center justify-center text-center py-8">
            <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-4 ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
              <Activity className={`h-8 w-8 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`} />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>No Demand Supply Data Available</h3>
            <p className={`text-sm max-w-md ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Demand vs supply analytics will show skill gaps between industry needs and graduate competencies.</p>
          </div>
        </div>
      )}

      {/* Department Gap Analytics */}
      {departmentGaps.length > 0 ? (
        <DepartmentGapAnalytics data={departmentGaps} darkMode={darkMode} />
      ) : (
        <div className={`rounded-2xl p-8 border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <div className="flex flex-col items-center justify-center text-center py-8">
            <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-4 ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
              <Building2 className={`h-8 w-8 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`} />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>No Department Gap Data Available</h3>
            <p className={`text-sm max-w-md ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Department-specific skill gap analysis will appear once data is available.</p>
          </div>
        </div>
      )}

      {/* Emerging Technology Analytics */}
      {emergingTechnologies.length > 0 ? (
        <EmergingTechnologyAnalytics data={emergingTechnologies} darkMode={darkMode} />
      ) : (
        <div className={`rounded-2xl p-8 border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <div className="flex flex-col items-center justify-center text-center py-8">
            <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-4 ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
              <Activity className={`h-8 w-8 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`} />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>No Emerging Technology Data Available</h3>
            <p className={`text-sm max-w-md ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Emerging technology trends and skill requirements will be displayed here.</p>
          </div>
        </div>
      )}

      {/* Certification & Training Analytics */}
      {certificationGaps.length > 0 ? (
        <CertificationTrainingAnalytics data={certificationGaps} darkMode={darkMode} />
      ) : (
        <div className={`rounded-2xl p-8 border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <div className="flex flex-col items-center justify-center text-center py-8">
            <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-4 ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
              <Award className={`h-8 w-8 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`} />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>No Certification Gap Data Available</h3>
            <p className={`text-sm max-w-md ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Industry certification requirements and gaps will be shown here.</p>
          </div>
        </div>
      )}

      {/* Priority Recommendations */}
      {skillGapRecommendations.length > 0 ? (
        <SkillGapRecommendations data={skillGapRecommendations} darkMode={darkMode} />
      ) : (
        <div className={`rounded-2xl p-8 border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <div className="flex flex-col items-center justify-center text-center py-8">
            <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-4 ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
              <Lightbulb className={`h-8 w-8 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`} />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>No Recommendations Available</h3>
            <p className={`text-sm max-w-md ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Curriculum improvement recommendations will be generated based on skill gap analysis.</p>
          </div>
        </div>
      )}

      {/* Executive Insights Panel */}
      {skillGapInsights.length > 0 ? (
        <SkillGapInsightsPanel insights={skillGapInsights} darkMode={darkMode} />
      ) : (
        <div className={`rounded-2xl p-8 border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <div className="flex flex-col items-center justify-center text-center py-8">
            <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-4 ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
              <Info className={`h-8 w-8 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`} />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>No Insights Available</h3>
            <p className={`text-sm max-w-md ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Executive insights and key findings will be displayed here.</p>
          </div>
        </div>
      )}

      {/* Skill Gap Table */}
      {skillGapRecords.length > 0 ? (
        <SkillGapTable records={skillGapRecords} darkMode={darkMode} />
      ) : (
        <div className={`rounded-2xl p-8 border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <div className="flex flex-col items-center justify-center text-center py-8">
            <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-4 ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
              <Table className={`h-8 w-8 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`} />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>No Records Available</h3>
            <p className={`text-sm max-w-md ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Detailed skill gap records will be listed here once data is collected.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillGapAnalysis;
