import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Lock, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../contexts/AuthContext';
import { departmentService } from '../services/department.service';
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

export const TracerReports: React.FC<TracerReportsProps> = ({ darkMode = false }) => {
  const { user } = useAuth();

  // Single department lock: non-admin users can ONLY see their assigned department
  const userDept = user?.department || 'Software Engineering';

  const getInitialFilters = (): TracerFilterState => {
    try {
      const saved = localStorage.getItem('astu_tracer_reports_saved_view');
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
      tracerPeriod: 'all',
      graduationBatch: '',
      academicYear: '',
      employmentStatus: ''
    };
  };

  const [filters, setFilters] = useState<TracerFilterState>(getInitialFilters);
  const [showExport, setShowExport] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tracerAnalytics, setTracerAnalytics] = useState<any>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await departmentService.getOverview({
        department: userDept,
        tracerPeriod: filters.tracerPeriod,
        graduationBatch: filters.graduationBatch,
        academicYear: filters.academicYear,
        employmentStatus: filters.employmentStatus
      });

      if (res?.tracerAnalytics) {
        setTracerAnalytics(res.tracerAnalytics);
      } else {
        setTracerAnalytics(null);
      }
    } catch (err) {
      console.error('Error loading tracer analytics:', err);
      toast.error('Failed to load real-time tracer analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userDept, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (newFilters: TracerFilterState) => {
    const lockedFilters = {
      ...newFilters,
      department: userDept // Always locked to user department
    };
    setFilters(lockedFilters);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    toast.promise(fetchData(), {
      loading: 'Refreshing database telemetry...',
      success: 'Tracer analytics updated live from database',
      error: 'Failed to refresh telemetry'
    });
  };

  const handleExport = () => {
    setShowExport(true);
  };

  const handleExportOption = async (option: TracerExportOption) => {
    setShowExport(false);
    toast.promise(
      departmentService.downloadReport({
        format: option.format as any,
        department: userDept,
        tracerPeriod: filters.tracerPeriod,
        academicYear: filters.academicYear,
        reportType: 'tracer-reports',
        dashboardData: tracerAnalytics ? { tracerAnalytics, department: { name: userDept, code: userDept.split(' ').map(w => w[0]).join('') } } : undefined
      }),
      {
        loading: `Generating ${option.title} report...`,
        success: `${option.title} report generated successfully`,
        error: 'Failed to generate report'
      }
    );
  };

  const handleSaveView = () => {
    try {
      localStorage.setItem('astu_tracer_reports_saved_view', JSON.stringify(filters));
      toast.success('Current filter view saved successfully');
    } catch (e) {
      toast.error('Failed to save view settings');
    }
  };

  if (loading && !tracerAnalytics) {
    return (
      <div className={`rounded-2xl p-12 text-center shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
        <RefreshCw className="h-10 w-10 text-astu-navy animate-spin mx-auto mb-4" />
        <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Loading Tracer Telemetry</h3>
        <p className={`text-sm max-w-md mx-auto ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Computing graduate outcomes, longitudinal milestones, career alignment, and survey completion data for {userDept}...
        </p>
      </div>
    );
  }

  // Safe metrics fallbacks from database payload
  const kpiMetrics = tracerAnalytics?.kpiMetrics || [];
  const timelineData = tracerAnalytics?.timelineData || [];
  const surveyCompletionData = tracerAnalytics?.surveyCompletionData || [];
  const employmentOutcomeData = tracerAnalytics?.employmentOutcomeData || [];
  const careerAlignmentData = tracerAnalytics?.careerAlignmentData || [];
  const benchmarks = tracerAnalytics?.benchmarks;
  const satisfactionData = tracerAnalytics?.satisfactionData || [];
  const overallSatisfaction = tracerAnalytics?.overallSatisfaction;
  const geographicData = tracerAnalytics?.geographicData || [];
  const geographicPercentages = tracerAnalytics?.geographicPercentages;
  const tracerInsights = tracerAnalytics?.tracerInsights || [];
  const records = tracerAnalytics?.records || [];

  return (
    <div className="space-y-6">
      {/* Department Lock Banner */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border ${darkMode ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-blue-50/70 border-blue-200 text-slate-800'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-astu-navy/10 text-astu-navy">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold tracking-tight">{userDept} Tracer Reports</h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-astu-navy text-white">
                <Lock className="h-3 w-3" /> Locked Scope
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Graduate employment tracking and longitudinal studies calculated dynamically from database
            </p>
          </div>
        </div>

        {refreshing && (
          <div className="flex items-center gap-2 text-xs font-semibold text-astu-navy">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Updating Telemetry...</span>
          </div>
        )}
      </div>

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
      <TracerKPI metrics={kpiMetrics} darkMode={darkMode} />

      {/* Timeline Analytics */}
      <TracerTimelineAnalytics data={timelineData} darkMode={darkMode} />

      {/* Survey Completion Analytics */}
      <SurveyCompletionAnalytics data={surveyCompletionData} darkMode={darkMode} />

      {/* Employment Outcome Analytics */}
      <EmploymentOutcomeAnalytics data={employmentOutcomeData} darkMode={darkMode} />

      {/* Career Alignment Analytics */}
      <CareerAlignmentAnalytics data={careerAlignmentData} benchmarks={benchmarks} darkMode={darkMode} />

      {/* Graduate Satisfaction Analytics */}
      <GraduateSatisfactionAnalytics data={satisfactionData} overallSatisfaction={overallSatisfaction} darkMode={darkMode} />

      {/* Geographic Outcome Analytics */}
      <GeographicOutcomeAnalytics data={geographicData} geographicPercentages={geographicPercentages} darkMode={darkMode} />

      {/* Tracer Insights Panel */}
      <TracerInsightsPanel insights={tracerInsights} darkMode={darkMode} />

      {/* Tracer Record Table */}
      <TracerRecordTable records={records} darkMode={darkMode} />

      {/* Export Modal */}
      {showExport && (
        <TracerExport
          onExport={handleExportOption}
          onClose={() => setShowExport(false)}
          userDept={userDept}
          darkMode={darkMode}
          tracerAnalytics={tracerAnalytics}
        />
      )}
    </div>
  );
};

export default TracerReports;
