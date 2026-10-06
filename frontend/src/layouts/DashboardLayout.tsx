import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  GraduationCap,
  ShieldCheck,
  LogOut,
  Menu,
  Bell,
  Database,
  Building2,
  BarChart3,
  ArrowRight,
  User,
  FileText,
  Briefcase,
  Users,
  MapPin,
  ShoppingBag,
  Zap,
  Award,
  FileCheck,
  Ticket,
  Heart,
  Globe,
  TrendingUp,
  Settings,
  FileBarChart2,
  Edit,
  Layers,
  Palette,
  MenuSquare,
  Image,
  Newspaper,
  SearchCode,
  MessageCircle,
  Mail,
  Handshake,
  Share2,
  CheckCircle,
  HardDrive,
  Activity,
  Archive,
  FileCode,
  Key,
  Monitor,
  Shield,
  LogIn,
  Download,
  Mic,
  GalleryHorizontal,
  Video,
  Calendar,
  UserCog,
  BarChart,
  AlertCircle,
  Upload,
  RefreshCw,
  ThumbsUp,
  BarChart2,
  BookOpen,
  Plus,
  Sun,
  Moon,
} from 'lucide-react';
import AlumniDashboard from '../features/alumni/pages/AlumniDashboard';
import EmployerDashboard from '../features/employers/pages/EmployerDashboard';
import RegistrarDashboard from '../features/registrar/pages/RegistrarDashboard';
import DepartmentDashboard from '../features/departments/pages/DepartmentDashboard';
import AdminDashboard from '../features/admin/pages/AdminDashboard';
import { PageHeader } from '../components/PageHeader';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useSystemSettings } from '../context/SystemSettingsContext';
import { useTheme } from '../hooks/useTheme';

// No backend call here (logout is purely local for now)
const logoutLocally = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};


// ==========================================
// 1. DYNAMIC SHARED LAYOUT SYSTEM
// ==========================================
interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  role: string;
  navItems: Array<{ path: string; label: string; icon: React.ComponentType<any> }>;
  breadcrumbs?: Array<{ label: string; path?: string; onClick?: () => void }>;
  subtitle?: string;
  headerActions?: React.ReactNode;
  loading?: boolean;
}

