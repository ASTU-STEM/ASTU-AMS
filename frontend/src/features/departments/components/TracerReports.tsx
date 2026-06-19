import React, { useState } from 'react';
import { TracerFilterState, TracerExportOption } from '../types/tracer.types';

// Sub-components
import { TracerFilters } from './TracerFilters';
import { TracerKPI } from './TracerKPI';
import { TracerTimelineAnalytics } from './TracerTimelineAnalytics';
import { SurveyCompletionAnalytics } from './SurveyCompletionAnalytics';
import { EmploymentOutcomeAnalytics } from './EmploymentOutcomeAnalytics';
import { CareerAlignmentAnalytics } from './CareerAlignmentAnalytics';
import { GraduateSatisfactionAnalytics } from './GraduateSatisfactionAnalytics';
import { GeographicOutcomeAnalytics } from './GeographicOutcomeAnalytics';
import { TracerInsightsPanel } from './TracerInsightsPanel';
import { TracerRecordTable } from './TracerRecordTable';
import { TracerExport } from './TracerExport';

// Mock data
import {
  mockTracerKPIMetrics,
  mockTracerTimelineData,
  mockSurveyCompletionData,
  mockEmploymentOutcomeData,
  mockCareerAlignmentData,
  mockSatisfactionData,
  mockGeographicData,
  mockTracerInsights,
  mockTracerRecords
} from '../services/mockTracerData';

interface TracerReportsProps {
  data?: any;
  darkMode?: boolean;
}

export const TracerReports: React.FC<TracerReportsProps> = ({ data, darkMode = false }) => {
  const [filters, setFilters] = useState<TracerFilterState>({
    department: '',
    tracerPeriod: 'all',
    graduationBatch: '',
    academicYear: '',
    employmentStatus: ''
  });
  const [showExport, setShowExport] = useState(false);

  const handleFilterChange = (newFilters: TracerFilterState) => {
    setFilters(newFilters);
  };

  const handleRefresh = () => {
    console.log('Refreshing data...');
  };

  const handleExport = () => {
    setShowExport(true);
  };

  const handleExportOption = (option: TracerExportOption) => {
    console.log('Exporting:', option);
    // Implement actual export logic
  };

  const handleSaveView = () => {
    console.log('Saving view...');
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <TracerFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onRefresh={handleRefresh}
        onExport={handleExport}
        onSaveView={handleSaveView}
        darkMode={darkMode}
      />

      {/* KPI Cards */}
      <TracerKPI metrics={mockTracerKPIMetrics} darkMode={darkMode} />

      {/* Timeline Analytics */}
      <TracerTimelineAnalytics data={mockTracerTimelineData} darkMode={darkMode} />

      {/* Survey Completion Analytics */}
      <SurveyCompletionAnalytics data={mockSurveyCompletionData} darkMode={darkMode} />

      {/* Employment Outcome Analytics */}
      <EmploymentOutcomeAnalytics data={mockEmploymentOutcomeData} darkMode={darkMode} />

      {/* Career Alignment Analytics */}
      <CareerAlignmentAnalytics data={mockCareerAlignmentData} darkMode={darkMode} />

      {/* Graduate Satisfaction Analytics */}
      <GraduateSatisfactionAnalytics data={mockSatisfactionData} darkMode={darkMode} />

      {/* Geographic Outcome Analytics */}
      <GeographicOutcomeAnalytics data={mockGeographicData} darkMode={darkMode} />

      {/* Tracer Insights Panel */}
      <TracerInsightsPanel insights={mockTracerInsights} darkMode={darkMode} />

      {/* Tracer Record Table */}
      <TracerRecordTable records={mockTracerRecords} darkMode={darkMode} />

      {/* Export Modal */}
      {showExport && (
        <TracerExport
          onExport={handleExportOption}
          onClose={() => setShowExport(false)}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};

export default TracerReports;
