import React, { useEffect, useMemo, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Bell, ChevronDown, HelpCircle, LogOut, Menu, Moon, Search, Settings, Sun, User } from 'lucide-react';


// Types
import { GraduateRecord, VerificationRequest, DocumentProcessingRequest } from '../types/registrar.types';

// Services
import {
  getGraduates,
  saveGraduates,
  getVerifications,
  saveVerifications,
  getDocumentRequests,
  saveDocumentRequests
} from '../services/mockRegistrarData';

// Tabs
import { RecordsTab } from '../components/RecordsTab';
import { DataIntegrationTab } from '../components/DataIntegrationTab';
import { VerificationTab } from '../components/VerificationTab';
import { DocumentProcessingTab } from '../components/DocumentProcessingTab';
import { ReportingTab } from '../components/ReportingTab';
import { MessagingTab } from '../components/MessagingTab';
import SurveyManagement from '../../surveys/components/SurveyManagement';
import { AnalyticsChart } from '../../../components/AnalyticsChart';
import { ActivityTimeline, ActivityEntry } from '../../../components/ActivityTimeline';

const RegistrarDashboard = () => {
   const [activeTab, setActiveTab] = useState<string>('dashboard');
   const [hoveredCard, setHoveredCard] = useState<number | null>(null);
   const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('registrar_sidebar_collapsed') === 'true');
   const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

   const [searchQuery, setSearchQuery] = useState('');
   const normalizedSearch = useMemo(() => searchQuery.trim().toLowerCase(), [searchQuery]);


   // Theme Dark / Light mode
   const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  // Notifications Bell dropdown
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Batch validation complete. 3 records processed.', unread: true, time: '2 hours ago' },
    { id: 2, text: 'New transcript request submitted by Abebe Bikila.', unread: true, time: '1 day ago' },
    { id: 3, text: 'Duplicate record warnings resolved in class batch 2024.', unread: false, time: '3 days ago' },
  ]);

  // Core Data States
  const [graduates, setGraduates] = useState<GraduateRecord[]>(getGraduates());
  const [verifications, setVerifications] = useState<VerificationRequest[]>(getVerifications());
  const [documents, setDocuments] = useState<DocumentProcessingRequest[]>(getDocumentRequests());

  // Count active stats
  const totalGraduatesCount = graduates.length + 23800; // Mock database counts + local states
  const verifiedAlumniCount = graduates.filter(g => g.identityVerified).length + 18200;
  const pendingVerificationsCount = verifications.filter(v => v.status === 'Pending').length;
  const documentRequestsCount = documents.filter(d => d.status === 'Pending').length;

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
      const haystack = `${v.studentId} ${v.fullName} ${v.email} ${v.department} ${v.graduationYear} ${v.type} ${v.status} ${v.requestDate}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [verifications, normalizedSearch]);

  const filteredDocuments = useMemo(() => {
    if (!normalizedSearch) return documents;
    return documents.filter((d) => {
      const haystack = `${d.studentId} ${d.fullName} ${d.documentType} ${d.destination} ${d.requestDate} ${d.status} ${d.id}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [documents, normalizedSearch]);


  const stats = [
    {
      id: 1,
      label: 'SIS Graduate DB',
      value: totalGraduatesCount.toLocaleString(),
      color: 'astu-navy',
      icon: 'database',
      bgGradient: 'from-blue-50 to-indigo-50',
      trend: '+1,200 this batch',
      trendIcon: 'trending_up',
      trendColor: 'astu-green'
    },
    {
      id: 2,
      label: 'Verified Alumni',
      value: verifiedAlumniCount.toLocaleString(),
      color: 'astu-green',
      icon: 'verified_user',
      bgGradient: 'from-emerald-50 to-green-50',
      trend: '76% validation rate',
      trendIcon: 'check_circle',
      trendColor: 'astu-green'
    },
    {
      id: 3,
      label: 'Pending Approvals',
      value: `${pendingVerificationsCount}`,
      color: 'astu-red',
      icon: 'gavel',
      bgGradient: 'from-red-50 to-orange-50',
      trend: 'Awaiting graduation confirm',
      trendIcon: 'schedule',
      trendColor: 'astu-red'
    },
    {
      id: 4,
      label: 'Document Queue',
      value: `${documentRequestsCount}`,
      color: 'purple-600',
      icon: 'description',
      bgGradient: 'from-purple-50 to-pink-50',
      trend: 'Transcript requests',
      trendIcon: 'schedule',
      trendColor: 'astu-red'
    }
  ];

  const registrarControlCards = [
    { icon: 'verified_user', title: 'Verification Center', desc: 'Approve alumni activation, validate identity, and resolve duplicate requests.', tab: 'verification' },
    { icon: 'draw', title: 'Document Workflow', desc: 'Transcript approval, certificate validation, digital signature, and request queues.', tab: 'documents' },
    { icon: 'analytics', title: 'Tracer Control', desc: 'Track 6/12/24-month survey responses, exports, and accreditation-ready reports.', tab: 'reporting' },
    { icon: 'admin_panel_settings', title: 'RBAC & Audit Readiness', desc: 'Registrar, employer, alumni, access control, audit logs, and monitoring cues.', tab: 'records' },
  ];

  const complianceSignals = [
    { label: 'ETA Employment KPI', value: '84%', icon: 'query_stats', tone: 'text-astu-green' },
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
    { label: 'Duplicate scan', value: '0 open', icon: 'difference', helper: 'Latest batch is conflict-free' },
    { label: 'Record completeness', value: '96%', icon: 'data_check', helper: 'Student ID, CGPA, email, and department coverage' },
    { label: 'Audit trail', value: 'Live', icon: 'admin_panel_settings', helper: 'Registrar actions are ready for review' },
  ];

  const registrarManagementActions = [
    { title: 'Digital Transcript Verification', desc: 'Create verification cases, approve transcript checks, and attach audit notes.', tab: 'documents', icon: 'verified' },
    { title: 'Graduate Clearance Tracking', desc: 'Track clearance status, missing approvals, and graduation readiness by batch.', tab: 'records', icon: 'rule' },
    { title: 'Certificate Verification Portal', desc: 'Validate certificate requests and publish official verification outcomes.', tab: 'verification', icon: 'workspace_premium' },
    { title: 'Student-to-Alumni Migration', desc: 'Automate graduate import, SIS sync, activation records, and duplicate checks.', tab: 'data_integration', icon: 'sync_alt' },
    { title: 'Graduation Batch Management', desc: 'Create batches, map departments, reconcile records, and export cohort data.', tab: 'records', icon: 'groups' },
    { title: 'Academic History Verification', desc: 'Review CGPA, program, completion, and document history before approval.', tab: 'reporting', icon: 'history_edu' },
  ];

  // Callbacks
  const handleAddGraduate = (newGradDetails: Omit<GraduateRecord, 'id' | 'identityVerified' | 'status'>) => {
    const nextGradId = graduates.length + 1;
    const newGrad: GraduateRecord = {
      id: nextGradId,
      ...newGradDetails,
      identityVerified: false,
      status: 'Active'
    };

    const updatedGrads = [newGrad, ...graduates];
    setGraduates(updatedGrads);
    saveGraduates(updatedGrads);

    // Push verification request automatically
    const newVerRequest: VerificationRequest = {
      id: verifications.length + 1,
      studentId: newGradDetails.studentId,
      fullName: newGradDetails.fullName,
      email: newGradDetails.email,
      department: newGradDetails.department,
      graduationYear: newGradDetails.graduationYear,
      type: 'Alumni Registration',
      status: 'Pending',
      requestDate: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    };
    const updatedVerifications = [newVerRequest, ...verifications];
    setVerifications(updatedVerifications);
    saveVerifications(updatedVerifications);
  };

  const handleEditGraduate = (updatedGrad: GraduateRecord) => {
    const updatedGrads = graduates.map(g => g.id === updatedGrad.id ? updatedGrad : g);
    setGraduates(updatedGrads);
    saveGraduates(updatedGrads);
  };

  const handleArchiveGraduate = (id: number) => {
    const updatedGrads = graduates.map(g =>
      g.id === id ? { ...g, status: 'Archived' as const } : g
    );
    setGraduates(updatedGrads);
    saveGraduates(updatedGrads);
    toast.success('SIS record archived successfully.');
  };

  const handleVerifyIdentity = (id: number) => {
    const updatedGrads = graduates.map(g =>
      g.id === id ? { ...g, identityVerified: true } : g
    );
    setGraduates(updatedGrads);
    saveGraduates(updatedGrads);
    toast.success('Identity status verified successfully!');
  };

  const handleBatchInsert = (records: any[]) => {
    const nextIdStart = graduates.length + 1;
    const newGrads: GraduateRecord[] = records.map((r, index) => ({
      id: nextIdStart + index,
      studentId: r.studentId,
      fullName: r.fullName,
      email: r.email,
      department: r.department,
      graduationYear: r.graduationYear,
      cgpa: r.cgpa,
      identityVerified: true,
      status: 'Active'
    }));

    const updatedGrads = [...newGrads, ...graduates];
    setGraduates(updatedGrads);
    saveGraduates(updatedGrads);
  };

  const handleVerifyRequestAction = (id: number, status: 'Approved' | 'Rejected') => {
    const updatedVerifications = verifications.map(req =>
      req.id === id ? { ...req, status } : req
    );
    setVerifications(updatedVerifications);
    saveVerifications(updatedVerifications);

    // If approved, update identityVerified flag in graduates database
    if (status === 'Approved') {
      const targetRequest = verifications.find(req => req.id === id);
      if (targetRequest) {
        const updatedGrads = graduates.map(g =>
          g.studentId === targetRequest.studentId ? { ...g, identityVerified: true } : g
        );
        setGraduates(updatedGrads);
        saveGraduates(updatedGrads);
      }
    }
  };

  const handleProcessDocumentAction = (id: number, status: 'Approved' | 'Rejected' | 'In Progress') => {
    const updatedDocuments = documents.map(doc =>
      doc.id === id ? { ...doc, status } : doc
    );
    setDocuments(updatedDocuments);
    saveDocumentRequests(updatedDocuments);
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
    if (activeTab === 'dashboard' && normalizedSearch) {
      // keep user in dashboard unless they explicitly search
    }
  }, [activeTab, normalizedSearch]);

