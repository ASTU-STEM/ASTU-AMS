import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { HelpCircle, LogOut, Menu } from 'lucide-react';

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
    const [activeTab, setActiveTab] = useState<string>('dashboard');
    const [darkMode, setDarkMode] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
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

    const renderSection = () => {
        switch (activeTab) {
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
        <div className={`min-h-screen font-body-md overflow-x-hidden transition-all duration-300 role-shell admin-shell ${darkMode ? 'bg-slate-950 text-white' : 'bg-gradient-to-br from-gray-50 via-white to-gray-50 text-on-surface'
            }`}>
            <Toaster position="top-right" reverseOrder={false} />

{/* Sidebar Navigation - Fixed width, collapsible */}
            <aside className={`fixed left-0 top-0 z-40 hidden h-full flex-col shadow-2xl ${sidebarCollapsed ? 'w-20' : 'w-64'} md:flex bg-astu-navy transition-all duration-300`}>
                <div className={`p-6 mt-6 ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
                    {!sidebarCollapsed && (
                        <div className="flex items-center gap-3">
                            <img
                                alt="ASTU Logo"
                                className="h-10 w-10 object-contain drop-shadow-lg rounded-lg"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6deuYLZHNJiVCdbEUR2-fizVXzbqqy4MUBUQxxpgQcUdXNPyUaH_PmuawCgALD_doph1Fn2l0Qm3sEDaMoPuc2lMztO55CYrFDQZJjGQzLnLeSbraPgATab7DFeDHzQBXZ701F8IpJHwziWElvPY8ZCQ3zP6XJTuIzhgJQf-M-iSJw2mdrDUtfp4ha63XRYBjxmAonsb8n_vVPC8oR_VPGkiQfTNFY90SVNbxfDuq0vglrtVAwyP7P6GW9uQKJ7XaUGNCpUhOEFwH"
                            />
                            <div>
                                <h1 className="text-xl font-bold text-white">ASTU Department</h1>
                                <p className="text-[10px] text-astu-green uppercase tracking-widest font-extrabold">Management Portal</p>
                            </div>
                        </div>
                    )}
                    {sidebarCollapsed && (
                        <img
                            alt="ASTU Logo"
                            className="h-10 w-10 object-contain drop-shadow-lg rounded-lg"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6deuYLZHNJiVCdbEUR2-fizVXzbqqy4MUBUQxxpgQcUdXNPyUaH_PmuawCgALD_doph1Fn2l0Qm3sEDaMoPuc2lMztO55CYrFDQZJjGQzLnLeSbraPgATab7DFeDHzQBXZ701F8IpJHwziWElvPY8ZCQ3zP6XJTuIzhgJQf-M-iSJw2mdrDUtfp4ha63XRYBjxmAonsb8n_vVPC8oR_VPGkiQfTNFY90SVNbxfDuq0vglrtVAwyP7P6GW9uQKJ7XaUGNCpUhOEFwH"
                        />
                    )}
                </div>

                <nav className="mt-8 flex-grow overflow-y-auto">
                    <div className="space-y-1">
                        {[
                            { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', activeColor: 'text-astu-green bg-white/10 border-l-4 border-astu-green' },
                            { id: 'employment-analytics', label: 'Employment Analytics', icon: 'trending_up', activeColor: 'text-astu-green bg-white/10 border-l-4 border-astu-green' },
                            { id: 'skill-gap', label: 'Skill Gap Reports', icon: 'school', activeColor: 'text-astu-green bg-white/10 border-l-4 border-astu-green' },
                            { id: 'employer-feedback', label: 'Employer Feedback', icon: 'rate_review', activeColor: 'text-astu-green bg-white/10 border-l-4 border-astu-green' },
                            { id: 'tracer-reports', label: 'Tracer Reports', icon: 'assignment', activeColor: 'text-astu-green bg-white/10 border-l-4 border-astu-green' },
                            { id: 'curriculum', label: 'Curriculum Insights', icon: 'menu_book', activeColor: 'text-astu-green bg-white/10 border-l-4 border-astu-green' },
                            { id: 'accreditation', label: 'Accreditation Reports', icon: 'verified', activeColor: 'text-astu-green bg-white/10 border-l-4 border-astu-green' },
                            { id: 'export', label: 'Export Reports', icon: 'download', activeColor: 'text-astu-green bg-white/10 border-l-4 border-astu-green' }
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                title={sidebarCollapsed ? item.label : undefined}
                                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-3' : 'gap-4 px-6'} py-2.5 rounded-r-xl transition-all duration-300 text-left ${activeTab === item.id
                                    ? item.activeColor + ' font-bold shadow-md'
                                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <span className="material-symbols-outlined">{item.icon}</span>
                                {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                            </button>
                        ))}
                    </div>
                </nav>

                <div className={`p-6 border-t border-white/10 mt-auto ${sidebarCollapsed ? 'flex flex-col items-center' : ''}`}>
                    {!sidebarCollapsed && (
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className="w-full flex items-center gap-4 text-slate-300 hover:text-white mb-4 transition-colors text-left"
                        >
                            <span className="material-symbols-outlined text-md">help</span>
                            <span className="text-sm font-medium">Help Center</span>
                        </button>
                    )}
                    {!sidebarCollapsed && (
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-4 text-slate-300 hover:text-white transition-colors text-left"
                        >
                            <span className="material-symbols-outlined text-md">logout</span>
                            <span className="text-sm font-medium">Logout</span>
                        </button>
                    )}
                    {sidebarCollapsed && (
                        <>
                            <button
                                onClick={() => setActiveTab('dashboard')}
                                className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-300 hover:text-white transition-colors mb-2"
                                title="Help Center"
                            >
                                <span className="material-symbols-outlined text-md">help</span>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex h-10 w-10 items-center justify-center rounded-lg text-red-400 hover:text-red-400 transition-colors"
                                title="Logout"
                            >
                                <span className="material-symbols-outlined text-md">logout</span>
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
                            <div className={`absolute right-12 top-12 w-80 border rounded-2xl shadow-xl z-50 p-4 space-y-3 ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-900'
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
                        <div className="flex items-center gap-3 cursor-pointer hover:opacity-85 transition-opacity">
                            <div className="text-right hidden sm:block">
                                <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Department Head</p>
                                <p className="text-xs text-gray-500 font-semibold">Computer Science</p>
                            </div>
                            <div className="w-10 h-10 rounded-full border-2 border-astu-navy/20 shadow-sm bg-astu-navy flex items-center justify-center text-white font-bold">
                                DH
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dynamic Inner Tab View */}
                <div className="flex-grow">
                    {renderSection()}
                </div>

            </main>
        </div>
    );
};

export default DepartmentDashboard;
