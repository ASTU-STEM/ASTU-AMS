import React, { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import { GraduationCap, ShieldCheck, LogOut, Menu, Bell, Database, Building2, BarChart3, ArrowRight, User, FileText, Briefcase, Users, MapPin, ShoppingBag, Activity, Award, FileCheck, Ticket, Heart, Globe, TrendingUp, Settings, FileBarChart2, Edit, Layers, Palette, MenuSquare, Image, Newspaper, SearchCode, MessageCircle, Mail, Handshake, Share2, CheckCircle, HardDrive, Archive, FileCode, Key, Monitor, Shield, LogIn, Download, Mic, GalleryHorizontal, Video, Calendar, UserCog, BarChart, AlertCircle, Upload, RefreshCw, ThumbsUp, BarChart2, BookOpen, Plus } from "lucide-react";
import AlumniDashboard from "../../domains/alumni/pages/AlumniDashboard";
import EmployerDashboard from "../../domains/employers/pages/EmployerDashboard";
import RegistrarDashboard from "../../domains/registrar/pages/RegistrarDashboard";
import DepartmentDashboard from "../../domains/departments/pages/DepartmentDashboard";
import AdminDashboard from "../../domains/admin/pages/AdminDashboard";
import CmsDashboard from "../../domains/admin/pages/CmsDashboard";
import ContentList from "../../domains/admin/pages/ContentList";
import HomepageManagement from "../../domains/admin/pages/HomepageManagement";
import ContentGovernance from "../../domains/admin/pages/ContentGovernance";
import GalleryManagement from "../../domains/admin/pages/GalleryManagement";
import EventWorkshopManagement from "../../domains/admin/pages/EventWorkshopManagement";
import ApprovalWorkflow from "../../domains/admin/pages/ApprovalWorkflow";
import MediaLibrary from "../../domains/admin/pages/MediaLibrary";
import SEOManagement from "../../domains/admin/pages/SEOManagement";
import ContentTemplates from "../../domains/admin/pages/ContentTemplates";
import CmsSettings from "../../domains/admin/pages/CmsSettings";
import { PageHeader } from "../shared/components/PageHeader";
import { LoadingSkeleton } from "../shared/components/LoadingSkeleton";

// No backend call here (logout is purely local for now)
const logoutLocally = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

// ==========================================
// 1. DYNAMIC SHARED LAYOUT SYSTEM
// ==========================================
interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  role: string;
  navItems: Array<{
    path: string;
    label: string;
    icon: React.ComponentType<any>;
  }>;
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
  loading = false,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem(`dashboard_layout_${role}_collapsed`) === "true",
  );
  const location = useLocation();

  React.useEffect(() => {
    localStorage.setItem(
      `dashboard_layout_${role}_collapsed`,
      String(sidebarCollapsed),
    );
  }, [role, sidebarCollapsed]);

  const sidebarDisplayCollapsed = sidebarCollapsed && !sidebarOpen;

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-slate-50 dark:bg-[#0b0f1a] text-slate-800 dark:text-slate-100 antialiased font-sans transition-colors duration-300">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/60 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh flex-shrink-0 flex-col bg-white/90 dark:bg-[#111827]/90 border-r border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xl transition-all duration-300 ease-in-out lg:relative lg:z-20 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} ${sidebarCollapsed ? "lg:w-20" : "lg:w-64"}`}
      >
        {/* Sidebar Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between flex-shrink-0">
          <Link
            to="/"
            className={`flex items-center ${sidebarDisplayCollapsed ? "justify-center" : "gap-3"}`}
          >
            <div className="bg-gradient-to-br from-[#003366] to-[#004499] p-2 rounded-xl text-white shadow-lg flex-shrink-0 transition-all hover:scale-110 active:scale-95 shadow-[#003366]/20">
              <GraduationCap className="h-5 w-5 text-[#FFCC00]" />
            </div>
            {!sidebarDisplayCollapsed && (
              <div className="overflow-hidden animate-in fade-in slide-in-from-left-4 duration-500">
                <span className="font-extrabold text-md tracking-tight text-[#003366] dark:text-white block whitespace-nowrap">
                  ASTU-AMS
                </span>
                <span className="text-[9px] uppercase tracking-[0.25em] text-[#CC0033] dark:text-rose-400 font-extrabold block whitespace-nowrap leading-tight">
                  {role}
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          {navItems.map(
            (
              item: {
                path: string;
                label: string;
                icon: React.ComponentType<any>;
              },
              idx: number,
            ) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={idx}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  title={sidebarDisplayCollapsed ? item.label : undefined}
                  className={`w-full flex items-center rounded-xl transition-all duration-300 px-3.5 py-2.5 group relative mb-0.5 ${sidebarDisplayCollapsed ? "justify-center" : "gap-3.5"} ${
                    isActive
                      ? "bg-gradient-to-r from-[#003366]/10 to-[#003366]/5 dark:from-blue-500/20 dark:to-blue-500/5 text-[#003366] dark:text-blue-400 font-bold shadow-[inset_0_0_12px_rgba(0,51,102,0.05)] ring-1 ring-[#003366]/10 dark:ring-blue-500/20"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 w-1 h-5 bg-[#003366] dark:bg-blue-400 rounded-r-full" />
                  )}
                  <item.icon
                    className={`h-5 w-5 flex-shrink-0 transition-all duration-300 group-hover:scale-110 ${isActive ? "text-[#003366] dark:text-blue-400" : "text-slate-400 dark:text-slate-500 group-hover:text-[#003366] dark:group-hover:text-blue-400"}`}
                  />
                  {!sidebarDisplayCollapsed && (
                    <span className="text-[13px] tracking-wide font-semibold truncate transition-transform duration-300 group-hover:translate-x-0.5">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            },
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-slate-100 dark:border-slate-800/60 flex-shrink-0 p-4 bg-slate-50/50 dark:bg-black/10">
          <button
            type="button"
            onClick={() => {
              logoutLocally();
              window.location.href = "/login";
            }}
            title={sidebarDisplayCollapsed ? "Exit Workspace" : undefined}
            className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all duration-200 group ${sidebarDisplayCollapsed ? "justify-center" : "gap-3"}`}
          >
            <LogOut className="h-4 w-4 flex-shrink-0 transition-transform group-hover:-translate-x-0.5" />
            {!sidebarDisplayCollapsed && <span>Exit Workspace</span>}
          </button>
        </div>
      </aside>

      {/* Fluid Canvas - main content area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-slate-50/30 dark:bg-[#0b0f1a]">
        {/* Clean Top Header Bar */}
        <header className="bg-white/70 dark:bg-[#111827]/70 backdrop-blur-md h-16 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center px-4 sm:px-6 justify-between flex-shrink-0 z-10 shadow-sm transition-colors duration-300">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setSidebarCollapsed((value) => !value)}
              className="hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl lg:inline-flex transition-all hover:scale-110 active:scale-95"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                <span>ASTU</span>
                <ChevronRight className="h-2.5 w-2.5" />
                <span className="text-[#003366] dark:text-blue-400">
                  {role}
                </span>
              </div>
              <h1 className="truncate text-[15px] font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
                {title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-[#003366] dark:hover:text-blue-400 bg-slate-50 dark:bg-slate-800 rounded-xl relative shadow-sm transition-all hover:scale-105 active:scale-95 border border-slate-200/40 dark:border-slate-700/40 group">
              <Bell className="h-4.5 w-4.5 transition-transform group-hover:rotate-12" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-[#111827]"></span>
            </button>
            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800"></div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#003366] to-[#004d99] flex items-center justify-center font-black text-sm text-white border border-white/20 shadow-md ring-2 ring-[#003366]/10 dark:ring-blue-500/10">
                AD
              </div>
            </div>
          </div>
        </header>

        {/* Scrolling Content Panel */}
        <main className="flex-1 overflow-y-auto bg-slate-50/30 dark:bg-black/5 p-4 sm:p-8 transition-all duration-300 scroll-smooth">
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
    <div className="min-h-screen bg-slate-50 antialiased font-sans">
      {/* Structural Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-[#003366] p-2 rounded-xl text-white shadow-md">
              <GraduationCap className="h-6 w-6 text-[#FFCC00]" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-[#003366] block">
                ASTU-AMS
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[#CC0033] font-bold block -mt-1">
                Alumni Ecosystem
              </span>
            </div>
          </div>
          <span className="text-xs font-bold text-astu-navy bg-blue-50 px-3 py-1.5 rounded-full border border-emerald-200/60 shadow-sm flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>{" "}
            Infrastructure Secure
          </span>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="py-16 text-center max-w-4xl mx-auto px-4 space-y-6">
        <h1 className="text-4xl sm:text-5xl font-black text-[#003366] tracking-tight leading-tight">
          ASTU-AMS Enterprise Portal Entry
        </h1>
        <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto">
          Welcome to the Adama Science and Technology University Digital
          Ecosystem. Choose your designated gateway module below to manage
          profiles, verify records, or access analytics.
        </p>
      </header>

      {/* Portal Path Grid */}
      <section className="max-w-7xl mx-auto px-4 pb-24 grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          {
            title: "Alumni Portal",
            desc: "Update professional resumes and fill tracking questionnaires.",
            path: "/alumni",
            icon: GraduationCap,
          },
          {
            title: "Registrar Hub",
            desc: "Process graduate Excel arrays and handle credentials validations.",
            path: "/registrar",
            icon: Database,
          },
          {
            title: "Employer Panel",
            desc: "Publish operational career opportunities and post feedback arrays.",
            path: "/employer",
            icon: Building2,
          },
          {
            title: "Department Analytics",
            desc: "Isolate structural technological curriculum discrepancies.",
            path: "/department",
            icon: BarChart3,
          },
          {
            title: "System Governance",
            desc: "Manage overarching access controls and cron schedules.",
            path: "/admin",
            icon: ShieldCheck,
          },
        ].map((p, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group transform hover:-translate-y-1"
          >
            <div className="space-y-4">
              <div className="bg-slate-50 text-[#003366] p-3 rounded-xl w-fit group-hover:bg-[#003366] group-hover:text-white transition-all shadow-sm">
                <p.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                {p.title}
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed">{p.desc}</p>
            </div>
            <button
              onClick={() => navigate(p.path)}
              className="mt-6 w-full flex items-center justify-center gap-2 bg-slate-50 text-slate-700 hover:bg-[#003366] hover:text-white py-2.5 font-bold text-xs rounded-xl border border-slate-200 transition-all shadow-sm"
            >
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
    {
      label: "Business Directory",
      path: "/alumni/business",
      icon: ShoppingBag,
    },
    { label: "Startup Showcase", path: "/alumni/startups", icon: Activity },
    {
      label: "Research Publications",
      path: "/alumni/research",
      icon: BookOpen,
    },
    { label: "Skills Portfolio", path: "/alumni/skills", icon: Award },
    { label: "CV Builder", path: "/alumni/cv", icon: FileCheck },
    { label: "Digital ID Card", path: "/alumni/id-card", icon: Ticket },
    { label: "Volunteer Program", path: "/alumni/volunteer", icon: Heart },
    { label: "Alumni Awards", path: "/alumni/awards", icon: Award },
    { label: "Chapters", path: "/alumni/chapters", icon: Globe },
    { label: "Donation History", path: "/alumni/donations", icon: Heart },
    { label: "Career Progress", path: "/alumni/career", icon: TrendingUp },
    { label: "Settings", path: "/alumni/settings", icon: Settings },
  ];

  return (
    <DashboardLayout
      title="Alumni Hub Dashboard"
      role="Alumni Account"
      navItems={navItems}
    >
      <Routes>
        <Route path="/dashboard" element={<Navigate to="/alumni" replace />} />
        <Route
          path="/"
          element={
            <div className="space-y-6">
              {/* Profile Highlight Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#003366]/10 text-[#003366] font-black rounded-2xl flex items-center justify-center text-lg shadow-inner">
                    JD
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                      John Doe
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      B.Sc. Software Engineering • Class of 2025
                    </p>
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-sm">
                  <AlertCircle className="text-amber-600 h-5 w-5 flex-shrink-0" />
                  <div className="text-xs">
                    <span className="font-bold text-amber-900 block">
                      Pending Mandatory Survey
                    </span>
                    <span className="text-amber-700 block">
                      6-Month Tracer Questionnaires must be answered.
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Metrics Panels */}
              <div className="grid sm:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-md">
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider block mb-1">
                    Profile Completeness
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black text-slate-900">
                      85%
                    </span>
                    <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#003366] h-full"
                        style={{ width: "85%" }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-md">
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider block mb-1">
                    Active Job Matches
                  </span>
                  <span className="text-2xl font-black text-slate-900 block">
                    14 Matches
                  </span>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-md">
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider block mb-1">
                    Verification Status
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-blue-50 px-2.5 py-1 rounded-md border border-emerald-200 inline-block mt-1 shadow-sm">
                    ✓ VERIFIED BY REGISTRAR
                  </span>
                </div>
              </div>
            </div>
          }
        />
        <Route
          path="/surveys"
          element={
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-md space-y-6">
              <div>
                <h2 className="text-lg font-black text-[#003366]">
                  6-Month Mandatory Employment Tracer
                </h2>
                <p className="text-xs text-slate-500">
                  This validation feeds directly into the university
                  accreditation module.
                </p>
              </div>
              <form
                className="space-y-4 max-w-xl border-t border-slate-100 pt-4"
                onSubmit={(e) => e.preventDefault()}
              >
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Current Employment Parameters
                  </label>
                  <select className="w-full text-sm rounded-xl border-slate-200 shadow-sm focus:border-[#003366] focus:ring-[#003366]">
                    <option>Employed Full-Time (Industry Aligned)</option>
                    <option>Self-Employed / Entrepreneur</option>
                    <option>Unemployed / Seeking Placement</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Time to Professional Hire
                  </label>
                  <select className="w-full text-sm rounded-xl border-slate-200 shadow-sm focus:border-[#003366] focus:ring-[#003366]">
                    <option>Secured Before Graduation</option>
                    <option>0 - 3 Months Post-Graduation</option>
                    <option>3 - 6 Months Post-Graduation</option>
                  </select>
                </div>
                <button
                  type="button"
                  className="bg-[#003366] hover:bg-slate-800 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition-all"
                >
                  Submit Responses
                </button>
              </form>
            </div>
          }
        />
        <Route
          path="/jobs"
          element={
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-md flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">
                    Cloud Infrastructure Engineer
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ethio Telecom • Addis Ababa (Hybrid)
                  </p>
                </div>
                <button className="bg-[#003366] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-800 transition-all">
                  Apply Now
                </button>
              </div>
            </div>
          }
        />
        <Route
          path="/directory"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Alumni Directory</h2>
              <p className="text-sm text-slate-500">
                Browse and search alumni profiles.
              </p>
            </div>
          }
        />
        <Route
          path="/map"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Alumni Map</h2>
              <p className="text-sm text-slate-500">
                Visualize alumni distribution worldwide.
              </p>
            </div>
          }
        />
        <Route
          path="/business"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Business Directory</h2>
              <p className="text-sm text-slate-500">
                Explore alumni-owned businesses.
              </p>
            </div>
          }
        />
        <Route
          path="/startups"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Startup Showcase</h2>
              <p className="text-sm text-slate-500">
                View innovative alumni startups.
              </p>
            </div>
          }
        />
        <Route
          path="/research"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Research Publications</h2>
              <p className="text-sm text-slate-500">
                View alumni research contributions.
              </p>
            </div>
          }
        />
        <Route
          path="/skills"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Skills Portfolio</h2>
              <p className="text-sm text-slate-500">
                Showcase your professional skills.
              </p>
            </div>
          }
        />
        <Route
          path="/cv"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">CV Builder</h2>
              <p className="text-sm text-slate-500">
                Create and download professional resume.
              </p>
            </div>
          }
        />
        <Route
          path="/id-card"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Digital ID Card</h2>
              <p className="text-sm text-slate-500">
                View and download your ASTU ID card.
              </p>
            </div>
          }
        />
        <Route
          path="/volunteer"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Volunteer Program</h2>
              <p className="text-sm text-slate-500">
                Apply for alumni volunteer opportunities.
              </p>
            </div>
          }
        />
        <Route
          path="/awards"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Alumni Awards</h2>
              <p className="text-sm text-slate-500">
                View and apply for alumni awards.
              </p>
            </div>
          }
        />
        <Route
          path="/chapters"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Chapters</h2>
              <p className="text-sm text-slate-500">
                Join or create alumni chapters.
              </p>
            </div>
          }
        />
        <Route
          path="/donations"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Donation History</h2>
              <p className="text-sm text-slate-500">
                View your contribution history.
              </p>
            </div>
          }
        />
        <Route
          path="/career"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Career Progress</h2>
              <p className="text-sm text-slate-500">
                Track your career milestones.
              </p>
            </div>
          }
        />
        <Route
          path="/settings"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Settings</h2>
              <p className="text-sm text-slate-500">
                Manage your account preferences.
              </p>
            </div>
          }
        />
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
    {
      label: "Digital Transcript",
      path: "/registrar/transcript",
      icon: FileCheck,
    },
    {
      label: "Graduate Clearance",
      path: "/registrar/clearance",
      icon: CheckCircle,
    },
    {
      label: "Certificate Verification",
      path: "/registrar/certificates",
      icon: Ticket,
    },
    {
      label: "Student Migration",
      path: "/registrar/migration",
      icon: RefreshCw,
    },
    { label: "Batch Management", path: "/registrar/batches", icon: Calendar },
    {
      label: "Academic Verification",
      path: "/registrar/verification",
      icon: Shield,
    },
    { label: "Data Import Pipeline", path: "/registrar/import", icon: Upload },
    { label: "Settings", path: "/registrar/settings", icon: Settings },
  ];

  return (
    <DashboardLayout
      title="Registrar Verification Hub"
      role="Registrar Admin"
      navItems={navItems}
    >
      <Routes>
        <Route
          path="/dashboard"
          element={<Navigate to="/registrar" replace />}
        />
        <Route
          path="/"
          element={
            <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h2 className="text-md font-bold text-slate-900">
                    Alumni Baseline Registry Ledger
                  </h2>
                  <p className="text-xs text-slate-500">
                    Definitive university baseline records for validation
                    processing.
                  </p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-4">Student ID</th>
                      <th className="p-4">Full Name</th>
                      <th className="p-4">Department Program</th>
                      <th className="p-4">CGPA Metric</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    <tr>
                      <td className="p-4 text-xs font-mono font-bold text-slate-900">
                        ASTU/1024/18
                      </td>
                      <td className="p-4">Abdi Kebede</td>
                      <td className="p-4">Electrical Engineering</td>
                      <td className="p-4 font-mono">3.84</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-50 text-emerald-700 border border-emerald-200">
                          Synced
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 text-xs font-mono font-bold text-slate-900">
                        ASTU/4592/18
                      </td>
                      <td className="p-4">Chala Bekele</td>
                      <td className="p-4">Computer Science</td>
                      <td className="p-4 font-mono">3.62</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-50 text-emerald-700 border border-emerald-200">
                          Synced
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          }
        />
        <Route
          path="/import"
          element={
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-md space-y-6">
              <div>
                <h2 className="text-lg font-black text-[#003366]">
                  Excel Data Import Pipeline
                </h2>
                <p className="text-xs text-slate-500">
                  Upload official graduate roster files from the student
                  information system to create accounts.
                </p>
              </div>
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center bg-slate-50 hover:bg-slate-100/50 transition-all cursor-pointer group shadow-inner">
                <Upload className="mx-auto h-10 w-10 text-slate-400 group-hover:text-[#003366] transition-colors mb-4" />
                <span className="font-bold text-sm text-slate-700 block mb-1">
                  Drag and drop graduates_ratios.xlsx
                </span>
                <span className="text-xs text-slate-400 block">
                  Supports standard column templates (Student ID, Name,
                  Department, Year, CGPA)
                </span>
              </div>
            </div>
          }
        />
        <Route
          path="/transcript"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">
                Digital Transcript Verification
              </h2>
              <p className="text-sm text-slate-500">
                Verify and issue digital transcripts.
              </p>
            </div>
          }
        />
        <Route
          path="/clearance"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Graduate Clearance Tracking</h2>
              <p className="text-sm text-slate-500">
                Track clearance status for graduates.
              </p>
            </div>
          }
        />
        <Route
          path="/certificates"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">
                Certificate Verification Portal
              </h2>
              <p className="text-sm text-slate-500">
                Validate and verify certificates.
              </p>
            </div>
          }
        />
        <Route
          path="/migration"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Student-to-Alumni Migration</h2>
              <p className="text-sm text-slate-500">
                Automate student to alumni transitions.
              </p>
            </div>
          }
        />
        <Route
          path="/batches"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Graduation Batch Management</h2>
              <p className="text-sm text-slate-500">
                Manage graduation batch records.
              </p>
            </div>
          }
        />
        <Route
          path="/verification"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">
                Academic History Verification
              </h2>
              <p className="text-sm text-slate-500">
                Verify academic credentials.
              </p>
            </div>
          }
        />
        <Route
          path="/settings"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Settings</h2>
              <p className="text-sm text-slate-500">
                Registrar preferences and settings.
              </p>
            </div>
          }
        />
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
    { label: "AI Candidate Matching", path: "/employer/matching", icon: Activity },
    {
      label: "Recruitment Analytics",
      path: "/employer/analytics",
      icon: BarChart2,
    },
    { label: "Bulk Job Posting", path: "/employer/bulk-post", icon: Upload },
    {
      label: "Internship Programs",
      path: "/employer/internships",
      icon: Calendar,
    },
    {
      label: "Company Verification",
      path: "/employer/verification",
      icon: FileCheck,
    },
    { label: "Campus Events", path: "/employer/events", icon: Calendar },
    {
      label: "Shortlist Candidates",
      path: "/employer/shortlist",
      icon: ThumbsUp,
    },
    { label: "Job Fair Participation", path: "/employer/jobfair", icon: Award },
    { label: "Publish Opportunities", path: "/employer/post", icon: Plus },
    { label: "Settings", path: "/employer/settings", icon: Settings },
  ];

  return (
    <DashboardLayout
      title="Industry Talent Sourcing Pipeline"
      role="Partner Employer"
      navItems={navItems}
    >
      <Routes>
        <Route
          path="/dashboard"
          element={<Navigate to="/employer" replace />}
        />
        <Route
          path="/"
          element={
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    Safaricom Ethiopia Workspace
                  </h2>
                  <p className="text-xs text-slate-500">
                    Verified corporate partner recruiter instance.
                  </p>
                </div>
                <span className="bg-blue-50 border border-emerald-200 text-emerald-700 font-bold text-xs px-3 py-1 rounded-full shadow-sm">
                  Verified Recruiter
                </span>
              </div>

              {/* Competency Input Sheet Info Block */}
              <div className="bg-gradient-to-r from-[#003366] to-slate-900 rounded-2xl p-6 text-white shadow-lg space-y-3">
                <h3 className="font-bold text-sm text-[#FFCC00] uppercase tracking-wider">
                  Curriculum Competency Rating Requested
                </h3>
                <p className="text-xs text-slate-200 max-w-2xl leading-relaxed">
                  Provide feedback on your hires' skillsets. Your input
                  automatically flags missing practical technical skills for
                  department heads.
                </p>
                <button className="bg-[#CC0033] hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md">
                  Launch Evaluation Sheet
                </button>
              </div>
            </div>
          }
        />
        <Route
          path="/post"
          element={
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-md space-y-6">
              <h2 className="text-md font-black text-slate-900 border-b border-slate-100 pb-3">
                Publish New Placement Opportunity
              </h2>
              <form
                className="space-y-4 max-w-xl"
                onSubmit={(e) => e.preventDefault()}
              >
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Job Title / Designation
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Junior DevOps Associate"
                    className="w-full text-sm rounded-xl border-slate-200 shadow-sm focus:border-[#003366] focus:ring-[#003366]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Target ASTU Academic Departments
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Computer Science, Software Engineering"
                    className="w-full text-sm rounded-xl border-slate-200 shadow-sm focus:border-[#003366] focus:ring-[#003366]"
                  />
                </div>
                <button
                  type="button"
                  className="bg-[#003366] text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md"
                >
                  Deploy Placement Post
                </button>
              </form>
            </div>
          }
        />
        <Route
          path="/talent"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Talent Pool Management</h2>
              <p className="text-sm text-slate-500">
                View and manage candidate pool.
              </p>
            </div>
          }
        />
        <Route
          path="/matching"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">AI Candidate Matching</h2>
              <p className="text-sm text-slate-500">
                AI-powered candidate recommendations.
              </p>
            </div>
          }
        />
        <Route
          path="/analytics"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Recruitment Analytics</h2>
              <p className="text-sm text-slate-500">
                Track hiring metrics and trends.
              </p>
            </div>
          }
        />
        <Route
          path="/bulk-post"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Bulk Job Posting</h2>
              <p className="text-sm text-slate-500">
                Upload multiple job openings at once.
              </p>
            </div>
          }
        />
        <Route
          path="/internships"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Internship Programs</h2>
              <p className="text-sm text-slate-500">
                Manage internship program listings.
              </p>
            </div>
          }
        />
        <Route
          path="/verification"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">
                Company Profile Verification
              </h2>
              <p className="text-sm text-slate-500">
                Verify company and update profile.
              </p>
            </div>
          }
        />
        <Route
          path="/events"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Campus Recruitment Events</h2>
              <p className="text-sm text-slate-500">
                Schedule and manage campus events.
              </p>
            </div>
          }
        />
        <Route
          path="/shortlist"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Candidate Shortlisting</h2>
              <p className="text-sm text-slate-500">
                Review and shortlist applicants.
              </p>
            </div>
          }
        />
        <Route
          path="/jobfair"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Job Fair Participation</h2>
              <p className="text-sm text-slate-500">
                Register and manage job fair booths.
              </p>
            </div>
          }
        />
        <Route
          path="/settings"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Settings</h2>
              <p className="text-sm text-slate-500">
                Manage company profile and preferences.
              </p>
            </div>
          }
        />
      </Routes>
    </DashboardLayout>
  );
}

