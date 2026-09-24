import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { ChevronDown, HelpCircle, LogOut } from 'lucide-react';
import HelpCenter from '../../../components/HelpCenter';
import { DashboardOverview } from '../components/DashboardOverview';
import { EmploymentAnalytics } from '../components/EmploymentAnalytics';
import { GraduatesDirectory } from '../components/GraduatesDirectory';
import { DepartmentSurveyCenter } from '../components/DepartmentSurveyCenter';
import { DepartmentInsights } from '../components/DepartmentInsights';
import { TelegramChat } from '../../../components/TelegramChat';
import { NotificationBell } from '../components/NotificationBell';
import { useDepartmentData } from '../hooks/useDepartmentData';
import { useDepartmentLiveCounts } from '../hooks/useDepartmentLiveCounts';

type DepartmentTab = 'dashboard' | 'graduates' | 'employment' | 'insights' | 'surveys' | 'messages';

const NAV_GROUPS: Array<{
  sectionKey: string;
  sectionLabel: string;
  items: Array<{ id: DepartmentTab; label: string; icon: string; tooltip: string }>;
}> = [
  {
    sectionKey: 'core',
    sectionLabel: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', tooltip: 'Graduate outcomes overview' },
      { id: 'graduates', label: 'Graduates', icon: 'groups', tooltip: 'Department alumni directory' },
      { id: 'employment', label: 'Employment', icon: 'trending_up', tooltip: 'Employment analytics' },
      { id: 'insights', label: 'Insights', icon: 'lightbulb', tooltip: 'Skill gaps, curriculum, tracer, employers' },
    ],
  },
  {
    sectionKey: 'engage',
    sectionLabel: 'Engagement',
    items: [
      { id: 'surveys', label: 'Surveys', icon: 'edit_note', tooltip: 'Create and dispatch department surveys' },
      { id: 'messages', label: 'Messages', icon: 'chat', tooltip: 'Direct messaging' },
    ],
  },
];

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
  const { logout, user } = useAuth();
  const { data: departmentData, isLoading, error, refetch, lastUpdated } = useDepartmentData();
  const liveCounts = useDepartmentLiveCounts();

  const userFullName = user ? `${user.firstName} ${user.lastName}`.trim() || user.email : 'Department Head';
  const userInitials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || 'DH'
    : 'DH';

  const departmentLabel = useMemo(() => {
    if (departmentData.department) {
      return `${departmentData.department.code} · ${departmentData.department.name}`;
    }
    return 'Department Head';
  }, [departmentData.department, user?.role]);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem('department_sidebar_collapsed') === 'true'
  );
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<DepartmentTab>('dashboard');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);
  const [helpOpen, setHelpOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState('');
  const [graduateSearchSeed, setGraduateSearchSeed] = useState('');

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

  const goToTab = (tab: DepartmentTab) => setActiveTab(tab);

  const handleHeaderSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = headerSearch.trim();
    setGraduateSearchSeed(q);
    setActiveTab('graduates');
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
          />
        );
      case 'surveys':
        return <DepartmentSurveyCenter darkMode={darkMode} />;
      case 'messages':
        return (
          <div className="space-y-4">
            <TelegramChat darkMode={darkMode} clean />
          </div>
        );
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
      <div
        className={`min-h-screen font-sans antialiased transition-colors ${
          darkMode ? 'bg-slate-950 text-white' : 'bg-[#f4f6fa] text-slate-800'
        }`}
      >
        {mobileSidebarOpen && (
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-slate-950/45 backdrop-blur-sm md:hidden"
          />
        )}

        <aside
          className={`fixed left-0 top-0 z-40 flex h-dvh flex-col overflow-hidden border-r ${darkMode ? 'border-slate-700 bg-slate-900 text-slate-200' : 'border-slate-200/80 bg-white text-slate-800'} shadow-sm transition-all duration-300 md:translate-x-0 ${
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } ${sidebarCollapsed ? 'w-20' : 'w-72'}`}
        >
          <div className={`flex h-16 shrink-0 items-center border-b ${darkMode ? 'border-slate-700' : 'border-slate-200/80'} px-4`}>
            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full">
                <img src="/images/astu-seal-logo.png" alt="ASTU" className="h-full w-full object-contain" />
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0">
                  <h1 className={`truncate text-base font-extrabold leading-tight tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    ASTU Department
                  </h1>
                  <p className={`mt-0.5 truncate text-[11px] font-extrabold uppercase tracking-[0.14em] ${darkMode ? 'text-blue-400' : 'text-[#003580]'}`}>
                    {departmentData.department?.code || 'Portal'}
                  </p>
                </div>
              )}
            </div>
          </div>

          <nav className="flex-grow space-y-4 overflow-y-auto px-3 py-4 [scrollbar-width:none]">
            {NAV_GROUPS.map((group) => (
              <div key={group.sectionKey}>
                {!sidebarCollapsed && (
                  <div className="mb-1.5 mt-1 px-2.5">
                    <p className={`text-[11px] font-extrabold uppercase tracking-[0.16em] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      {group.sectionLabel}
                    </p>
                  </div>
                )}
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => goToTab(item.id)}
                      title={sidebarCollapsed ? item.label : item.tooltip}
                      className={`group flex w-full items-center rounded-xl px-3 py-2.5 text-left transition-all ${
                        sidebarCollapsed ? 'justify-center' : 'gap-3.5'
                      } ${
                        activeTab === item.id
                          ? darkMode
                            ? 'bg-blue-500/15 font-bold text-blue-300 ring-1 ring-blue-400/30'
                            : 'bg-[#003580]/10 font-bold text-[#003580] ring-1 ring-[#003580]/20'
                          : darkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50 hover:text-[#003580]'
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                          activeTab === item.id
                            ? 'bg-[#003580] text-white'
                            : darkMode ? 'bg-slate-800 text-slate-400 group-hover:text-blue-300' : 'bg-slate-100 text-slate-500 group-hover:text-[#003580]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                      </span>
                      {!sidebarCollapsed && (
                        <span className="flex-1 truncate text-sm font-semibold">{item.label}</span>
                      )}
                      {!sidebarCollapsed && typeof navCounts[item.id] === 'number' && (
                        <span
                          className={`ml-1 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                            darkMode
                              ? 'bg-slate-700 text-slate-200'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                          title={`${item.label} count`}
                        >
                          {(navCounts[item.id] as number) > 99 ? '99+' : navCounts[item.id]}
                        </span>
                      )}
                      {activeTab === item.id && !sidebarCollapsed && (
                        <div className={`ml-1 h-1.5 w-1.5 shrink-0 rounded-full ${darkMode ? 'bg-blue-400' : 'bg-[#003580]'}`} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className={`space-y-1 border-t ${darkMode ? 'border-slate-700' : 'border-slate-200/80'} p-3`}>
            {!sidebarCollapsed ? (
              <>
                <button
                  type="button"
                  onClick={() => setHelpOpen(true)}
                  className={`flex w-full items-center gap-3.5 rounded-xl px-3 py-2.5 text-left ${darkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50 hover:text-[#003580]'} transition`}
                >
                  <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                    <span className="material-symbols-outlined text-[20px]">help</span>
                  </span>
                  <span className="text-sm font-semibold">Help Center</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className={`flex w-full items-center gap-3.5 rounded-xl px-3 py-2.5 text-left text-rose-600 transition ${darkMode ? 'hover:bg-rose-950/40' : 'hover:bg-rose-50'}`}
                >
                  <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${darkMode ? 'bg-rose-950/40 text-rose-400' : 'bg-rose-50 text-rose-600'}`}>
                    <span className="material-symbols-outlined text-[20px]">logout</span>
                  </span>
                  <span className="text-sm font-bold">Logout</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setHelpOpen(true)}
                  title="Help Center"
                  className={`flex w-full items-center justify-center rounded-xl px-3 py-2.5 ${darkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <span className="material-symbols-outlined text-[20px]">help</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Logout"
                  className={`flex w-full items-center justify-center rounded-xl px-3 py-2.5 text-rose-600 ${darkMode ? 'hover:bg-rose-950/40' : 'hover:bg-rose-50'}`}
                >
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                </button>
              </>
            )}
          </div>
        </aside>

        <main
          className={`flex min-h-screen flex-col transition-all duration-300 ${
            sidebarCollapsed ? 'ml-0 md:ml-20' : 'ml-0 md:ml-72'
          }`}
        >
          <header
            className={`sticky top-0 z-30 flex h-16 w-full shrink-0 items-center justify-between border-b px-4 shadow-sm sm:px-6 ${
              darkMode
                ? 'border-slate-800 bg-slate-900/95 text-white'
                : 'border-slate-200/80 bg-white/95 text-slate-800'
            }`}
          >
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarCollapsed((v) => !v)}
                className={`hidden h-10 w-10 items-center justify-center rounded-lg md:inline-flex ${
                  darkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-black/5'
                }`}
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <span className="material-symbols-outlined text-[20px]">menu</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSidebarCollapsed(false);
                  setMobileSidebarOpen(true);
                }}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-lg md:hidden ${
                  darkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-black/5'
                }`}
                aria-label="Open navigation"
              >
                <span className="material-symbols-outlined text-[20px]">menu</span>
              </button>
              <div className="min-w-0">
                <h1 className={`truncate text-[16px] font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  {tabMeta.title}
                </h1>
                <p className={`truncate text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {departmentData.department ? departmentLabel : tabMeta.subtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <form onSubmit={handleHeaderSearchSubmit} className="relative hidden w-72 sm:block md:w-80">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                  search
                </span>
                <input
                  className={`w-full rounded-full border py-2 pl-9 pr-4 text-xs transition focus:outline-none focus:ring-2 focus:ring-[#003580]/20 ${
                    darkMode
                      ? 'border-slate-700 bg-slate-800 text-white'
                      : 'border-slate-200 bg-[#F3F5FA] text-gray-900 focus:bg-white'
                  }`}
                  placeholder="Search graduates by name or ID..."
                  type="search"
                  value={headerSearch}
                  onChange={(e) => setHeaderSearch(e.target.value)}
                  aria-label="Search graduates"
                />
              </form>

              <NotificationBell darkMode={darkMode} onNavigate={(tab) => setActiveTab(tab as DepartmentTab)} />

              <button
                type="button"
                onClick={() => {
                  const next = !darkMode;
                  setDarkMode(next);
                  document.documentElement.classList.toggle('dark', next);
                  localStorage.setItem('theme', next ? 'dark' : 'light');
                }}
                className={`rounded-full p-2 transition ${darkMode ? 'text-amber-400' : 'text-slate-600'}`}
                title="Toggle theme"
                aria-label="Toggle dark mode"
              >
                <span className="material-symbols-outlined text-xl">
                  {darkMode ? 'light_mode' : 'dark_mode'}
                </span>
              </button>

              <div className="relative" data-dept-menu>
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  className="flex items-center gap-3 rounded-lg py-1 hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003580]/40"
                >
                  <div className="pointer-events-none hidden text-right sm:block">
                    <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{userFullName}</p>
                    <p className={`truncate text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{departmentLabel}</p>
                  </div>
                  <div className="pointer-events-none flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#003580]/20 bg-[#003580] font-bold text-white">
                    {userInitials}
                  </div>
                  <ChevronDown
                    className={`pointer-events-none h-4 w-4 text-gray-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {menuOpen && (
                  <div
                    className={`absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-[10px] border p-1 shadow-[0_4px_16px_rgba(0,0,0,0.08)] ${
                      darkMode ? 'border-slate-700 bg-slate-900' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="px-3 py-3">
                      <div className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{userFullName}</div>
                      <div className="mt-1">
                        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${darkMode ? 'border-blue-800 bg-blue-950 text-blue-300' : 'border-blue-200 bg-blue-50 text-[#003580]'}`}>
                          {departmentLabel}
                        </span>
                      </div>
                    </div>
                    <div className={`my-1 h-px ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`} />
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setHelpOpen(true);
                      }}
                      className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition ${darkMode ? 'text-slate-300 hover:bg-white/5' : 'text-gray-600 hover:bg-black/5'}`}
                    >
                      <HelpCircle className="h-4 w-4" /> Help
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        handleLogout();
                      }}
                      className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition ${darkMode ? 'text-red-400 hover:bg-red-950/40' : 'text-red-500 hover:bg-rose-50'}`}
                    >
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className="mx-auto w-full max-w-[1400px] flex-grow p-4 sm:p-6 md:p-8">
            <div key={activeTab} className="animate-slide-up">{renderSection()}</div>
          </div>
        </main>
      </div>

      <HelpCenter isOpen={helpOpen} onClose={() => setHelpOpen(false)} darkMode={darkMode} audience="department" />
    </>
  );
};

export default DepartmentDashboard;
