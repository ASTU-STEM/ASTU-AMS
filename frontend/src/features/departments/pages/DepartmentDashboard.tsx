import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { HelpCircle, LogOut, Menu, ChevronDown, FileText, BarChart3, Settings } from 'lucide-react';
import HelpCenter from '../../../components/HelpCenter';

// Components
import { DashboardOverview } from '../components/DashboardOverview';
import { EmploymentAnalytics } from '../components/EmploymentAnalytics';
import { SkillGapAnalysis } from '../components/SkillGapAnalysis';
import { EmployerFeedback } from '../components/EmployerFeedback';
import { TracerReports } from '../components/TracerReports';
import { CurriculumInsights } from '../components/CurriculumInsights';
import { ExportCenter } from '../components/ExportCenter';
import { AccreditationReports } from '../components/AccreditationReports';
import { DepartmentSurveyCenter } from '../components/DepartmentSurveyCenter';
import { TelegramChat } from '../../../components/TelegramChat';
import { useTheme } from '../../../hooks/useTheme';

// Data

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
    category: 'Tracer' | 'Accreditation' | 'Employer' | 'Curriculum' | 'Skill Gap' | 'Survey';
    priority: 'high' | 'medium' | 'low';
    time: string;
    unread: boolean;
    targetTab: string;
    actionLabel: string;
    details: string;
    source: string;
}

const searchDataset: SearchItem[] = [
    // Core Pages
    { id: 'p-dashboard', title: 'Dashboard Overview', subtitle: 'Executive command center & telemetry overview', category: 'Pages & Reports', targetTab: 'dashboard', icon: 'dashboard' },
    { id: 'p-tracer', title: 'Tracer Reports & Longitudinal Tracking', subtitle: 'Graduates survey completion & 5-year career outcomes', category: 'Pages & Reports', targetTab: 'tracer-reports', icon: 'assignment' },
    { id: 'p-curriculum', title: 'Curriculum Insights & Alignment', subtitle: 'Course alignment, industry relevancy & new course proposals', category: 'Pages & Reports', targetTab: 'curriculum', icon: 'menu_book' },
    { id: 'p-accreditation', title: 'Accreditation Reports & Executive Reporting Center', subtitle: 'ABET readiness, evidence audit records & compliance status', category: 'Pages & Reports', targetTab: 'accreditation', icon: 'verified' },
    { id: 'p-employment', title: 'Employment Analytics', subtitle: 'Salary progression, top hiring companies & geographic placement', category: 'Pages & Reports', targetTab: 'employment-analytics', icon: 'trending_up' },
    { id: 'p-skillgap', title: 'Skill Gap Reports & Industry Demand', subtitle: 'Employer missing skills, training priorities & risk areas', category: 'Pages & Reports', targetTab: 'skill-gap', icon: 'school' },
    { id: 'p-employer', title: 'Employer Feedback & Competency Ratings', subtitle: 'Satisfaction ratings, repeat hiring & partner evaluations', category: 'Pages & Reports', targetTab: 'employer-feedback', icon: 'rate_review' },
    { id: 'p-surveys', title: 'Department Custom Surveys', subtitle: 'Tri-channel dispatch & custom survey creation', category: 'Pages & Reports', targetTab: 'department-surveys', icon: 'edit_note' },
    { id: 'p-export', title: 'Export Reports & Download Center', subtitle: 'PDF, Excel, CSV, and JSON executive export packs', category: 'Pages & Reports', targetTab: 'export', icon: 'download' },
    { id: 'p-messages', title: 'Direct Messages & ASTU Hub', subtitle: 'Real-time chat with graduates, recruiters, and admins', category: 'Pages & Reports', targetTab: 'messages', icon: 'chat' },

    // Evidence & KPIs — labels only, no fabricated percentages
    { id: 'e-abet', title: 'ABET Readiness', subtitle: 'Accreditation readiness evidence for inspection', category: 'Evidence & KPIs', targetTab: 'accreditation', icon: 'verified' },
    { id: 'e-survey', title: 'Survey Completion', subtitle: 'Tracer study completion for department graduates', category: 'Evidence & KPIs', targetTab: 'tracer-reports', icon: 'trending_up' },
    { id: 'e-align', title: 'Course Alignment', subtitle: 'Curriculum alignment with industry demand', category: 'Evidence & KPIs', targetTab: 'curriculum', icon: 'menu_book' },
    { id: 'e-skills', title: 'Skill Gaps', subtitle: 'Employer-reported missing skill categories', category: 'Evidence & KPIs', targetTab: 'skill-gap', icon: 'school' },
    { id: 'e-salary', title: 'Employment Outcomes', subtitle: 'Salary and placement outcomes for graduates', category: 'Evidence & KPIs', targetTab: 'employment-analytics', icon: 'payments' },
];

