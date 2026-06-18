import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../shared/contexts/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { Bell, ChevronDown, HelpCircle, LogOut, Menu, Moon, Search, Sun, FileText, BarChart3 } from 'lucide-react';
import HelpCenter from '../../../shared/components/HelpCenter';
import AiAssistant from '../../../shared/components/AiAssistant';

import { GraduateRecord, VerificationRequest, DocumentProcessingRequest } from '../types/registrar.types';
import { registrarService } from '../services/registrar.service';

import { RecordsTab } from '../components/RecordsTab';
import { DataIntegrationTab } from '../components/DataIntegrationTab';
import { VerificationTab } from '../components/VerificationTab';
import { DocumentProcessingTab } from '../components/DocumentProcessingTab';
import { ReportingTab } from '../components/ReportingTab';
import { MessagingTab } from '../components/MessagingTab';
import SurveyManagement from '../../surveys/components/SurveyManagement';
import { AnalyticsChart } from '../../../shared/components/AnalyticsChart';
import { ActivityTimeline, ActivityEntry } from '../../../shared/components/ActivityTimeline';

const RegistrarDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('registrar_sidebar_collapsed') === 'true');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const normalizedSearch = useMemo(() => searchQuery.trim().toLowerCase(), [searchQuery]);

  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  const [showNotifications, setShowNotifications] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<{ id: number; text: string; unread: boolean; time: string }[]>([]);

  const [graduates, setGraduates] = useState<GraduateRecord[]>([]);
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [documents, setDocuments] = useState<DocumentProcessingRequest[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const displayName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Registrar';
  const displayTitle = user?.role === 'REGISTRAR' ? 'Dean of Registrar' : 'Registrar Office';

  const totalGraduatesCount = graduates.length;
  const verifiedAlumniCount = graduates.length;
  const pendingVerificationsCount = verifications.filter(v => v.status === 'PENDING').length;
  const documentRequestsCount = documents.filter(d => d.status === 'PENDING').length;

  const filteredGraduates = useMemo(() => {
    if (!normalizedSearch) return graduates;
    return graduates.filter((g) => {
      const haystack = `${g.studentId} ${g.fullName} ${g.email} ${g.department} ${g.graduationYear} ${g.cgpa}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [graduates, normalizedSearch]);

  const filteredVerifications = useMemo(() => {
    if (!normalizedSearch) return verifications;
    return verifications.filter((v) => {
      const haystack = `${v.studentId} ${v.fullName} ${v.email} ${v.status} ${v.createdAt}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [verifications, normalizedSearch]);

  const filteredDocuments = useMemo(() => {
    if (!normalizedSearch) return documents;
    return documents.filter((d) => {
      const haystack = `${d.alumniId} ${d.documentType} ${d.status} ${d.createdAt} ${d.id}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [documents, normalizedSearch]);

  const stats = [
    { id: 1, label: 'SIS Graduate DB', value: totalGraduatesCount.toLocaleString(), color: 'astu-navy', icon: 'database', bgGradient: 'from-blue-50 to-indigo-50', trend: '', trendIcon: 'trending_up', trendColor: 'astu-green' },
    { id: 2, label: 'Verified Alumni', value: verifiedAlumniCount.toLocaleString(), color: 'astu-green', icon: 'verified_user', bgGradient: 'from-emerald-50 to-green-50', trend: '', trendIcon: 'check_circle', trendColor: 'astu-green' },
    { id: 3, label: 'Pending Approvals', value: `${pendingVerificationsCount}`, color: 'astu-red', icon: 'gavel', bgGradient: 'from-red-50 to-orange-50', trend: 'Awaiting graduation confirm', trendIcon: 'schedule', trendColor: 'astu-red' },
    { id: 4, label: 'Document Queue', value: `${documentRequestsCount}`, color: 'purple-600', icon: 'description', bgGradient: 'from-purple-50 to-pink-50', trend: 'Transcript requests', trendIcon: 'schedule', trendColor: 'astu-red' },
  ];

  const registrarControlCards = [
    { icon: 'verified_user', title: 'Verification Center', desc: 'Approve alumni activation, validate identity, and resolve duplicate requests.', tab: 'verification' },
    { icon: 'draw', title: 'Document Workflow', desc: 'Transcript approval, certificate validation, digital signature, and request queues.', tab: 'documents' },
    { icon: 'analytics', title: 'Tracer Control', desc: 'Track 6/12/24-month survey responses, exports, and accreditation-ready reports.', tab: 'reporting' },
    { icon: 'admin_panel_settings', title: 'RBAC & Audit Readiness', desc: 'Registrar, employer, alumni, access control, audit logs, and monitoring cues.', tab: 'records' },
  ];

  const complianceSignals = [
    { label: 'ETA Employment KPI', value: '-', icon: 'query_stats', tone: 'text-astu-green' },
    { label: 'Pending Documents', value: documentRequestsCount.toString(), icon: 'pending_actions', tone: 'text-astu-red' },
    { label: 'SIS Heartbeat', value: 'Active', icon: 'database', tone: 'text-astu-navy' },
  ];

  const verificationRate = Math.round((verifiedAlumniCount / totalGraduatesCount) * 100);
  const registrarCommandSignals = [
    { label: 'Identity coverage', value: `${verificationRate}%`, icon: 'verified', tab: 'records', tone: 'text-astu-green' },
    { label: 'Approval queue', value: pendingVerificationsCount.toString(), icon: 'rule', tab: 'verification', tone: 'text-astu-red' },
    { label: 'Document SLA', value: documentRequestsCount > 0 ? 'Action' : 'Clear', icon: 'timer', tab: 'documents', tone: documentRequestsCount > 0 ? 'text-astu-red' : 'text-astu-green' },
    { label: 'Export status', value: 'Ready', icon: 'download', tab: 'reporting', tone: 'text-astu-navy' },
  ];

  const dataQualityPanels = [
    { label: 'Duplicate scan', value: '-', icon: 'difference', helper: 'Run a batch scan to check for duplicates' },
    { label: 'Record completeness', value: '-', icon: 'data_check', helper: 'Completeness metrics available after SIS sync' },
    { label: 'Audit trail', value: '-', icon: 'admin_panel_settings', helper: 'Audit logs available after first action' },
  ];

  const registrarManagementActions = [
    { title: 'Digital Transcript Verification', desc: 'Create verification cases, approve transcript checks, and attach audit notes.', tab: 'documents', icon: 'verified' },
    { title: 'Graduate Clearance Tracking', desc: 'Track clearance status, missing approvals, and graduation readiness by batch.', tab: 'records', icon: 'rule' },
    { title: 'Certificate Verification Portal', desc: 'Validate certificate requests and publish official verification outcomes.', tab: 'verification', icon: 'workspace_premium' },
    { title: 'Student-to-Alumni Migration', desc: 'Automate graduate import, SIS sync, activation records, and duplicate checks.', tab: 'data_integration', icon: 'sync_alt' },
    { title: 'Graduation Batch Management', desc: 'Create batches, map departments, reconcile records, and export cohort data.', tab: 'records', icon: 'groups' },
    { title: 'Academic History Verification', desc: 'Review CGPA, program, completion, and document history before approval.', tab: 'reporting', icon: 'history_edu' },
  ];

  let idCounter = Date.now();
  const nextStrId = () => String(idCounter++);

  const handleAddGraduate = (newGradDetails: Omit<GraduateRecord, 'id'>) => {
    const newGrad: GraduateRecord = {
      id: nextStrId(),
      ...newGradDetails,
    };
    const updatedGrads = [newGrad, ...graduates];
    setGraduates(updatedGrads);

    const newVerRequest: VerificationRequest = {
      id: nextStrId(),
      studentId: newGradDetails.studentId,
      fullName: newGradDetails.fullName,
      email: newGradDetails.email,
      status: 'PENDING',
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    const updatedVerifications = [newVerRequest, ...verifications];
    setVerifications(updatedVerifications);
  };

  const handleEditGraduate = (updatedGrad: GraduateRecord) => {
    const updatedGrads = graduates.map(g => g.id === updatedGrad.id ? updatedGrad : g);
    setGraduates(updatedGrads);
  };

  const handleBatchInsert = (records: any[]) => {
    const newGrads: GraduateRecord[] = records.map((r) => ({
      id: nextStrId(),
      studentId: r.studentId,
      fullName: r.fullName,
      email: r.email,
      department: r.department,
      departmentCode: r.department.substring(0, 3).toUpperCase(),
      graduationYear: parseInt(r.graduationYear) || 0,
      cgpa: parseFloat(r.cgpa) || 0,
      source: 'batch-import',
    }));
    const updatedGrads = [...newGrads, ...graduates];
    setGraduates(updatedGrads);
  };

  const handleVerifyRequestAction = (id: string, status: 'APPROVED' | 'REJECTED') => {
    const updatedVerifications = verifications.map(req => req.id === id ? { ...req, status } : req);
    setVerifications(updatedVerifications);
  };

  const handleProcessDocumentAction = (id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED') => {
    const updatedDocuments = documents.map(doc => doc.id === id ? { ...doc, status } : doc);
    setDocuments(updatedDocuments);
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const unreadNotificationsCount = notifications.filter(n => n.unread).length;

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(darkMode ? 'dark' : 'light');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('registrar_sidebar_collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    const loadData = async () => {
      setDataLoading(true);
      try {
        const [grads, vers, docs] = await Promise.all([
          registrarService.getGraduates(),
          registrarService.getVerifications(),
          registrarService.getDocumentRequests(),
        ]);
        setGraduates(grads);
        setVerifications(vers);
        setDocuments(docs);
      } catch {
        toast.error('Failed to load dashboard data.');
      } finally {
        setDataLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    setMobileSidebarOpen(false);
    setShowNotifications(false);
    setMenuOpen(false);
  }, [activeTab]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-admin-menu]') && !target.closest('[data-admin-notifications]')) {
        setMenuOpen(false);
        setShowNotifications(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.querySelector<HTMLInputElement>('input[type="text"]');
        input?.focus();
      }
    };
    window.addEventListener('mousedown', handleClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    window.location.href = '/login';
  };

  return (
    <>
    <div className="role-shell admin-shell min-h-screen overflow-x-hidden bg-[var(--bg-page)] font-['Inter',sans-serif] text-[var(--text-primary)] antialiased">
      <style>{`
        @keyframes float-particle {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.4; }
          25% { transform: translateY(-15px) translateX(8px); opacity: 0.6; }
          50% { transform: translateY(-8px) translateX(-4px); opacity: 0.3; }
          75% { transform: translateY(-22px) translateX(12px); opacity: 0.5; }
        }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes glow-soft {
          0%, 100% { box-shadow: 0 0 8px rgba(0,51,102,0.08); }
          50% { box-shadow: 0 0 20px rgba(0,51,102,0.15); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .sidebar-particle {
          animation: float-particle 6s ease-in-out infinite;
        }
        .sidebar-particle:nth-child(2) { animation-delay: 2s; animation-duration: 8s; }
        .sidebar-particle:nth-child(3) { animation-delay: 4s; animation-duration: 7s; }
        .nav-btn {
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .nav-btn:hover {
          transform: translateX(3px);
        }
      `}</style>
      <Toaster position="top-right" reverseOrder={false} />

      {mobileSidebarOpen && (
        <button type="button" aria-label="Close navigation" onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/45 backdrop-blur-sm md:hidden" />
      )}

        {/* Enhanced Sidebar with Animated Gradient and Feature Badges */}
        <aside className={`fixed left-0 top-0 z-40 flex h-dvh w-64 flex-col overflow-hidden shadow-2xl transition-all duration-300 md:translate-x-0 bg-gradient-to-b from-[#001a33] via-[#002a55] to-[#003366] ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${sidebarCollapsed ? 'md:w-20' : 'md:w-64'}`}>
          <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.02)_0%,transparent_40%,rgba(0,107,60,0.04)_60%,transparent_100%)] bg-[length:400%_400%] animate-[gradient-shift_8s_ease_infinite]" />
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[15%] left-[20%] w-2 h-2 rounded-full bg-emerald-400/30 sidebar-particle" />
            <div className="absolute top-[45%] right-[25%] w-1.5 h-1.5 rounded-full bg-[#FFD700]/25 sidebar-particle" />
            <div className="absolute bottom-[30%] left-[30%] w-2.5 h-2.5 rounded-full bg-blue-400/20 sidebar-particle" />
          </div>

          <div className="relative z-10 p-5 border-b border-white/10">
            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
              <div className="relative group/logo">
                <img alt="ASTU Official Logo" className="h-11 w-11 rounded-full object-contain transition-all duration-300"
                  src="/images/astu-logo-modified.png" />
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[#001a33] shadow-lg animate-pulse" />
                {!sidebarCollapsed && (
                  <div className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[7px] font-extrabold rounded border border-emerald-500/30 uppercase tracking-wider opacity-0 group-hover/logo:opacity-100 transition-opacity">
                    Live
                  </div>
                )}
              </div>
              {!sidebarCollapsed && (
                <div>
                  <h1 className="text-base font-extrabold text-white tracking-tight">ASTU Registrar</h1>
                  <p className="text-[9px] text-emerald-400 uppercase tracking-[0.2em] font-extrabold">Management Hub</p>
                </div>
              )}
            </div>
          </div>

          <nav className="relative z-10 flex-grow px-3 py-4 overflow-y-auto scrollbar-thin">
            {!sidebarCollapsed && (
              <div className="flex items-center justify-between px-3 mb-2">
                <p className="text-[9px] font-extrabold text-white/30 uppercase tracking-[0.2em]">Main Menu</p>
                <span className="text-[8px] text-emerald-400/50 font-bold px-1.5 py-0.5 bg-emerald-400/5 rounded border border-emerald-400/10">
                  {8} items
                </span>
              </div>
            )}
            <div className="space-y-0.5">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', badge: null, tooltip: 'Overview & key metrics' },
                { id: 'management', label: 'Management Hub', icon: 'dashboard_customize', badge: null, tooltip: 'Verification, clearance, certificates & migration' },
                { id: 'records', label: 'Alumni Records', icon: 'people', badge: totalGraduatesCount > 0 ? totalGraduatesCount.toLocaleString() : null, tooltip: `${graduates.length} active records` },
                { id: 'data_integration', label: 'Batch Scaffolding', icon: 'cloud_upload', badge: null, tooltip: 'Excel/CSV import & batch processing' },
                { id: 'verification', label: 'Verifications', icon: 'verified_user', badge: pendingVerificationsCount > 0 ? pendingVerificationsCount : null, tooltip: `${pendingVerificationsCount} pending approvals` },
                { id: 'documents', label: 'Document Queue', icon: 'description', badge: documentRequestsCount > 0 ? documentRequestsCount : null, tooltip: `${documentRequestsCount} documents awaiting action` },
                { id: 'surveys', label: 'Tracer Surveys', icon: 'assignment', badge: null, tooltip: 'Survey response tracking & analytics' },
                { id: 'reporting', label: 'Reports & Export', icon: 'analytics', badge: null, tooltip: 'Accreditation reports & data export' },
              ].map((item) => (
                <button key={item.id} onClick={() => setActiveTab(item.id)}
                  title={sidebarCollapsed ? item.label : item.tooltip}
                  className={`nav-btn w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 text-left group relative ${sidebarCollapsed ? 'justify-center' : 'gap-3'} ${activeTab === item.id
                    ? 'bg-white/15 text-white font-bold shadow-lg shadow-black/10 backdrop-blur-sm ring-1 ring-white/10'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}>
                  <span className={`relative w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all ${activeTab === item.id ? 'bg-emerald-400/20 text-emerald-400' : 'bg-white/5 text-white/40 group-hover:text-white/70'}`}>
                    <span className="material-symbols-outlined">{item.icon}</span>
                    {item.badge && sidebarCollapsed && (
                      <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 px-1 flex items-center justify-center rounded-full bg-rose-500 text-[7px] font-extrabold text-white shadow-lg">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </span>
                  {!sidebarCollapsed && (
                    <>
                      <span className="text-sm font-medium flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <span className={`ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[9px] font-extrabold shadow-lg ${String(item.id) === 'verification' || String(item.id) === 'documents' ? 'bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/30' : 'bg-white/10 text-white/70'}`}>
                          {item.badge > 99 ? '99+' : item.badge}
                        </span>
                      )}
                    </>
                  )}
                  {activeTab === item.id && !sidebarCollapsed && !item.badge && (
                    <div className="ml-1 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                  {sidebarCollapsed && (
                    <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-slate-900 text-white text-[10px] font-medium rounded-lg shadow-xl border border-white/10 whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                      {item.label}
                      {item.badge && <span className="ml-1.5 text-rose-400 font-bold">({item.badge})</span>}
                    </div>
                  )}
                </button>
              ))}
            </div>

            {!sidebarCollapsed && (
              <div className="flex items-center justify-between px-3 mt-5 mb-2">
                <p className="text-[9px] font-extrabold text-white/30 uppercase tracking-[0.2em]">Communication</p>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            )}
            <div className="space-y-0.5">
              {[
                { id: 'messages', label: 'Internal Messaging', icon: 'forum', badge: notifications.filter(n => n.unread).length || null, tooltip: `${notifications.filter(n => n.unread).length} unread messages` }
              ].map((item) => (
                <button key={item.id} onClick={() => setActiveTab(item.id)}
                  title={sidebarCollapsed ? item.label : item.tooltip}
                  className={`nav-btn w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 text-left group relative ${sidebarCollapsed ? 'justify-center' : 'gap-3'} ${activeTab === item.id
                    ? 'bg-white/15 text-white font-bold shadow-lg shadow-black/10 backdrop-blur-sm ring-1 ring-white/10'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}>
                  <span className={`relative w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all ${activeTab === item.id ? 'bg-emerald-400/20 text-emerald-400' : 'bg-white/5 text-white/40 group-hover:text-white/70'}`}>
                    <span className="material-symbols-outlined">{item.icon}</span>
                    {item.badge && sidebarCollapsed && (
                      <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 px-1 flex items-center justify-center rounded-full bg-rose-500 text-[7px] font-extrabold text-white shadow-lg">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </span>
                  {!sidebarCollapsed && (
                    <>
                      <span className="text-sm font-medium flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-rose-500/20 text-rose-300 text-[9px] font-extrabold ring-1 ring-rose-500/30 shadow-lg">
                          {item.badge > 9 ? '9+' : item.badge}
                        </span>
                      )}
                      {!item.badge && activeTab === item.id && (
                        <div className="ml-1 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                    </>
                  )}
                  {sidebarCollapsed && (
                    <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-slate-900 text-white text-[10px] font-medium rounded-lg shadow-xl border border-white/10 whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                      {item.label}
                      {item.badge && <span className="ml-1.5 text-rose-400 font-bold">({item.badge} unread)</span>}
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

          <div className="relative z-10 p-4 border-t border-white/10 space-y-1">
            {!sidebarCollapsed && (
              <>
                <button onClick={() => setHelpOpen(true)}
                  className="nav-btn w-full flex items-center px-3 py-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all duration-200 text-left group gap-3">
                  <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm text-white/40 group-hover:text-white/70 material-symbols-outlined">help</span>
                  <span className="text-sm font-medium">Help Center</span>
                  <span className="ml-auto text-[8px] text-white/20 font-bold px-1.5 py-0.5 bg-white/5 rounded border border-white/10">v1.4</span>
                </button>
                <button onClick={() => setAiAssistantOpen(true)}
                  className="nav-btn w-full flex items-center px-3 py-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all duration-200 text-left group gap-3">
                  <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm text-white/40 group-hover:text-white/70 material-symbols-outlined">smart_toy</span>
                  <span className="text-sm font-medium">AI Assistant</span>
                  <span className="ml-auto text-[8px] text-emerald-400/80 font-bold px-1.5 py-0.5 bg-emerald-500/10 rounded border border-emerald-500/20">NEW</span>
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
                <button onClick={() => setAiAssistantOpen(true)}
                  className="nav-btn w-full flex items-center justify-center px-3 py-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all duration-200 group relative" title="AI Assistant">
                  <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm text-white/40 group-hover:text-white/70 material-symbols-outlined">smart_toy</span>
                  <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-slate-900 text-white text-[10px] font-medium rounded-lg shadow-xl border border-white/10 whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">AI Assistant</div>
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
       <main className={`flex min-h-screen flex-col justify-between transition-[margin-left] duration-300 ease-in-out ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
         <div>
           {/* Header bar */}
           <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b px-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:px-6"
             style={{ background: 'var(--bg-navbar)', borderColor: 'var(--border-color)' }}>
             <div className="flex min-w-0 items-center gap-3">
               <button type="button" onClick={() => setSidebarCollapsed((value) => !value)}
                 className="hidden h-10 w-10 items-center justify-center rounded-[8px] text-[var(--text-secondary)] hover:bg-black/5 md:inline-flex"
                 title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
                 <Menu className="h-5 w-5" />
               </button>
               <button type="button" onClick={() => { setSidebarCollapsed(false); setMobileSidebarOpen(true); }}
                 className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] text-[var(--text-secondary)] hover:bg-black/5 md:hidden" aria-label="Open navigation">
                 <Menu className="h-5 w-5" />
               </button>
               <div className="min-w-0 space-y-0.5">
                 <div className="flex items-center gap-2 text-[13px] font-medium text-[var(--text-secondary)]">
                   <span>Registrar</span><span>/</span><span>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace(/_/g, ' ')}</span>
                 </div>
                 <h1 className="truncate text-[16px] font-semibold tracking-tight text-[var(--text-primary)]">
                   {activeTab === 'dashboard' ? 'Dashboard' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace(/_/g, ' ')}
                 </h1>
               </div>
             </div>

            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <label className="group hidden h-11 w-[280px] xl:w-[420px] items-center rounded-full border bg-[#F3F5FA] px-3 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 md:flex focus-within:border-[#003580] focus-within:ring-2 focus-within:ring-[#003580]/10 dark:bg-[#1E2130]"
                style={{ borderColor: 'var(--border-color)' }}>
                <span className="mr-2 inline-flex h-5 w-5 items-center justify-center text-[#8FA3BF]">
                  <Search className="h-4.5 w-4.5 flex-none" />
                </span>
                <input type="text" placeholder="Search SIS records, requests, documents..."
                  className="w-full bg-transparent outline-none placeholder:text-[#7C879D] dark:placeholder:text-[#97A0B8]"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); if (activeTab === 'dashboard' && e.target.value.trim().length > 1) setActiveTab('records'); }} />
                <span className="ml-auto hidden text-[10px] font-medium text-[#8FA3BF] xl:inline-flex items-center gap-0.5 bg-white/80 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-slate-700">
                  ⌘K
                </span>
              </label>

              {/* Dark Mode Toggle */}
              <button type="button" onClick={() => { setDarkMode(!darkMode); toast.success(darkMode ? 'Light Theme activated!' : 'Premium Dark Theme activated!'); }}
                className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] text-[var(--text-secondary)] hover:bg-black/5" aria-label="Toggle dark mode">
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              {/* Notification Bell */}
              <div className="relative" data-admin-notifications>
                <button type="button" onClick={() => setShowNotifications((v) => !v)}
                  className="relative inline-flex h-9 w-9 items-center justify-center rounded-[8px] text-[var(--text-secondary)] hover:bg-black/5">
                  <Bell className="h-4 w-4" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute right-0.5 top-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#E24B4A] text-[9px] font-semibold leading-none text-white">{unreadNotificationsCount}</span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 top-11 z-50 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-[10px] border border-[var(--border-color)] bg-[var(--bg-card)] shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                    <div className="border-b border-[var(--border-color)] px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-semibold text-[var(--text-primary)]">Notifications</div>
                          <div className="text-xs text-[var(--text-secondary)]">Recent updates</div>
                        </div>
                        <button onClick={handleClearNotifications} className="text-xs font-semibold text-[#E24B4A] hover:underline">Clear All</button>
                      </div>
                    </div>
                    <div className="space-y-1 p-2">
                      {notifications.map((notif) => (
                        <div key={notif.id} className="flex items-start gap-3 rounded-md px-2 py-2 hover:bg-black/5">
                          <span className={`mt-1 h-2.5 w-2.5 rounded-full ${notif.unread ? 'bg-[#003580]' : 'bg-gray-300'}`} />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-[var(--text-primary)]">{notif.text}</p>
                            <p className="text-xs text-[var(--text-secondary)]">{notif.time}</p>
                          </div>
                        </div>
                      ))}
                      {notifications.length === 0 && (
                        <p className="px-2 py-6 text-center text-sm text-[var(--text-secondary)]">No new alerts.</p>
                      )}
                    </div>
                    <div className="border-t border-[var(--border-color)] px-4 py-3">
                      <button type="button" className="text-sm font-semibold text-[#003580] hover:underline">View all notifications →</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Button */}
              <div className="relative" data-admin-menu>
                <button type="button" onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-3 rounded-[8px] border bg-[var(--bg-card)] px-2.5 py-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                  style={{ borderColor: 'var(--border-color)' }}>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#003580] to-[#004d99] text-xs font-semibold text-white shadow-sm">{displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'RR'}</div>
                  <div className="hidden text-left sm:block">
                    <div className="text-sm font-medium text-[var(--text-primary)]">{displayName}</div>
                    <div className="text-[11px] text-[var(--text-secondary)]">{displayTitle}</div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-[10px] border border-[var(--border-color)] bg-[var(--bg-card)] p-1 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                    <div className="px-3 py-3">
                      <div className="text-sm font-semibold text-[var(--text-primary)]">{displayName}</div>
                      <div className="mt-1"><span className="inline-flex items-center rounded-md bg-[#003366]/10 px-2 py-0.5 text-xs font-medium text-[#003366] border border-[#003366]/15">{displayTitle}</span></div>
                    </div>
                    <div className="my-1 h-px bg-[var(--border-color)]" />
                    <button type="button" onClick={() => { setMenuOpen(false); setActiveTab('surveys'); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)]">
                      <FileText className="h-4 w-4" /> Tracer Reports
                    </button>
                    <button type="button" onClick={() => { setMenuOpen(false); setActiveTab('reporting'); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)]">
                      <BarChart3 className="h-4 w-4" /> Reports
                    </button>
                    <div className="my-1 h-px bg-[var(--border-color)]" />
                    <button type="button" onClick={() => { setMenuOpen(false); setHelpOpen(true); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)]">
                      <HelpCircle className="h-4 w-4" /> Help
                    </button>
                    <button type="button" onClick={() => { setMenuOpen(false); handleLogout(); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[#E24B4A] hover:bg-rose-50">
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Dynamic tabs routing */}
          <div className="flex-grow bg-[var(--bg-page)]" style={{ animation: 'astu-admin-fade-in 150ms ease-out' }}>
            {activeTab === 'management' && (
              <section className="space-y-6 p-4 md:p-6">
                <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-astu-navy via-[#002a55] to-emerald-800 p-6 md:p-8 text-white shadow-lg">
                  <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/10 rounded-full translate-y-1/3 -translate-x-1/4" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-300 mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Registrar Management Hub
                    </div>
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Manage verification, clearance, certificates, and migration</h2>
                    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/80">
                      Digital transcript verification, graduate clearance, certificate verification, student-to-alumni automation, graduation batches, and academic history checks.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button onClick={() => setActiveTab('verification')} className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl text-xs font-bold hover:bg-white/25 transition-all">
                        <span className="material-symbols-outlined text-sm">verified_user</span> Verification Center
                      </button>
                      <button onClick={() => setActiveTab('documents')} className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl text-xs font-bold hover:bg-white/25 transition-all">
                        <span className="material-symbols-outlined text-sm">description</span> Document Queue
                      </button>
                      <button onClick={() => setActiveTab('records')} className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl text-xs font-bold hover:bg-white/25 transition-all">
                        <span className="material-symbols-outlined text-sm">people</span> Alumni Records
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className={`rounded-2xl border p-4 shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
                    <span className="material-symbols-outlined text-astu-navy">verified_user</span>
                    <p className={`text-[10px] font-bold uppercase tracking-wider mt-2 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Pending Verification</p>
                    <p className="text-2xl font-extrabold text-amber-600">{pendingVerificationsCount}</p>
                  </div>
                  <div className={`rounded-2xl border p-4 shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
                    <span className="material-symbols-outlined text-astu-navy">description</span>
                    <p className={`text-[10px] font-bold uppercase tracking-wider mt-2 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Document Queue</p>
                    <p className="text-2xl font-extrabold text-astu-navy">{documentRequestsCount}</p>
                  </div>
                  <div className={`rounded-2xl border p-4 shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
                    <span className="material-symbols-outlined text-astu-navy">people</span>
                    <p className={`text-[10px] font-bold uppercase tracking-wider mt-2 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Graduate Records</p>
                    <p className="text-2xl font-extrabold text-emerald-600">{totalGraduatesCount.toLocaleString()}</p>
                  </div>
                  <div className={`rounded-2xl border p-4 shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
                    <span className="material-symbols-outlined text-astu-navy">analytics</span>
                    <p className={`text-[10px] font-bold uppercase tracking-wider mt-2 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Verification Rate</p>
                    <p className="text-2xl font-extrabold text-astu-navy">{verificationRate}%</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {registrarManagementActions.map((action) => (
                    <button key={action.title} onClick={() => setActiveTab(action.tab)}
                      className={`group rounded-2xl border p-5 text-left shadow-sm transition-all duration-300 hover:border-astu-navy/30 hover:shadow-md hover:-translate-y-0.5 ${darkMode ? 'border-slate-800 bg-slate-900' : 'border-gray-200/60 bg-white'}`}>
                      <span className="material-symbols-outlined rounded-xl bg-astu-navy/10 p-2.5 text-astu-navy group-hover:scale-110 transition-transform duration-300 text-xl">{action.icon}</span>
                      <h3 className={`mt-4 text-sm font-bold transition-colors ${darkMode ? 'text-white group-hover:text-astu-navy' : 'text-gray-900 group-hover:text-astu-navy'}`}>{action.title}</h3>
                      <p className={`mt-1 text-xs leading-relaxed ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{action.desc}</p>
                      <span className="mt-4 inline-flex rounded-xl bg-gradient-to-r from-astu-navy to-[#004d99] px-3 py-2 text-xs font-bold text-white shadow-sm group-hover:shadow-md transition-all">Manage / Create</span>
                    </button>
                  ))}
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div onClick={() => setActiveTab('verification')} className={`rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all border ${darkMode ? 'bg-gradient-to-br from-amber-900/30 to-orange-900/30 border-amber-700/30' : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/60'}`}>
                    <span className="material-symbols-outlined text-amber-600">gavel</span>
                    <p className={`text-xs font-bold uppercase tracking-wider mt-2 ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>Verification</p>
                    <p className={`text-lg font-extrabold ${darkMode ? 'text-amber-200' : 'text-amber-900'}`}>{pendingVerificationsCount} pending</p>
                    <p className={`text-xs ${darkMode ? 'text-amber-400/80' : 'text-amber-700'}`}>Awaiting graduation confirmation</p>
                  </div>
                  <div onClick={() => setActiveTab('documents')} className={`rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all border ${darkMode ? 'bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-blue-700/30' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/60'}`}>
                    <span className="material-symbols-outlined text-blue-600">description</span>
                    <p className={`text-xs font-bold uppercase tracking-wider mt-2 ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>Documents</p>
                    <p className={`text-lg font-extrabold ${darkMode ? 'text-blue-200' : 'text-blue-900'}`}>{documentRequestsCount} in queue</p>
                    <p className={`text-xs ${darkMode ? 'text-blue-400/80' : 'text-blue-700'}`}>Transcript & certificate requests</p>
                  </div>
                  <div onClick={() => setActiveTab('data_integration')} className={`rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all border ${darkMode ? 'bg-gradient-to-br from-emerald-900/30 to-green-900/30 border-emerald-700/30' : 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200/60'}`}>
                    <span className="material-symbols-outlined text-emerald-600">cloud_upload</span>
                    <p className={`text-xs font-bold uppercase tracking-wider mt-2 ${darkMode ? 'text-emerald-300' : 'text-emerald-800'}`}>Batch Import</p>
                    <p className={`text-lg font-extrabold ${darkMode ? 'text-emerald-200' : 'text-emerald-900'}`}>Ready for upload</p>
                    <p className={`text-xs ${darkMode ? 'text-emerald-400/80' : 'text-emerald-700'}`}>Import graduate rosters from SIS</p>
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'dashboard' && (
              <div className="space-y-6 p-4 md:p-6">

                {dataLoading && (
                  <div className="space-y-6 animate-pulse">
                    <div className="rounded-[20px] bg-gray-200 dark:bg-slate-700 h-32" />
                    <div className="rounded-[10px] bg-gray-200 dark:bg-slate-700 h-48" />
                    <div className="grid grid-cols-4 gap-4">
                      {[1,2,3,4].map(i => <div key={i} className="rounded-[10px] bg-gray-200 dark:bg-slate-700 h-32" />)}
                    </div>
                  </div>
                )}

                {!dataLoading && (<>
                <section className="rounded-[20px] border border-[var(--border-color)] bg-[linear-gradient(135deg,#003580,#0f4f86,#1D9E75)] p-5 text-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] md:p-6">
                  <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                    <div className="max-w-2xl space-y-2">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">ASTU SIS integration</span>
                      <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Institutional Registrar Panel</h2>
                      <p className="text-sm leading-relaxed text-white/85">
                        Process batch records uploads, review pending alumni requests, authorize transcript releases, and export Stata-ready census datasets.
                      </p>
                    </div>
                    <button onClick={() => setActiveTab('data_integration')}
                      className="flex items-center gap-1.5 whitespace-nowrap rounded-md bg-[#E24B4A] px-4 py-2.5 text-xs font-bold tracking-wide text-white shadow-sm transition-all hover:bg-[#c94140]">
                      <span className="material-symbols-outlined">cloud_upload</span>
                      Batch Upload CSV
                    </button>
                  </div>
                </section>

                <section className={`rounded-[10px] border p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200/60'}`}>
                  <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Registrar Command Center</h3>
                      <p className="mt-1 text-xs text-gray-500">A clearer control layer for identity coverage, approvals, documents, exports, and SIS data quality.</p>
                    </div>
                    <button onClick={() => setActiveTab('reporting')}
                      className="inline-flex items-center gap-1.5 rounded-md bg-astu-navy px-3 py-2 text-xs font-bold text-white transition-all hover:bg-astu-navy/90">
                      <span className="material-symbols-outlined text-base">ios_share</span>
                      Export reports
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.2fr]">
                    <div className="grid grid-cols-2 gap-3">
                      {registrarCommandSignals.map((signal) => (
                        <button key={signal.label} onClick={() => setActiveTab(signal.tab)}
                          className={`rounded-[10px] border p-4 text-left transition-all hover:border-astu-navy/30 hover:shadow-sm ${darkMode ? 'border-slate-800 bg-slate-950/40' : 'border-gray-200 bg-gray-50 hover:bg-white'}`}>
                          <div className="flex items-center gap-2">
                            <span className={`material-symbols-outlined ${signal.tone}`}>{signal.icon}</span>
                            <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">{signal.label}</p>
                          </div>
                          <p className="mt-2 text-2xl font-extrabold text-gray-900">{signal.value}</p>
                        </button>
                      ))}
                    </div>
                    <div className={`rounded-[10px] border p-4 ${darkMode ? 'border-slate-800 bg-slate-950/40' : 'border-gray-200 bg-white'}`}>
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-sm font-bold text-gray-900">SIS Data Quality</h4>
                        <span className="rounded-md bg-astu-green/10 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-astu-green">Monitored</span>
                      </div>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        {dataQualityPanels.map((item) => (
                          <div key={item.label} className={`rounded-[10px] border p-3 ${darkMode ? 'border-slate-800 bg-slate-900/80' : 'border-gray-200 bg-gray-50'}`}>
                            <span className="material-symbols-outlined text-astu-navy">{item.icon}</span>
                            <p className="mt-2 text-xl font-extrabold text-gray-900">{item.value}</p>
                            <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">{item.label}</p>
                            <p className="mt-1 text-[11px] leading-relaxed text-gray-500">{item.helper}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {stats.map((stat) => (
                    <div key={stat.id}
                      onMouseEnter={() => setHoveredCard(stat.id)}
                      onMouseLeave={() => setHoveredCard(null)}
                      onClick={() => { if (stat.id === 1) setActiveTab('records'); if (stat.id === 3) setActiveTab('verification'); if (stat.id === 4) setActiveTab('documents'); }}
                      className={`group relative cursor-pointer overflow-hidden rounded-[10px] border p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-300 ${darkMode ? 'border-slate-800 bg-slate-900' : 'border-gray-200/60 bg-white'} ${hoveredCard === stat.id ? '-translate-y-1 shadow-md' : ''}`}>
                      <div className="relative z-10 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="p-2.5 rounded-xl bg-astu-navy/10 text-astu-navy">
                            <span className="material-symbols-outlined text-2xl font-bold">{stat.icon}</span>
                          </div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-astu-green bg-astu-green/10 px-2 py-0.5 rounded">SIS Verified</span>
                        </div>
                        <div>
                          <p className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{stat.label}</p>
                          <p className="text-3xl font-extrabold text-astu-navy mt-1">{stat.value}</p>
                        </div>
                        <div className={`flex items-center gap-1 text-xs font-semibold pt-1 border-t ${darkMode ? 'text-slate-400 border-slate-700' : 'text-gray-500 border-gray-200'}`}>
                          <span className="material-symbols-outlined text-base font-bold text-astu-green">{stat.trendIcon}</span>
                          {stat.trend}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {[
                    { icon: 'people', title: 'SIS Records Management', desc: 'Browse full lists, edit academic GPAs, or archive old folders.', tab: 'records' },
                    { icon: 'cloud_upload', title: 'Excel/CSV Scaffolding', desc: 'Process bulk file datasets and send automated sign-up emails.', tab: 'data_integration' },
                    { icon: 'description', title: 'Document Processing Queue', desc: 'Authorize official transcripts and degree verifications.', tab: 'documents' }
                  ].map((act, idx) => (
                    <div key={idx} onClick={() => setActiveTab(act.tab)}
                      className={`group cursor-pointer rounded-[10px] border p-5 text-center transition-all hover:border-astu-navy/30 hover:shadow-md space-y-4 ${darkMode ? 'border-slate-800 bg-slate-900' : 'border-gray-200/60 bg-white'}`}>
                      <div className="mx-auto w-12 h-12 rounded-2xl bg-astu-navy/10 flex items-center justify-center group-hover:bg-astu-navy/20 transition-colors text-astu-navy">
                        <span className="material-symbols-outlined text-2xl font-bold">{act.icon}</span>
                      </div>
                      <div>
                        <h3 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{act.title}</h3>
                        <p className={`text-xs mt-1 leading-relaxed ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{act.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <section className={`rounded-[10px] border p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${darkMode ? 'border-slate-800 bg-slate-900' : 'border-gray-200/60 bg-white'}`}>
                  <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Registrar Feature Control</h3>
                      <p className={`mt-1 text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Verification, documents, tracer monitoring, accreditation, and audit readiness.</p>
                    </div>
                    <span className="rounded-md border border-astu-green/20 bg-astu-green/10 px-2.5 py-1 text-[11px] font-semibold text-astu-green">Accreditation ready</span>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {registrarControlCards.map((card) => (
                      <button key={card.title} onClick={() => setActiveTab(card.tab)}
                        className={`rounded-[10px] border p-4 text-left transition-all hover:border-astu-navy/30 hover:shadow-sm ${darkMode ? 'border-slate-800 bg-slate-950/40 hover:bg-slate-800' : 'border-gray-200 bg-gray-50 hover:bg-white'}`}>
                        <span className="material-symbols-outlined rounded-full bg-astu-navy/10 p-2 text-astu-navy">{card.icon}</span>
                        <h4 className={`mt-3 text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{card.title}</h4>
                        <p className={`mt-1 text-xs leading-relaxed ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{card.desc}</p>
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                    {complianceSignals.map((signal) => (
                      <div key={signal.label} className={`rounded-[10px] border p-4 ${darkMode ? 'border-slate-800 bg-slate-950/40' : 'border-gray-200 bg-white'}`}>
                        <div className="flex items-center gap-2">
                          <span className={`material-symbols-outlined ${signal.tone}`}>{signal.icon}</span>
                          <p className={`text-[11px] font-bold uppercase tracking-wide ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{signal.label}</p>
                        </div>
                        <p className={`mt-2 text-lg font-extrabold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{signal.value}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className={`rounded-[10px] border p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${darkMode ? 'border-slate-800 bg-slate-900' : 'border-gray-200/60 bg-white'}`}>
                    <AnalyticsChart type="bar" title="Graduate Import Trends"
                      subtitle="Volume of graduates synchronized from SIS per batch"
                      data={[]}
                      xKey="batch" series={[{ key: 'graduates', label: 'Synced Graduates' }]} height={200} darkMode={darkMode} />
                    <div className={`mt-2 text-center text-xs ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>No import data yet — upload a batch to see trends</div>
                  </div>
                  <div className={`rounded-[10px] border p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${darkMode ? 'border-slate-800 bg-slate-900' : 'border-gray-200/60 bg-white'}`}>
                    <AnalyticsChart type="line" title="Tracer Survey Submissions Rate"
                      subtitle="Interactive timeline tracking response rate percentage"
                      data={[]}
                      xKey="month" series={[{ key: 'rate', label: 'Response Rate %' }]} height={200} darkMode={darkMode} />
                    <div className={`mt-2 text-center text-xs ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>No survey data yet — responses will appear here</div>
                  </div>
                </div>

                <div className="mt-6">
                  <ActivityTimeline activities={[] as ActivityEntry[]} darkMode={darkMode} onViewAll={() => setActiveTab('messages')} />
                </div>

                </>)}
              </div>
            )}

            {activeTab === 'records' && (
              <RecordsTab graduates={filteredGraduates}
                onAddGraduate={handleAddGraduate} onEditGraduate={handleEditGraduate} darkMode={darkMode} />
            )}

            {activeTab === 'data_integration' && (
              <DataIntegrationTab onBatchInsert={handleBatchInsert} darkMode={darkMode} />
            )}

            {activeTab === 'verification' && (
              <VerificationTab verifications={filteredVerifications}
                onVerify={handleVerifyRequestAction} darkMode={darkMode} />
            )}

            {activeTab === 'documents' && (
              <DocumentProcessingTab documents={filteredDocuments}
                onProcessDocument={handleProcessDocumentAction} darkMode={darkMode} />
            )}

            {activeTab === 'surveys' && (
              <div className="p-4 md:p-6">
                <div className="rounded-3xl bg-gradient-to-br from-astu-navy via-[#002a55] to-emerald-800 p-6 md:p-8 text-white shadow-lg mb-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/10 rounded-full translate-y-1/3 -translate-x-1/4" />
                  <div className="relative z-10">
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-300">Tracer Studies</span>
                    <h2 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight">Tracer Surveys</h2>
                    <p className="mt-2 max-w-2xl text-sm text-white/80">Design, launch, and monitor graduate tracer surveys for ABET accreditation. Track 6/12/24-month response rates and export accreditation-ready data.</p>
                  </div>
                </div>
                <SurveyManagement />
              </div>
            )}

            {activeTab === 'reporting' && <ReportingTab darkMode={darkMode} />}

            {activeTab === 'messages' && <MessagingTab darkMode={darkMode} />}
          </div>
        </div>

        <footer className="mt-12 bg-astu-navy text-slate-300 py-10 px-6 border-t border-white/10 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img alt="ASTU Official Emblem" className="h-10 w-10 rounded-full object-contain" src="/images/astu-logo-modified.png" />
                <div>
                  <h4 className="font-bold text-white text-sm">Adama Science and Technology University</h4>
                  <p className="text-[10px] text-astu-green uppercase tracking-widest font-extrabold">Office of the Registrar</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 max-w-md leading-relaxed">
                The ASTU Alumni Management System bridges engineering graduates with industry recruiters, securing transcripts verification, and providing continuous tracer study reports to the dean boards.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-8 text-xs">
              <div className="space-y-2">
                <h5 className="font-bold text-white text-[11px] uppercase tracking-wider">Helpful Channels</h5>
                <ul className="space-y-1 text-slate-400 font-medium">
                  <li><a href="#" className="hover:text-white transition-colors">Curriculum Review Committee</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">SIS Technical Assistance</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">API Sync Integration Docs</a></li>
                </ul>
              </div>
              <div className="space-y-2">
                <h5 className="font-bold text-white text-[11px] uppercase tracking-wider">System Info</h5>
                <p className="text-[10px] text-slate-400">Version: <strong>v1.4.0 (Enterprise)</strong></p>
                <p className="text-[10px] text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
                  SIS Sync Heartbeat: <strong>Active</strong>
                </p>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto pt-6 mt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-500 font-semibold gap-4">
            <p>&copy; {new Date().getFullYear()} Adama Science and Technology University. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-slate-300">Privacy Policy</a>
              <span>&bull;</span>
              <a href="#" className="hover:text-slate-300">Terms of Use</a>
            </div>
          </div>
        </footer>
      </main>
    </div>

    <HelpCenter isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    <AiAssistant role="registrar" isOpen={aiAssistantOpen} onClose={() => setAiAssistantOpen(false)} />
    </>
  );
};

export default RegistrarDashboard;