export function DashboardLayout({
  children,
  title,
  role,
  navItems,
  breadcrumbs,
  subtitle,
  headerActions,
  loading = false
}: DashboardLayoutProps) {
  const { settings } = useSystemSettings();
  const { darkMode, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem(`dashboard_layout_${role}_collapsed`) === 'true');
  const location = useLocation();

  React.useEffect(() => {
    localStorage.setItem(`dashboard_layout_${role}_collapsed`, String(sidebarCollapsed));
  }, [role, sidebarCollapsed]);

  const sidebarDisplayCollapsed = sidebarCollapsed && !sidebarOpen;

  return (
    <div className="app-shell flex h-dvh w-full overflow-hidden bg-[var(--bg-page)] text-[var(--text-primary)] dark:text-slate-100 antialiased font-sans">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-sm" />
      )}

       {/* Sidebar Container */}
       <aside className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-64 flex-shrink-0 flex-col bg-[var(--bg-card)] dark:bg-slate-900 border-r border-[var(--border-color)] dark:border-slate-800 transition-all duration-300 lg:relative lg:z-20 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}`}>
         
         {/* Sidebar Header */}
         <div className="p-4 border-b border-[var(--border-color)] dark:border-slate-800 flex items-center justify-between flex-shrink-0">
           <Link to="/" className={`flex items-center ${sidebarDisplayCollapsed ? 'justify-center' : 'gap-3'}`}>
             <div className="bg-[#003366] p-2 rounded-xl text-white shadow-md flex-shrink-0">
               <GraduationCap className="h-5 w-5 text-[#FFCC00]" />
             </div>
             {!sidebarDisplayCollapsed && <div className="overflow-hidden">
               <span className="font-extrabold text-md tracking-tight text-[#003366] dark:text-amber-400 block whitespace-nowrap">{settings.general.abbreviation}-AMS</span>
               <span className="text-[9px] uppercase tracking-widest text-[#CC0033] font-bold block whitespace-nowrap">{role}</span>
             </div>}
           </Link>
         </div>

         {/* Navigation Links */}
         <nav className="flex-1 overflow-y-auto p-2 space-y-1">
           {navItems.map((item: { path: string; label: string; icon: React.ComponentType<any> }, idx: number) => {
             const isActive = location.pathname === item.path;
             return (
               <Link
                 key={idx}
                 to={item.path}
                 onClick={() => setSidebarOpen(false)}
                 title={sidebarDisplayCollapsed ? item.label : undefined}
                 className={`w-full flex items-center rounded-xl transition-all duration-200 px-4 py-3 ${sidebarDisplayCollapsed ? 'justify-center' : 'gap-4'} ${isActive
                   ? 'bg-[#003366]/10 text-[#003366] dark:bg-amber-400/10 dark:text-amber-400 font-bold shadow-sm'
                   : 'text-[var(--text-secondary)] dark:text-slate-400 hover:bg-[var(--bg-page)] dark:hover:bg-slate-800 hover:text-[var(--text-primary)] dark:hover:text-slate-100'
                   }`}
               >
                 <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-[#003366] dark:text-amber-400' : 'text-[var(--text-muted)] dark:text-slate-400'}`} />
                 {!sidebarDisplayCollapsed && <span className="text-sm tracking-wide font-medium truncate">
                   {item.label}
                 </span>}
               </Link>
             );
           })}
         </nav>

         {/* Sidebar Footer */}
         <div className="border-t border-[var(--border-color)] dark:border-slate-800 flex-shrink-0 p-4">
           <button
             type="button"
             onClick={() => {
               logoutLocally();
               window.location.href = '/login';
             }}
             title={sidebarDisplayCollapsed ? 'Exit Workspace' : undefined}
             className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all ${sidebarDisplayCollapsed ? 'justify-center' : 'gap-3'}`}
           >
             <LogOut className="h-4 w-4 flex-shrink-0" />
             {!sidebarDisplayCollapsed && <span>Exit Workspace</span>}
           </button>
         </div>
       </aside>

       {/* Fluid Canvas - main content area */}
       <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
         
         {/* Clean Top Header Bar */}
         <header className="bg-[var(--bg-card)] dark:bg-slate-900 h-16 border-b border-[var(--border-color)] dark:border-slate-800 flex items-center px-4 sm:px-6 justify-between flex-shrink-0 z-10">
           <div className="flex items-center gap-4">
             {/* Mobile menu button */}
             <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-[var(--text-secondary)] dark:text-slate-400 hover:bg-[var(--bg-page)] dark:hover:bg-slate-800 rounded-xl">
               <Menu className="h-5 w-5" />
             </button>
             <button
               type="button"
               onClick={() => setSidebarCollapsed((value) => !value)}
               className="hidden p-2 text-[var(--text-secondary)] dark:text-slate-400 hover:bg-[var(--bg-page)] dark:hover:bg-slate-800 rounded-xl lg:inline-flex"
               title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
             >
               <Menu className="h-5 w-5" />
             </button>
             {/* Breadcrumbs / Title */}
             <h1 className="truncate text-base font-bold text-[var(--text-primary)] dark:text-slate-100 tracking-tight sm:text-lg">{title}</h1>
           </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] dark:text-slate-400 dark:hover:text-slate-200 bg-[var(--bg-page)] dark:bg-slate-800 rounded-xl relative shadow-sm border border-transparent dark:border-slate-700 transition-colors"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
            </button>
            <button className="p-2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] dark:text-slate-400 dark:hover:text-slate-200 bg-[var(--bg-page)] dark:bg-slate-800 rounded-xl relative shadow-sm border border-transparent dark:border-slate-700">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#CC0033] rounded-full"></span>
            </button>
            <div className="h-8 w-[1px] bg-[var(--bg-page)] dark:bg-slate-700"></div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[var(--bg-page)] dark:bg-slate-800 flex items-center justify-center font-bold text-sm text-[#003366] dark:text-amber-400 border border-[var(--border-color)] dark:border-slate-700">
                U
              </div>
            </div>
          </div>
        </header>

        {/* Scrolling Content Panel */}
        <main className="flex-1 overflow-y-auto bg-[var(--bg-page)] p-4 sm:p-6">
          {/* Page Header with Breadcrumbs */}
          {(breadcrumbs || subtitle || headerActions) && (
            <PageHeader
              title={title}
              subtitle={subtitle}
              breadcrumbs={breadcrumbs}
              actions={headerActions}
            />
          )}

          {/* Loading State */}
          {loading ? (
            <div className="space-y-6">
              <LoadingSkeleton variant="card" count={3} />
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}

// ==========================================
// 2. LANDING COMPONENT VIEW
// ==========================================
function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="app-shell min-h-screen bg-[var(--bg-page)] antialiased font-sans">
      {/* Structural Navbar */}
      <nav className="bg-[var(--bg-card)] border-b border-[var(--border-color)] sticky top-0 z-50 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-[#003366] p-2 rounded-xl text-white shadow-md">
              <GraduationCap className="h-6 w-6 text-[#FFCC00]" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-[#003366] block">ASTU-AMS</span>
              <span className="text-[10px] uppercase tracking-widest text-[#CC0033] font-bold block -mt-1">Alumni Ecosystem</span>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200/60 shadow-sm flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Infrastructure Secure
          </span>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="py-16 text-center max-w-4xl mx-auto px-4 space-y-6">
        <h1 className="text-4xl sm:text-5xl font-black text-[#003366] tracking-tight leading-tight">
          ASTU-AMS Enterprise Portal Entry
        </h1>
        <p className="text-[var(--text-secondary)] text-base sm:text-lg max-w-2xl mx-auto">
          Welcome to the Adama Science and Technology University Digital Ecosystem. Choose your designated gateway module below to manage profiles, verify records, or access analytics.
        </p>
      </header>

      {/* Portal Path Grid */}
      <section className="max-w-7xl mx-auto px-4 pb-24 grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          { title: "Alumni Portal", desc: "Update professional resumes and fill tracking questionnaires.", path: "/alumni", icon: GraduationCap },
          { title: "Registrar Hub", desc: "Process graduate Excel arrays and handle credentials validations.", path: "/registrar", icon: Database },
          { title: "Employer Panel", desc: "Publish operational career opportunities and post feedback arrays.", path: "/employer", icon: Building2 },
          { title: "Department Analytics", desc: "Isolate structural technological curriculum discrepancies.", path: "/department", icon: BarChart3 },
          { title: "System Governance", desc: "Manage overarching access controls and cron schedules.", path: "/admin", icon: ShieldCheck },
        ].map((p, i) => (
          <div key={i} className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-6 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group transform hover:-translate-y-1">
            <div className="space-y-4">
              <div className="bg-[var(--bg-page)] text-[#003366] p-3 rounded-xl w-fit group-hover:bg-[#003366] group-hover:text-white transition-all shadow-sm">
                <p.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">{p.title}</h3>
              <p className="text-[var(--text-muted)] text-xs leading-relaxed">{p.desc}</p>
            </div>
            <button onClick={() => navigate(p.path)} className="mt-6 w-full flex items-center justify-center gap-2 bg-[var(--bg-page)] text-[var(--text-secondary)] hover:bg-[#003366] hover:text-white py-2.5 font-bold text-xs rounded-xl border border-[var(--border-color)] transition-all shadow-sm">
              Launch Portal <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}

// ==========================================
// 3. PORTAL 1: ALUMNI INSTANCE
// ==========================================
function AlumniPortal() {
  const navItems = [
    { label: "Overview", path: "/alumni", icon: User },
    { label: "Tracer Surveys", path: "/alumni/surveys", icon: FileText },
    { label: "Jobs Board", path: "/alumni/jobs", icon: Briefcase },
    { label: "Alumni Directory", path: "/alumni/directory", icon: Users },
    { label: "Alumni Map", path: "/alumni/map", icon: MapPin },
    { label: "Business Directory", path: "/alumni/business", icon: ShoppingBag },
    { label: "Startup Showcase", path: "/alumni/startups", icon: Zap },
    { label: "Research Publications", path: "/alumni/research", icon: BookOpen },
    { label: "Skills Portfolio", path: "/alumni/skills", icon: Award },
    { label: "CV Builder", path: "/alumni/cv", icon: FileCheck },
    { label: "Digital ID Card", path: "/alumni/id-card", icon: Ticket },
    { label: "Volunteer Program", path: "/alumni/volunteer", icon: Heart },
    { label: "Alumni Awards", path: "/alumni/awards", icon: Award },
    { label: "Chapters", path: "/alumni/chapters", icon: Globe },
    { label: "Donation History", path: "/alumni/donations", icon: Heart },
    { label: "Career Progress", path: "/alumni/career", icon: TrendingUp },
    { label: "Settings", path: "/alumni/settings", icon: Settings }
  ];

  return (
    <DashboardLayout title="Alumni Hub Dashboard" role="Alumni Account" navItems={navItems}>
      <Routes>
        <Route path="/dashboard" element={<Navigate to="/alumni" replace />} />
        <Route path="/" element={
          <div className="space-y-6">
            {/* Profile Highlight Card */}
            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#003366]/10 text-[#003366] font-black rounded-2xl flex items-center justify-center text-lg shadow-inner">
                  JD
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">John Doe</h2>
                  <p className="text-xs text-[var(--text-muted)] font-medium">B.Sc. Software Engineering • Class of 2025</p>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-sm">
                <AlertCircle className="text-amber-600 h-5 w-5 flex-shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-amber-900 block">Pending Mandatory Survey</span>
                  <span className="text-amber-700 block">6-Month Tracer Questionnaires must be answered.</span>
                </div>
              </div>
            </div>

            {/* Quick Metrics Panels */}
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-6 shadow-md">
                <span className="text-[var(--text-muted)] font-bold text-[10px] uppercase tracking-wider block mb-1">Profile Completeness</span>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black text-[var(--text-primary)]">85%</span>
                  <div className="flex-1 bg-[var(--bg-page)] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#003366] h-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </div>
              <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-6 shadow-md">
                <span className="text-[var(--text-muted)] font-bold text-[10px] uppercase tracking-wider block mb-1">Active Job Matches</span>
                <span className="text-2xl font-black text-[var(--text-primary)] block">14 Matches</span>
              </div>
              <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-6 shadow-md">
                <span className="text-[var(--text-muted)] font-bold text-[10px] uppercase tracking-wider block mb-1">Verification Status</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 inline-block mt-1 shadow-sm">
                  ✓ VERIFIED BY REGISTRAR
                </span>
              </div>
            </div>
          </div>
        } />
        <Route path="/surveys" element={
          <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-6 shadow-md space-y-6">
            <div>
              <h2 className="text-lg font-black text-[#003366]">6-Month Mandatory Employment Tracer</h2>
              <p className="text-xs text-[var(--text-muted)]">This validation feeds directly into the university accreditation module.</p>
            </div>
            <form className="space-y-4 max-w-xl border-t border-[var(--border-color)] pt-4" onSubmit={e => e.preventDefault()}>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-secondary)] block">Current Employment Parameters</label>
                <select className="w-full text-sm rounded-xl border-[var(--border-color)] shadow-sm focus:border-[#003366] focus:ring-[#003366]">
                  <option>Employed Full-Time (Industry Aligned)</option>
                  <option>Self-Employed / Entrepreneur</option>
                  <option>Unemployed / Seeking Placement</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-secondary)] block">Time to Professional Hire</label>
                <select className="w-full text-sm rounded-xl border-[var(--border-color)] shadow-sm focus:border-[#003366] focus:ring-[#003366]">
                  <option>Secured Before Graduation</option>
                  <option>0 - 3 Months Post-Graduation</option>
                  <option>3 - 6 Months Post-Graduation</option>
                </select>
              </div>
              <button type="button" className="bg-[#003366] hover:bg-slate-800 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition-all">
                Submit Responses
              </button>
            </form>
          </div>
        } />
        <Route path="/jobs" element={
          <div className="space-y-4">
            <div className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border-color)] shadow-md flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[var(--text-primary)]">Cloud Infrastructure Engineer</h3>
                <p className="text-xs text-[var(--text-muted)]">Ethio Telecom • Addis Ababa (Hybrid)</p>
              </div>
              <button className="bg-[#003366] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-800 transition-all">
                Apply Now
              </button>
            </div>
          </div>
        } />
        <Route path="/directory" element={<div className="p-6"><h2 className="text-lg font-bold">Alumni Directory</h2><p className="text-sm text-[var(--text-muted)]">Browse and search alumni profiles.</p></div>} />
        <Route path="/map" element={<div className="p-6"><h2 className="text-lg font-bold">Alumni Map</h2><p className="text-sm text-[var(--text-muted)]">Visualize alumni distribution worldwide.</p></div>} />
        <Route path="/business" element={<div className="p-6"><h2 className="text-lg font-bold">Business Directory</h2><p className="text-sm text-[var(--text-muted)]">Explore alumni-owned businesses.</p></div>} />
        <Route path="/startups" element={<div className="p-6"><h2 className="text-lg font-bold">Startup Showcase</h2><p className="text-sm text-[var(--text-muted)]">View innovative alumni startups.</p></div>} />
        <Route path="/research" element={<div className="p-6"><h2 className="text-lg font-bold">Research Publications</h2><p className="text-sm text-[var(--text-muted)]">View alumni research contributions.</p></div>} />
        <Route path="/skills" element={<div className="p-6"><h2 className="text-lg font-bold">Skills Portfolio</h2><p className="text-sm text-[var(--text-muted)]">Showcase your professional skills.</p></div>} />
        <Route path="/cv" element={<div className="p-6"><h2 className="text-lg font-bold">CV Builder</h2><p className="text-sm text-[var(--text-muted)]">Create and download professional resume.</p></div>} />
        <Route path="/id-card" element={<div className="p-6"><h2 className="text-lg font-bold">Digital ID Card</h2><p className="text-sm text-[var(--text-muted)]">View and download your ASTU ID card.</p></div>} />
        <Route path="/volunteer" element={<div className="p-6"><h2 className="text-lg font-bold">Volunteer Program</h2><p className="text-sm text-[var(--text-muted)]">Apply for alumni volunteer opportunities.</p></div>} />
        <Route path="/awards" element={<div className="p-6"><h2 className="text-lg font-bold">Alumni Awards</h2><p className="text-sm text-[var(--text-muted)]">View and apply for alumni awards.</p></div>} />
        <Route path="/chapters" element={<div className="p-6"><h2 className="text-lg font-bold">Chapters</h2><p className="text-sm text-[var(--text-muted)]">Join or create alumni chapters.</p></div>} />
        <Route path="/donations" element={<div className="p-6"><h2 className="text-lg font-bold">Donation History</h2><p className="text-sm text-[var(--text-muted)]">View your contribution history.</p></div>} />
        <Route path="/career" element={<div className="p-6"><h2 className="text-lg font-bold">Career Progress</h2><p className="text-sm text-[var(--text-muted)]">Track your career milestones.</p></div>} />
        <Route path="/settings" element={<div className="p-6"><h2 className="text-lg font-bold">Settings</h2><p className="text-sm text-[var(--text-muted)]">Manage your account preferences.</p></div>} />
      </Routes>
    </DashboardLayout>
  );
}

// ==========================================
// 4. PORTAL 2: REGISTRAR HUBS
// ==========================================
function RegistrarPortal() {
  const navItems = [
    { label: "Dashboard", path: "/registrar", icon: Database },
    { label: "Digital Transcript", path: "/registrar/transcript", icon: FileCheck },
    { label: "Graduate Clearance", path: "/registrar/clearance", icon: CheckCircle },
    { label: "Certificate Verification", path: "/registrar/certificates", icon: Ticket },
    { label: "Student Migration", path: "/registrar/migration", icon: RefreshCw },
    { label: "Batch Management", path: "/registrar/batches", icon: Calendar },
    { label: "Academic Verification", path: "/registrar/verification", icon: Shield },
    { label: "Data Import Pipeline", path: "/registrar/import", icon: Upload },
    { label: "Settings", path: "/registrar/settings", icon: Settings }
  ];

  return (
    <DashboardLayout title="Registrar Verification Hub" role="Registrar Admin" navItems={navItems}>
      <Routes>
        <Route path="/dashboard" element={<Navigate to="/registrar" replace />} />
        <Route path="/" element={
          <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] shadow-md overflow-hidden">
            <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-page)]">
              <div>
                <h2 className="text-md font-bold text-[var(--text-primary)]">Alumni Baseline Registry Ledger</h2>
                <p className="text-xs text-[var(--text-muted)]">Definitive university baseline records for validation processing.</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[var(--bg-page)] text-[var(--text-muted)] text-[11px] font-bold uppercase tracking-wider border-b border-[var(--border-color)]">
                  <tr>
                    <th className="p-4">Student ID</th>
                    <th className="p-4">Full Name</th>
                    <th className="p-4">Department Program</th>
                    <th className="p-4">CGPA Metric</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)] font-medium text-[var(--text-secondary)]">
                  <tr>
                    <td className="p-4 text-xs font-mono font-bold text-[var(--text-primary)]">ASTU/1024/18</td>
                    <td className="p-4">Abdi Kebede</td>
                    <td className="p-4">Electrical Engineering</td>
                    <td className="p-4 font-mono">3.84</td>
                    <td className="p-4"><span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-50 text-emerald-700 border border-emerald-200">Synced</span></td>
                  </tr>
                  <tr>
                    <td className="p-4 text-xs font-mono font-bold text-[var(--text-primary)]">ASTU/4592/18</td>
                    <td className="p-4">Chala Bekele</td>
                    <td className="p-4">Computer Science</td>
                    <td className="p-4 font-mono">3.62</td>
                    <td className="p-4"><span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-50 text-emerald-700 border border-emerald-200">Synced</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        } />
        <Route path="/import" element={
          <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-6 shadow-md space-y-6">
            <div>
              <h2 className="text-lg font-black text-[#003366]">Excel Data Import Pipeline</h2>
              <p className="text-xs text-[var(--text-muted)]">Upload official graduate roster files from the student information system to create accounts.</p>
            </div>
<div className="border-2 border-dashed border-[var(--border-color)] rounded-2xl p-12 text-center bg-[var(--bg-page)] hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer group shadow-inner">
               <Upload className="mx-auto h-10 w-10 text-[var(--text-muted)] group-hover:text-[#003366] transition-colors mb-4" />
               <span className="font-bold text-sm text-[var(--text-secondary)] block mb-1">Drag and drop graduates_ratios.xlsx</span>
               <span className="text-xs text-[var(--text-muted)] block">Supports standard column templates (Student ID, Name, Department, Year, CGPA)</span>
             </div>
           </div>
         } />
        <Route path="/transcript" element={<div className="p-6"><h2 className="text-lg font-bold">Digital Transcript Verification</h2><p className="text-sm text-[var(--text-muted)]">Verify and issue digital transcripts.</p></div>} />
        <Route path="/clearance" element={<div className="p-6"><h2 className="text-lg font-bold">Graduate Clearance Tracking</h2><p className="text-sm text-[var(--text-muted)]">Track clearance status for graduates.</p></div>} />
        <Route path="/certificates" element={<div className="p-6"><h2 className="text-lg font-bold">Certificate Verification Portal</h2><p className="text-sm text-[var(--text-muted)]">Validate and verify certificates.</p></div>} />
        <Route path="/migration" element={<div className="p-6"><h2 className="text-lg font-bold">Student-to-Alumni Migration</h2><p className="text-sm text-[var(--text-muted)]">Automate student to alumni transitions.</p></div>} />
        <Route path="/batches" element={<div className="p-6"><h2 className="text-lg font-bold">Graduation Batch Management</h2><p className="text-sm text-[var(--text-muted)]">Manage graduation batch records.</p></div>} />
        <Route path="/verification" element={<div className="p-6"><h2 className="text-lg font-bold">Academic History Verification</h2><p className="text-sm text-[var(--text-muted)]">Verify academic credentials.</p></div>} />
        <Route path="/settings" element={<div className="p-6"><h2 className="text-lg font-bold">Settings</h2><p className="text-sm text-[var(--text-muted)]">Registrar preferences and settings.</p></div>} />
      </Routes>
    </DashboardLayout>
  );
}

// ==========================================
// 5. PORTAL 3: EMPLOYER WORKSPACE
// ==========================================
function EmployerPortal() {
  const navItems = [
    { label: "Dashboard", path: "/employer", icon: Building2 },
    { label: "Talent Pool", path: "/employer/talent", icon: Users },
    { label: "AI Candidate Matching", path: "/employer/matching", icon: Zap },
    { label: "Recruitment Analytics", path: "/employer/analytics", icon: BarChart2 },
    { label: "Bulk Job Posting", path: "/employer/bulk-post", icon: Upload },
    { label: "Internship Programs", path: "/employer/internships", icon: Calendar },
    { label: "Company Verification", path: "/employer/verification", icon: FileCheck },
    { label: "Campus Events", path: "/employer/events", icon: Calendar },
    { label: "Shortlist Candidates", path: "/employer/shortlist", icon: ThumbsUp },
    { label: "Job Fair Participation", path: "/employer/jobfair", icon: Award },
    { label: "Publish Opportunities", path: "/employer/post", icon: Plus },
    { label: "Settings", path: "/employer/settings", icon: Settings }
  ];

  return (
    <DashboardLayout title="Industry Talent Sourcing Pipeline" role="Partner Employer" navItems={navItems}>
      <Routes>
        <Route path="/dashboard" element={<Navigate to="/employer" replace />} />
        <Route path="/" element={
          <div className="space-y-6">
            <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)] shadow-md flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-[var(--text-primary)]">Safaricom Ethiopia Workspace</h2>
                <p className="text-xs text-[var(--text-muted)]">Verified corporate partner recruiter instance.</p>
              </div>
              <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs px-3 py-1 rounded-full shadow-sm">
                Verified Recruiter
              </span>
            </div>

            {/* Competency Input Sheet Info Block */}
            <div className="bg-gradient-to-r from-[#003366] to-slate-900 rounded-2xl p-6 text-white shadow-lg space-y-3">
              <h3 className="font-bold text-sm text-[#FFCC00] uppercase tracking-wider">Curriculum Competency Rating Requested</h3>
              <p className="text-xs text-slate-200 max-w-2xl leading-relaxed">
                Provide feedback on your hires' skillsets. Your input automatically flags missing practical technical skills for department heads.
              </p>
              <button className="bg-[#CC0033] hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md">
                Launch Evaluation Sheet
              </button>
            </div>
          </div>
        } />
        <Route path="/post" element={
          <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-6 shadow-md space-y-6">
            <h2 className="text-md font-black text-[var(--text-primary)] border-b border-[var(--border-color)] pb-3">Publish New Placement Opportunity</h2>
            <form className="space-y-4 max-w-xl" onSubmit={e => e.preventDefault()}>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-secondary)] block">Job Title / Designation</label>
                <input type="text" placeholder="e.g. Junior DevOps Associate" className="w-full text-sm rounded-xl border-[var(--border-color)] shadow-sm focus:border-[#003366] focus:ring-[#003366]" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-secondary)] block">Target ASTU Academic Departments</label>
                <input type="text" placeholder="e.g. Computer Science, Software Engineering" className="w-full text-sm rounded-xl border-[var(--border-color)] shadow-sm focus:border-[#003366] focus:ring-[#003366]" />
              </div>
              <button type="button" className="bg-[#003366] text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md">
                Deploy Placement Post
              </button>
            </form>
          </div>
        } />
        <Route path="/talent" element={<div className="p-6"><h2 className="text-lg font-bold">Talent Pool Management</h2><p className="text-sm text-[var(--text-muted)]">View and manage candidate pool.</p></div>} />
        <Route path="/matching" element={<div className="p-6"><h2 className="text-lg font-bold">AI Candidate Matching</h2><p className="text-sm text-[var(--text-muted)]">AI-powered candidate recommendations.</p></div>} />
        <Route path="/analytics" element={<div className="p-6"><h2 className="text-lg font-bold">Recruitment Analytics</h2><p className="text-sm text-[var(--text-muted)]">Track hiring metrics and trends.</p></div>} />
        <Route path="/bulk-post" element={<div className="p-6"><h2 className="text-lg font-bold">Bulk Job Posting</h2><p className="text-sm text-[var(--text-muted)]">Upload multiple job openings at once.</p></div>} />
        <Route path="/internships" element={<div className="p-6"><h2 className="text-lg font-bold">Internship Programs</h2><p className="text-sm text-[var(--text-muted)]">Manage internship program listings.</p></div>} />
        <Route path="/verification" element={<div className="p-6"><h2 className="text-lg font-bold">Company Profile Verification</h2><p className="text-sm text-[var(--text-muted)]">Verify company and update profile.</p></div>} />
        <Route path="/events" element={<div className="p-6"><h2 className="text-lg font-bold">Campus Recruitment Events</h2><p className="text-sm text-[var(--text-muted)]">Schedule and manage campus events.</p></div>} />
        <Route path="/shortlist" element={<div className="p-6"><h2 className="text-lg font-bold">Candidate Shortlisting</h2><p className="text-sm text-[var(--text-muted)]">Review and shortlist applicants.</p></div>} />
        <Route path="/jobfair" element={<div className="p-6"><h2 className="text-lg font-bold">Job Fair Participation</h2><p className="text-sm text-[var(--text-muted)]">Register and manage job fair booths.</p></div>} />
        <Route path="/settings" element={<div className="p-6"><h2 className="text-lg font-bold">Settings</h2><p className="text-sm text-[var(--text-muted)]">Manage company profile and preferences.</p></div>} />
      </Routes>
    </DashboardLayout>
  );
}

// ==========================================
// 6. PORTAL 5: ROOT SYSTEM GOVERNANCE
// ==========================================
interface AdminPageHeroProps {
  title: string;
  description: string;
  category: string;
  icon: React.ComponentType<any>;
}

function AdminPageHero({
  title,
  description,
  category,
  icon: Icon
}: AdminPageHeroProps) {
  return (
    <div className="p-6 space-y-6">
      {/* Hero Banner styled like SurveyManagement but with ASTU Blue gradient */}
      <div className="relative overflow-hidden rounded-[14px] shadow-sm" style={{
        background: 'linear-gradient(135deg, #001F4D 0%, #003366 50%, #004080 100%)',
      }}>
        {/* Decorative circles */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -right-8 top-8 h-40 w-40 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-24 -bottom-12 h-48 w-48 rounded-full bg-white/5 pointer-events-none" />
        
        <div className="relative px-8 py-8 flex flex-col md:flex-row md:items-center justify-between gap-6 z-10">
          <div className="space-y-2 max-w-2xl">
            <span className="mb-2 inline-block rounded-sm text-[11px] font-bold uppercase tracking-[0.25em] text-[#FFCC00]">
              {category}
            </span>
            <h1 className="mb-2 text-3xl font-bold text-white tracking-tight">{title}</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-200/90 font-medium">
              {description}
            </p>
          </div>
          <div className="flex-shrink-0 bg-white/10 border border-white/20 p-4 rounded-xl shadow-inner backdrop-blur-sm hidden sm:flex items-center justify-center">
            <Icon className="h-8 w-8 text-[#FFCC00]" />
          </div>
        </div>
      </div>

      {/* Decorative inner workspace card */}
      <div className="bg-[var(--bg-card)] rounded-[14px] border border-[var(--border-color)] p-8 shadow-sm text-center py-16 space-y-4">
        <div className="bg-[var(--bg-page)] text-[#003366] p-4 rounded-full w-fit mx-auto border border-[var(--border-color)] shadow-inner">
          <Icon className="h-6 w-6 text-[#003366]" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">{title} Workspace</h3>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            This module is protected under the Root Admin security policies. Use this section to manage administrative data, monitor configurations, and update systems.
          </p>
        </div>
        <div className="pt-2">
          <button className="bg-[#003366] hover:bg-slate-800 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition-all inline-flex items-center gap-2 hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0">
            Configure {title}
            <ArrowRight className="h-3.5 w-3.5 text-[#FFCC00]" />
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminPortal() {
  const navItems = [
    { label: "Dashboard", path: "/admin", icon: BarChart3 },
    { label: "CMS/Page Builder", path: "/admin/cms", icon: Edit },
    { label: "Dynamic Homepage Sections", path: "/admin/homepage/sections", icon: Layers },
    { label: "Homepage Theme", path: "/admin/homepage/theme", icon: Palette },
    { label: "Homepage Menu", path: "/admin/homepage/menu", icon: MenuSquare },
    { label: "Hero Slider", path: "/admin/homepage/hero", icon: Image },
    { label: "Banners", path: "/admin/homepage/banners", icon: Newspaper },
    { label: "Homepage Search", path: "/admin/homepage/search", icon: SearchCode },
    { label: "SEO Settings", path: "/admin/seo", icon: Globe },
    { label: "Popup & Notices", path: "/admin/popup", icon: MessageCircle },
    { label: "Contact Messages", path: "/admin/contact", icon: Mail },
    { label: "FAQ Management", path: "/admin/faq", icon: FileText },
    { label: "Partners & Sponsors", path: "/admin/partners", icon: Handshake },
    { label: "Advertisement Banners", path: "/admin/advertisement", icon: Share2 },
    { label: "Success Story Approval", path: "/admin/success-stories/approval", icon: CheckCircle },
    { label: "Digital Asset Library", path: "/admin/assets", icon: HardDrive },
    { label: "Activity Logs", path: "/admin/logs", icon: Activity },
    { label: "Backup & Restore", path: "/admin/backup", icon: Archive },
    { label: "Email/SMS Templates", path: "/admin/templates", icon: FileCode },
    { label: "Notification Center", path: "/admin/notifications", icon: Bell },
    { label: "Role & Permissions", path: "/admin/roles", icon: Key },
    { label: "API Management", path: "/admin/api", icon: Zap },
    { label: "System Monitoring", path: "/admin/monitoring", icon: Monitor },
    { label: "Security Center", path: "/admin/security", icon: Shield },
    { label: "Login History", path: "/admin/login-history", icon: LogIn },
    { label: "Data Export", path: "/admin/export", icon: Download },
    { label: "News & Announcements", path: "/admin/announcements", icon: Newspaper },
    { label: "Statistics", path: "/admin/statistics", icon: BarChart },
    { label: "Testimonials", path: "/admin/testimonials", icon: Mic },
    { label: "Gallery", path: "/admin/gallery", icon: GalleryHorizontal },
    { label: "Events", path: "/admin/events", icon: Calendar },
    { label: "Workshops", path: "/admin/workshops", icon: Video },
    { label: "Community", path: "/admin/community", icon: Users },
    { label: "User Management", path: "/admin/users", icon: UserCog },
    { label: "System Settings", path: "/admin/settings", icon: Settings },
    { label: "All Reports", path: "/admin/reports", icon: FileBarChart2 }
  ];

  return (
    <DashboardLayout title="Overarching Ecosystem Management Control Panel" role="Root Admin" navItems={navItems}>
      <Routes>
        <Route path="/dashboard" element={<Navigate to="/admin" replace />} />
        <Route index element={<AdminDashboard />} />
        <Route path="/cms" element={<AdminPageHero title="CMS / Page Builder" description="Drag-and-drop page builder for content management and layout configuration." category="Ecosystem Builder" icon={Edit} />} />
        <Route path="/homepage/sections" element={<AdminPageHero title="Dynamic Homepage Sections" description="Add, remove, reorder, and structure components of the public landing homepage." category="Content Layout" icon={Layers} />} />
        <Route path="/homepage/theme" element={<AdminPageHero title="Homepage Theme Customization" description="Configure color variables, typography scales, active gradients, and visual tokens." category="Branding & Styles" icon={Palette} />} />
        <Route path="/homepage/menu" element={<AdminPageHero title="Homepage Menu Management" description="Manage primary header menus, dropdown lists, footer directories, and navigation mapping." category="Navigation Hierarchy" icon={MenuSquare} />} />
        <Route path="/homepage/hero" element={<AdminPageHero title="Hero Slider" description="Upload high-resolution slides, control interval timings, overlays, and hero CTA actions." category="Visual Banners" icon={Image} />} />
        <Route path="/homepage/banners" element={<AdminPageHero title="Banners" description="Position promotional notification banners and announcements on priority panels." category="Content Delivery" icon={Newspaper} />} />
        <Route path="/homepage/search" element={<AdminPageHero title="Homepage Search Management" description="Refine algorithmic search behavior, indexable fields, and directory parameters." category="Access Optimization" icon={SearchCode} />} />
        <Route path="/seo" element={<AdminPageHero title="SEO Settings" description="Optimize search visibility, canonical links, robots configurations, and schema tags." category="Site Performance" icon={Globe} />} />
        <Route path="/popup" element={<AdminPageHero title="Popup & Notice Management" description="Deploy emergency bulletins, scheduled modals, and overlay communications." category="Audience Engagement" icon={MessageCircle} />} />
        <Route path="/contact" element={<AdminPageHero title="Contact Message Management" description="Review contact submissions, distribute queries to specific departments, and track responses." category="Communications Hub" icon={Mail} />} />
        <Route path="/faq" element={<AdminPageHero title="FAQ Management" description="Structure frequently asked questions, categorize queries, and manage user guides." category="Support Infrastructure" icon={FileText} />} />
        <Route path="/partners" element={<AdminPageHero title="Partners & Sponsors" description="Verify sponsorship logos, active links, partnerships tiers, and corporate highlights." category="Relations Directory" icon={Handshake} />} />
        <Route path="/advertisement" element={<AdminPageHero title="Advertisement Banner Management" description="Review placement slots, dimensions, impression logs, and target click-through paths." category="Marketing & Ads" icon={Share2} />} />
        <Route path="/success-stories/approval" element={<AdminPageHero title="Success Story Approval" description="Moderate outstanding student spotlight requests, career highlights, and publications." category="Alumni Spotlights" icon={CheckCircle} />} />
        <Route path="/assets" element={<AdminPageHero title="Digital Asset Library" description="Access uploaded documents, verification proofs, profile pictures, and database files." category="Secure Media Hub" icon={HardDrive} />} />
        <Route path="/logs" element={<AdminPageHero title="Activity Logs & Audit Trail" description="Review detailed administrative login trials, API calls, and resource mutation events." category="Security & Compliance" icon={Activity} />} />
        <Route path="/backup" element={<AdminPageHero title="Backup & Restore System" description="Schedule baseline automated backups, review storage status, and perform rollback routines." category="Ecosystem Recovery" icon={Archive} />} />
        <Route path="/templates" element={<AdminPageHero title="Email / SMS Templates" description="Edit automated transactional templates, system notifications, and layout schemas." category="Branding & Mail" icon={FileCode} />} />
        <Route path="/notifications" element={<AdminPageHero title="Notification Center" description="Dispatch global broadcast bulletins, customize targeted SMS segments, and review open logs." category="Alerts Center" icon={Bell} />} />
        <Route path="/roles" element={<AdminPageHero title="Role & Permission Management" description="Govern security groups, define scope bindings, and control RBAC settings." category="Identity Management" icon={Key} />} />
        <Route path="/api" element={<AdminPageHero title="API Management" description="Review token usage metrics, rate limit metrics, key permissions, and system webhooks." category="System Integration" icon={Zap} />} />
        <Route path="/monitoring" element={<AdminPageHero title="System Monitoring Dashboard" description="Observe CPU/memory utilization, request success ratios, and endpoint timings in real time." category="Performance Tuning" icon={Monitor} />} />
        <Route path="/security" element={<AdminPageHero title="Security Center" description="Inspect firewalls, brute force protection layers, and dynamic block tables." category="Platform Security" icon={Shield} />} />
        <Route path="/login-history" element={<AdminPageHero title="Login History" description="Audit user session details, geographical logs, IP addresses, and status details." category="Identity Logs" icon={LogIn} />} />
        <Route path="/export" element={<AdminPageHero title="Data Export Center" description="Generate accreditation datasets, aggregate reports, and custom spreadsheet packages." category="Analytics Hub" icon={Download} />} />
        <Route path="/homepage" element={<AdminPageHero title="Homepage Management" description="Configure landing layout hierarchies, footer widgets, and default settings." category="Ecosystem Builder" icon={Newspaper} />} />
        <Route path="/announcements" element={<AdminPageHero title="News & Announcements" description="Draft public updates, customize highlights, and map target feeds." category="Communications" icon={Newspaper} />} />
        <Route path="/statistics" element={<AdminPageHero title="Statistics" description="Review aggregate dashboard metrics, active cohorts, and registry volumes." category="Analytics" icon={BarChart} />} />
        <Route path="/testimonials" element={<AdminPageHero title="Testimonials" description="Configure verified student testimonials, company highlights, and reviews." category="Alumni Spotlights" icon={Mic} />} />
        <Route path="/gallery" element={<AdminPageHero title="Gallery" description="Manage campus highlights, graduation albums, and alumni directories." category="Media Hub" icon={GalleryHorizontal} />} />
        <Route path="/events" element={<AdminPageHero title="Events" description="Schedule professional webinars, graduation events, and company meets." category="Campus Calendars" icon={Calendar} />} />
        <Route path="/workshops" element={<AdminPageHero title="Workshops" description="Coordinate technical bootcamps, schedule workshops, and publish video resources." category="Visual Media" icon={Video} />} />
        <Route path="/community" element={<AdminPageHero title="Community" description="Moderate shared feed elements, community tags, and verification logs." category="Moderation" icon={Users} />} />
        <Route path="/users" element={<AdminPageHero title="User Management" description="Process registrar lists, corporate validations, and update active state flags." category="Identity Hub" icon={UserCog} />} />
        <Route path="/settings" element={<AdminPageHero title="System Settings" description="Update portal metadata, adjust default timeouts, and govern mail protocols." category="Platform Governance" icon={Settings} />} />
        <Route path="/reports" element={<AdminPageHero title="All Reports" description="Compile comprehensive tracer data, quality reviews, and curriculum alignments." category="Compliance & Audits" icon={FileBarChart2} />} />
      </Routes>
    </DashboardLayout>
  );
}

// ==========================================
// 8. CORE APPLICATION EXPORT MODULE
// ==========================================
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Gateway System Root */}
        <Route path="/" element={<LandingPage />} />

        {/* Portal Cluster Ecosystem Routing Entryways */}
        <Route path="/alumni/*" element={<AlumniPortal />} />
        <Route path="/registrar/*" element={<RegistrarPortal />} />
        <Route path="/employer/*" element={<EmployerPortal />} />
        <Route path="/admin/*" element={<AdminPortal />} />
      </Routes>
    </BrowserRouter>
  );
}
