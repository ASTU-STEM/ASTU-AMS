import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Download, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../contexts/AuthContext';
import { departmentService } from '../services/department.service';
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

export const CurriculumInsights: React.FC<CurriculumInsightsProps> = ({ darkMode = false }) => {
  const { user } = useAuth();
  const userDept = user?.department || 'Software Engineering';

  const [filters, setFilters] = useState<CurriculumFilterState>(() => {
    try {
      const saved = localStorage.getItem(`astu_curriculum_filters_${userDept}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          department: userDept,
          program: parsed.program || '',
          courseCategory: parsed.courseCategory || '',
          academicYear: parsed.academicYear || '',
          industryAlignment: parsed.industryAlignment || '',
          skillCoverage: parsed.skillCoverage || '',
          accreditationRequirement: parsed.accreditationRequirement || ''
        };
      }
    } catch (e) {
      console.error('Error loading saved curriculum view:', e);
    }
    return {
      department: userDept,
      program: '',
      courseCategory: '',
      academicYear: '',
      industryAlignment: '',
      skillCoverage: '',
      accreditationRequirement: ''
    };
  });

  const [loading, setLoading] = useState(true);
  const [curriculumAnalytics, setCurriculumAnalytics] = useState<any>(null);
  const [showExport, setShowExport] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await departmentService.getOverview({
        department: userDept,
        academicYear: filters.academicYear,
      });

      if (res?.curriculumAnalytics) {
        setCurriculumAnalytics(res.curriculumAnalytics);
      } else {
        setCurriculumAnalytics(null);
      }
    } catch (err) {
      console.error('Error loading curriculum analytics:', err);
      toast.error('Failed to load curriculum analytics');
    } finally {
      setLoading(false);
    }
  }, [userDept, filters.academicYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    toast.promise(fetchData(), {
      loading: 'Refreshing curriculum telemetry...',
      success: 'Curriculum analytics updated live from database',
      error: 'Failed to refresh curriculum telemetry'
    });
  };

  const handleExport = () => {
    setShowExport(true);
  };

  const handleExportOption = async (option: CurriculumExportOption) => {
    setShowExport(false);
    toast.promise(
      departmentService.downloadReport({
        format: option.format as any,
        department: userDept,
        academicYear: filters.academicYear,
        reportType: 'curriculum',
        dashboardData: curriculumAnalytics ? { curriculumAnalytics, department: { name: userDept } } : undefined
      }),
      {
        loading: 'Generating curriculum report...',
        success: 'Curriculum report generated successfully',
        error: 'Failed to generate report'
      }
    );
  };

  const handleSaveView = () => {
    try {
      localStorage.setItem(`astu_curriculum_filters_${userDept}`, JSON.stringify(filters));
      toast.success(`Curriculum view preferences saved for ${userDept}`);
    } catch (e) {
      console.error('Error saving curriculum view:', e);
      toast.error('Failed to save view preferences');
    }
  };

  const handleGenerateProposal = () => {
    toast.promise(
      departmentService.downloadReport({
        format: 'pdf',
        department: userDept,
        academicYear: filters.academicYear,
        reportType: 'curriculum',
        dashboardData: curriculumAnalytics ? { curriculumAnalytics, department: { name: userDept } } : undefined
      }),
      {
        loading: 'Generating official executive curriculum proposal...',
        success: 'Curriculum proposal generated and ready for print/download',
        error: 'Failed to generate curriculum proposal'
      }
    );
  };

  if (loading && !curriculumAnalytics) {
    return (
      <div className={`rounded-2xl p-12 text-center shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
        <RefreshCw className="h-10 w-10 text-astu-navy animate-spin mx-auto mb-4" />
        <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Loading Curriculum Intelligence</h3>
        <p className={`text-sm max-w-md mx-auto ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Computing course alignment, industry relevancy, and ABET curriculum metrics for {userDept}...
        </p>
      </div>
    );
  }

  const kpiMetrics = curriculumAnalytics?.kpiMetrics || [];
  const overviewData = curriculumAnalytics?.overview || { totalReviewed: 0, highAlignment: 0, mediumAlignment: 0, lowAlignment: 0, pendingUpdate: 0 };
  const courseAlignmentData = curriculumAnalytics?.courseAlignment || [];
  const newCourseData = curriculumAnalytics?.newCourseRecommendations || [];
  const courseUpdateData = curriculumAnalytics?.courseUpdates || [];
  const accreditationData = curriculumAnalytics?.accreditationAlignment || [];
  const industryData = curriculumAnalytics?.industryAlignment || { topPerformingSkills: [], improvementAreas: [] };
  const insightsData = curriculumAnalytics?.curriculumInsights || [];
  const recordsData = curriculumAnalytics?.records || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Curriculum Insights & Academic Alignment Intelligence</h2>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-astu-navy/10 text-astu-navy border border-astu-navy/20">
                <Lock className="h-3.5 w-3.5" />
                {userDept} Scope
              </span>
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Align academic programs with real database employer feedback and graduate telemetry</p>
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
              onClick={handleGenerateProposal}
              className="flex items-center gap-2 px-4 py-2.5 bg-astu-navy hover:bg-blue-900 text-white rounded-xl transition-all duration-300 font-medium text-sm"
            >
              Generate Proposal
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
      <TracerKPI metrics={kpiMetrics} darkMode={darkMode} />

      {/* Curriculum Overview */}
      <CurriculumOverview data={overviewData} darkMode={darkMode} />

      {/* Course Alignment Analytics */}
      <CourseAlignmentAnalytics data={courseAlignmentData} darkMode={darkMode} />

      {/* New Course Recommendations */}
      <NewCourseRecommendations data={newCourseData} darkMode={darkMode} />

      {/* Course Update Analytics */}
      <CourseUpdateAnalytics data={courseUpdateData} />

      {/* Accreditation Alignment Analytics */}
      <AccreditationAlignmentAnalytics data={accreditationData} />

      {/* Industry Alignment Panel */}
      <IndustryAlignmentPanel data={industryData} />

      {/* Executive Insights Panel */}
      <CurriculumInsightsPanel insights={insightsData} />

      {/* Curriculum Table */}
      <CurriculumTable records={recordsData} />

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
