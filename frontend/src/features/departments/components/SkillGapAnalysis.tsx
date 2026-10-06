import React, { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { Loader2, RefreshCw, Bookmark, Sparkles, Download, Lock } from 'lucide-react';
import { SkillGapFilterState, SkillGapExportOption } from '../types/skillGap.types';
import { departmentService } from '../services/department.service';
import { useAuth } from '../../../contexts/AuthContext';

// Sub-components
import { TracerKPI } from './TracerKPI';
import { SkillGapOverview } from './SkillGapOverview';
import { DemandSupplyAnalytics } from './DemandSupplyAnalytics';
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

export const SkillGapAnalysis: React.FC<SkillGapAnalysisProps> = ({ data: initialPropData, darkMode = false }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const userDept = user?.department || 'Software Engineering';

  const recommendationsRef = useRef<HTMLDivElement>(null);

  // Restore saved filter view from localStorage if available
  const getInitialFilters = (): SkillGapFilterState => {
    try {
      const saved = localStorage.getItem('astu_skill_gap_saved_view');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          department: isAdmin ? (parsed.department || '') : userDept
        };
      }
    } catch (e) {
      // fallback
    }
    return {
      department: isAdmin ? '' : userDept,
      program: '',
      graduationBatch: '',
      industry: '',
      skillCategory: '',
      gapSeverity: '',
      dateRange: ''
    };
  };

  const [filters, setFilters] = useState<SkillGapFilterState>(getInitialFilters);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [skillGapData, setSkillGapData] = useState<any>(null);
  const [showExport, setShowExport] = useState(false);

  // Fetch real telemetry data from backend database
  const fetchTelemetryData = useCallback(async (isSilentRefresh = false) => {
    if (isSilentRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const activeDept = isAdmin ? (filters.department || '') : userDept;
      const response = await departmentService.getOverview({
        department: activeDept,
        industry: filters.industry !== '' ? filters.industry : undefined,
      });

      if (response && response.skillGapAnalytics) {
        setSkillGapData(response.skillGapAnalytics);
      } else if (response && response.data?.skillGapAnalytics) {
        setSkillGapData(response.data.skillGapAnalytics);
      } else if (initialPropData?.skillGapAnalytics) {
        setSkillGapData(initialPropData.skillGapAnalytics);
      }
    } catch (err) {
      console.error('Failed to fetch skill gap analytics telemetry:', err);
      toast.error('Could not refresh skill gap telemetry from database');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters.department, filters.industry, isAdmin, userDept, initialPropData]);

  useEffect(() => {
    fetchTelemetryData();
  }, [fetchTelemetryData]);

  const handleRefresh = () => {
    fetchTelemetryData(true).then(() => {
      toast.success('Skill gap telemetry updated from database!');
    });
  };

  const handleSaveView = () => {
    try {
      localStorage.setItem('astu_skill_gap_saved_view', JSON.stringify(filters));
      toast.success('Skill Gap view state and filter parameters saved!');
    } catch (e) {
      toast.error('Failed to save view preferences');
    }
  };

  const handleGenerateRecommendations = () => {
    if (recommendationsRef.current) {
      recommendationsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    toast.success('Generated top curriculum intervention recommendations based on database telemetry!');
  };

  const handleExportOption = (option: SkillGapExportOption) => {
    console.log('Exporting skill gap option:', option);
  };

  // Derive and filter dynamic datasets based on user selected category & severity filters
  const activeAnalytics = skillGapData || initialPropData?.skillGapAnalytics;

  const kpiMetrics = activeAnalytics?.kpiMetrics || [];
  const overviewData = activeAnalytics?.overview || {
    totalSkills: 0,
    skillsMatched: 0,
    skillsMissing: 0,
    skillsPartiallyCovered: 0,
    skillsToPrioritize: 0
  };

  // Filter demand supply skills
  const rawDemandSkills = activeAnalytics?.demandSupplySkills || [];
  const filteredDemandSkills = rawDemandSkills.filter((item: any) => {
    if (!filters.skillCategory) return true;
    return item.category?.toLowerCase() === filters.skillCategory.toLowerCase();
  });

  const emergingTechnologies = activeAnalytics?.emergingTechnologies || [];
  const certificationGaps = activeAnalytics?.certificationGaps || [];

  // Filter recommendations
  const rawRecommendations = activeAnalytics?.recommendations || [];
  const filteredRecommendations = rawRecommendations.filter((item: any) => {
    if (!filters.gapSeverity) return true;
    return item.priority?.toLowerCase() === filters.gapSeverity.toLowerCase();
  });

  const insights = activeAnalytics?.insights || [];

  // Filter records table
  const rawRecords = activeAnalytics?.records || [];
  const filteredRecords = rawRecords.filter((item: any) => {
    if (filters.skillCategory && item.category?.toLowerCase() !== filters.skillCategory.toLowerCase()) {
      return false;
    }
    if (filters.gapSeverity && item.priority?.toLowerCase() !== filters.gapSeverity.toLowerCase()) {
      return false;
    }
    return true;
  });

  if (loading && !skillGapData) {
    return (
      <div className={`rounded-2xl p-12 text-center border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
        <Loader2 className="h-10 w-10 text-astu-navy animate-spin mx-auto mb-4" />
        <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Calculating Skill Gap Telemetry</h3>
        <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Gathering live employer feedback, job requisitions, and alumni competencies from the database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Skill Gap Analysis & Workforce Demand Intelligence</h2>
              {refreshing && <Loader2 className="h-5 w-5 text-astu-navy animate-spin" />}
            </div>
            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Identify missing graduate competencies and align curriculum with labor market needs</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 font-medium text-sm ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>
            <button
              onClick={handleSaveView}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 font-medium text-sm ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
            >
              <Bookmark className="h-4 w-4 text-amber-500" />
              Save View
            </button>
            <button
              onClick={handleGenerateRecommendations}
              className="flex items-center gap-2 px-4 py-2.5 bg-astu-navy hover:bg-blue-900 text-white rounded-xl transition-all duration-300 font-medium text-sm shadow-sm"
            >
              <Sparkles className="h-4 w-4 text-yellow-400" />
              Generate Recommendations
            </button>
            <button
              onClick={() => setShowExport(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-astu-navy hover:bg-blue-900 text-white rounded-xl transition-all duration-300 font-medium text-sm shadow-sm"
            >
              <Download className="h-4 w-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Dynamic Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Department</label>
              {!isAdmin && (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-astu-navy dark:text-blue-400 bg-astu-navy/10 dark:bg-blue-950/60 px-1.5 py-0.5 rounded">
                  <Lock className="h-3 w-3" /> Locked
                </span>
              )}
            </div>
            <select
              value={isAdmin ? filters.department : userDept}
              disabled={!isAdmin}
              onChange={(e) => isAdmin && setFilters({ ...filters, department: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-astu-navy/50 transition-all ${
                !isAdmin
                  ? 'bg-gray-100 border-gray-300 text-gray-700 cursor-not-allowed dark:bg-slate-800 dark:border-slate-700 dark:text-gray-300 font-medium'
                  : (darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900')
              }`}
            >
              {!isAdmin ? (
                <option value={userDept}>{userDept}</option>
              ) : (
                <>
                  <option value="">All Departments (ASTU Core)</option>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Chemical Engineering">Chemical Engineering</option>
                  <option value="Applied Geology">Applied Geology</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Industry Requisition</label>
            <select
              value={filters.industry}
              onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-astu-navy/50 transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
            >
              <option value="">All Industries</option>
              <option value="Technology">Technology & Software</option>
              <option value="Telecommunications">Telecommunications</option>
              <option value="Finance">Finance & Banking</option>
              <option value="Manufacturing">Manufacturing & Energy</option>
              <option value="Construction">Civil & Construction</option>
            </select>
          </div>

          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Skill Category</label>
            <select
              value={filters.skillCategory}
              onChange={(e) => setFilters({ ...filters, skillCategory: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-astu-navy/50 transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
            >
              <option value="">All Categories</option>
              <option value="Infrastructure">Infrastructure & Cloud</option>
              <option value="DevOps">DevOps & CI/CD</option>
              <option value="AI">AI & Machine Learning</option>
              <option value="Data">Data Engineering</option>
              <option value="Security">Cybersecurity</option>
              <option value="Development">Software Development</option>
              <option value="Embedded">Embedded & Microcontrollers</option>
              <option value="Structural">Structural Analysis</option>
              <option value="Process">Process Control & Safety</option>
              <option value="Geology">Geology & Spatial Data</option>
            </select>
          </div>

          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Gap Severity</label>
            <select
              value={filters.gapSeverity}
              onChange={(e) => setFilters({ ...filters, gapSeverity: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-astu-navy/50 transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
            >
              <option value="">All Severities</option>
              <option value="immediate">Immediate / Critical</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Section */}
      <TracerKPI metrics={kpiMetrics} darkMode={darkMode} />

      {/* Skill Gap Overview */}
      <SkillGapOverview data={overviewData} darkMode={darkMode} />

      {/* Demand vs Supply Analytics */}
      <DemandSupplyAnalytics data={filteredDemandSkills} darkMode={darkMode} />

      {/* Emerging Technology Analytics */}
      <EmergingTechnologyAnalytics data={emergingTechnologies} darkMode={darkMode} />

      {/* Certification & Training Analytics */}
      <CertificationTrainingAnalytics data={certificationGaps} darkMode={darkMode} />

      {/* Priority Recommendations */}
      <div ref={recommendationsRef}>
        <SkillGapRecommendations data={filteredRecommendations} darkMode={darkMode} />
      </div>

      {/* Executive Insights Panel */}
      <SkillGapInsightsPanel insights={insights} darkMode={darkMode} />

      {/* Skill Gap Table */}
      <SkillGapTable records={filteredRecords} darkMode={darkMode} />

      {/* Export Modal with ASTU Seal Logo Branding */}
      {showExport && (
        <SkillGapExport
          data={activeAnalytics}
          departmentName={isAdmin ? (filters.department || userDept) : userDept}
          onExport={handleExportOption}
          onClose={() => setShowExport(false)}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};

export default SkillGapAnalysis;

