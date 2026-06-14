import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../shared/contexts/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { Bell, ChevronDown, HelpCircle, LogOut, Menu, Moon, Search, Sun } from 'lucide-react';
import HelpCenter from '../../../shared/components/HelpCenter';

import { GraduateRecord, VerificationRequest, DocumentProcessingRequest } from '../types/registrar.types';
import { registrarService } from '../services/registrar.service';

import { RecordsTab } from '../components/RecordsTab';
import { DataIntegrationTab } from '../components/DataIntegrationTab';
import { VerificationTab } from '../components/VerificationTab';
import { DocumentProcessingTab } from '../components/DocumentProcessingTab';

const RegistrarDashboard = () => {
   const { logout } = useAuth();
   const [activeTab, setActiveTab] = useState<string>('dashboard');
   const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('registrar_sidebar_collapsed') === 'true');
   const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

   const [searchQuery, setSearchQuery] = useState('');
   const normalizedSearch = useMemo(() => searchQuery.trim().toLowerCase(), [searchQuery]);

   const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  const [showNotifications, setShowNotifications] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: number; text: string; unread: boolean; time: string }>>([]);

  const [graduates, setGraduates] = useState<GraduateRecord[]>([]);
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [documents, setDocuments] = useState<DocumentProcessingRequest[]>([]);

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
      const haystack = `${d.alumniId} ${d.documentType} ${d.status} ${d.createdAt}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [documents, normalizedSearch]);

  const stats = [
    {
      id: 1, label: 'SIS Graduate DB', value: totalGraduatesCount.toLocaleString(),
      color: 'astu-navy', icon: 'database', bgGradient: 'from-blue-50 to-indigo-50',
      trend: '', trendIcon: 'trending_up', trendColor: 'astu-green',
    },
    {
      id: 2, label: 'Graduate Records', value: verifiedAlumniCount.toLocaleString(),
      color: 'astu-green', icon: 'verified_user', bgGradient: 'from-emerald-50 to-green-50',
      trend: '', trendIcon: 'check_circle', trendColor: 'astu-green',
    },
    {
      id: 3, label: 'Pending Approvals', value: `${pendingVerificationsCount}`,
      color: 'astu-red', icon: 'gavel', bgGradient: 'from-red-50 to-orange-50',
      trend: 'Awaiting confirmation', trendIcon: 'schedule', trendColor: 'astu-red',
    },
    {
      id: 4, label: 'Document Queue', value: `${documentRequestsCount}`,
      color: 'purple-600', icon: 'description', bgGradient: 'from-purple-50 to-pink-50',
      trend: 'Requires processing', trendIcon: 'schedule', trendColor: 'astu-red',
    },
  ];

  const commandSignals = [
    { label: 'Records', value: totalGraduatesCount.toString(), icon: 'database', tab: 'records', tone: 'text-astu-green' },
    { label: 'Approval queue', value: pendingVerificationsCount.toString(), icon: 'rule', tab: 'verification', tone: 'text-astu-red' },
    { label: 'Document SLA', value: documentRequestsCount > 0 ? 'Action' : 'Clear', icon: 'timer', tab: 'documents', tone: documentRequestsCount > 0 ? 'text-astu-red' : 'text-astu-green' },
  ];

  let idCounter = Date.now();
  const nextStrId = () => String(idCounter++);

  const handleAddGraduate = (newGradDetails: Omit<GraduateRecord, 'id'>) => {
    const newGrad: GraduateRecord = {
      id: nextStrId(), ...newGradDetails,
    };
    const updatedGrads = [newGrad, ...graduates];
    setGraduates(updatedGrads);

    const newVerRequest: VerificationRequest = {
      id: nextStrId(), studentId: newGradDetails.studentId,
      fullName: newGradDetails.fullName, email: newGradDetails.email,
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
      id: nextStrId(), studentId: r.studentId, fullName: r.fullName, email: r.email,
      department: r.department, departmentCode: r.department.substring(0, 3).toUpperCase(),
      graduationYear: parseInt(r.graduationYear) || 0, cgpa: parseFloat(r.cgpa) || 0,
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
     window.addEventListener('mousedown', handleClick);
     return () => window.removeEventListener('mousedown', handleClick);
   }, []);

   const handleLogout = () => { logout(); toast.success('Logged out successfully'); window.location.href = '/login'; };

   const menu = (
     <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-[10px] border border-[var(--border-color)] bg-[var(--bg-card)] p-1 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
       <div className="px-3 py-3">
         <div className="text-sm font-semibold text-[var(--text-primary)]">Registrar Office</div>
         <div className="mt-1"><span className="inline-flex items-center rounded-md bg-[#003366]/10 px-2 py-0.5 text-xs font-medium text-[#003366] border border-[#003366]/15">Registrar</span></div>
       </div>
       <div className="my-1 h-px bg-[var(--border-color)]" />
       <button type="button" onClick={() => { setMenuOpen(false); setHelpOpen(true); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)]">
         <HelpCircle className="h-4 w-4" /> Help
       </button>
       <button type="button" onClick={() => { setMenuOpen(false); handleLogout(); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[#E24B4A] hover:bg-rose-50">
         <LogOut className="h-4 w-4" /> Logout
       </button>
     </div>
   );

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', badge: null },
    { id: 'records', label: 'Alumni Records', icon: 'people', badge: totalGraduatesCount > 0 ? totalGraduatesCount.toLocaleString() : null },
    { id: 'data_integration', label: 'Batch Import', icon: 'cloud_upload', badge: null },
    { id: 'verification', label: 'Verifications', icon: 'verified_user', badge: pendingVerificationsCount > 0 ? pendingVerificationsCount : null },
    { id: 'documents', label: 'Document Queue', icon: 'description', badge: documentRequestsCount > 0 ? documentRequestsCount : null },
  ];

  return (
    <div className="role-shell admin-shell min-h-screen overflow-x-hidden bg-[var(--bg-page)] font-['Inter',sans-serif] text-[var(--text-primary)] antialiased">
      <style>{`
        @keyframes float-particle { 0%,100% { transform:translateY(0) translateX(0); opacity:0.4; } 25% { transform:translateY(-15px) translateX(8px); opacity:0.6; } 50% { transform:translateY(-8px) translateX(-4px); opacity:0.3; } 75% { transform:translateY(-22px) translateX(12px); opacity:0.5; } }
        @keyframes gradient-shift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .sidebar-particle { animation: float-particle 6s ease-in-out infinite; }
        .sidebar-particle:nth-child(2) { animation-delay: 2s; animation-duration: 8s; }
        .sidebar-particle:nth-child(3) { animation-delay: 4s; animation-duration: 7s; }
        .nav-btn { transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .nav-btn:hover { transform: translateX(3px); }
      `}</style>

      {mobileSidebarOpen && (
        <button type="button" aria-label="Close navigation" onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/45 backdrop-blur-sm md:hidden" />
      )}

      <aside className={`fixed left-0 top-0 z-40 flex h-dvh w-64 flex-col overflow-hidden shadow-2xl transition-all duration-300 md:translate-x-0 bg-gradient-to-b from-[#001a33] via-[#002a55] to-[#003366] ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${sidebarCollapsed ? 'md:w-20' : 'md:w-64'}`}>
        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.02)_0%,transparent_40%,rgba(0,107,60,0.04)_60%,transparent_100%)] bg-[length:400%_400%] animate-[gradient-shift_8s_ease_infinite]" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[15%] left-[20%] w-2 h-2 rounded-full bg-emerald-400/30 sidebar-particle" />
          <div className="absolute top-[45%] right-[25%] w-1.5 h-1.5 rounded-full bg-[#FFD700]/25 sidebar-particle" />
          <div className="absolute bottom-[30%] left-[30%] w-2.5 h-2.5 rounded-full bg-blue-400/20 sidebar-particle" />
        </div>

        <div className="relative z-10 p-5 border-b border-white/10">
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/15 shadow-lg">
                <img alt="ASTU Logo" className="h-8 w-8 object-contain rounded-md"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6deuYLZHNJiVCdbEUR2-fizVXzbqqy4MUBUQxxpgQcUdXNPyUaH_PmuawCgALD_doph1Fn2l0Qm3sEDaMoPuc2lMztO55CYrFDQZJjGQzLnLeSbraPgATab7DFeDHzQBXZ701F8IpJHwziWElvPY8ZCQ3zP6XJTuIzhgJQf-M-iSJw2mdrDUtfp4ha63XRYBjxmAonsb8n_vVPC8oR_VPGkiQfTNFY90SVNbxfDuq0vglrtVAwyP7P6GW9uQKJ7XaUGNCpUhOEFwH" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[#001a33] shadow-lg animate-pulse" />
            </div>
            {!sidebarCollapsed && <div>
              <h1 className="text-base font-extrabold text-white tracking-tight">ASTU Registrar</h1>
              <p className="text-[9px] text-emerald-400 uppercase tracking-[0.2em] font-extrabold">Records Hub</p>
            </div>}
          </div>
        </div>

        <nav className="relative z-10 flex-grow px-3 py-4 overflow-y-auto scrollbar-thin">
          {!sidebarCollapsed && <p className="px-3 mb-2 text-[9px] font-extrabold text-white/30 uppercase tracking-[0.2em]">Records</p>}
          <div className="space-y-0.5">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`nav-btn w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 text-left group ${sidebarCollapsed ? 'justify-center' : 'gap-3'} ${activeTab === item.id ? 'bg-white/15 text-white font-bold shadow-lg shadow-black/10 backdrop-blur-sm ring-1 ring-white/10' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all ${activeTab === item.id ? 'bg-emerald-400/20 text-emerald-400' : 'bg-white/5 text-white/40 group-hover:text-white/70'}`}>
                  <span className="material-symbols-outlined">{item.icon}</span>
                </span>
                {!sidebarCollapsed && (
                  <>
                    <span className="text-sm font-medium flex-1 truncate">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-rose-500/20 text-rose-300 text-[9px] font-extrabold ring-1 ring-rose-500/30 shadow-lg">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            ))}
          </div>
        </nav>

        <div className="relative z-10 p-4 border-t border-white/10">
          <button onClick={() => setHelpOpen(true)}
            className="nav-btn w-full flex items-center px-3 py-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all group gap-3">
            <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 group-hover:text-white/70 material-symbols-outlined">help</span>
            {!sidebarCollapsed && <span className="text-sm font-medium">Help Center</span>}
          </button>
          <button onClick={handleLogout}
            className="nav-btn w-full flex items-center px-3 py-2.5 rounded-xl text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/10 transition-all group gap-3">
            <span className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center group-hover:bg-rose-500/20 material-symbols-outlined text-rose-400/70 group-hover:text-rose-400">logout</span>
            {!sidebarCollapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      <main className={`flex min-h-screen flex-col justify-between transition-[margin-left] duration-300 ease-in-out ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        <div>
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b px-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:px-6"
            style={{ background: 'var(--bg-navbar)', borderColor: 'var(--border-color)' }}>
            <div className="flex min-w-0 items-center gap-3">
              <button type="button" onClick={() => setSidebarCollapsed((v) => !v)}
                className="hidden h-10 w-10 items-center justify-center rounded-[8px] text-[var(--text-secondary)] hover:bg-black/5 md:inline-flex" title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
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
              <label className="group hidden h-11 w-[420px] max-w-[36vw] items-center rounded-full border bg-[#F3F5FA] px-3 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_1px_2px_rgba(0,0,0,0.04)] transition-all md:flex focus-within:border-[#003580] focus-within:ring-2 focus-within:ring-[#003580]/10 dark:bg-[#1E2130]"
                style={{ borderColor: 'var(--border-color)' }}>
                <span className="mr-2 inline-flex h-5 w-5 items-center justify-center text-[#8FA3BF]">
                  <Search className="h-4.5 w-4.5 flex-none" />
                </span>
                <input type="text" placeholder="Search records, verifications, documents..." value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); if (activeTab === 'dashboard' && e.target.value.trim().length > 1) setActiveTab('records'); }}
                  className="w-full bg-transparent outline-none placeholder:text-[#7C879D] dark:placeholder:text-[#97A0B8]" />
              </label>

              <button type="button" onClick={() => { setDarkMode(!darkMode); toast.success(darkMode ? 'Light theme activated' : 'Dark theme activated'); }}
                className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] text-[var(--text-secondary)] hover:bg-black/5" aria-label="Toggle dark mode">
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

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
                        <button onClick={() => setNotifications([])} className="text-xs font-semibold text-[#E24B4A] hover:underline">Clear All</button>
                      </div>
                    </div>
                    <div className="space-y-1 p-2">
                      {notifications.length > 0 ? notifications.map((notif) => (
                        <div key={notif.id} className="flex items-start gap-3 rounded-md px-2 py-2 hover:bg-black/5">
                          <span className={`mt-1 h-2.5 w-2.5 rounded-full ${notif.unread ? 'bg-[#003580]' : 'bg-gray-300'}`} />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-[var(--text-primary)]">{notif.text}</p>
                            <p className="text-xs text-[var(--text-secondary)]">{notif.time}</p>
                          </div>
                        </div>
                      )) : <p className="px-2 py-6 text-center text-sm text-[var(--text-secondary)]">No new alerts.</p>}
                    </div>
                    <div className="border-t border-[var(--border-color)] px-4 py-3">
                      <button type="button" className="text-sm font-semibold text-[#003580] hover:underline">View all notifications →</button>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative" data-admin-menu>
                <button type="button" onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-3 rounded-[8px] border bg-[var(--bg-card)] px-2.5 py-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#003580] to-[#004d99] text-xs font-semibold text-white shadow-sm">RO</div>
                  <div className="hidden text-left sm:block">
                    <div className="text-sm font-medium text-[var(--text-primary)]">Registrar Office</div>
                    <div className="text-[11px] text-[var(--text-secondary)]">Registrar</div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>
                {menuOpen && menu}
              </div>
            </div>
          </header>

          <div className="flex-grow bg-[var(--bg-page)]" style={{ animation: 'astu-admin-fade-in 150ms ease-out' }}>
            {activeTab === 'dashboard' && (
              <div className="space-y-6 p-4 md:p-6">
                <section className="rounded-[20px] border border-[var(--border-color)] bg-[linear-gradient(135deg,#003580,#233876,#1D9E75)] p-5 text-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] md:p-6">
                  <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                    <div className="max-w-2xl space-y-2">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">ASTU registrar office</span>
                      <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">SIS Graduate Records Portal</h2>
                      <p className="text-sm leading-relaxed text-white/85">
                        Manage verified alumni records, process verifications, and handle document requests.
                        <span className="font-bold text-astu-green"> {totalGraduatesCount} records</span> in the database.
                      </p>
                    </div>
                    <button onClick={() => setActiveTab('data_integration')}
                      className="flex items-center gap-1.5 whitespace-nowrap rounded-md bg-[#E24B4A] px-4 py-2.5 text-xs font-bold tracking-wide text-white shadow-sm transition-all hover:bg-[#c94140]">
                      <span className="material-symbols-outlined">cloud_upload</span>
                      Import Records
                    </button>
                  </div>
                </section>

                <section className="rounded-[10px] border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.2fr]">
                    <div className="grid grid-cols-2 gap-3">
                      {commandSignals.map((signal) => (
                        <button key={signal.label} onClick={() => setActiveTab(signal.tab)}
                          className={`rounded-[10px] border p-4 text-left transition-all hover:border-astu-navy/30 hover:shadow-sm ${darkMode ? 'border-slate-800 bg-slate-950/40' : 'border-gray-200 bg-gray-50 hover:bg-white'}`}>
                          <div className="flex items-center gap-2">
                            <span className={`material-symbols-outlined ${signal.tone}`}>{signal.icon}</span>
                            <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">{signal.label}</p>
                          </div>
                          <p className="mt-2 text-2xl font-extrabold">{signal.value}</p>
                        </button>
                      ))}
                    </div>
                    <div className={`rounded-[10px] border p-4 ${darkMode ? 'border-slate-800 bg-slate-950/40' : 'border-gray-200 bg-white'}`}>
                      <h4 className="text-sm font-bold mb-3">Quick Actions</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setActiveTab('verification')} className="p-3 bg-astu-navy text-white rounded-xl text-xs font-bold hover:opacity-90">Verify Alumni</button>
                        <button onClick={() => setActiveTab('documents')} className="p-3 bg-astu-green text-white rounded-xl text-xs font-bold hover:opacity-90">Process Docs</button>
                        <button onClick={() => setActiveTab('data_integration')} className="p-3 bg-purple-600 text-white rounded-xl text-xs font-bold hover:opacity-90">Batch Import</button>
                        <button onClick={() => setActiveTab('records')} className="p-3 bg-astu-red text-white rounded-xl text-xs font-bold hover:opacity-90">View Records</button>
                      </div>
                    </div>
                  </div>
                </section>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {stats.map((stat) => (
                    <div key={stat.id} onClick={() => { if (stat.id === 1 || stat.id === 2) setActiveTab('records'); if (stat.id === 3) setActiveTab('verification'); if (stat.id === 4) setActiveTab('documents'); }}
                      className={`group relative cursor-pointer overflow-hidden rounded-[10px] border p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-300 ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200/60 text-gray-900'}`}>
                      <div className="relative z-10 space-y-3">
                        <div className="p-2.5 rounded-xl bg-astu-navy/10 text-astu-navy">
                          <span className="material-symbols-outlined text-2xl font-bold">{stat.icon}</span>
                        </div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{stat.label}</p>
                        <p className="text-3xl font-extrabold text-astu-navy mt-1">{stat.value}</p>
                        {stat.trend && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 font-semibold pt-1 border-t border-gray-100/5">
                            <span className="material-symbols-outlined text-base font-bold text-astu-green">{stat.trendIcon}</span>
                            {stat.trend}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                    <section className={`rounded-[10px] border p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200/60'}`}>
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold">Pending Verifications</h3>
                          <p className="text-xs text-gray-500">Alumni registration and graduation status requests</p>
                        </div>
                        <button onClick={() => setActiveTab('verification')} className="text-xs font-bold text-astu-navy hover:underline">View All &rarr;</button>
                      </div>
                      {verifications.length > 0 ? (
                        <div className="space-y-4">
                          {verifications.slice(0, 3).map((v) => (
                            <div key={v.id} className={`rounded-[10px] border p-4 ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50/50 border-gray-200'}`}>
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-bold text-sm">{v.fullName}</h4>
                                  <p className="text-xs text-gray-500">{v.studentId}</p>
                                </div>
                                <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded ${v.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : v.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{v.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                      <span className="material-symbols-outlined text-4xl mb-2">verified_user</span>
                      <p className="text-sm font-medium">No pending verifications</p>
                      <p className="text-xs mt-1">New verification requests will appear here.</p>
                    </div>
                  )}
                </section>

                <section className={`rounded-[10px] border p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200/60'}`}>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold">Document Queue</h3>
                      <p className="text-xs text-gray-500">Transcript and degree verification requests</p>
                    </div>
                    <button onClick={() => setActiveTab('documents')} className="text-xs font-bold text-astu-navy hover:underline">View All &rarr;</button>
                  </div>
                  {documents.length > 0 ? (
                    <div className="space-y-4">
                      {documents.slice(0, 3).map((d) => (
                        <div key={d.id} className={`rounded-[10px] border p-4 ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50/50 border-gray-200'}`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-sm">{d.documentType}</h4>
                              <p className="text-xs text-gray-500">{d.alumniId}</p>
                            </div>
                            <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded ${d.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : d.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{d.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                      <span className="material-symbols-outlined text-4xl mb-2">description</span>
                      <p className="text-sm font-medium">No document requests</p>
                      <p className="text-xs mt-1">Student document requests will appear here.</p>
                    </div>
                  )}
                </section>
              </div>
            )}

            {activeTab === 'records' && (
              <RecordsTab
                graduates={filteredGraduates}
                onAddGraduate={handleAddGraduate}
                onEditGraduate={handleEditGraduate}
                darkMode={darkMode}
              />
            )}
            {activeTab === 'data_integration' && (
              <DataIntegrationTab
                onBatchInsert={handleBatchInsert}
                darkMode={darkMode}
              />
            )}
            {activeTab === 'verification' && (
              <VerificationTab
                verifications={filteredVerifications}
                onVerify={handleVerifyRequestAction}
                darkMode={darkMode}
              />
            )}
            {activeTab === 'documents' && (
              <DocumentProcessingTab
                documents={filteredDocuments}
                onProcessDocument={handleProcessDocumentAction}
                darkMode={darkMode}
              />
            )}
          </div>
        </div>
      </main>

      <HelpCenter isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
};

export default RegistrarDashboard;
