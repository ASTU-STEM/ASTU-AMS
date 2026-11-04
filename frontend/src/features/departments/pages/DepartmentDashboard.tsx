import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../hooks/useTheme';
import { Toaster } from 'react-hot-toast';
import HelpCenter from '../../../components/HelpCenter';

// Navigation Components
import { DepartmentSidebar } from '../components/navigation/DepartmentSidebar';
import { DepartmentHeader } from '../components/navigation/DepartmentHeader';

// Feature Tabs
import { DashboardOverview } from '../components/DashboardOverview';
import { EmploymentOutcomesMatrix } from '../components/outcomes/EmploymentOutcomesMatrix';
import { TracerStudyWaveAudit } from '../components/tracer/TracerStudyWaveAudit';
import { EmploymentAnalytics } from '../components/EmploymentAnalytics';
import { SkillGapAnalysis } from '../components/SkillGapAnalysis';
import { EmployerFeedback } from '../components/EmployerFeedback';
import { DepartmentSurveyCenter } from '../components/DepartmentSurveyCenter';
import { TracerReports } from '../components/TracerReports';
import { CurriculumInsights } from '../components/CurriculumInsights';
import { AccreditationReports } from '../components/AccreditationReports';
import { ExportCenter } from '../components/ExportCenter';
import { TelegramChat } from '../../../components/TelegramChat';
import InstitutionalHubBridge from '../../../components/InstitutionalHubBridge';

export const DepartmentDashboard: React.FC = () => {
  const { logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => 
    localStorage.getItem('department_sidebar_collapsed') === 'true'
  );
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [helpOpen, setHelpOpen] = useState(false);

  const handleSidebarCollapseToggle = (val: boolean | ((prev: boolean) => boolean)) => {
    setSidebarCollapsed(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      localStorage.setItem('department_sidebar_collapsed', String(next));
      return next;
    });
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview darkMode={darkMode} />;
      case 'outcomes-matrix':
        return <EmploymentOutcomesMatrix />;
      case 'wave-audit':
        return <TracerStudyWaveAudit />;
      case 'employment-analytics':
        return <EmploymentAnalytics darkMode={darkMode} />;
      case 'skill-gap':
        return <SkillGapAnalysis darkMode={darkMode} />;
      case 'employer-feedback':
        return <EmployerFeedback darkMode={darkMode} />;
      case 'department-surveys':
        return <DepartmentSurveyCenter darkMode={darkMode} />;
      case 'tracer-reports':
        return <TracerReports darkMode={darkMode} />;
      case 'curriculum':
        return <CurriculumInsights darkMode={darkMode} />;
      case 'accreditation':
        return <AccreditationReports darkMode={darkMode} />;
      case 'export':
        return <ExportCenter darkMode={darkMode} />;
      case 'messages':
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">ASTU Direct Messaging Hub</h2>
            <TelegramChat darkMode={darkMode} />
          </div>
        );
      case 'management':
        return (
          <div className="space-y-6">
            <InstitutionalHubBridge currentHub="department" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button 
                onClick={() => setActiveTab('outcomes-matrix')} 
                className="bg-[var(--bg-card)] border border-[var(--border-color)] p-5 rounded-xl text-left hover:border-[#2196F3] transition-all"
              >
                <div className="text-base font-semibold text-[var(--text-primary)]">Employment Outcomes Matrix</div>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Cross-cohort placement rates, velocity and top corporate hiring partners.</p>
              </button>
              <button 
                onClick={() => setActiveTab('wave-audit')} 
                className="bg-[var(--bg-card)] border border-[var(--border-color)] p-5 rounded-xl text-left hover:border-[#2196F3] transition-all"
              >
                <div className="text-base font-semibold text-[var(--text-primary)]">Wave 3 Tracer & Curriculum Audit</div>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Syllabus relevance ratings, employer satisfaction, and ABET recommendations.</p>
              </button>
              <button 
                onClick={() => setActiveTab('accreditation')} 
                className="bg-[var(--bg-card)] border border-[var(--border-color)] p-5 rounded-xl text-left hover:border-[#2196F3] transition-all"
              >
                <div className="text-base font-semibold text-[var(--text-primary)]">Accreditation Reports</div>
                <p className="text-xs text-[var(--text-secondary)] mt-1">ETA and international engineering accreditation compliance artifacts.</p>
              </button>
            </div>
          </div>
        );
      default:
        return <DashboardOverview darkMode={darkMode} />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-input)] text-[var(--text-primary)] antialiased font-sans">
      <Toaster position="top-right" />

      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar */}
      <DepartmentSidebar
        sidebarCollapsed={sidebarCollapsed}
        mobileSidebarOpen={mobileSidebarOpen}
        activeTab={activeTab}
        setActiveTab={(t) => {
          setActiveTab(t);
          setMobileSidebarOpen(false);
        }}
        onOpenHelp={() => setHelpOpen(true)}
        onLogout={logout}
      />

      {/* Main Content Area */}
      <div className={`flex flex-col min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'md:pl-20' : 'md:pl-72'}`}>
        <DepartmentHeader
          activeTab={activeTab}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={handleSidebarCollapseToggle}
          setMobileSidebarOpen={setMobileSidebarOpen}
          darkMode={darkMode}
          toggleTheme={toggleTheme}
          onNavigateTab={setActiveTab}
        />

        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
          {renderActiveTabContent()}
        </main>
      </div>

      <HelpCenter isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
};

export default DepartmentDashboard;
