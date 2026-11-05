import React, { Suspense, lazy } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useAlumniDashboard } from '../hooks/useAlumniDashboard';
import { AlumniDashboardTab } from '../types/alumniDashboard.types';
import {
  LayoutDashboard,
  Briefcase,
  User,
  FileText,
  Users,
  Compass,
  ClipboardList,
  Wrench,
  Settings,
} from 'lucide-react';
import { PageLoader } from '../../../components/loaders';
import { DashboardShell } from '../../../layouts/DashboardShell';
import type { SidebarNavItem } from '../../../layouts/AppSidebar';

import { DashboardOverview } from '../components/DashboardOverview';
import { CareerJobsTab } from '../components/tabs/CareerJobsTab';
import { ProfileMatrixTab } from '../components/tabs/ProfileMatrixTab';
import { DocumentServicesTrackerTab } from '../components/tabs/DocumentServicesTrackerTab';
const MentorshipTab = lazy(() => import('../components/MentorshipTab').then((m) => ({ default: m.MentorshipTab })));
const SurveysTab = lazy(() => import('../components/SurveysTab').then((m) => ({ default: m.SurveysTab })));
const AlumniDirectoryTab = lazy(() => import('../components/AlumniDirectoryTab').then((m) => ({ default: m.AlumniDirectoryTab })));
const AlumniToolsPage = lazy(() => import('../../tools/pages/AlumniToolsPage').then((m) => ({ default: m.AlumniToolsPage })));
const SettingsTab = lazy(() => import('../components/SettingsTab').then((m) => ({ default: m.SettingsTab })));

interface AlumniDashboardProps {
  defaultTab?: string;
}

export const AlumniDashboard: React.FC<AlumniDashboardProps> = ({ defaultTab }) => {
  const { user, logout } = useAuth();
  const { activeTab, setActiveTab, loading, profile, jobs, documents, handleApplyJob, handleToggleSaveJob } =
    useAlumniDashboard(defaultTab);

  const navItems: Array<{ id: AlumniDashboardTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'jobs', label: 'Career & Jobs', icon: Briefcase },
    { id: 'profile', label: 'Profile & Skills', icon: User },
    { id: 'documents', label: 'Document Services', icon: FileText },
    { id: 'mentorship', label: 'Mentorship', icon: Compass },
    { id: 'directory', label: 'Alumni Directory', icon: Users },
    { id: 'surveys', label: 'Surveys', icon: ClipboardList },
    { id: 'tools', label: 'Alumni Tools', icon: Wrench },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const sidebarItems: SidebarNavItem[] = navItems.map(({ id, label, icon: Icon }) => ({
    id,
    label,
    iconNode: <Icon className="h-4 w-4" />,
  }));

  const userName = profile?.fullName || user?.firstName || 'Alumni';
  const userInitials = userName
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'AL';

  if (loading) {
    return <PageLoader message="Loading your ASTU Alumni Workspace..." />;
  }

  return (
    <DashboardShell
      sidebarItems={sidebarItems}
      activeTab={activeTab}
      onTabChange={(tab) => setActiveTab(tab as AlumniDashboardTab)}
      title="ASTU Alumni"
      subtitle="Graduate Workspace"
      brand="Alumni"
      userName={userName}
      userRole="Alumni Account"
      userInitials={userInitials}
      onLogout={logout}
      searchPlaceholder="Search alumni workspace..."
      logoSrc="/images/astu-seal-logo.png"
      menuActions={[
        {
          id: 'profile',
          label: 'My Profile',
          icon: <User className="h-4 w-4" />,
          onClick: () => setActiveTab('profile'),
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: <Settings className="h-4 w-4" />,
          onClick: () => setActiveTab('settings'),
        },
      ]}
    >
      <Suspense fallback={<PageLoader message="Loading section..." />}>
        {activeTab === 'overview' && (
          <DashboardOverview
            profile={profile}
            jobs={jobs}
            surveys={[]}
            mentors={[]}
            events={[]}
            documents={documents}
            onSelectTab={setActiveTab as any}
            onViewJob={() => setActiveTab('jobs')}
            onViewMentor={() => setActiveTab('mentorship')}
          />
        )}
        {activeTab === 'jobs' && (
          <CareerJobsTab jobs={jobs} onApply={handleApplyJob} onToggleSave={handleToggleSaveJob} />
        )}
        {activeTab === 'profile' && <ProfileMatrixTab profile={profile} />}
        {activeTab === 'documents' && <DocumentServicesTrackerTab documentRequests={documents} />}
        {activeTab === 'mentorship' && (
          <MentorshipTab mentors={[]} myMentors={[]} onConnectMentor={() => {}} onViewProfile={() => {}} />
        )}
        {activeTab === 'directory' && <AlumniDirectoryTab />}
        {activeTab === 'surveys' && <SurveysTab surveys={[]} onTakeSurvey={() => {}} />}
        {activeTab === 'tools' && <AlumniToolsPage />}
        {activeTab === 'settings' && (
          <SettingsTab
            preferences={{ emailNotifications: true, profileVisibility: 'public' } as any}
            onSavePreferences={() => {}}
          />
        )}
      </Suspense>
    </DashboardShell>
  );
};

export default AlumniDashboard;
