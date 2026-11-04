import React, { Suspense, lazy, useState } from 'react';
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
  LogOut,
  Bell,
  Menu,
  Moon,
  Sun,
} from 'lucide-react';
import HelpCenter from '../../../components/HelpCenter';
import { PageLoader } from '../../../components/loaders';
import { useTheme } from '../../../hooks/useTheme';
import toast from 'react-hot-toast';

// Tab Views
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
  const { darkMode, toggleTheme } = useTheme();
  const { activeTab, setActiveTab, loading, profile, jobs, documents, stats, handleApplyJob, handleToggleSaveJob } =
    useAlumniDashboard(defaultTab);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const navItems: Array<{ id: AlumniDashboardTab; label: string; icon: any }> = [
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

  if (loading) {
    return <PageLoader message="Loading your ASTU Alumni Workspace..." />;
  }

  return (
    <div className="flex h-screen bg-[var(--bg-input)] text-[var(--text-primary)] font-sans overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-[var(--border-color)] bg-[var(--bg-sidebar)] transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-[var(--border-color)] px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#003580] text-sm font-black text-white">
            AS
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-[var(--text-primary)]">ASTU Alumni</h1>
            <p className="text-[10px] uppercase tracking-wider text-[var(--accent-cyan)]">Graduate Workspace</p>
          </div>
        </div>

        <nav className="space-y-1 p-3 overflow-y-auto max-h-[calc(100vh-8rem)]">
          {navItems.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setActiveTab(id);
                  setSidebarOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-colors ${
                  active
                    ? 'bg-[var(--brand-primary)] text-white shadow-md'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-[var(--border-color)] bg-[var(--bg-sidebar)] p-3">
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/20"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-navbar)] px-4 md:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--bg-hover)] lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
              {navItems.find((i) => i.id === activeTab)?.label || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                toggleTheme();
                toast.success(darkMode ? 'Light Theme activated!' : 'Premium Dark Theme activated!');
              }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <div className="flex items-center gap-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-1.5 text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-[var(--text-primary)]">{profile?.fullName || user?.firstName || 'Alumni'}</span>
            </div>
          </div>
        </header>

        {/* Tab Content Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
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
            {activeTab === 'settings' && <SettingsTab preferences={{ emailNotifications: true, profileVisibility: 'public' } as any} onSavePreferences={() => {}} />}
          </Suspense>
        </main>
      </div>

      <HelpCenter isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
};

export default AlumniDashboard;
