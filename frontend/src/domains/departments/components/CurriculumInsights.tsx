import React, { useState } from 'react';
import { CurriculumFilterState, CurriculumExportOption } from '../types/curriculum.types';

// Sub-components
import { TracerKPI } from './TracerKPI';
import { CurriculumOverview } from './CurriculumOverview';
import { CourseAlignmentAnalytics } from './CourseAlignmentAnalytics';
import { NewCourseRecommendations } from './NewCourseRecommendations';
import { CourseUpdateAnalytics } from './CourseUpdateAnalytics';
import { AccreditationAlignmentAnalytics } from './AccreditationAlignmentAnalytics';
import { IndustryAlignmentPanel } from './IndustryAlignmentPanel';
import { CurriculumInsightsPanel } from './CurriculumInsightsPanel';
import { CurriculumTable } from './CurriculumTable';
import { CurriculumExport } from './CurriculumExport';



interface CurriculumInsightsProps {
  data?: any;
  darkMode?: boolean;
}

export const CurriculumInsights: React.FC<CurriculumInsightsProps> = ({ data, darkMode = false }) => {
  const [filters, setFilters] = useState<CurriculumFilterState>({
    department: '',
    program: '',
    courseCategory: '',
    academicYear: '',
    industryAlignment: '',
    skillCoverage: '',
    accreditationRequirement: ''
  });
  const [showExport, setShowExport] = useState(false);

  const handleFilterChange = (newFilters: CurriculumFilterState) => {
    setFilters(newFilters);
  };

  const handleRefresh = () => {
    console.log('Refreshing data...');
  };

  const handleExport = () => {
    setShowExport(true);
  };

  const handleExportOption = (option: CurriculumExportOption) => {
    console.log('Exporting:', option);
    // Implement actual export logic
  };

  const handleSaveView = () => {
    console.log('Saving view...');
  };

  const handleGenerateProposal = () => {
    console.log('Generating curriculum proposal...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Curriculum Insights & Academic Alignment Intelligence</h2>
            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Align academic programs with industry demand and graduate outcomes</p>
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
              onClick={handleGenerateProposal}
              className="flex items-center gap-2 px-4 py-2.5 bg-astu-navy hover:bg-blue-900 text-white rounded-xl transition-all duration-300 font-medium text-sm"
            >
              Generate Proposal
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
            <option value="Computer Science">Computer Science</option>
            <option value="Software Engineering">Software Engineering</option>
            <option value="Electrical Engineering">Electrical Engineering</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
          </select>
          <select
            value={filters.courseCategory}
            onChange={(e) => setFilters({ ...filters, courseCategory: e.target.value })}
            className={`px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-astu-navy/50 transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white'}`}
          >
            <option value="">All Categories</option>
            <option value="Core">Core</option>
            <option value="Elective">Elective</option>
            <option value="Lab">Lab</option>
          </select>
          <select
            value={filters.industryAlignment}
            onChange={(e) => setFilters({ ...filters, industryAlignment: e.target.value })}
            className={`px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-astu-navy/50 transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white'}`}
          >
            <option value="">All Alignments</option>
            <option value="high">High Alignment</option>
            <option value="medium">Medium Alignment</option>
            <option value="low">Low Alignment</option>
          </select>
          <select
            value={filters.accreditationRequirement}
            onChange={(e) => setFilters({ ...filters, accreditationRequirement: e.target.value })}
            className={`px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-astu-navy/50 transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white'}`}
          >
            <option value="">All Requirements</option>
            <option value="eta">ETA</option>
            <option value="herqa">HERQA</option>
          </select>
        </div>
      </div>

      {/* KPI Section */}
      {(data?.kpiMetrics || []).length > 0 ? (
        <TracerKPI metrics={data?.kpiMetrics || []} darkMode={darkMode} />
      ) : null}

      {/* Curriculum Overview */}
      <CurriculumOverview data={data?.overview || {}} darkMode={darkMode} />

      {/* Course Alignment Analytics */}
      {(data?.courseAlignment || []).length > 0 ? (
        <CourseAlignmentAnalytics data={data?.courseAlignment || []} darkMode={darkMode} />
      ) : null}

      {/* New Course Recommendations */}
      <NewCourseRecommendations data={data?.recommendations || []} darkMode={darkMode} />

      {/* Course Update Analytics */}
      {(data?.courseUpdates || []).length > 0 ? (
        <CourseUpdateAnalytics data={data?.courseUpdates || []} />
      ) : null}

      {/* Accreditation Alignment Analytics */}
      <AccreditationAlignmentAnalytics data={data?.accreditation || {}} />

      {/* Industry Alignment Panel */}
      {(data?.industryAlignment || []).length > 0 ? (
        <IndustryAlignmentPanel data={data?.industryAlignment || []} />
      ) : null}

      {/* Executive Insights Panel */}
      <CurriculumInsightsPanel insights={data?.insights || []} />

      {/* Curriculum Table */}
      {(data?.records || []).length > 0 ? (
        <CurriculumTable records={data?.records || []} />
      ) : null}

      {/* Export Modal */}
      {showExport && (
        <CurriculumExport
          onExport={handleExportOption}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
};

export default CurriculumInsights;