// ==========================================
// 6. PORTAL 5: ROOT SYSTEM GOVERNANCE
// ==========================================
function AdminPortal() {
  const navItems = [
    { label: "CMS Dashboard", path: "/admin", icon: BarChart3 },
    { label: "All Content", path: "/admin/cms", icon: Edit },
    { label: "Homepage CMS", path: "/admin/homepage", icon: Layers },
    { label: "Approvals", path: "/admin/approvals", icon: ShieldCheck },
    { label: "Homepage Theme", path: "/admin/homepage/theme", icon: Palette },
    { label: "Homepage Menu", path: "/admin/homepage/menu", icon: MenuSquare },
    { label: "Hero Slider", path: "/admin/homepage/hero", icon: Image },
    { label: "Banners", path: "/admin/homepage/banners", icon: Newspaper },
    {
      label: "Homepage Search",
      path: "/admin/homepage/search",
      icon: SearchCode,
    },
    { label: "SEO Engine", path: "/admin/seo", icon: Globe },
    { label: "Popup & Notices", path: "/admin/popup", icon: MessageCircle },
    { label: "Contact Messages", path: "/admin/contact", icon: Mail },
    { label: "FAQ Management", path: "/admin/faq", icon: FileText },
    { label: "Partners & Sponsors", path: "/admin/partners", icon: Handshake },
    {
      label: "Advertisement Banners",
      path: "/admin/advertisement",
      icon: Share2,
    },
    {
      label: "Success Story Approval",
      path: "/admin/success-stories/approval",
      icon: CheckCircle,
    },
    { label: "Media Library", path: "/admin/assets", icon: HardDrive },
    { label: "Activity Logs", path: "/admin/logs", icon: Activity },
    { label: "Backup & Restore", path: "/admin/backup", icon: Archive },
    { label: "Content Templates", path: "/admin/templates", icon: FileCode },
    { label: "Notification Center", path: "/admin/notifications", icon: Bell },
    { label: "Role & Permissions", path: "/admin/roles", icon: Key },
    { label: "API Management", path: "/admin/api", icon: Activity },
    { label: "System Monitoring", path: "/admin/monitoring", icon: Monitor },
    { label: "Security Center", path: "/admin/security", icon: Shield },
    { label: "Login History", path: "/admin/login-history", icon: LogIn },
    { label: "Data Export", path: "/admin/export", icon: Download },
    {
      label: "News & Announcements",
      path: "/admin/announcements",
      icon: Newspaper,
    },
    { label: "Statistics", path: "/admin/statistics", icon: BarChart },
    { label: "Testimonials", path: "/admin/testimonials", icon: Mic },
    { label: "Gallery", path: "/admin/gallery", icon: GalleryHorizontal },
    { label: "Events", path: "/admin/events", icon: Calendar },
    { label: "Workshops", path: "/admin/workshops", icon: Video },
    { label: "Community", path: "/admin/community", icon: Users },
    { label: "User Management", path: "/admin/users", icon: UserCog },
    { label: "System Settings", path: "/admin/settings", icon: Settings },
    { label: "All Reports", path: "/admin/reports", icon: FileBarChart2 },
  ];

  return (
    <DashboardLayout
      title="Overarching Ecosystem Management Control Panel"
      role="Root Admin"
      navItems={navItems}
    >
      <Routes>
        <Route path="/dashboard" element={<Navigate to="/admin" replace />} />
        <Route index element={<AdminDashboard />} />
        <Route
          path="/cms"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">CMS/Page Builder</h2>
              <p className="text-sm text-slate-500">
                Drag-and-drop page builder for content management.
              </p>
            </div>
          }
        />
        <Route
          path="/homepage/sections"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Dynamic Homepage Sections</h2>
              <p className="text-sm text-slate-500">
                Add, remove, reorder homepage sections.
              </p>
            </div>
          }
        />
        <Route
          path="/homepage/theme"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">
                Homepage Theme Customization
              </h2>
              <p className="text-sm text-slate-500">
                Customize colors, fonts, and styling.
              </p>
            </div>
          }
        />
        <Route
          path="/homepage/menu"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Homepage Menu Management</h2>
              <p className="text-sm text-slate-500">
                Configure navigation menu items and order.
              </p>
            </div>
          }
        />
        <Route
          path="/homepage/hero"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Hero Slider</h2>
              <p className="text-sm text-slate-500">
                Configure hero slider images and text.
              </p>
            </div>
          }
        />
        <Route
          path="/homepage/banners"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Banners</h2>
              <p className="text-sm text-slate-500">
                Manage homepage banners and promotions.
              </p>
            </div>
          }
        />
        <Route
          path="/homepage/search"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Homepage Search Management</h2>
              <p className="text-sm text-slate-500">
                Configure search parameters and filters.
              </p>
            </div>
          }
        />
        <Route
          path="/seo"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">SEO Settings</h2>
              <p className="text-sm text-slate-500">
                Manage meta tags, sitemap, and SEO.
              </p>
            </div>
          }
        />
        <Route
          path="/popup"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Popup & Notice Management</h2>
              <p className="text-sm text-slate-500">
                Create and schedule popup notifications.
              </p>
            </div>
          }
        />
        <Route
          path="/contact"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Contact Message Management</h2>
              <p className="text-sm text-slate-500">
                View and respond to contact inquiries.
              </p>
            </div>
          }
        />
        <Route
          path="/faq"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">FAQ Management</h2>
              <p className="text-sm text-slate-500">
                Add, edit, organize FAQ entries.
              </p>
            </div>
          }
        />
        <Route
          path="/partners"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Partners & Sponsors</h2>
              <p className="text-sm text-slate-500">
                Manage partner and sponsor profiles.
              </p>
            </div>
          }
        />
        <Route
          path="/advertisement"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">
                Advertisement Banner Management
              </h2>
              <p className="text-sm text-slate-500">
                Upload and schedule ad banners.
              </p>
            </div>
          }
        />
        <Route
          path="/success-stories/approval"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Success Story Approval</h2>
              <p className="text-sm text-slate-500">
                Review and approve alumni stories.
              </p>
            </div>
          }
        />
        <Route
          path="/assets"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Digital Asset Library</h2>
              <p className="text-sm text-slate-500">
                Store and organize images, documents.
              </p>
            </div>
          }
        />
        <Route
          path="/logs"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Activity Logs & Audit Trail</h2>
              <p className="text-sm text-slate-500">
                View system activity and user actions.
              </p>
            </div>
          }
        />
        <Route
          path="/backup"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Backup & Restore System</h2>
              <p className="text-sm text-slate-500">
                Schedule backups and restore data.
              </p>
            </div>
          }
        />
        <Route
          path="/templates"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Email/SMS Templates</h2>
              <p className="text-sm text-slate-500">
                Create and manage communication templates.
              </p>
            </div>
          }
        />
        <Route
          path="/notifications"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Notification Center</h2>
              <p className="text-sm text-slate-500">
                Send and track system notifications.
              </p>
            </div>
          }
        />
        <Route
          path="/roles"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">
                Role & Permission Management
              </h2>
              <p className="text-sm text-slate-500">
                Configure user roles and access levels.
              </p>
            </div>
          }
        />
        <Route
          path="/api"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">API Management</h2>
              <p className="text-sm text-slate-500">
                API keys, endpoints, and documentation.
              </p>
            </div>
          }
        />
        <Route
          path="/monitoring"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">System Monitoring Dashboard</h2>
              <p className="text-sm text-slate-500">
                Real-time system performance metrics.
              </p>
            </div>
          }
        />
        <Route
          path="/security"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Security Center</h2>
              <p className="text-sm text-slate-500">
                Security policies and threat monitoring.
              </p>
            </div>
          }
        />
        <Route
          path="/login-history"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Login History</h2>
              <p className="text-sm text-slate-500">
                View all user login attempts.
              </p>
            </div>
          }
        />
        <Route
          path="/export"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Data Export Center</h2>
              <p className="text-sm text-slate-500">
                Export accreditation and analytics data.
              </p>
            </div>
          }
        />
        <Route
          path="/homepage"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Homepage Management</h2>
              <p className="text-sm text-slate-500">
                Manage homepage content and settings.
              </p>
            </div>
          }
        />
        <Route
          path="/announcements"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">News & Announcements</h2>
              <p className="text-sm text-slate-500">
                Create and manage news posts.
              </p>
            </div>
          }
        />
        <Route
          path="/statistics"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Statistics</h2>
              <p className="text-sm text-slate-500">
                View platform analytics and metrics.
              </p>
            </div>
          }
        />
        <Route
          path="/testimonials"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Testimonials</h2>
              <p className="text-sm text-slate-500">
                Manage testimonials from alumni and employers.
              </p>
            </div>
          }
        />
        <Route
          path="/gallery"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Gallery</h2>
              <p className="text-sm text-slate-500">
                Manage photo gallery and assets.
              </p>
            </div>
          }
        />
        <Route
          path="/events"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Events</h2>
              <p className="text-sm text-slate-500">
                Manage alumni and university events.
              </p>
            </div>
          }
        />
        <Route
          path="/workshops"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Workshops</h2>
              <p className="text-sm text-slate-500">
                Manage workshop listings and recordings.
              </p>
            </div>
          }
        />
        <Route
          path="/community"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Community</h2>
              <p className="text-sm text-slate-500">
                Monitor and moderate community feed.
              </p>
            </div>
          }
        />
        <Route
          path="/users"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">User Management</h2>
              <p className="text-sm text-slate-500">
                Manage users, roles, and permissions.
              </p>
            </div>
          }
        />
        <Route
          path="/settings"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">System Settings</h2>
              <p className="text-sm text-slate-500">
                Configure system-wide settings.
              </p>
            </div>
          }
        />
        <Route
          path="/reports"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">All Reports</h2>
              <p className="text-sm text-slate-500">
                View and export all accreditation reports.
              </p>
            </div>
          }
        />
      </Routes>
    </DashboardLayout>
  );
}

