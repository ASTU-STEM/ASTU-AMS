import React, { useState } from 'react';
import { AccreditationFilterState, AccreditationExportOption } from '../types/accreditation.types';

// Sub-components
import { TracerKPI } from './TracerKPI';
import { AccreditationOverview } from './AccreditationOverview';
import { TracerEvidenceAnalytics } from './TracerEvidenceAnalytics';
import { EmployerEvidenceAnalytics } from './EmployerEvidenceAnalytics';
import { SkillGapEvidenceAnalytics } from './SkillGapEvidenceAnalytics';
import { CurriculumEvidenceAnalytics } from './CurriculumEvidenceAnalytics';
import { ComplianceStatusPanel } from './ComplianceStatusPanel';
import { AccreditationEvidenceTable } from './AccreditationEvidenceTable';
import { AccreditationInsightsPanel } from './AccreditationInsightsPanel';
import { AccreditationExport } from './AccreditationExport';

// Mock data
import {
  mockAccreditationKPIMetrics,
  mockAccreditationOverview,
  mockTracerEvidence,
  mockEmployerEvidence,
  mockSkillGapEvidence,
  mockCurriculumEvidence,
  mockComplianceStatus,
  mockAccreditationInsights,
  mockAccreditationEvidenceRecords
} from '../services/mockAccreditationData';

interface AccreditationReportsProps {
  data?: any;
  darkMode?: boolean;
}

export const AccreditationReports: React.FC<AccreditationReportsProps> = ({ data, darkMode = false }) => {
  const [filters, setFilters] = useState<AccreditationFilterState>({
    department: '',
    academicYear: '',
    graduationBatch: '',
    accreditationCycle: '',
    reportType: '',
    dateRange: ''
  });
  const [showExport, setShowExport] = useState(false);

  const handleFilterChange = (newFilters: AccreditationFilterState) => {
    setFilters(newFilters);
  };

  const handleRefresh = () => {
    console.log('Refreshing data...');
  };

  const handleExport = () => {
    setShowExport(true);
  };

  const handleExportOption = (option: AccreditationExportOption) => {
    console.log('Exporting:', option);
    // Implement actual export logic
  };

  const handleSaveView = () => {
    console.log('Saving view...');
  };

  const handleGeneratePack = () => {
    console.log('Generating accreditation pack...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Accreditation Reports & Executive Reporting Center</h2>
            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Generate accreditation-ready evidence from tracer, employer, skill, and curriculum analytics</p>
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
              onClick={handleGeneratePack}
              className="flex items-center gap-2 px-4 py-2.5 bg-astu-navy hover:bg-blue-900 text-white rounded-xl transition-all duration-300 font-medium text-sm"
            >
              Generate Accreditation Pack
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            value={filters.academicYear}
            onChange={(e) => setFilters({ ...filters, academicYear: e.target.value })}
            className={`px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-astu-navy/50 transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white'}`}
          >
            <option value="">All Academic Years</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>
          <select
            value={filters.graduationBatch}
            onChange={(e) => setFilters({ ...filters, graduationBatch: e.target.value })}
            className={`px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-astu-navy/50 transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white'}`}
          >
            <option value="">All Batches</option>
            <option value="2025">Batch 2025</option>
            <option value="2024">Batch 2024</option>
            <option value="2023">Batch 2023</option>
          </select>
          <select
            value={filters.accreditationCycle}
            onChange={(e) => setFilters({ ...filters, accreditationCycle: e.target.value })}
            className={`px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-astu-navy/50 transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white'}`}
          >
            <option value="">All Cycles</option>
            <option value="eta">ETA Cycle</option>
            <option value="herqa">HERQA Cycle</option>
          </select>
          <select
            value={filters.reportType}
            onChange={(e) => setFilters({ ...filters, reportType: e.target.value })}
            className={`px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-astu-navy/50 transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white'}`}
          >
            <option value="">All Report Types</option>
            <option value="tracer">Tracer Evidence</option>
            <option value="employer">Employer Evidence</option>
            <option value="skill">Skill Gap Evidence</option>
            <option value="curriculum">Curriculum Evidence</option>
          </select>
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
            className={`px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-astu-navy/50 transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white'}`}
          >
            <option value="">All Time Ranges</option>
            <option value="last-30-days">Last 30 Days</option>
            <option value="last-90-days">Last 90 Days</option>
            <option value="last-year">Last Year</option>
          </select>
        </div>
      </div>

      {/* KPI Section */}
      <TracerKPI metrics={mockAccreditationKPIMetrics} darkMode={darkMode} />

      {/* Accreditation Overview */}
      <AccreditationOverview data={mockAccreditationOverview} />

      {/* Evidence Analytics Sections */}
      <TracerEvidenceAnalytics data={mockTracerEvidence} />
      <EmployerEvidenceAnalytics data={mockEmployerEvidence} />
      <SkillGapEvidenceAnalytics data={mockSkillGapEvidence} />
      <CurriculumEvidenceAnalytics data={mockCurriculumEvidence} />

      {/* Compliance Status Panel */}
      <ComplianceStatusPanel data={mockComplianceStatus} />

      {/* Executive Insights Panel */}
      <AccreditationInsightsPanel insights={mockAccreditationInsights} />

      {/* Accreditation Evidence Table */}
      <AccreditationEvidenceTable records={mockAccreditationEvidenceRecords} />

      {/* Export Modal */}
      {showExport && (
        <AccreditationExport
          onExport={handleExportOption}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
};

export default AccreditationReports;
