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

interface TracerReportsProps {
  data?: any;
  darkMode?: boolean;
}

export const TracerReports: React.FC<TracerReportsProps> = ({ data, darkMode = false }) => {
  const [filters, setFilters] = useState<TracerFilterState>({
    department: 'Computer Science',
    batch: '2024',
    academicYear: '2024',
    employmentStatus: 'All'
  });

  // Use data from props or provide empty defaults
  const tracerKPIMetrics = data?.kpiMetrics || [];
  const tracerTimelineData = data?.timelineData || [];
  const surveyCompletionData = data?.completionData || [];
  const employmentOutcomeData = data?.outcomeData || [];
  const careerAlignmentData = data?.alignmentData || [];
  const satisfactionData = data?.satisfactionData || [];
  const geographicData = data?.geographicData || [];
  const tracerInsights = data?.insights || [];
  const tracerRecords = data?.records || [];

  const handleFilterChange = (newFilters: TracerFilterState) => {
    setFilters(newFilters);
  };

  const handleRefresh = () => {
    console.log('Refreshing data...');
  };

  const handleExport = () => {
    console.log('Exporting tracer reports...');
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
      <TracerKPI metrics={tracerKPIMetrics} darkMode={darkMode} />

      {/* Timeline Analytics */}
      <TracerTimelineAnalytics data={tracerTimelineData} darkMode={darkMode} />

      {/* Survey Completion Analytics */}
      <SurveyCompletionAnalytics data={surveyCompletionData} darkMode={darkMode} />

      {/* Employment Outcome Analytics */}
      <EmploymentOutcomeAnalytics data={employmentOutcomeData} darkMode={darkMode} />

      {/* Career Alignment Analytics */}
      <CareerAlignmentAnalytics data={careerAlignmentData} darkMode={darkMode} />

      {/* Graduate Satisfaction Analytics */}
      <GraduateSatisfactionAnalytics data={satisfactionData} darkMode={darkMode} />

      {/* Geographic Outcome Analytics */}
      <GeographicOutcomeAnalytics data={geographicData} darkMode={darkMode} />

      {/* Tracer Insights Panel */}
      <TracerInsightsPanel insights={tracerInsights} darkMode={darkMode} />

      {/* Tracer Record Table */}
      <TracerRecordTable records={tracerRecords} darkMode={darkMode} />
    </div>
  );
};

export default TracerReports;
