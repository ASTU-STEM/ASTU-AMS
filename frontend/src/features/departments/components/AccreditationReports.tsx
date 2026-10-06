import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Download, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../contexts/AuthContext';
import { departmentService } from '../services/department.service';
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

interface AccreditationReportsProps {
  data?: any;
  darkMode?: boolean;
}

export const AccreditationReports: React.FC<AccreditationReportsProps> = ({ darkMode = false }) => {
  const { user } = useAuth();
  const userDept = user?.department || 'Software Engineering';

  const [filters, setFilters] = useState<AccreditationFilterState>(() => {
    try {
      const saved = localStorage.getItem(`astu_accreditation_filters_${userDept}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          department: userDept,
          academicYear: parsed.academicYear || '',
          graduationBatch: parsed.graduationBatch || '',
          accreditationCycle: parsed.accreditationCycle || '',
          reportType: parsed.reportType || '',
          dateRange: parsed.dateRange || ''
        };
      }
    } catch (e) {
      console.error('Error loading saved accreditation view:', e);
    }
    return {
      department: userDept,
      academicYear: '',
      graduationBatch: '',
      accreditationCycle: '',
      reportType: '',
      dateRange: ''
    };
  });

  const [loading, setLoading] = useState(true);
  const [accreditationAnalytics, setAccreditationAnalytics] = useState<any>(null);
  const [showExport, setShowExport] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await departmentService.getOverview({
        department: userDept,
        academicYear: filters.academicYear,
        graduationBatch: filters.graduationBatch,
      });

      if (res?.accreditationAnalytics) {
        setAccreditationAnalytics(res.accreditationAnalytics);
      } else {
        setAccreditationAnalytics(null);
      }
    } catch (err) {
      console.error('Error loading accreditation analytics:', err);
      toast.error('Failed to load accreditation evidence from database');
    } finally {
      setLoading(false);
    }
  }, [userDept, filters.academicYear, filters.graduationBatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    toast.promise(fetchData(), {
      loading: 'Refreshing accreditation audit evidence...',
      success: 'Accreditation evidence updated live from database',
      error: 'Failed to refresh accreditation evidence'
    });
  };

  const handleExport = () => {
    setShowExport(true);
  };

  const handleExportOption = async (option: AccreditationExportOption) => {
    setShowExport(false);
    toast.promise(
      departmentService.downloadReport({
        format: option.format as any,
        department: userDept,
        academicYear: filters.academicYear,
        reportType: 'accreditation',
        dashboardData: accreditationAnalytics ? { accreditationAnalytics, department: { name: userDept } } : undefined
      }),
      {
        loading: 'Generating accreditation evidence report...',
        success: 'Accreditation evidence report generated successfully',
        error: 'Failed to generate report'
      }
    );
  };

  const handleSaveView = () => {
    try {
      localStorage.setItem(`astu_accreditation_filters_${userDept}`, JSON.stringify(filters));
      toast.success(`Accreditation view preferences saved for ${userDept}`);
    } catch (e) {
      console.error('Error saving accreditation view:', e);
      toast.error('Failed to save view preferences');
    }
  };

  const handleGeneratePack = () => {
    toast.promise(
      departmentService.downloadReport({
        format: 'pdf',
        department: userDept,
        reportType: 'accreditation',
        dashboardData: accreditationAnalytics ? { accreditationAnalytics, department: { name: userDept } } : undefined
      }),
      {
        loading: 'Generating complete accreditation audit pack...',
        success: 'Accreditation audit pack ready for download',
        error: 'Failed to generate audit pack'
      }
    );
  };

  if (loading && !accreditationAnalytics) {
    return (
      <div className={`rounded-2xl p-12 text-center shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
        <RefreshCw className="h-10 w-10 text-astu-navy animate-spin mx-auto mb-4" />
        <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Loading Accreditation Telemetry & Audit Evidence</h3>
        <p className={`text-sm max-w-md mx-auto ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Extracting ABET audit evidence, employer evaluations, student outcomes, and tracer telemetry for {userDept}...
        </p>
      </div>
    );
  }

  const kpiMetrics = accreditationAnalytics?.kpiMetrics || [];
  const overviewData = accreditationAnalytics?.overview || {
    overallReadinessStatus: 'needs-work',
    totalEvidenceItems: 0,
    missingEvidenceItems: 0,
    completedEvidenceItems: 0,
    pendingComplianceAreas: 0
  };
  const tracerEvidenceData = accreditationAnalytics?.tracerEvidence || {
    surveyCompletionRate: 0,
    responseRateByBatch: 0,
    employmentOutcomes: 0,
    salaryProgression: 0,
    alignmentMetrics: 0,
    geographicDistribution: 0
  };
  const employerEvidenceData = accreditationAnalytics?.employerEvidence || {
    employerResponseRate: 0,
    satisfactionScores: 0,
    competencyRatings: 0,
    industryDemandTrends: 0,
    recommendationsFrequency: 0,
    repeatEmployerEngagement: 0
  };
  const skillGapEvidenceData = accreditationAnalytics?.skillGapEvidence || {
    criticalSkillGaps: 0,
    industryDemand: 0,
    coverageRate: 0,
    trainingPriorities: 0,
    certificationGaps: 0,
    departmentRiskAreas: 0
  };
  const curriculumEvidenceData = accreditationAnalytics?.curriculumEvidence || {
    alignmentScore: 0,
    outdatedCourses: 0,
    newCourseRecommendations: 0,
    accreditationCompliance: 0,
    practicalTheoryBalance: 0,
    updatePriorities: 0
  };
  const complianceStatusData = accreditationAnalytics?.complianceStatus || {
    compliantItems: 0,
    partiallyCompliantItems: 0,
    nonCompliantItems: 0,
    actionRequired: 0,
    completionEstimate: 'N/A',
    responsibleArea: 'Department Academic Committee'
  };
  const insightsData = accreditationAnalytics?.accreditationInsights || [];
  const evidenceRecords = accreditationAnalytics?.evidenceRecords || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Accreditation Reports & Executive Reporting Center</h2>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-astu-navy/10 text-astu-navy border border-astu-navy/20">
                <Lock className="h-3.5 w-3.5" />
                {userDept} Scope
              </span>
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Generate accreditation-ready evidence calculated dynamically from tracer, employer, skill, and curriculum analytics</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 font-medium text-sm ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
            >
              <RefreshCw className="h-4 w-4" />
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
              <Download className="h-4 w-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative">
            <select
              disabled
              value={userDept}
              className={`w-full px-4 py-2.5 rounded-xl text-sm font-semibold border focus:outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-gray-100 border-gray-200 text-slate-700'}`}
            >
              <option value={userDept}>{userDept} (Locked Scope)</option>
            </select>
          </div>
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
        </div>
      </div>

      {/* KPI Section */}
      <TracerKPI metrics={kpiMetrics} darkMode={darkMode} />

      {/* Accreditation Overview */}
      <AccreditationOverview data={overviewData} />

      {/* Evidence Analytics Sections */}
      <TracerEvidenceAnalytics data={tracerEvidenceData} />
      <EmployerEvidenceAnalytics data={employerEvidenceData} />
      <SkillGapEvidenceAnalytics data={skillGapEvidenceData} />
      <CurriculumEvidenceAnalytics data={curriculumEvidenceData} />

      {/* Compliance Status Panel */}
      <ComplianceStatusPanel data={complianceStatusData} />

      {/* Executive Insights Panel */}
      <AccreditationInsightsPanel insights={insightsData} />

      {/* Accreditation Evidence Table */}
      <AccreditationEvidenceTable records={evidenceRecords} />

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