// ==========================================
// 7. PORTAL 4: DEPARTMENT ANALYTICS
// ==========================================
function DepartmentPortal() {
  const navItems = [
    { label: "Dashboard", path: "/department", icon: BarChart3 },
    {
      label: "Graduate Outcome Analytics",
      path: "/department/outcome-analytics",
      icon: BarChart2,
    },
    {
      label: "Curriculum Review",
      path: "/department/curriculum-review",
      icon: BookOpen,
    },
    { label: "Department Ranking", path: "/department/ranking", icon: Award },
    {
      label: "Research Collaboration",
      path: "/department/research",
      icon: Activity,
    },
    {
      label: "Employability Reports",
      path: "/department/employability",
      icon: TrendingUp,
    },
    { label: "KPI Dashboard", path: "/department/kpi", icon: Activity },
    {
      label: "Industry Partnership",
      path: "/department/partnership",
      icon: Handshake,
    },
    {
      label: "Employment Analytics",
      path: "/department/employment",
      icon: TrendingUp,
    },
    {
      label: "Skill Gap Reports",
      path: "/department/skill-gap",
      icon: GraduationCap,
    },
    {
      label: "Employer Feedback",
      path: "/department/employer-feedback",
      icon: FileText,
    },
    { label: "Tracer Reports", path: "/department/tracer", icon: FileText },
    {
      label: "Curriculum Insights",
      path: "/department/curriculum",
      icon: FileText,
    },
    {
      label: "Accreditation Reports",
      path: "/department/accreditation",
      icon: FileText,
    },
    { label: "Settings", path: "/department/settings", icon: Settings },
  ];

  return (
    <DashboardLayout
      title="Department Head Portal"
      role="Department Head"
      navItems={navItems}
    >
      <Routes>
        <Route
          path="/dashboard"
          element={<Navigate to="/department" replace />}
        />
        <Route
          index
          element={
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-md">
                <h2 className="text-lg font-black text-[#003366] mb-4">
                  Department Dashboard
                </h2>
                <p className="text-sm text-slate-500">
                  Select a module from the sidebar to view analytics.
                </p>
              </div>
            </div>
          }
        />
        <Route
          path="/outcome-analytics"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Graduate Outcome Analytics</h2>
              <p className="text-sm text-slate-500">
                Track graduate employment outcomes.
              </p>
            </div>
          }
        />
        <Route
          path="/curriculum-review"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Curriculum Review Dashboard</h2>
              <p className="text-sm text-slate-500">
                Review and suggest curriculum updates.
              </p>
            </div>
          }
        />
        <Route
          path="/ranking"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">
                Department Ranking Dashboard
              </h2>
              <p className="text-sm text-slate-500">
                View department performance rankings.
              </p>
            </div>
          }
        />
        <Route
          path="/research"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">
                Research Collaboration Tracking
              </h2>
              <p className="text-sm text-slate-500">
                Track research partnerships and outcomes.
              </p>
            </div>
          }
        />
        <Route
          path="/employability"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">
                Graduate Employability Reports
              </h2>
              <p className="text-sm text-slate-500">
                Generate employability analytics.
              </p>
            </div>
          }
        />
        <Route
          path="/kpi"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Department KPI Dashboard</h2>
              <p className="text-sm text-slate-500">
                Key performance indicators for the department.
              </p>
            </div>
          }
        />
        <Route
          path="/partnership"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">
                Industry Partnership Reports
              </h2>
              <p className="text-sm text-slate-500">
                Manage and track industry partnerships.
              </p>
            </div>
          }
        />
        <Route
          path="/employment"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Employment Analytics</h2>
              <p className="text-sm text-slate-500">
                Detailed employment statistics.
              </p>
            </div>
          }
        />
        <Route
          path="/skill-gap"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Skill Gap Reports</h2>
              <p className="text-sm text-slate-500">
                Analyze skill gaps from employer feedback.
              </p>
            </div>
          }
        />
        <Route
          path="/employer-feedback"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Employer Feedback</h2>
              <p className="text-sm text-slate-500">
                Review feedback from employers.
              </p>
            </div>
          }
        />
        <Route
          path="/tracer"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Tracer Reports</h2>
              <p className="text-sm text-slate-500">
                Generate tracer study reports.
              </p>
            </div>
          }
        />
        <Route
          path="/curriculum"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Curriculum Insights</h2>
              <p className="text-sm text-slate-500">
                View curriculum analytics.
              </p>
            </div>
          }
        />
        <Route
          path="/accreditation"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Accreditation Reports</h2>
              <p className="text-sm text-slate-500">
                Accreditation-ready reports.
              </p>
            </div>
          }
        />
        <Route
          path="/settings"
          element={
            <div className="p-6">
              <h2 className="text-lg font-bold">Settings</h2>
              <p className="text-sm text-slate-500">
                Manage department preferences.
              </p>
            </div>
          }
        />
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
        <Route path="/department/*" element={<DepartmentPortal />} />
        <Route path="/admin/*" element={<AdminPortal />} />
      </Routes>
    </BrowserRouter>
  );
}