useEffect(() => {
     localStorage.setItem('registrar_sidebar_collapsed', String(sidebarCollapsed));
   }, [sidebarCollapsed]);

   useEffect(() => {
     setMobileSidebarOpen(false);
     setShowNotifications(false);
   }, [activeTab]);

   const handleLogout = () => {
     localStorage.removeItem('authToken');
     localStorage.removeItem('refreshToken');
     localStorage.removeItem('user');
     window.location.href = '/login';
   };


   return (
    <div className="role-shell admin-shell min-h-screen overflow-x-hidden bg-[var(--bg-page)] font-['Inter',sans-serif] text-[var(--text-primary)] antialiased">
      <Toaster position="top-right" reverseOrder={false} />

      {mobileSidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/45 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar Navigation - Fixed width, collapsible */}
      <aside className={`fixed left-0 top-0 z-40 flex h-dvh w-64 flex-col shadow-2xl md:translate-x-0 bg-[#003366] transition-all duration-300 ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${sidebarCollapsed ? 'md:w-20' : 'md:w-64'}`}>
        <div className={`p-6 mt-6 ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
          <div className={`flex items-center ${sidebarCollapsed ? '' : 'gap-3'}`}>
            <img
              alt="ASTU Official Logo"
              className="h-10 w-10 object-contain drop-shadow-lg rounded-lg"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6deuYLZHNJiVCdbEUR2-fizVXzbqqy4MUBUQxxpgQcUdXNPyUaH_PmuawCgALD_doph1Fn2l0Qm3sEDaMoPuc2lMztO55CYrFDQZJjGQzLnLeSbraPgATab7DFeDHzQBXZ701F8IpJHwziWElvPY8ZCQ3zP6XJTuIzhgJQf-M-iSJw2mdrDUtfp4ha63XRYBjxmAonsb8n_vVPC8oR_VPGkiQfTNFY90SVNbxfDuq0vglrtVAwyP7P6GW9uQKJ7XaUGNCpUhOEFwH"
            />
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-lg font-bold text-white">ASTU Registrar</h1>
                <p className="text-[10px] text-astu-green uppercase tracking-widest font-extrabold">Management Hub</p>
              </div>
            )}
          </div>
        </div>

        <nav className="mt-8 flex-grow overflow-y-auto">
          <div className="space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', activeColor: 'text-astu-green bg-white/10 border-l-4 border-astu-green' },
              { id: 'management', label: 'Management Hub', icon: 'dashboard_customize', activeColor: 'text-astu-green bg-white/10 border-l-4 border-astu-green' },
              { id: 'records', label: 'Alumni Records', icon: 'people', activeColor: 'text-astu-green bg-white/10 border-l-4 border-astu-green' },
              { id: 'data_integration', label: 'Batch Scaffolding', icon: 'cloud_upload', activeColor: 'text-astu-green bg-white/10 border-l-4 border-astu-green' },
              { id: 'verification', label: 'Registration Verifications', icon: 'verified_user', activeColor: 'text-astu-green bg-white/10 border-l-4 border-astu-green' },
              { id: 'documents', label: 'Document Queue', icon: 'description', activeColor: 'text-astu-green bg-white/10 border-l-4 border-astu-green' },
              { id: 'surveys', label: 'Tracer Surveys', icon: 'assignment', activeColor: 'text-astu-green bg-white/10 border-l-4 border-astu-green' },
              { id: 'reporting', label: 'Reports & Export', icon: 'analytics', activeColor: 'text-astu-green bg-white/10 border-l-4 border-astu-green' },
              { id: 'messages', label: 'Internal Messaging', icon: 'forum', activeColor: 'text-astu-green bg-white/10 border-l-4 border-astu-green' }
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
              onClick={() => setActiveTab('reporting')}
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
                onClick={() => setActiveTab('reporting')}
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
       <main className={`flex min-h-screen flex-col justify-between transition-[margin-left] duration-300 ease-in-out ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
         <div>
           {/* Header bar */}
           <header
             className="sticky top-0 z-20 flex h-16 items-center justify-between border-b px-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:px-6"
             style={{
               background: 'var(--bg-navbar)',
               borderColor: 'var(--border-color)',
             }}
           >
             <div className="flex min-w-0 items-center gap-3">
               <button
                 type="button"
                 onClick={() => setSidebarCollapsed((value) => !value)}
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
               <div className="min-w-0 space-y-0.5">
                 <div className="flex items-center gap-2 text-[13px] font-medium text-[var(--text-secondary)]">
                   <span>Registrar</span>
                   <span>/</span>
                   <span>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace(/_/g, ' ')}</span>
                 </div>
                 <h1 className="truncate text-[16px] font-semibold tracking-tight text-[var(--text-primary)]">
                   {activeTab === 'dashboard' ? 'Dashboard' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace(/_/g, ' ')}
                 </h1>
               </div>
             </div>

            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <label
                className="group hidden h-11 w-[420px] max-w-[36vw] items-center rounded-full border bg-[#F3F5FA] px-3 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 md:flex focus-within:border-[#003580] focus-within:ring-2 focus-within:ring-[#003580]/10 dark:bg-[#1E2130]"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <span className="mr-2 inline-flex h-5 w-5 items-center justify-center text-[#8FA3BF]">
                  <Search className="h-4.5 w-4.5 flex-none" />
                </span>
                <input
                  type="text"
                  placeholder="Search SIS records, requests, documents..."
                  className="w-full bg-transparent outline-none placeholder:text-[#7C879D] dark:placeholder:text-[#97A0B8]"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (activeTab === 'dashboard' && e.target.value.trim().length > 1) {
                      setActiveTab('records');
                    }
                  }}
                />
              </label>

              {/* Dark Mode Toggle */}
              <button
                type="button"
                onClick={() => {
                  setDarkMode(!darkMode);
                  toast.success(darkMode ? 'Light Theme activated!' : 'Premium Dark Theme activated!');
                }}
                className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] text-[var(--text-secondary)] hover:bg-black/5"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              {/* Notification Bell */}
              <div className="relative" data-admin-notifications>
                <button
                  type="button"
                  onClick={() => setShowNotifications((v) => !v)}
                  className="relative inline-flex h-9 w-9 items-center justify-center rounded-[8px] text-[var(--text-secondary)] hover:bg-black/5"
                >
                  <Bell className="h-4 w-4" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute right-0.5 top-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#E24B4A] text-[9px] font-semibold leading-none text-white">
                      {unreadNotificationsCount}
                    </span>
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
                        <button
                          onClick={handleClearNotifications}
                          className="text-xs font-semibold text-[#E24B4A] hover:underline"
                        >
                          Clear All
                        </button>
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
                      <button type="button" className="text-sm font-semibold text-[#003580] hover:underline">
                        View all notifications →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Button with Initials (Admin Style) */}
              <div className="relative" data-admin-menu>
                <button
                  type="button"
                  className="flex items-center gap-3 rounded-[8px] border bg-[var(--bg-card)] px-2.5 py-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#003580] text-xs font-semibold text-white">
                    AA
                  </div>
                  <div className="hidden text-left sm:block">
                    <div className="text-sm font-medium text-[var(--text-primary)]">Dr. Abebe Assefa</div>
                    <div className="text-[11px] text-[var(--text-secondary)]">Dean of Registrar</div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>
              </div>
            </div>
          </header>

          {/* Dynamic tabs routing */}
          <div className="flex-grow">
            {activeTab === 'management' && (
              <section className="space-y-6 p-4 md:p-6">
                <div className="rounded-[20px] border border-[var(--border-color)] bg-[linear-gradient(135deg,#003580,#0f4f86,#1D9E75)] p-5 text-white md:p-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">Registrar management</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">Manage verification, clearance, certificates, and migration</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/85">
                    Digital transcript verification, graduate clearance, certificate verification, student-to-alumni automation, graduation batches, and academic history checks.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {registrarManagementActions.map((action) => (
                    <button key={action.title} onClick={() => setActiveTab(action.tab)} className={`rounded-[10px] border p-5 text-left shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all hover:border-[#003580]/30 ${darkMode ? 'border-slate-800 bg-slate-900' : 'border-gray-200 bg-white'}`}>
                      <span className="material-symbols-outlined rounded-[8px] bg-[#003580]/10 p-2 text-[#003580]">{action.icon}</span>
                      <h3 className="mt-4 text-sm font-semibold text-gray-900">{action.title}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-gray-500">{action.desc}</p>
                      <span className="mt-4 inline-flex rounded-[8px] bg-[#003580] px-3 py-2 text-xs font-semibold text-white">Manage / Create</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {activeTab === 'dashboard' && (
              <div className="space-y-6">

                {/* Welcome banner */}
                <section className="rounded-[20px] border border-[var(--border-color)] bg-[linear-gradient(135deg,#003580,#0f4f86,#1D9E75)] p-5 text-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] md:p-6">
                  <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                    <div className="max-w-2xl space-y-2">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">ASTU SIS integration</span>
                      <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Institutional Registrar Panel</h2>
                      <p className="text-sm leading-relaxed text-white/85">
                        Process batch records uploads, review pending alumni requests, authorize transcript releases, and export Stata-ready census datasets.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('data_integration')}
                      className="flex items-center gap-1.5 whitespace-nowrap rounded-md bg-[#E24B4A] px-4 py-2.5 text-xs font-bold tracking-wide text-white shadow-sm transition-all hover:bg-[#c94140]"
                    >
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
                    <button
                      onClick={() => setActiveTab('reporting')}
                      className="inline-flex items-center gap-1.5 rounded-md bg-astu-navy px-3 py-2 text-xs font-bold text-white transition-all hover:bg-astu-navy/90"
                    >
                      <span className="material-symbols-outlined text-base">ios_share</span>
                      Export reports
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.2fr]">
                    <div className="grid grid-cols-2 gap-3">
                      {registrarCommandSignals.map((signal) => (
                        <button
                          key={signal.label}
                          onClick={() => setActiveTab(signal.tab)}
                          className={`rounded-[10px] border p-4 text-left transition-all hover:border-astu-navy/30 hover:shadow-sm ${darkMode ? 'border-slate-800 bg-slate-950/40' : 'border-gray-200 bg-gray-50 hover:bg-white'}`}
                        >
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

                {/* Stats Cards Grid */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {stats.map((stat) => (
                    <div
                      key={stat.id}
                      onMouseEnter={() => setHoveredCard(stat.id)}
                      onMouseLeave={() => setHoveredCard(null)}
                      onClick={() => {
                        if (stat.id === 1) setActiveTab('records');
                        if (stat.id === 3) setActiveTab('verification');
                        if (stat.id === 4) setActiveTab('documents');
                      }}
                      className={`group relative cursor-pointer overflow-hidden rounded-[10px] border border-gray-200/60 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-300 ${hoveredCard === stat.id ? '-translate-y-1 shadow-md' : ''}`}
                    >
                      <div className="relative z-10 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="p-2.5 rounded-xl bg-astu-navy/10 text-astu-navy">
                            <span className="material-symbols-outlined text-2xl font-bold">{stat.icon}</span>
                          </div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-astu-green bg-astu-green/10 px-2 py-0.5 rounded">SIS Verified</span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{stat.label}</p>
                          <p className="text-3xl font-extrabold text-astu-navy mt-1">{stat.value}</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 font-semibold pt-1 border-t">
                          <span className="material-symbols-outlined text-base font-bold text-astu-green">{stat.trendIcon}</span>
                          {stat.trend}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {[
                    { icon: 'people', title: 'SIS Records Management', desc: 'Browse full lists, edit academic GPAs, or archive old folders.', tab: 'records' },
                    { icon: 'cloud_upload', title: 'Excel/CSV Scaffolding', desc: 'Process bulk file datasets and send automated sign-up emails.', tab: 'data_integration' },
                    { icon: 'description', title: 'Document Processing Queue', desc: 'Authorize official transcripts and degree verifications.', tab: 'documents' }
                  ].map((act, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActiveTab(act.tab)}
                      className="group cursor-pointer rounded-[10px] border border-gray-200/60 bg-white p-5 text-center transition-all hover:border-astu-navy/30 hover:shadow-md space-y-4"
                    >
                      <div className="mx-auto w-12 h-12 rounded-2xl bg-astu-navy/10 flex items-center justify-center group-hover:bg-astu-navy/20 transition-colors text-astu-navy">
                        <span className="material-symbols-outlined text-2xl font-bold">{act.icon}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">{act.title}</h3>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{act.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <section className="rounded-[10px] border border-gray-200/60 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                  <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Registrar Feature Control</h3>
                      <p className="mt-1 text-xs text-gray-500">Verification, documents, tracer monitoring, accreditation, and audit readiness.</p>
                    </div>
                    <span className="rounded-md border border-astu-green/20 bg-astu-green/10 px-2.5 py-1 text-[11px] font-semibold text-astu-green">
                      Accreditation ready
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {registrarControlCards.map((card) => (
                      <button
                        key={card.title}
                        onClick={() => setActiveTab(card.tab)}
                        className="rounded-[10px] border border-gray-200 bg-gray-50 p-4 text-left transition-all hover:border-astu-navy/30 hover:bg-white hover:shadow-sm"
                      >
                        <span className="material-symbols-outlined rounded-full bg-astu-navy/10 p-2 text-astu-navy">{card.icon}</span>
                        <h4 className="mt-3 text-sm font-bold text-gray-900">{card.title}</h4>
                        <p className="mt-1 text-xs leading-relaxed text-gray-500">{card.desc}</p>
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                    {complianceSignals.map((signal) => (
                      <div key={signal.label} className="rounded-[10px] border border-gray-200 bg-white p-4">
                        <div className="flex items-center gap-2">
                          <span className={`material-symbols-outlined ${signal.tone}`}>{signal.icon}</span>
                          <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">{signal.label}</p>
                        </div>
                        <p className="mt-2 text-lg font-extrabold text-gray-900">{signal.value}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Charts & Graphs Section */}
                <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <AnalyticsChart
                    type="bar"
                    title="Graduate Import Trends"
                    subtitle="Volume of graduates synchronized from SIS per batch"
                    data={[
                      { batch: '2021', graduates: 3200 },
                      { batch: '2022', graduates: 3450 },
                      { batch: '2023', graduates: 3800 },
                      { batch: '2024', graduates: 4100 },
                      { batch: '2025', graduates: 4324 },
                    ]}
                    xKey="batch"
                    series={[{ key: 'graduates', label: 'Synced Graduates' }]}
                    height={200}
                    darkMode={darkMode}
                  />
                  <AnalyticsChart
                    type="line"
                    title="Tracer Survey Submissions Rate"
                    subtitle="Interactive timeline tracking response rate percentage"
                    data={[
                      { month: 'Jan', rate: 45 },
                      { month: 'Feb', rate: 58 },
                      { month: 'Mar', rate: 68 },
                      { month: 'Apr', rate: 76 },
                      { month: 'May', rate: 84 },
                    ]}
                    xKey="month"
                    series={[{ key: 'rate', label: 'Response Rate %' }]}
                    height={200}
                    darkMode={darkMode}
                  />
                </div>

                {/* Registrar Activity Timeline */}
                <div className="mt-6">
                  <ActivityTimeline
                    activities={[
                      { id: 1, type: 'verification', title: 'Alumni registration approved', description: 'Abebe Bikila successfully cleared identity checks.', timestamp: '1 hour ago', unread: true },
                      { id: 2, type: 'document', title: 'Transcript verification complete', description: 'Dean approved digital credential hash for student ID UG/12839/14.', timestamp: '3 hours ago', unread: true },
                      { id: 3, type: 'broadcast', title: 'Global tracer study published', description: 'Launched 24-month feedback inquiry to Class of 2024.', timestamp: '1 day ago' },
                      { id: 4, type: 'alert', title: 'SIS Database backup', description: 'Cloud replication completed successfully.', timestamp: '2 days ago' }
                    ] as ActivityEntry[]}
                    darkMode={darkMode}
                    onViewAll={() => setActiveTab('messages')}
                  />
                </div>

              </div>
            )}

            {activeTab === 'records' && (
              <RecordsTab
                graduates={filteredGraduates}
                onAddGraduate={handleAddGraduate}
                onEditGraduate={handleEditGraduate}
                onArchiveGraduate={handleArchiveGraduate}
                onVerifyIdentity={handleVerifyIdentity}
              />
            )}

            {activeTab === 'data_integration' && (
              <DataIntegrationTab
                onBatchInsert={handleBatchInsert}
              />
            )}

            {activeTab === 'verification' && (
              <VerificationTab
                verifications={filteredVerifications}
                onVerify={handleVerifyRequestAction}
              />
            )}

            {activeTab === 'documents' && (
              <DocumentProcessingTab
                documents={filteredDocuments}
                onProcessDocument={handleProcessDocumentAction}
              />
            )}

            {activeTab === 'surveys' && (
              <SurveyManagement />
            )}

            {activeTab === 'reporting' && (
              <ReportingTab />
            )}

            {activeTab === 'messages' && (
              <MessagingTab darkMode={darkMode} />
            )}
          </div>
        </div>

        {/* Premium Footer Enhancement */}
        <footer className="mt-12 bg-astu-navy text-slate-300 py-10 px-6 border-t border-white/10 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img
                  alt="ASTU Official Emblem"
                  className="h-10 w-10 object-contain rounded-lg bg-white/10 p-1"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6deuYLZHNJiVCdbEUR2-fizVXzbqqy4MUBUQxxpgQcUdXNPyUaH_PmuawCgALD_doph1Fn2l0Qm3sEDaMoPuc2lMztO55CYrFDQZJjGQzLnLeSbraPgATab7DFeDHzQBXZ701F8IpJHwziWElvPY8ZCQ3zP6XJTuIzhgJQf-M-iSJw2mdrDUtfp4ha63XRYBjxmAonsb8n_vVPC8oR_VPGkiQfTNFY90SVNbxfDuq0vglrtVAwyP7P6GW9uQKJ7XaUGNCpUhOEFwH"
                />
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
  );
};

export default RegistrarDashboard;
