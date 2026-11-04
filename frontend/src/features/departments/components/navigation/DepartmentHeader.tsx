import React, { useState } from 'react';
import { Menu, Sun, Moon, Bell, Search, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  targetTab: string;
  icon: string;
}

interface NotificationItem {
  id: number;
  title: string;
  text: string;
  time: string;
  unread: boolean;
}

interface DepartmentHeaderProps {
  activeTab: string;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean | ((prev: boolean) => boolean)) => void;
  setMobileSidebarOpen: (v: boolean) => void;
  darkMode: boolean;
  toggleTheme: () => void;
  onNavigateTab: (tab: string) => void;
}

const SEARCH_DATASET: SearchItem[] = [
  { id: 'p-dash', title: 'Dashboard Overview', subtitle: 'Executive command center', category: 'Core', targetTab: 'dashboard', icon: 'dashboard' },
  { id: 'p-outcomes', title: 'Employment Outcomes Matrix', subtitle: 'Placement rates & time-to-hire velocity', category: 'Outcomes', targetTab: 'outcomes-matrix', icon: 'query_stats' },
  { id: 'p-wave', title: 'Wave 3 Tracer Audit', subtitle: 'Alumni survey aggregation & curriculum audit', category: 'Audit', targetTab: 'wave-audit', icon: 'rule' },
  { id: 'p-curr', title: 'Curriculum Insights', subtitle: 'ABET alignment and course reviews', category: 'Curriculum', targetTab: 'curriculum', icon: 'menu_book' },
  { id: 'p-surv', title: 'Department Custom Surveys', subtitle: 'Tri-channel dispatch', category: 'Surveys', targetTab: 'department-surveys', icon: 'edit_note' },
];

export const DepartmentHeader: React.FC<DepartmentHeaderProps> = ({
  activeTab,
  sidebarCollapsed,
  setSidebarCollapsed,
  setMobileSidebarOpen,
  darkMode,
  toggleTheme,
  onNavigateTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: 1, title: 'Wave 3 Tracer Ready', text: '1,480 new alumni submissions aggregated.', time: '10m ago', unread: true },
    { id: 2, title: 'ABET Syllabus Review', text: 'CSE-4201 rated 96% industry match.', time: '1h ago', unread: true }
  ]);

  const filteredSearch = searchQuery.trim()
    ? SEARCH_DATASET.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : SEARCH_DATASET;

  const titleText = activeTab === 'outcomes-matrix' 
    ? 'Graduate Employment Outcomes Matrix'
    : activeTab === 'wave-audit'
    ? 'Wave 3 Tracer Feedback & Curriculum Audit'
    : activeTab.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-topbar)] px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarCollapsed(prev => !prev)}
          className="hidden md:flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="md:hidden h-9 w-9 flex items-center justify-center rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)]"
          aria-label="Open mobile nav"
        >
          <Menu className="w-4 h-4" />
        </button>
        <h1 className="text-base font-bold text-[var(--text-primary)] tracking-tight truncate">
          {titleText}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden sm:block w-64 md:w-80">
          <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
            placeholder="Search reports or courses..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:border-[#2196F3]"
          />
          {searchFocused && (
            <div className="absolute left-0 top-10 w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-xl z-50 p-2 space-y-1">
              {filteredSearch.map(item => (
                <button
                  key={item.id}
                  onClick={() => onNavigateTab(item.targetTab)}
                  className="w-full text-left p-2 rounded-lg hover:bg-[var(--bg-card-secondary)] transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-semibold text-[var(--text-primary)]">{item.title}</div>
                    <div className="text-[11px] text-[var(--text-secondary)]">{item.subtitle}</div>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/30 text-blue-300 border border-blue-600/30">
                    {item.category}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => {
            toggleTheme();
            toast.success(darkMode ? 'Switched to Light Mode' : 'Switched to Dark Mode');
          }}
          className="p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          title="Toggle Theme"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {notifications.filter(n => n.unread).length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </button>
          {showNotifs && (
            <div className="absolute right-0 top-11 w-72 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-2xl p-3 z-50 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
                <span className="text-xs font-bold text-[var(--text-primary)]">Notifications</span>
                <button 
                  onClick={() => setNotifications(prev => prev.map(n => ({ ...n, unread: false })))}
                  className="text-[11px] text-[#22D3EE] hover:underline"
                >
                  Mark read
                </button>
              </div>
              {notifications.map(n => (
                <div key={n.id} className="p-2 rounded-lg bg-[var(--bg-page)]/60 border border-[var(--border-color)]/50">
                  <div className="text-xs font-semibold text-[var(--text-primary)]">{n.title}</div>
                  <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">{n.text}</div>
                  <div className="text-[10px] text-[var(--text-secondary)]/70 mt-1">{n.time}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
