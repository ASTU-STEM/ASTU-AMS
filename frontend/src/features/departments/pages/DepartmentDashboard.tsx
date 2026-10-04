import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '../../../hooks/useTheme';
import { useAuth } from '../../../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  ChevronDown,
  HelpCircle,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  ClipboardList,
  Search,
  Sun,
  TrendingUp,
  Users,
  type LucideIcon,
} from 'lucide-react';
import HelpCenter from '../../../components/HelpCenter';
import { DashboardOverview } from '../components/DashboardOverview';
import { EmploymentAnalytics } from '../components/EmploymentAnalytics';
import { GraduatesDirectory } from '../components/GraduatesDirectory';
import { DepartmentSurveyCenter } from '../components/DepartmentSurveyCenter';
import { DepartmentInsights } from '../components/DepartmentInsights';
import { MessagingTab } from '../components/MessagingTab';
import { NotificationBell } from '../components/NotificationBell';
import { useDepartmentData } from '../hooks/useDepartmentData';
import { useDepartmentLiveCounts } from '../hooks/useDepartmentLiveCounts';
import departmentService, { DepartmentAlumniRecord, DepartmentProfile } from '../services/department.service';

type DepartmentTab = 'dashboard' | 'graduates' | 'employment' | 'insights' | 'surveys' | 'messages';

const VALID_TABS: DepartmentTab[] = ['dashboard', 'graduates', 'employment', 'insights', 'surveys', 'messages'];

const isDepartmentTab = (value: string | null): value is DepartmentTab =>
  Boolean(value && VALID_TABS.includes(value as DepartmentTab));

const NAV_GROUPS: Array<{
  sectionKey: string;
  sectionLabel: string;
  items: Array<{
    id: DepartmentTab;
    label: string;
    description: string;
    icon: LucideIcon;
    tooltip: string;
    badgeTone?: 'slate' | 'amber' | 'rose';
  }>;
}> = [
  {
    sectionKey: 'core',
    sectionLabel: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', description: 'Outcomes overview', icon: LayoutDashboard, tooltip: 'Graduate outcomes overview' },
      { id: 'graduates', label: 'Graduates', description: 'Alumni directory', icon: Users, tooltip: 'Department alumni directory', badgeTone: 'slate' },
      { id: 'employment', label: 'Employment', description: 'Placement analytics', icon: TrendingUp, tooltip: 'Employment analytics' },
      { id: 'insights', label: 'Insights', description: 'Skills & curriculum', icon: Lightbulb, tooltip: 'Skill gaps, curriculum, tracer, employers' },
    ],
  },
  {
    sectionKey: 'engage',
    sectionLabel: 'Engagement',
    items: [
      { id: 'surveys', label: 'Surveys', description: 'Tracer & custom', icon: ClipboardList, tooltip: 'Create and dispatch department surveys', badgeTone: 'amber' },
      { id: 'messages', label: 'Messages', description: 'Direct chat', icon: MessageSquare, tooltip: 'Direct messaging', badgeTone: 'rose' },
    ],
  },
];

const badgeToneClass = (tone: 'slate' | 'amber' | 'rose' | undefined, active: boolean, dark: boolean) => {
  if (active) return 'bg-[#003580] text-white border-transparent';
  if (tone === 'rose') return dark ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-rose-50 text-rose-700 border-rose-100';
  if (tone === 'amber') return dark ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-800 border-amber-100';
  return dark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200';
};
const TAB_TITLES: Record<DepartmentTab, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Live graduate outcomes for your department' },
  graduates: { title: 'Graduates', subtitle: 'Search and export department alumni' },
  employment: { title: 'Employment', subtitle: 'Placement trends, employers, and locations' },
  insights: { title: 'Insights', subtitle: 'Skill gaps, curriculum, tracer, and employer signals' },
  surveys: { title: 'Surveys', subtitle: 'Create and dispatch surveys to your alumni' },
  messages: { title: 'Messages', subtitle: 'Direct messages with alumni and staff' },
};

const DepartmentDashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { logout, user } = useAuth();
  // Admins must scope every /departments/my-* call with ?departmentId=, so they get a
  // department switcher. Department heads are resolved from their own head profile and
  // the server ignores the param for them, so they never get one.
  const isAdmin = user?.role === 'ADMIN';
  const [departments, setDepartments] = useState<DepartmentProfile[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
  const [departmentIdDraft, setDepartmentIdDraft] = useState('');
  const { data: departmentData, isLoading, error, refetch, lastUpdated } = useDepartmentData(
    isAdmin ? selectedDepartmentId : null,
    !isAdmin || Boolean(selectedDepartmentId)
  );
  const liveCounts = useDepartmentLiveCounts();
  const [messageTarget, setMessageTarget] = useState<{
    id?: string;
    userId?: string;
    name?: string;
    email?: string;
    role?: string;
    roleLabel?: string;
    department?: string;
  } | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    let active = true;
    departmentService
      .getDepartments()
      .then((list) => {
        if (!active) return;
        const options = Array.isArray(list) ? list.filter((d) => d?.id) : [];
        setDepartments(options);
        setSelectedDepartmentId((current) => current ?? options[0]?.id ?? null);
      })
      .catch(() => {
        if (active) toast.error('Could not load departments for the admin switcher.');
      });
    return () => {
      active = false;
    };
  }, [isAdmin]);

  const userFullName = user ? `${user.firstName} ${user.lastName}`.trim() || user.email : 'Department Head';
  const userInitials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || 'DH'
    : 'DH';

  const departmentLabel = useMemo(() => {
    if (departmentData.department) {
      return `${departmentData.department.code} · ${departmentData.department.name}`;
    }
    return 'Department Head';
  }, [departmentData.department]);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem('department_sidebar_collapsed') === 'true'
  );
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<DepartmentTab>(
    isDepartmentTab(tabFromUrl) ? tabFromUrl : 'dashboard'
  );
  // useTheme removes both classes before adding the target one. The previous
  // `classList.toggle('dark', darkMode)` left `light` on <html>, so with both
  // classes present the light tokens won and the toggle did nothing visible.
  const { darkMode, setTheme: setDarkMode } = useTheme();
  const [helpOpen, setHelpOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState('');
  const [graduateSearchSeed, setGraduateSearchSeed] = useState('');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (isDepartmentTab(tab) && tab !== activeTab) {
      setActiveTab(tab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  useEffect(() => {
    localStorage.setItem('department_sidebar_collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    setMobileSidebarOpen(false);
    setMenuOpen(false);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'surveys' || activeTab === 'messages') {
      liveCounts.refresh(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-dept-menu]')) setMenuOpen(false);
    };
    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, []);

  const goToTab = (tab: DepartmentTab) => {
    setActiveTab(tab);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tab === 'dashboard') next.delete('tab');
      else next.set('tab', tab);
      return next;
    }, { replace: true });
  };

  const handleMessageGraduate = (alumni: DepartmentAlumniRecord) => {
    if (!alumni.userId) {
      toast.error('This graduate has no linked user account to message.');
      return;
    }
    setMessageTarget({
      id: alumni.userId,
      userId: alumni.userId,
      name: alumni.fullName,
      email: alumni.email || undefined,
      role: 'ALUMNI',
      roleLabel: 'Department Alumni',
      department: departmentData.department?.name,
    });
    goToTab('messages');
  };

  const handleHeaderSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = headerSearch.trim();
    setGraduateSearchSeed(q);
    goToTab('graduates');
  };

  const renderSection = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardOverview
            darkMode={darkMode}
            data={departmentData}
            isLoading={isLoading}
            error={error}
            onRefresh={refetch}
            onNavigate={(tab) => goToTab(tab as DepartmentTab)}
            lastUpdated={lastUpdated}
          />
        );
      case 'graduates':
        return (
          <GraduatesDirectory
            darkMode={darkMode}
            data={departmentData}
            isLoading={isLoading}
            error={error}
            onRefresh={refetch}
            initialSearch={graduateSearchSeed}
            onMessageGraduate={handleMessageGraduate}
          />
        );
      case 'employment':
        return (
          <EmploymentAnalytics
            darkMode={darkMode}
            data={departmentData}
            isLoading={isLoading}
            error={error}
            onRefresh={refetch}
          />
        );
      case 'insights':
        return (
          <DepartmentInsights
            darkMode={darkMode}
            data={departmentData}
            isLoading={isLoading}
            error={error}
            onRefresh={refetch}
            onNavigate={(tab) => goToTab(tab as DepartmentTab)}
          />
        );
      case 'surveys':
        return (
          <DepartmentSurveyCenter
            darkMode={darkMode}
            departmentId={isAdmin ? selectedDepartmentId : null}
          />
        );
      case 'messages':
        return <MessagingTab darkMode={darkMode} initialTarget={messageTarget} />;
      default:
        return null;
    }
  };

  const tabMeta = TAB_TITLES[activeTab];

  const navCounts: Partial<Record<DepartmentTab, number>> = {
    graduates: departmentData.alumni.length > 0 ? departmentData.alumni.length : undefined,
    surveys: liveCounts.surveys > 0 ? liveCounts.surveys : undefined,
    messages: liveCounts.messages > 0 ? liveCounts.messages : undefined,
  };

  return (
    <>
      <div className="app-shell min-h-screen bg-[var(--bg-page)] font-['Inter',sans-serif] text-[var(--text-primary)] antialiased">
        <style>{`
          .nav-btn {
            transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          }
          .nav-btn:hover {
            transform: translateX(3px);
          }
          @keyframes astu-admin-fade-in {
            from { opacity: 0; transform: translateY(4px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        {mobileSidebarOpen && (
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-slate-950/45 backdrop-blur-sm md:hidden"
          />
        )}

        <aside
          className={`fixed left-0 top-0 z-40 flex h-dvh w-72 flex-col overflow-hidden border-r transition-all duration-300 md:translate-x-0 ${
            darkMode
              ? 'border-slate-800 bg-slate-950 text-slate-100'
              : 'border-slate-200/80 bg-white text-slate-800'
          } ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${
            sidebarCollapsed ? 'md:w-20' : 'md:w-72'
          }`}
        >
          <div
            className={`relative z-10 flex h-16 shrink-0 items-center border-b px-4 ${
              darkMode ? 'border-slate-800' : 'border-slate-200/80'
            }`}
          >
            <div className={`flex w-full items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#003580]/5 ring-1 ring-[#003580]/10">
                <img
                  src="/images/astu-seal-logo.png"
                  alt="ASTU Official Logo"
                  className="h-full w-full scale-110 object-contain"
                />
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0">
                  <div className={`truncate text-[15px] font-extrabold leading-tight tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    ASTU Department
                  </div>
                  <p className="mt-0.5 truncate text-[10px] font-bold uppercase tracking-[0.14em] text-[#003580]">
                    {departmentData.department?.code || 'Portal'}
                    {departmentData.department?.name ? ` · ${departmentData.department.name}` : ''}
                  </p>
                </div>
              )}
            </div>
          </div>

          <nav className="relative z-10 flex-grow space-y-5 overflow-y-auto px-3 py-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {NAV_GROUPS.map((group) => (
              <div key={group.sectionKey}>
                {!sidebarCollapsed ? (
                  <div className="mb-2 flex items-center gap-2 px-2.5">
                    <p className={`text-[10px] font-extrabold uppercase tracking-[0.16em] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {group.sectionLabel}
                    </p>
                    <div className={`h-px flex-1 ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />
                  </div>
                ) : (
                  <div className={`mx-auto mb-2 h-px w-8 ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
                )}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const count = navCounts[item.id];
                    const hasBadge = typeof count === 'number';
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => goToTab(item.id)}
                        title={sidebarCollapsed ? `${item.label}${hasBadge ? ` (${count})` : ''}` : item.tooltip}
                        className={`nav-btn group relative flex w-full items-center rounded-xl px-2.5 py-2 text-left transition-all duration-200 ${
                          sidebarCollapsed ? 'justify-center' : 'gap-3'
                        } ${
                          isActive
                            ? darkMode
                              ? 'bg-[#003580]/25 font-bold text-white ring-1 ring-[#003580]/40'
                              : 'bg-[#003580]/10 font-bold text-[#003580] ring-1 ring-[#003580]/20'
                            : darkMode
                              ? 'text-slate-400 hover:bg-slate-900 hover:text-white'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-[#003580]'
                        }`}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-[#003580]" />
                        )}
                        <span
                          className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all ${
                            isActive
                              ? 'bg-[#003580] text-white shadow-sm'
                              : darkMode
                                ? 'bg-slate-900 text-slate-400 group-hover:text-white'
                                : 'bg-slate-100 text-slate-600 group-hover:text-[#003580]'
                          }`}
                        >
                          <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                          {hasBadge && sidebarCollapsed && (
                            <span className="absolute -right-1 -top-1 flex h-4 min-w-[15px] items-center justify-center rounded-full bg-rose-500 px-1 text-[8px] font-extrabold text-white shadow-lg">
                              {count! > 99 ? '99+' : count}
                            </span>
                          )}
                        </span>
                        {!sidebarCollapsed && (
                          <>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-semibold leading-tight">{item.label}</span>
                              <span className={`mt-0.5 block truncate text-[11px] font-medium leading-tight ${
                                isActive
                                  ? darkMode ? 'text-slate-300' : 'text-[#003580]/70'
                                  : darkMode ? 'text-slate-500' : 'text-slate-400'
                              }`}>
                                {item.description}
                              </span>
                            </span>
                            {hasBadge && (
                              <span className={`ml-auto flex h-5 min-w-[22px] items-center justify-center rounded-full border px-1.5 text-[10px] font-extrabold tabular-nums ${badgeToneClass(item.badgeTone, isActive, darkMode)}`}>
                                {count! > 99 ? '99+' : count}
                              </span>
                            )}
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className={`relative z-10 space-y-2 border-t p-3 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            {!sidebarCollapsed && (
              <div className={`mb-1 flex items-center gap-3 rounded-xl px-2.5 py-2 ${darkMode ? 'bg-slate-900/80' : 'bg-slate-50'}`}>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#003580] to-[#004d99] text-[11px] font-bold text-white">
                  {userInitials}
                </div>
                <div className="min-w-0">
                  <p className={`truncate text-xs font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{userFullName}</p>
                  <p className={`truncate text-[10px] font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {departmentLabel}
                  </p>
                </div>
              </div>
            )}
            {!sidebarCollapsed ? (
              <>
                <button
                  type="button"
                  onClick={() => setHelpOpen(true)}
                  className={`nav-btn group flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-all duration-200 ${
                    darkMode ? 'text-slate-400 hover:bg-slate-900 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${darkMode ? 'bg-slate-900 text-slate-400' : 'bg-slate-100 text-slate-500 group-hover:text-slate-900'}`}>
                    <HelpCircle className="h-[18px] w-[18px]" strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">Help Center</span>
                    <span className={`block text-[11px] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Guides & support</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="nav-btn group flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-rose-700 transition-all duration-200 hover:bg-rose-50 hover:text-rose-800 dark:text-rose-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-700 group-hover:bg-rose-100 dark:bg-rose-500/15 dark:text-rose-400">
                    <LogOut className="h-[18px] w-[18px]" strokeWidth={1.75} />
                  </span>
                  <span className="text-sm font-semibold">Logout</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setHelpOpen(true)}
                  title="Help Center"
                  className={`nav-btn flex w-full items-center justify-center rounded-lg px-2 py-1.5 transition-all duration-200 ${
                    darkMode ? 'text-slate-400 hover:bg-slate-900 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span className={`flex h-7 w-7 items-center justify-center rounded-md ${darkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
                    <HelpCircle className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Logout"
                  className="nav-btn flex w-full items-center justify-center rounded-lg px-2 py-1.5 text-rose-700 transition-all duration-200 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400">
                    <LogOut className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                </button>
              </>
            )}
          </div>
        </aside>

        <div
          className={`flex min-h-screen flex-col transition-[margin-left] duration-300 ease-in-out ${
            sidebarCollapsed ? 'md:ml-20' : 'md:ml-72'
          }`}
        >
          <header
            className={`sticky top-0 z-30 flex h-16 w-full shrink-0 items-center justify-between border-b px-4 shadow-2xs backdrop-blur-md sm:px-6 ${
              darkMode
                ? 'border-slate-800 bg-slate-950/95'
                : 'border-slate-200/80 bg-white/95'
            }`}
          >
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarCollapsed((v) => !v)}
                className="hidden h-10 w-10 items-center justify-center rounded-[8px] text-[var(--text-secondary)] hover:bg-black/5 md:inline-flex"
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <Menu className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setSidebarCollapsed(false);
                  setMobileSidebarOpen(true);
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] text-[var(--text-secondary)] hover:bg-black/5 md:hidden"
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <h1 className="truncate text-[16px] font-bold tracking-tight text-[var(--text-primary)]">
                  {tabMeta.title}
                </h1>
                <p className="truncate text-xs font-medium text-[var(--text-secondary)]">
                  {departmentData.department ? departmentLabel : tabMeta.subtitle}
                </p>
              </div>
            </div>

            <div className="flex min-w-0 shrink items-center gap-3">
              <form onSubmit={handleHeaderSearchSubmit} className="hidden md:block">
                <label
                  className="group flex h-11 w-[420px] max-w-[36vw] items-center rounded-full border bg-[#F3F5FA] px-3 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 focus-within:border-[#003580] focus-within:ring-2 focus-within:ring-[#003580]/10 dark:bg-[#1E2130]"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  <span className="mr-2 inline-flex h-5 w-5 items-center justify-center text-[#8FA3BF]">
                    <Search className="h-4 w-4 flex-none" />
                  </span>
                  <input
                    type="search"
                    placeholder="Search graduates by name or ID..."
                    className="w-full bg-transparent outline-none placeholder:text-[#7C879D] dark:placeholder:text-[#97A0B8]"
                    value={headerSearch}
                    onChange={(e) => setHeaderSearch(e.target.value)}
                    aria-label="Search graduates"
                  />
                </label>
              </form>

              <button
                type="button"
                onClick={() => {
                  const next = !darkMode;
                  // useTheme owns the class list and localStorage; the manual
                  // classList.toggle here was re-introducing the same bug.
                  setDarkMode(next ? 'dark' : 'light');
                  toast.success(next ? 'Dark theme activated' : 'Light theme activated');
                }}
                className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] text-[var(--text-secondary)] hover:bg-black/5"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              <NotificationBell darkMode={darkMode} onNavigate={(tab) => goToTab(tab as DepartmentTab)} />

              <div className="relative" data-dept-menu>
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  className="flex items-center gap-3 rounded-[8px] border bg-[var(--bg-card)] px-2.5 py-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#003580] to-[#004d99] text-xs font-semibold text-white shadow-sm">
                    {userInitials}
                  </div>
                  <div className="hidden text-left sm:block">
                    <div className="max-w-[9rem] truncate text-sm font-medium text-[var(--text-primary)]">{userFullName}</div>
                    <div className="max-w-[9rem] truncate text-[11px] text-[var(--text-secondary)]">{departmentLabel}</div>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-[10px] border border-[var(--border-color)] bg-[var(--bg-card)] p-1 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                    <div className="px-3 py-3">
                      <div className="text-sm font-semibold text-[var(--text-primary)]">{userFullName}</div>
                      <div className="mt-1">
                        <span className="inline-flex items-center rounded-md border border-[#003366]/15 bg-[#003366]/10 px-2 py-0.5 text-xs font-medium text-[#003366]">
                          {departmentLabel}
                        </span>
                      </div>
                    </div>
                    <div className="my-1 h-px bg-[var(--border-color)]" />
                    {isAdmin && (
                      <>
                        <div className="px-3 pb-1 pt-2">
                          <label
                            htmlFor="department-switcher"
                            className="text-[10px] font-black uppercase tracking-wider text-[var(--text-secondary)]"
                          >
                            Viewing Department
                          </label>
                          {departments.length > 0 ? (
                            <select
                              id="department-switcher"
                              value={selectedDepartmentId ?? ''}
                              onChange={(e) => setSelectedDepartmentId(e.target.value || null)}
                              className="mt-1.5 w-full rounded-md border border-[var(--border-color)] bg-[var(--bg-page)] px-2 py-1.5 text-sm font-semibold text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003580]/40"
                            >
                              {departments.map((dept) => (
                                <option key={dept.id} value={dept.id}>
                                  {dept.code} · {dept.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <>
                              <input
                                id="department-switcher"
                                value={departmentIdDraft}
                                onChange={(e) => setDepartmentIdDraft(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    setSelectedDepartmentId(departmentIdDraft.trim() || null);
                                  }
                                }}
                                placeholder="e.g. dept-swe"
                                className="mt-1.5 w-full rounded-md border border-[var(--border-color)] bg-[var(--bg-page)] px-2 py-1.5 text-sm font-semibold text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003580]/40"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const id = departmentIdDraft.trim();
                                  if (!id) {
                                    toast.error('Enter a department ID first.');
                                    return;
                                  }
                                  setSelectedDepartmentId(id);
                                  toast.success(`Viewing department ${id}`);
                                }}
                                className="mt-2 w-full rounded-md bg-[#003580] px-2 py-1.5 text-xs font-semibold text-white hover:brightness-110"
                              >
                                Apply department ID
                              </button>
                              <p className="mt-1 text-[10px] leading-snug text-[var(--text-secondary)]">
                                Enter a department ID. The list endpoint is unavailable on the local
                                dev store, so IDs come from the seed data.
                              </p>
                            </>
                          )}
                        </div>
                        <div className="my-1 h-px bg-[var(--border-color)]" />
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setHelpOpen(true);
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[var(--text-secondary)] transition hover:bg-black/5 hover:text-[var(--text-primary)]"
                    >
                      <HelpCircle className="h-4 w-4" /> Help
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[#B91C1C] transition hover:bg-rose-50"
                    >
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <div
            className={`mx-auto w-full max-w-[1600px] flex-grow bg-slate-50/60 ${
              activeTab === 'messages' ? 'p-3 md:p-4' : 'space-y-6 p-6 md:p-8'
            }`}
            style={{ animation: 'astu-admin-fade-in 150ms ease-out' }}
          >
            <div key={activeTab}>{renderSection()}</div>
          </div>
        </div>
      </div>

      <HelpCenter isOpen={helpOpen} onClose={() => setHelpOpen(false)} darkMode={darkMode} audience="department" />
    </>
  );
};

export default DepartmentDashboard;