const initialNotifications: NotificationItem[] = [];

const DepartmentDashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('department_sidebar_collapsed') === 'true');
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<string>('dashboard');
    const { darkMode, toggleTheme } = useTheme();
    const [showNotifications, setShowNotifications] = useState(false);
    const [helpOpen, setHelpOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
    const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(null);
    const [showAllNotifsModal, setShowAllNotifsModal] = useState(false);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);

    const filteredSearchResults = searchQuery.trim()
        ? searchDataset.filter(item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : searchDataset.slice(0, 6);

    const handleSelectSearchItem = (item: SearchItem) => {
        setActiveTab(item.targetTab);
        setSearchQuery('');
        setSearchFocused(false);
        toast.success(`Navigated to ${item.title}`);
    };

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    const handleMarkNotificationsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    };

    const handleClearNotification = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const handleOpenNotifDetail = (notif: NotificationItem) => {
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, unread: false } : n));
        setSelectedNotif(notif);
        setShowNotifications(false);
    };

    const unreadNotificationsCount = notifications.filter(n => n.unread).length;

    React.useEffect(() => {
        localStorage.setItem('department_sidebar_collapsed', String(sidebarCollapsed));
    }, [sidebarCollapsed]);

    React.useEffect(() => {
        setMobileSidebarOpen(false);
        setShowNotifications(false);
        setMenuOpen(false);
        setSearchFocused(false);
    }, [activeTab]);

    // Close dropdowns on click outside
    React.useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('[data-search-container]')) {
                setSearchFocused(false);
            }
            if (!target.closest('[data-notif-container]')) {
                setShowNotifications(false);
            }
            if (!target.closest('[data-dept-menu]')) {
                setMenuOpen(false);
            }
        };
        window.addEventListener('mousedown', handleClick);
        return () => window.removeEventListener('mousedown', handleClick);
    }, []);

    const departmentManagementActions = [
        { title: 'Graduate Outcome Analytics', desc: 'Create outcome cohorts and compare employment, salary, location, and study continuation.', tab: 'employment-analytics', icon: 'query_stats' },
        { title: 'Department Custom Surveys', desc: 'Create custom department-level surveys for your alumni and dispatch tri-channel alerts (In-App, Email, SMS).', tab: 'department-surveys', icon: 'mark_email_unread' },
        { title: 'Curriculum Review Dashboard', desc: 'Manage feedback evidence, course updates, competency gaps, and review cycles.', tab: 'curriculum', icon: 'menu_book' },
        { title: 'Department KPI Dashboard', desc: 'Track accreditation KPIs, tracer response, research collaboration, and engagement.', tab: 'accreditation', icon: 'monitoring' },
        { title: 'Skill Gap Reports', desc: 'Create department skill-gap reports from employer demand and alumni career data.', tab: 'skill-gap', icon: 'school' },
        { title: 'Industry Partnership Reports', desc: 'Manage employer feedback, partnership evidence, and collaboration requests.', tab: 'employer-feedback', icon: 'handshake' },
        { title: 'Graduate Employability Reports', desc: 'Export accreditation-ready reports by batch, program, geography, and sector.', tab: 'export', icon: 'ios_share' },
    ];

    const renderSection = () => {
        switch (activeTab) {
            case 'management':
                return (
                    <section className="space-y-6 p-4 md:p-6">
                        <div className="rounded-[20px] border border-white/10 bg-gradient-to-r from-astu-navy via-[#0f4f86] to-astu-green p-5 text-white shadow-md md:p-6">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">Department management</p>
                            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Manage analytics, curriculum, KPIs, partnerships, and reports</h2>
                            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/85">
                                Graduate outcomes, curriculum review, ranking/KPI evidence, research collaboration, employability reporting, and industry partnership analytics.
                            </p>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {departmentManagementActions.map((action) => (
                                <button key={action.title} onClick={() => setActiveTab(action.tab)} className={`rounded-[10px] border p-5 text-left shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all hover:border-astu-navy/30 ${darkMode ? 'border-slate-800 bg-slate-900' : 'border-gray-200 bg-white'}`}>
                                    <span className="material-symbols-outlined rounded-[8px] bg-astu-navy/10 p-2 text-astu-navy">{action.icon}</span>
                                    <h3 className="mt-4 text-sm font-semibold">{action.title}</h3>
                                    <p className="mt-1 text-xs leading-relaxed text-gray-500">{action.desc}</p>
                                    <span className="mt-4 inline-flex rounded-[8px] bg-astu-navy px-3 py-2 text-xs font-semibold text-white">Manage / Create</span>
                                </button>
                            ))}
                        </div>
                    </section>
                );
            case 'dashboard':
                return <DashboardOverview darkMode={darkMode} />;
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
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">ASTU_AMS Hub & Direct Messages</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    Real-time direct messaging center for Department Chairs with Alumni Candidates, Corporate Recruiters, Registrar, and Admins.
                                </p>
                            </div>
                        </div>
                        <TelegramChat darkMode={darkMode} />
                    </div>
                );
            default:
                return <DashboardOverview darkMode={darkMode} />;
        }
    };

    return (
        <>
            <div className={`role-shell min-h-screen font-sans antialiased transition-all duration-300 ${darkMode ? 'bg-slate-950 text-white' : 'bg-[#f4f6fa] text-slate-800'
                }`}>

                {mobileSidebarOpen && (
                    <button
                        type="button"
                        aria-label="Close navigation"
                        onClick={() => setMobileSidebarOpen(false)}
                        className="fixed inset-0 z-30 bg-slate-950/45 backdrop-blur-sm md:hidden"
                    />
                )}

                {/* Exact Registrar-Inspired Premium White/Dark Sidebar Navigation */}
                <aside className={`fixed left-0 top-0 z-40 flex h-dvh flex-col overflow-hidden shadow-xs transition-all duration-300 md:translate-x-0 ${darkMode ? 'bg-slate-900 border-r border-slate-800 text-slate-100' : 'bg-white border-r border-slate-200/80 text-slate-800'} ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${sidebarCollapsed ? 'w-20 md:w-20' : 'w-72 md:w-72'}`}>
                    {/* Sidebar Logo Header */}
                    <div className={`relative z-10 h-16 shrink-0 px-4 flex items-center border-b transition-colors ${darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200/80 bg-white'}`}>
                        <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                            <div className="relative shrink-0 flex items-center justify-center h-10 w-10 overflow-hidden rounded-full">
                                <img
                                    src="/images/astu-seal-logo.png"
                                    alt="ASTU Official Logo"
                                    className="h-full w-full object-contain"
                                />
                            </div>
                            {!sidebarCollapsed && (
                                <div>
                                    <h1 className={`text-base font-extrabold tracking-tight leading-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>ASTU Department</h1>
                                    <p className={`text-[11px] uppercase tracking-[0.16em] font-extrabold truncate mt-0.5 ${darkMode ? 'text-blue-400' : 'text-[#003580]'}`}>Management Portal</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <nav className="relative z-10 flex-grow px-3 py-4 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden space-y-4">
                        {[
                            {
                                sectionKey: 'core',
                                sectionLabel: 'Department Core',
                                items: [
                                    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', badge: null, tooltip: 'Overview & key metrics' },
                                    { id: 'messages', label: 'Messages', icon: 'chat', badge: null, tooltip: 'ASTU_AMS direct messaging hub' },
                                    { id: 'management', label: 'Management Hub', icon: 'dashboard_customize', badge: null, tooltip: 'Analytics, curriculum, KPIs & partnerships' },
                                    { id: 'employment-analytics', label: 'Employment Analytics', icon: 'trending_up', badge: null, tooltip: 'Graduate employment outcomes & trends' },
                                ]
                            },
                            {
                                sectionKey: 'surveys',
                                sectionLabel: 'Analytics & Surveys',
                                items: [
                                    { id: 'department-surveys', label: 'Department Surveys', icon: 'edit_note', badge: 'NEW', tooltip: 'Create custom department surveys & dispatch alerts' },
                                    { id: 'skill-gap', label: 'Skill Gap Reports', icon: 'school', badge: null, tooltip: 'Skill gap analysis from employer data' },
                                    { id: 'employer-feedback', label: 'Employer Feedback', icon: 'rate_review', badge: null, tooltip: 'Employer reviews & curriculum feedback' },
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
                        ].map(group => (
                            <div key={group.sectionKey}>
                                {!sidebarCollapsed && (
                                    <div className="px-2.5 mb-1.5 mt-1">
                                        <p className={`text-[11.5px] font-extrabold uppercase tracking-[0.16em] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{group.sectionLabel}</p>
                                    </div>
                                )}
                                <div className="space-y-1">
                                    {group.items.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => setActiveTab(item.id)}
                                            title={sidebarCollapsed ? item.label : item.tooltip}
                                            className={`nav-btn w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 text-left group relative ${sidebarCollapsed ? 'justify-center' : 'gap-3.5'} ${activeTab === item.id
                                                    ? darkMode
                                                        ? 'bg-blue-600/20 text-blue-400 font-bold shadow-2xs ring-1 ring-blue-500/30'
                                                        : 'bg-[#003580]/10 text-[#003580] font-bold shadow-2xs ring-1 ring-[#003580]/20'
                                                    : darkMode
                                                        ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                                                        : 'text-slate-600 hover:text-[#003580] hover:bg-slate-50'
                                                }`}
                                        >
                                            <span className={`relative w-9 h-9 rounded-xl flex items-center justify-center text-sm transition-all ${activeTab === item.id
                                                    ? darkMode
                                                        ? 'bg-blue-600 text-white shadow-xs'
                                                        : 'bg-[#003580] text-white shadow-xs'
                                                    : darkMode
                                                        ? 'bg-slate-800 text-slate-400 group-hover:text-blue-400'
                                                        : 'bg-slate-100 text-slate-500 group-hover:text-[#003580]'
                                                }`}>
                                                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                                            </span>
                                            {!sidebarCollapsed && (
                                                <>
                                                    <span className="text-sm font-semibold flex-1 truncate text-left">{item.label}</span>
                                                    {item.badge && (
                                                        <span className={`ml-auto flex items-center justify-center min-w-[20px] h-5 px-2 rounded-full text-[10px] font-extrabold shadow-xs ${item.badge === 'NEW'
                                                                ? 'bg-blue-600 text-white'
                                                                : darkMode
                                                                    ? 'bg-slate-800 text-slate-300 border border-slate-700'
                                                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                                                            }`}>
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                            {activeTab === item.id && !sidebarCollapsed && !item.badge && (
                                                <div className={`ml-1 w-1.5 h-1.5 rounded-full shrink-0 ${darkMode ? 'bg-blue-400' : 'bg-[#003580]'}`} />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </nav>

                    {/* Sidebar Footer */}
                    <div className={`relative z-10 p-3 border-t transition-colors space-y-1 ${darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200/80 bg-white'}`}>
                        {!sidebarCollapsed && (
                            <>
                                <button
                                    onClick={() => setHelpOpen(true)}
                                    className={`nav-btn w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 text-left group gap-3.5 ${
                                        darkMode
                                            ? 'text-slate-400 hover:text-blue-400 hover:bg-slate-800/60'
                                            : 'text-slate-600 hover:text-[#003580] hover:bg-slate-50'
                                    }`}
                                >
                                    <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                                        darkMode
                                            ? 'bg-slate-800 text-slate-400 group-hover:text-blue-400'
                                            : 'bg-slate-100 text-slate-500 group-hover:text-[#003580]'
                                    }`}>
                                        <span className="material-symbols-outlined text-[20px]">help</span>
                                    </span>
                                    <span className="text-sm font-semibold flex-1 truncate">Help Center</span>
                                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md border ${
                                        darkMode
                                            ? 'text-slate-400 bg-slate-800 border-slate-700'
                                            : 'text-slate-400 bg-slate-100 border-slate-200'
                                    }`}>
                                        v1.4
                                    </span>
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className={`nav-btn w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 text-left group gap-3.5 ${
                                        darkMode
                                            ? 'text-rose-400 hover:bg-rose-950/40'
                                            : 'text-rose-600 hover:bg-rose-50'
                                    }`}
                                >
                                    <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                                        darkMode
                                            ? 'bg-rose-950/60 text-rose-400'
                                            : 'bg-rose-50 text-rose-600'
                                    }`}>
                                        <span className="material-symbols-outlined text-[20px]">logout</span>
                                    </span>
                                    <span className="text-sm font-bold flex-1 truncate">Logout</span>
                                    <span className="text-[10px] text-rose-400 font-bold">Alt+L</span>
                                </button>
                            </>
                        )}
                        {sidebarCollapsed && (
                            <>
                                <button
                                    onClick={() => setHelpOpen(true)}
                                    className={`nav-btn w-full flex items-center justify-center px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                                        darkMode ? 'text-slate-400 hover:bg-slate-800/60' : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                                    title="Help Center"
                                >
                                    <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                                        darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                        <span className="material-symbols-outlined text-[20px]">help</span>
                                    </span>
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className={`nav-btn w-full flex items-center justify-center px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                                        darkMode ? 'text-rose-400 hover:bg-rose-950/40' : 'text-rose-600 hover:bg-rose-50'
                                    }`}
                                    title="Logout"
                                >
                                    <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                                        darkMode ? 'bg-rose-950/60 text-rose-400' : 'bg-rose-50 text-rose-600'
                                    }`}>
                                        <span className="material-symbols-outlined text-[20px]">logout</span>
                                    </span>
                                </button>
                            </>
                        )}
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className={`min-h-screen flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-0 md:ml-20' : 'ml-0 md:ml-72'}`}>

                    {/* Header Section */}
                    <header className={`sticky top-0 z-30 flex h-16 w-full shrink-0 items-center justify-between border-b px-4 sm:px-6 shadow-2xs transition-all duration-300 ${darkMode ? 'bg-slate-900/95 border-slate-800 text-white' : 'bg-white/95 border-slate-200/80 text-slate-800'
                        }`}>
                        <div className="flex min-w-0 items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setSidebarCollapsed((value) => !value)}
                                className={`hidden h-10 w-10 items-center justify-center rounded-[8px] md:inline-flex ${darkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-black/5'}`}
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
                                className={`inline-flex h-10 w-10 items-center justify-center rounded-[8px] md:hidden ${darkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-black/5'}`}
                                aria-label="Open navigation"
                            >
                                <span className="material-symbols-outlined text-[20px]">menu</span>
                            </button>
                            <div className="min-w-0">
                                <h1 className={`truncate text-[16px] font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                    {activeTab === 'dashboard' ? 'Dashboard' : activeTab.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                </h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">

                            {/* Search Bar with Live Recommendations Autocomplete */}
                            <div className="relative group hidden sm:block w-72 md:w-96" data-search-container>
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
                                <input
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setSearchFocused(true);
                                    }}
                                    onFocus={() => setSearchFocused(true)}
                                    className={`w-full pl-9 pr-4 py-2 text-xs rounded-full border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-astu-navy/20 ${darkMode ? 'bg-slate-800 border-slate-700 text-white focus:bg-slate-750' : 'bg-[#F3F5FA] border-slate-200 focus:bg-white text-gray-900'
                                        }`}
                                    placeholder="Search graduates, reports, or analytics..."
                                    type="text"
                                />

                                {searchFocused && (
                                    <div className={`absolute left-0 top-12 w-full min-w-[340px] max-h-96 overflow-y-auto border rounded-2xl shadow-2xl z-50 p-2 space-y-2 ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                                        <div className="px-3 py-1.5 border-b border-gray-100/10 flex justify-between items-center text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                                            <span>Recommendations ({filteredSearchResults.length})</span>
                                            {searchQuery && <span className="text-blue-600 dark:text-blue-400">Filtering live...</span>}
                                        </div>

                                        {filteredSearchResults.length > 0 ? (
                                            <div className="space-y-1">
                                                {filteredSearchResults.map((item) => (
                                                    <button
                                                        key={item.id}
                                                        onClick={() => handleSelectSearchItem(item)}
                                                        className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all duration-200 ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
                                                    >
                                                        <span className="w-8 h-8 rounded-lg bg-astu-navy/10 text-astu-navy dark:bg-blue-900/40 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                                                            <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                                                        </span>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <h4 className="text-xs font-bold truncate">{item.title}</h4>
                                                                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase shrink-0">{item.category}</span>
                                                            </div>
                                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{item.subtitle}</p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-4 text-center text-xs text-slate-400 italic">
                                                No results found for "{searchQuery}". Try searching for "Tracer", "ABET", "Abebe", or "Curriculum".
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Dark Mode Toggle Switch */}
                            <button
                                onClick={() => {
                                    toggleTheme();
                                    toast.success(!darkMode ? 'Premium Dark Theme activated!' : 'Light Theme activated!');
                                }}
                                className={`p-2 rounded-full hover:bg-gray-100/10 transition-colors flex items-center justify-center ${darkMode ? 'text-amber-400' : 'text-slate-600'
                                    }`}
                                title="Toggle Dark/Light Mode"
                            >
                                <span className="material-symbols-outlined text-xl">
                                    {darkMode ? 'light_mode' : 'dark_mode'}
                                </span>
                            </button>

                            {/* Notification Bell Dropdown */}
                            <div className="relative" data-notif-container>
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="p-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full relative transition-all duration-300 hover:scale-105"
                                    title="Notifications"
                                >
                                    <span className="material-symbols-outlined">notifications</span>
                                    {unreadNotificationsCount > 0 && (
                                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-astu-red rounded-full border-2 border-white animate-pulse"></span>
                                    )}
                                </button>

                                {/* Notification Dropdown Menu */}
                                {showNotifications && (
                                    <div className={`absolute right-0 top-12 w-[min(22rem,calc(100vw-2rem))] border rounded-2xl shadow-xl z-50 p-4 space-y-3 ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-900'
                                        }`}>
                                        <div className="flex justify-between items-center pb-2 border-b border-gray-100/10">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-sm">Notifications</h4>
                                                {unreadNotificationsCount > 0 && (
                                                    <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-700 rounded-full">{unreadNotificationsCount} new</span>
                                                )}
                                            </div>
                                            <button
                                                onClick={handleMarkNotificationsRead}
                                                className="text-xs text-astu-navy dark:text-blue-400 font-semibold hover:underline"
                                            >
                                                Mark read
                                            </button>
                                        </div>
                                        <div className="space-y-2 max-h-72 overflow-y-auto">
                                            {notifications.map(notif => (
                                                <div
                                                    key={notif.id}
                                                    onClick={() => handleOpenNotifDetail(notif)}
                                                    className={`flex items-start gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${notif.unread ? (darkMode ? 'bg-slate-800/80' : 'bg-blue-50/70 border border-blue-100') : (darkMode ? 'hover:bg-slate-800/40' : 'hover:bg-gray-50')}`}
                                                >
                                                    <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${notif.unread ? 'bg-blue-600' : 'bg-transparent'}`} />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-1 mb-0.5">
                                                            <h5 className="text-xs font-bold truncate">{notif.title}</h5>
                                                            <span className="text-[10px] text-gray-400 shrink-0">{notif.time}</span>
                                                        </div>
                                                        <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">{notif.text}</p>
                                                        <span className="mt-1 inline-block text-[10px] font-bold text-astu-navy dark:text-blue-400 hover:underline">Click for details &rarr;</span>
                                                    </div>
                                                </div>
                                            ))}
                                            {notifications.length === 0 && (
                                                <p className="text-xs text-gray-500 italic text-center py-4">No notifications yet.</p>
                                            )}
                                        </div>
                                        <div className="pt-2 border-t border-gray-100/10 flex justify-between items-center text-xs">
                                            <button
                                                onClick={() => { setShowNotifications(false); setShowAllNotifsModal(true); }}
                                                className="font-bold text-astu-navy dark:text-blue-400 hover:underline"
                                            >
                                                View All Notifications
                                            </button>
                                            <button
                                                onClick={() => setNotifications([])}
                                                className="text-rose-600 font-semibold hover:underline"
                                            >
                                                Clear All
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>

                            {/* Header User Profile Display */}
                            <div className="relative" data-dept-menu>
                                <div onClick={() => setMenuOpen((v) => !v)} className="flex items-center gap-3 cursor-pointer hover:opacity-85 transition-opacity">
                                    <div className="text-right hidden sm:block">
                                        <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user?.name || 'Department Head'}</p>
                                        <p className="text-xs text-gray-500 font-semibold">{user?.department || 'Computer Science'}</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full border-2 border-astu-navy/20 shadow-sm bg-astu-navy flex items-center justify-center text-white font-bold">
                                        DH
                                    </div>
                                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                                </div>
                                {menuOpen && (
                                    <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-[10px] border border-gray-200 bg-white p-1 shadow-[0_4px_16px_rgba(0,0,0,0.08)] dark:bg-gray-900 dark:border-gray-700">
                                        <div className="px-3 py-3">
                                            <div className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name || 'Department Head'}</div>
                                            <div className="mt-1">
                                                <span className="inline-flex items-center rounded-md bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 border border-purple-200">{user?.department || 'Computer Science'}</span>
                                            </div>
                                        </div>
                                        <div className="my-1 h-px bg-gray-100" />
                                        <button type="button" onClick={() => { setMenuOpen(false); setActiveTab('accreditation'); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-600 hover:bg-black/5 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                                            <BarChart3 className="h-4 w-4" /> Accreditation Reports
                                        </button>
                                        <button type="button" onClick={() => { setMenuOpen(false); setActiveTab('export'); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-600 hover:bg-black/5 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                                            <FileText className="h-4 w-4" /> Export Center
                                        </button>
                                        <div className="my-1 h-px bg-gray-100" />
                                        <button type="button" onClick={() => { setMenuOpen(false); setHelpOpen(true); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-600 hover:bg-black/5 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                                            <HelpCircle className="h-4 w-4" /> Help
                                        </button>
                                        <button type="button" onClick={() => { setMenuOpen(false); handleLogout(); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-red-500 hover:bg-rose-50 dark:hover:bg-red-500/10 transition-colors">
                                            <LogOut className="h-4 w-4" /> Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </header>

                    {/* Dynamic Inner Tab View */}
                    <div className="dashboard-content flex-grow p-4 sm:p-6 md:p-8">
                        {renderSection()}
                    </div>

                </main>
            </div>

            {/* Single Notification Detail Modal */}
            {selectedNotif && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className={`w-full max-w-lg rounded-2xl shadow-2xl border p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200 ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                        <div className="flex justify-between items-start gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-0.5 text-xs font-extrabold bg-astu-navy/10 text-astu-navy dark:bg-blue-900/40 dark:text-blue-400 rounded-full border border-astu-navy/20">
                                        {selectedNotif.category}
                                    </span>
                                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${selectedNotif.priority === 'high' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {selectedNotif.priority} priority
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold tracking-tight">{selectedNotif.title}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-2">
                                    <span>{selectedNotif.source}</span>
                                    <span>•</span>
                                    <span>{selectedNotif.time}</span>
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedNotif(null)}
                                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className={`p-4 rounded-xl border text-sm leading-relaxed ${darkMode ? 'bg-slate-800/60 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200/80 text-slate-700'}`}>
                            <p className="font-semibold mb-2">{selectedNotif.text}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{selectedNotif.details}</p>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <button
                                onClick={() => {
                                    handleClearNotification(selectedNotif.id);
                                    setSelectedNotif(null);
                                    toast.success('Notification removed');
                                }}
                                className="text-xs font-semibold text-rose-600 hover:underline"
                            >
                                Delete Notification
                            </button>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setSelectedNotif(null)}
                                    className={`px-4 py-2 text-xs font-semibold rounded-xl border ${darkMode ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-gray-200 hover:bg-gray-100 text-gray-700'}`}
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        setActiveTab(selectedNotif.targetTab);
                                        setSelectedNotif(null);
                                        toast.success(`Navigated to ${selectedNotif.category} page`);
                                    }}
                                    className="px-4 py-2 text-xs font-bold bg-astu-navy hover:bg-blue-900 text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                                >
                                    <span>{selectedNotif.actionLabel}</span>
                                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View All Notifications Modal */}
            {showAllNotifsModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className={`w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl shadow-2xl border ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                        <div className="p-6 border-b border-gray-100/10 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold">All Notifications ({notifications.length})</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Department alerts, tracer survey responses, and accreditation audit updates</p>
                            </div>
                            <button
                                onClick={() => setShowAllNotifsModal(false)}
                                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1 space-y-3">
                            {notifications.map(notif => (
                                <div
                                    key={notif.id}
                                    onClick={() => {
                                        setShowAllNotifsModal(false);
                                        handleOpenNotifDetail(notif);
                                    }}
                                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all hover:shadow-md flex items-start gap-4 ${notif.unread ? (darkMode ? 'bg-slate-800 border-blue-900/50' : 'bg-blue-50/60 border-blue-200') : (darkMode ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50/60 border-slate-200/60')}`}
                                >
                                    <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center font-bold text-sm ${notif.unread ? 'bg-astu-navy text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                                        <span className="material-symbols-outlined">notifications</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <h4 className="text-sm font-bold truncate">{notif.title}</h4>
                                            <span className="text-xs text-slate-400 shrink-0">{notif.time}</span>
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">{notif.text}</p>
                                        <div className="flex items-center gap-2 text-[11px]">
                                            <span className="px-2 py-0.5 rounded bg-astu-navy/10 text-astu-navy dark:bg-blue-900/40 dark:text-blue-400 font-bold">{notif.category}</span>
                                            <span className="text-slate-400">•</span>
                                            <span className="font-semibold text-slate-500">{notif.source}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {notifications.length === 0 && (
                                <div className="p-8 text-center text-slate-400 italic">No notifications found.</div>
                            )}
                        </div>
                        <div className="p-4 border-t border-gray-100/10 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl flex justify-between items-center">
                            <button
                                onClick={() => handleMarkNotificationsRead()}
                                className="text-xs font-bold text-astu-navy dark:text-blue-400 hover:underline"
                            >
                                Mark All as Read
                            </button>
                            <button
                                onClick={() => setShowAllNotifsModal(false)}
                                className="px-5 py-2 text-xs font-semibold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 rounded-xl"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <HelpCenter isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
        </>
    );
};

export default DepartmentDashboard;
