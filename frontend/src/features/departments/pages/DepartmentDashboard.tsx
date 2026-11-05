import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import { DashboardShell } from '../../../layouts/DashboardShell';
import type { SidebarNavSection } from '../../../layouts/AppSidebar';

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
import { useTheme } from '../../../hooks/useTheme';

const SIDEBAR_SECTIONS: SidebarNavSection[] = [
  {
    id: 'core',
    label: 'Department Core',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', tooltip: 'Overview & key metrics' },
      { id: 'outcomes-matrix', label: 'Outcomes Matrix', icon: 'query_stats', badge: 'NEW', tooltip: 'Graduate Employment Outcomes Matrix' },
      { id: 'wave-audit', label: 'Wave 3 Audit', icon: 'rule', badge: 'NEW', tooltip: 'Wave 3 Tracer Study & Curriculum Audit' },
      { id: 'employment-analytics', label: 'Employment Analytics', icon: 'trending_up', tooltip: 'Graduate employment outcomes & trends' },
      { id: 'management', label: 'Management Hub', icon: 'dashboard_customize', tooltip: 'Analytics, curriculum, KPIs & partnerships' },
    ],
  },
  {
    id: 'surveys',
    label: 'Analytics & Surveys',
    items: [
      { id: 'department-surveys', label: 'Department Surveys', icon: 'edit_note', badge: 'NEW', tooltip: 'Custom department surveys & alerts' },
      { id: 'skill-gap', label: 'Skill Gap Reports', icon: 'school', tooltip: 'Skill gap analysis from employer data' },
      { id: 'employer-feedback', label: 'Employer Feedback', icon: 'rate_review', tooltip: 'Employer reviews & curriculum feedback' },
      { id: 'messages', label: 'Messages', icon: 'chat', tooltip: 'ASTU_AMS direct messaging hub' },
    ],
  },
  {
    id: 'reports',
    label: 'Reports & Audit',
    items: [
      { id: 'tracer-reports', label: 'Tracer Reports', icon: 'assignment', tooltip: 'Tracer study reports & surveys' },
      { id: 'curriculum', label: 'Curriculum Insights', icon: 'menu_book', tooltip: 'Curriculum review & analytics' },
      { id: 'accreditation', label: 'Accreditation Reports', icon: 'verified', tooltip: 'Accreditation-ready reports' },
      { id: 'export', label: 'Export Reports', icon: 'download', tooltip: 'Export data & reports' },
    ],
  },
];

export const DepartmentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { darkMode } = useTheme();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const userName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    (user as any)?.name ||
    'Department Head';
  const userInitials = userName
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'DH';

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
                type="button"
                onClick={() => setActiveTab('outcomes-matrix')}
                className="bg-[var(--bg-card)] border border-[var(--border-color)] p-5 rounded-xl text-left hover:border-[#003580] transition-all"
              >
                <div className="text-base font-semibold text-[var(--text-primary)]">Employment Outcomes Matrix</div>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Cross-cohort placement rates, velocity and top corporate hiring partners.
                </p>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('wave-audit')}
                className="bg-[var(--bg-card)] border border-[var(--border-color)] p-5 rounded-xl text-left hover:border-[#003580] transition-all"
              >
                <div className="text-base font-semibold text-[var(--text-primary)]">Wave 3 Tracer & Curriculum Audit</div>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Syllabus relevance ratings, employer satisfaction, and ABET recommendations.
                </p>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('accreditation')}
                className="bg-[var(--bg-card)] border border-[var(--border-color)] p-5 rounded-xl text-left hover:border-[#003580] transition-all"
              >
                <div className="text-base font-semibold text-[var(--text-primary)]">Accreditation Reports</div>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  ETA and international engineering accreditation compliance artifacts.
                </p>
              </button>
            </div>
          </div>
        );
      default:
        return <DashboardOverview darkMode={darkMode} />;
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <DashboardShell
        sidebarSections={SIDEBAR_SECTIONS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        title="ASTU Department"
        subtitle="Management Portal"
        brand="Department"
        userName={userName}
        userRole="Department Head"
        userInitials={userInitials}
        onLogout={logout}
        searchPlaceholder="Search department workspace..."
        logoSrc="/images/astu-seal-logo.png"
      >
        {renderActiveTabContent()}
      </DashboardShell>
    </>
  );
};

export default DepartmentDashboard;
