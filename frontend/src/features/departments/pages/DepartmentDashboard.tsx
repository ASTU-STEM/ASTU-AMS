import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

// Data
import { mockEmploymentData, mockSkillGapData, mockEmployerFeedback, mockTracerSurveyData, mockCurriculumInsights, mockExportReports } from '../services/mockDepartmentData';

const DepartmentDashboard = () => {
    const navigate = useNavigate();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('department_sidebar_collapsed') === 'true');
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<string>('dashboard');
    const [darkMode, setDarkMode] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [helpOpen, setHelpOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState([
        { id: 1, text: 'New tracer survey responses received from 2024 graduates.', unread: true, time: '2 hours ago' },
        { id: 2, text: 'Employer feedback report generated for Computer Science.', unread: true, time: '1 day ago' },
        { id: 3, text: 'Accreditation evidence audit completed successfully.', unread: false, time: '3 days ago' },
    ]);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        toast.success('Logged out successfully');
        navigate('/login');
    };

    const handleMarkNotificationsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    };

    const handleClearNotification = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const unreadNotificationsCount = notifications.filter(n => n.unread).length;

    React.useEffect(() => {
        localStorage.setItem('department_sidebar_collapsed', String(sidebarCollapsed));
    }, [sidebarCollapsed]);

    React.useEffect(() => {
        setMobileSidebarOpen(false);
        setShowNotifications(false);
        setMenuOpen(false);
    }, [activeTab]);

    // Close dropdowns on click outside
    React.useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('[data-dept-menu]')) {
                setMenuOpen(false);
            }
        };
        window.addEventListener('mousedown', handleClick);
        return () => window.removeEventListener('mousedown', handleClick);
    }, []);

    const departmentManagementActions = [
        { title: 'Graduate Outcome Analytics', desc: 'Create outcome cohorts and compare employment, salary, location, and study continuation.', tab: 'employment-analytics', icon: 'query_stats' },
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
                return <EmploymentAnalytics data={mockEmploymentData} darkMode={darkMode} />;
            case 'skill-gap':
                return <SkillGapAnalysis data={mockSkillGapData} darkMode={darkMode} />;
            case 'employer-feedback':
                return <EmployerFeedback data={mockEmployerFeedback} darkMode={darkMode} />;
            case 'tracer-reports':
                return <TracerReports data={mockTracerSurveyData} darkMode={darkMode} />;
            case 'curriculum':
                return <CurriculumInsights data={mockCurriculumInsights} darkMode={darkMode} />;
            case 'accreditation':
                return <AccreditationReports darkMode={darkMode} />;
            case 'export':
                return <ExportCenter reports={mockExportReports} darkMode={darkMode} />;
            default:
                return <DashboardOverview darkMode={darkMode} />;
        }
    };

    return (
        <>
        <div className={`min-h-screen font-body-md overflow-x-hidden transition-all duration-300 role-shell admin-shell ${darkMode ? 'bg-slate-950 text-white' : 'bg-gradient-to-br from-gray-50 via-white to-gray-50 text-on-surface'
            }`}>
            <Toaster position="top-right" reverseOrder={false} />

            {mobileSidebarOpen && (
                <button
                    type="button"
                    aria-label="Close navigation"
                    onClick={() => setMobileSidebarOpen(false)}
                    className="fixed inset-0 z-30 bg-slate-950/45 backdrop-blur-sm md:hidden"
                />
            )}

        {/* Enhanced Sidebar Navigation */}
            <aside className={`fixed left-0 top-0 z-40 flex h-dvh w-64 flex-col shadow-2xl md:translate-x-0 bg-gradient-to-b from-[#001a33] via-[#002a55] to-[#003366] transition-all duration-300 ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${sidebarCollapsed ? 'md:w-20' : 'md:w-64'}`}>
                {/* Animated Background Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.02)_0%,transparent_40%,rgba(0,107,60,0.04)_60%,transparent_100%)] bg-[length:400%_400%] animate-[gradient-shift_8s_ease_infinite] pointer-events-none" />
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[15%] left-[20%] w-2 h-2 rounded-full bg-emerald-400/30 sidebar-particle" />
                    <div className="absolute top-[45%] right-[25%] w-1.5 h-1.5 rounded-full bg-[#FFD700]/25 sidebar-particle" />
                    <div className="absolute bottom-[30%] left-[30%] w-2.5 h-2.5 rounded-full bg-blue-400/20 sidebar-particle" />
                </div>

                {/* Logo */}
                <div className="relative z-10 p-5 border-b border-white/10">
                    <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                        <div className="relative group/logo">
                            <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/15 shadow-lg transition-all duration-300 group-hover/logo:border-emerald-400/50">
                                <img alt="ASTU Logo" className="h-8 w-8 object-contain rounded-md"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6deuYLZHNJiVCdbEUR2-fizVXzbqqy4MUBUQxxpgQcUdXNPyUaH_PmuawCgALD_doph1Fn2l0Qm3sEDaMoPuc2lMztO55CYrFDQZJjGQzLnLeSbraPgATab7DFeDHzQBXZ701F8IpJHwziWElvPY8ZCQ3zP6XJTuIzhgJQf-M-iSJw2mdrDUtfp4ha63XRYBjxmAonsb8n_vVPC8oR_VPGkiQfTNFY90SVNbxfDuq0vglrtVAwyP7P6GW9uQKJ7XaUGNCpUhOEFwH" />
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#001a33] shadow-lg animate-pulse" />
                            {!sidebarCollapsed && (
                                <div className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[7px] font-extrabold rounded border border-emerald-500/30 uppercase tracking-wider opacity-0 group-hover/logo:opacity-100 transition-opacity">Live</div>
                            )}
                        </div>
                        {!sidebarCollapsed && (
                            <div>
                                <h1 className="text-base font-extrabold text-white tracking-tight">ASTU Department</h1>
                                <p className="text-[9px] text-emerald-400 uppercase tracking-[0.2em] font-extrabold">Management Portal</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="relative z-10 flex-grow px-3 py-4 overflow-y-auto scrollbar-thin">
                    {!sidebarCollapsed && (
                        <div className="flex items-center justify-between px-3 mb-2">
                            <p className="text-[9px] font-extrabold text-white/30 uppercase tracking-[0.2em]">Analytics</p>
                            <span className="text-[8px] text-emerald-400/50 font-bold px-1.5 py-0.5 bg-emerald-400/5 rounded border border-emerald-400/10">5 items</span>
                        </div>
                    )}
                    <div className="space-y-0.5">
                        {[
                            { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', badge: null, tooltip: 'Overview & key metrics' },
                            { id: 'management', label: 'Management Hub', icon: 'dashboard_customize', badge: null, tooltip: 'Analytics, curriculum, KPIs & partnerships' },
                            { id: 'employment-analytics', label: 'Employment Analytics', icon: 'trending_up', badge: null, tooltip: 'Graduate employment outcomes & trends' },
                            { id: 'skill-gap', label: 'Skill Gap Reports', icon: 'school', badge: null, tooltip: 'Skill gap analysis from employer data' },
                            { id: 'employer-feedback', label: 'Employer Feedback', icon: 'rate_review', badge: null, tooltip: 'Employer reviews & curriculum feedback' },
                        ].map((item) => (
                            <button key={item.id} onClick={() => setActiveTab(item.id)}
                                title={sidebarCollapsed ? item.label : item.tooltip}
                                className={`nav-btn w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 text-left group relative ${sidebarCollapsed ? 'justify-center' : 'gap-3'} ${activeTab === item.id ? 'bg-white/15 text-white font-bold shadow-lg shadow-black/10 backdrop-blur-sm ring-1 ring-white/10' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
                                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all ${activeTab === item.id ? 'bg-emerald-400/20 text-emerald-400' : 'bg-white/5 text-white/40 group-hover:text-white/70'}`}>
                                    <span className="material-symbols-outlined">{item.icon}</span>
                                </span>
                                {!sidebarCollapsed && <span className="text-sm font-medium flex-1 truncate">{item.label}</span>}
                                {activeTab === item.id && !sidebarCollapsed && !item.badge && <div className="ml-1 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                                {sidebarCollapsed && (
                                    <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-slate-900 text-white text-[10px] font-medium rounded-lg shadow-xl border border-white/10 whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                                        {item.label}
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    {!sidebarCollapsed && (
                        <div className="flex items-center justify-between px-3 mt-5 mb-2">
                            <p className="text-[9px] font-extrabold text-white/30 uppercase tracking-[0.2em]">Reports</p>
                            <span className="text-[8px] text-emerald-400/50 font-bold px-1.5 py-0.5 bg-emerald-400/5 rounded border border-emerald-400/10">4 items</span>
                        </div>
                    )}
                    <div className="space-y-0.5">
                        {[
                            { id: 'tracer-reports', label: 'Tracer Reports', icon: 'assignment', badge: null, tooltip: 'Tracer study reports & surveys' },
                            { id: 'curriculum', label: 'Curriculum Insights', icon: 'menu_book', badge: null, tooltip: 'Curriculum review & analytics' },
                            { id: 'accreditation', label: 'Accreditation Reports', icon: 'verified', badge: null, tooltip: 'Accreditation-ready reports' },
                            { id: 'export', label: 'Export Reports', icon: 'download', badge: null, tooltip: 'Export data & reports' },
                        ].map((item) => (
                            <button key={item.id} onClick={() => setActiveTab(item.id)}
                                title={sidebarCollapsed ? item.label : item.tooltip}
                                className={`nav-btn w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 text-left group relative ${sidebarCollapsed ? 'justify-center' : 'gap-3'} ${activeTab === item.id ? 'bg-white/15 text-white font-bold shadow-lg shadow-black/10 backdrop-blur-sm ring-1 ring-white/10' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
                                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all ${activeTab === item.id ? 'bg-emerald-400/20 text-emerald-400' : 'bg-white/5 text-white/40 group-hover:text-white/70'}`}>
                                    <span className="material-symbols-outlined">{item.icon}</span>
                                </span>
                                {!sidebarCollapsed && <span className="text-sm font-medium flex-1 truncate">{item.label}</span>}
                                {activeTab === item.id && !sidebarCollapsed && !item.badge && <div className="ml-1 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                                {sidebarCollapsed && (
                                    <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-slate-900 text-white text-[10px] font-medium rounded-lg shadow-xl border border-white/10 whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                                        {item.label}
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    {sidebarCollapsed && (
                        <div className="mt-4 px-3">
                            <div className="flex justify-center">
                                <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" title="System Online" />
                            </div>
                        </div>
                    )}
                </nav>

                {/* Footer */}
                <div className="relative z-10 p-4 border-t border-white/10 space-y-1">
                    {!sidebarCollapsed && (
                        <>
                            <button onClick={() => setHelpOpen(true)}
                                className="nav-btn w-full flex items-center px-3 py-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all duration-200 text-left group gap-3">
                                <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm text-white/40 group-hover:text-white/70 material-symbols-outlined">help</span>
                                <span className="text-sm font-medium">Help Center</span>
                                <span className="ml-auto text-[8px] text-white/20 font-bold px-1.5 py-0.5 bg-white/5 rounded border border-white/10">v1.4</span>
                            </button>
                            <button onClick={handleLogout}
                                className="nav-btn w-full flex items-center px-3 py-2.5 rounded-xl text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200 text-left group gap-3">
                                <span className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center group-hover:bg-rose-500/20 material-symbols-outlined text-rose-400/70 group-hover:text-rose-400">logout</span>
                                <span className="text-sm font-medium">Logout</span>
                                <span className="ml-auto text-[8px] text-white/10 font-medium">Alt+L</span>
                            </button>
                        </>
                    )}
                    {sidebarCollapsed && (
                        <>
                            <button onClick={() => setHelpOpen(true)}
                                className="nav-btn w-full flex items-center justify-center px-3 py-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all duration-200 group relative" title="Help Center">
                                <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm text-white/40 group-hover:text-white/70 material-symbols-outlined">help</span>
                                <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-slate-900 text-white text-[10px] font-medium rounded-lg shadow-xl border border-white/10 whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">Help Center</div>
                            </button>
                            <button onClick={handleLogout}
                                className="nav-btn w-full flex items-center justify-center px-3 py-2.5 rounded-xl text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200 group relative" title="Logout">
                                <span className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center group-hover:bg-rose-500/20 material-symbols-outlined text-rose-400/70 group-hover:text-rose-400">logout</span>
                                <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-slate-900 text-white text-[10px] font-medium rounded-lg shadow-xl border border-white/10 whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">Logout</div>
                            </button>
                        </>
                    )}
                </div>
            </aside>

            {/* Main Content Area */}
            <main className={`min-h-screen flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>

                {/* Header Section */}
                <header className={`sticky top-0 z-50 flex justify-between items-center w-full px-4 md:px-10 h-16 border-b transition-all duration-300 ${darkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-gray-200/50 shadow-sm'
                    }`}>
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => setSidebarCollapsed((value) => !value)}
                            className={`hidden h-10 w-10 items-center justify-center rounded-[8px] md:inline-flex ${darkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-black/5'}`}
                            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        >
                            <span className="material-symbols-outlined">menu</span>
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
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <div className="flex-1 max-w-xl">
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                                <input
                                    className={`w-full pl-10 pr-4 py-2 text-sm rounded-full border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-astu-navy/20 ${darkMode ? 'bg-slate-850 border-slate-700 text-white focus:bg-slate-800' : 'bg-gray-100/80 border-gray-200 focus:bg-white text-gray-900'
                                        }`}
                                    placeholder="Search graduates, reports, or analytics..."
                                    type="text"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 ml-6 relative">
                        {/* Dark Mode Toggle Switch */}
                        <button
                            onClick={() => {
                                setDarkMode(!darkMode);
                                toast.success(darkMode ? 'Light Theme activated!' : 'Premium Dark Theme activated!');
                            }}
                            className={`p-2 rounded-full hover:bg-gray-100/10 transition-colors flex items-center justify-center ${darkMode ? 'text-amber-400' : 'text-slate-600'
                                }`}
                            title="Toggle Dark/Light Mode"
                        >
                            <span className="material-symbols-outlined text-xl">
                                {darkMode ? 'light_mode' : 'dark_mode'}
                            </span>
                        </button>

                        {/* Notification Bell */}
                        <button
                            onClick={() => {
                                setShowNotifications(!showNotifications);
                                if (!showNotifications) handleMarkNotificationsRead();
                            }}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full relative transition-all duration-300 hover:scale-105"
                        >
                            <span className="material-symbols-outlined">notifications</span>
                            {unreadNotificationsCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-astu-red rounded-full border-2 border-white animate-pulse"></span>
                            )}
                        </button>

                        {/* Notification Dropdown Portal */}
                        {showNotifications && (
                            <div className={`absolute right-0 top-12 w-[min(20rem,calc(100vw-2rem))] border rounded-2xl shadow-xl z-50 p-4 space-y-3 ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-900'
                                }`}>
                                <div className="flex justify-between items-center pb-2 border-b border-gray-100/10">
                                    <h4 className="font-bold text-sm">Notifications</h4>
                                    <button
                                        onClick={() => setNotifications([])}
                                        className="text-xs text-astu-red hover:underline"
                                    >
                                        Clear All
                                    </button>
                                </div>
                                <div className="space-y-2.5 max-h-60 overflow-y-auto">
                                    {notifications.map(notif => (
                                        <div key={notif.id} className="flex justify-between items-start gap-2 p-2 rounded-lg hover:bg-gray-50/10 transition-colors">
                                            <div className="space-y-0.5">
                                                <p className="text-xs leading-normal">{notif.text}</p>
                                                <span className="text-[10px] text-gray-400 font-semibold">{notif.time}</span>
                                            </div>
                                            <button
                                                onClick={() => handleClearNotification(notif.id)}
                                                className="text-gray-300 hover:text-gray-500"
                                            >
                                                <span className="material-symbols-outlined text-sm">close</span>
                                            </button>
                                        </div>
                                    ))}
                                    {notifications.length === 0 && (
                                        <p className="text-xs text-gray-500 italic text-center py-4">No notifications yet.</p>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>

                        {/* Header User Profile Display */}
                        <div className="relative" data-dept-menu>
                            <div onClick={() => setMenuOpen((v) => !v)} className="flex items-center gap-3 cursor-pointer hover:opacity-85 transition-opacity">
                                <div className="text-right hidden sm:block">
                                    <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Department Head</p>
                                    <p className="text-xs text-gray-500 font-semibold">Computer Science</p>
                                </div>
                                <div className="w-10 h-10 rounded-full border-2 border-astu-navy/20 shadow-sm bg-astu-navy flex items-center justify-center text-white font-bold">
                                    DH
                                </div>
                                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                            </div>
                            {menuOpen && (
                                <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-[10px] border border-gray-200 bg-white p-1 shadow-[0_4px_16px_rgba(0,0,0,0.08)] dark:bg-gray-900 dark:border-gray-700">
                                    <div className="px-3 py-3">
                                        <div className="text-sm font-semibold text-gray-900 dark:text-white">Department Head</div>
                                        <div className="mt-1">
                                            <span className="inline-flex items-center rounded-md bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 border border-purple-200">Computer Science</span>
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
                <div className="flex-grow">
                    {renderSection()}
                </div>

            </main>
        </div>

        <HelpCenter isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
        </>
    );
};

export default DepartmentDashboard;
