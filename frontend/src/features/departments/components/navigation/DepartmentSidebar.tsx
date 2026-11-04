import React from 'react';

interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  badge?: string | null;
  tooltip: string;
}

interface SidebarGroup {
  sectionKey: string;
  sectionLabel: string;
  items: SidebarItem[];
}

interface DepartmentSidebarProps {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenHelp: () => void;
  onLogout: () => void;
}

const SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    sectionKey: 'core',
    sectionLabel: 'Department Core',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', badge: null, tooltip: 'Overview & key metrics' },
      { id: 'outcomes-matrix', label: 'Outcomes Matrix', icon: 'query_stats', badge: 'NEW', tooltip: 'Graduate Employment Outcomes Matrix' },
      { id: 'wave-audit', label: 'Wave 3 Audit', icon: 'rule', badge: 'NEW', tooltip: 'Wave 3 Tracer Study & Curriculum Audit' },
      { id: 'employment-analytics', label: 'Employment Analytics', icon: 'trending_up', badge: null, tooltip: 'Graduate employment outcomes & trends' },
      { id: 'management', label: 'Management Hub', icon: 'dashboard_customize', badge: null, tooltip: 'Analytics, curriculum, KPIs & partnerships' },
    ]
  },
  {
    sectionKey: 'surveys',
    sectionLabel: 'Analytics & Surveys',
    items: [
      { id: 'department-surveys', label: 'Department Surveys', icon: 'edit_note', badge: 'NEW', tooltip: 'Custom department surveys & alerts' },
      { id: 'skill-gap', label: 'Skill Gap Reports', icon: 'school', badge: null, tooltip: 'Skill gap analysis from employer data' },
      { id: 'employer-feedback', label: 'Employer Feedback', icon: 'rate_review', badge: null, tooltip: 'Employer reviews & curriculum feedback' },
      { id: 'messages', label: 'Messages', icon: 'chat', badge: null, tooltip: 'ASTU_AMS direct messaging hub' },
    ]
  },
  {
    sectionKey: 'reports',
    sectionLabel: 'Reports & Audit',
    items: [
      { id: 'tracer-reports', label: 'Tracer Reports', icon: 'assignment', badge: null, tooltip: 'Tracer study reports & surveys' },
      { id: 'curriculum', label: 'Curriculum Insights', icon: 'menu_book', badge: null, tooltip: 'Curriculum review & analytics' },
      { id: 'accreditation', label: 'Accreditation Reports', icon: 'verified', badge: null, tooltip: 'Accreditation-ready reports' },
      { id: 'export', label: 'Export Reports', icon: 'download', badge: null, tooltip: 'Export data & reports' },
    ]
  }
];

export const DepartmentSidebar: React.FC<DepartmentSidebarProps> = ({
  sidebarCollapsed,
  mobileSidebarOpen,
  activeTab,
  setActiveTab,
  onOpenHelp,
  onLogout,
}) => {
  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-dvh flex-col overflow-hidden transition-all duration-300 md:translate-x-0 bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] text-[var(--text-primary)] ${
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${sidebarCollapsed ? 'w-20 md:w-20' : 'w-72 md:w-72'}`}
    >
      {/* Sidebar Logo Header */}
      <div className="relative z-10 h-16 shrink-0 px-4 flex items-center border-b border-[var(--border-color)] bg-[var(--bg-sidebar)]">
        <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="relative shrink-0 flex items-center justify-center h-10 w-10 overflow-hidden rounded-full">
            <img src="/images/astu-seal-logo.png" alt="ASTU Logo" className="h-full w-full object-contain" />
          </div>
          {!sidebarCollapsed && (
            <div>
              <h1 className="text-base font-extrabold tracking-tight leading-tight text-[var(--text-primary)]">ASTU Department</h1>
              <p className="text-[11px] uppercase tracking-[0.16em] font-extrabold truncate mt-0.5 text-[var(--accent-cyan)]">Management Portal</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="relative z-10 flex-grow px-3 py-4 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden space-y-4">
        {SIDEBAR_GROUPS.map(group => (
          <div key={group.sectionKey}>
            {!sidebarCollapsed && (
              <div className="px-2.5 mb-1.5 mt-1">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--text-muted)]">{group.sectionLabel}</p>
              </div>
            )}
            <div className="space-y-1">
              {group.items.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={sidebarCollapsed ? item.label : item.tooltip}
                  className={`nav-btn w-full flex items-center px-3 py-2 rounded-xl transition-all duration-200 text-left group relative cursor-pointer ${
                    sidebarCollapsed ? 'justify-center' : 'gap-3'
                  } ${
                    activeTab === item.id
                      ? 'bg-[#2196F3] text-white font-bold shadow-md'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
                  }`}
                >
                  <span
                    className={`relative w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                      activeTab === item.id
                        ? 'bg-white/20 text-white'
                        : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--accent-cyan)] group-hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  </span>
                  {!sidebarCollapsed && (
                    <>
                      <span className="text-xs font-semibold flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <span
                          className={`ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[9px] font-extrabold ${
                            item.badge === 'NEW'
                              ? 'bg-[#22D3EE] text-slate-900'
                              : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-color)]'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      {activeTab === item.id && !item.badge && (
                        <div className="ml-1 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      )}
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className="relative z-10 p-3 border-t border-[var(--border-color)] bg-[var(--bg-sidebar)] space-y-1">
        <button
          onClick={onOpenHelp}
          className={`nav-btn w-full flex items-center px-3 py-2 rounded-xl text-left group ${
            sidebarCollapsed ? 'justify-center' : 'gap-3'
          } text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] cursor-pointer`}
          title="Help Center"
        >
          <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--accent-cyan)]">
            <span className="material-symbols-outlined text-[18px]">help</span>
          </span>
          {!sidebarCollapsed && <span className="text-xs font-semibold flex-1 truncate">Help Center</span>}
        </button>

        <button
          onClick={onLogout}
          className={`nav-btn w-full flex items-center px-3 py-2 rounded-xl text-left group ${
            sidebarCollapsed ? 'justify-center' : 'gap-3'
          } text-[#F87171] hover:bg-[#3B1A22] cursor-pointer`}
          title="Logout"
        >
          <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#3B1A22] border border-[#71313A] text-[#F87171]">
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </span>
          {!sidebarCollapsed && <span className="text-xs font-bold flex-1 truncate">Logout</span>}
        </button>
      </div>
    </aside>
  );
};
