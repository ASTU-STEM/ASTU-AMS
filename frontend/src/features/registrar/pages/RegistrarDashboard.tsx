import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

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

const RegistrarDashboard = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  
  // Theme Dark / Light mode
  const [darkMode, setDarkMode] = useState(false);

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

  return (
    <div className={`min-h-screen font-body-md overflow-x-hidden flex flex-col justify-between transition-all duration-300 ${
      darkMode ? 'bg-slate-950 text-white' : 'bg-gradient-to-br from-gray-50 via-white to-gray-50 text-on-surface'
    }`}>
      <Toaster position="top-right" reverseOrder={false} />

      <div className="flex-grow">
        {/* Sidebar navigation */}
        <aside className={`fixed left-0 top-0 h-full flex flex-col z-40 shadow-2xl w-[280px] hidden md:flex transition-all duration-300 ${
          darkMode ? 'bg-slate-900 border-r border-slate-800' : 'bg-astu-navy'
        }`}>
          <div className="p-6 mt-6">
            <div className="flex items-center gap-3">
              <img
                alt="ASTU Official Logo"
                className="h-12 w-12 object-contain drop-shadow-lg rounded-lg"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6deuYLZHNJiVCdbEUR2-fizVXzbqqy4MUBUQxxpgQcUdXNPyUaH_PmuawCgALD_doph1Fn2l0Qm3sEDaMoPuc2lMztO55CYrFDQZJjGQzLnLeSbraPgATab7DFeDHzQBXZ701F8IpJHwziWElvPY8ZCQ3zP6XJTuIzhgJQf-M-iSJw2mdrDUtfp4ha63XRYBjxmAonsb8n_vVPC8oR_VPGkiQfTNFY90SVNbxfDuq0vglrtVAwyP7P6GW9uQKJ7XaUGNCpUhOEFwH"
              />
              <div>
                <h1 className="text-lg font-bold text-white">ASTU Registrar</h1>
                <p className="text-[10px] text-astu-green uppercase tracking-widest font-extrabold">Management Hub</p>
              </div>
            </div>
          </div>

          <nav className="mt-8 flex-grow px-3">
            <div className="space-y-1">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', activeColor: 'text-astu-green bg-white/10 border-l-4 border-astu-green' },
                { id: 'records', label: 'Alumni Records', icon: 'people', activeColor: 'text-astu-green bg-white/10 border-l-4 border-astu-green' },
                { id: 'data_integration', label: 'Batch Scaffolding', icon: 'cloud_upload', activeColor: 'text-astu-green bg-white/10 border-l-4 border-astu-green' },
                { id: 'verification', label: 'Registration Verifications', icon: 'verified_user', activeColor: 'text-astu-green bg-white/10 border-l-4 border-astu-green' },
                { id: 'documents', label: 'Document Queue', icon: 'description', activeColor: 'text-astu-green bg-white/10 border-l-4 border-astu-green' },
                { id: 'reporting', label: 'Reports & Export', icon: 'analytics', activeColor: 'text-astu-green bg-white/10 border-l-4 border-astu-green' },
                { id: 'messages', label: 'Internal Messaging', icon: 'forum', activeColor: 'text-astu-green bg-white/10 border-l-4 border-astu-green' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-4 px-6 py-2.5 rounded-r-xl transition-all duration-300 text-left ${
                    activeTab === item.id 
                      ? item.activeColor + ' font-bold shadow-md' 
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </nav>

          <div className="p-6 border-t border-white/10 mt-auto">
            <button 
              onClick={() => setActiveTab('reporting')}
              className="w-full flex items-center gap-4 text-slate-300 hover:text-white mb-4 transition-all duration-300 text-left"
            >
              <span className="material-symbols-outlined text-md">help</span>
              <span className="text-sm font-medium">Help Center</span>
            </button>
            <button 
              onClick={() => toast.success('Mock logout triggered.')} 
              className="w-full flex items-center gap-4 text-slate-300 hover:text-white transition-all duration-300 text-left"
            >
              <span className="material-symbols-outlined text-md">logout</span>
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="md:ml-[280px] min-h-screen flex flex-col justify-between">
          <div>
            {/* Header bar */}
            <header className={`sticky top-0 z-50 flex justify-between items-center w-full px-4 md:px-10 h-16 border-b transition-all duration-300 ${
              darkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-gray-200/50 shadow-sm'
            }`}>
              <div className="flex-1 max-w-xl">
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                  <input
                    className={`w-full pl-10 pr-4 py-2 text-sm rounded-full border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-astu-navy/20 ${
                      darkMode ? 'bg-slate-850 border-slate-700 text-white focus:bg-slate-800' : 'bg-gray-100/80 border-gray-200 focus:bg-white text-gray-900'
                    }`}
                    placeholder="Search verified records, transcripts, or graduates..."
                    type="text"
                    onChange={(e) => {
                      if (activeTab === 'dashboard' && e.target.value.trim().length > 1) {
                        setActiveTab('records');
                      }
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 ml-6 relative">
                {/* Dark Mode Toggle Switch */}
                <button
                  onClick={() => {
                    setDarkMode(!darkMode);
                    toast.success(darkMode ? 'Light Theme activated!' : 'Premium Dark Theme activated!');
                  }}
                  className={`p-2 rounded-full hover:bg-gray-100/10 transition-colors flex items-center justify-center ${
                    darkMode ? 'text-amber-400' : 'text-slate-600'
                  }`}
                  title="Toggle Dark/Light Mode"
                >
                  <span className="material-symbols-outlined text-xl">
                    {darkMode ? 'light_mode' : 'dark_mode'}
                  </span>
                </button>

                {/* Notification bell */}
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-400 hover:bg-gray-100/10 rounded-full relative transition-all duration-300 hover:scale-105"
                >
                  <span className="material-symbols-outlined">notifications</span>
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-astu-red rounded-full border-2 border-white animate-pulse"></span>
                  )}
                </button>

                {/* Notifications Dropdown card */}
                {showNotifications && (
                  <div className={`absolute right-12 top-12 w-80 border rounded-2xl shadow-xl z-50 p-4 space-y-3 ${
                    darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-900'
                  }`}>
                    <div className="flex justify-between items-center pb-2 border-b border-gray-100/10">
                      <h4 className="font-bold text-sm">Registrar Notifications</h4>
                      <button 
                        onClick={handleClearNotifications} 
                        className="text-xs text-astu-red hover:underline font-bold"
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
                        </div>
                      ))}
                      {notifications.length === 0 && (
                        <p className="text-xs text-gray-500 italic text-center py-4">No new recruit alerts.</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="h-8 w-[1px] bg-gray-250 mx-2"></div>
                
                {/* Registrar Head */}
                <div 
                  className="flex items-center gap-3 cursor-pointer hover:opacity-85 transition-opacity"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold">Dr. Abebe Assefa</p>
                    <p className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Dean of Registrar</p>
                  </div>
                  <img
                    alt="Profile"
                    className="h-10 w-10 rounded-full border-2 border-astu-navy/20 shadow-sm object-cover"
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80"
                  />
                </div>
              </div>
            </header>

            {/* Dynamic tabs routing */}
            <div className="p-4 md:p-10 flex-grow">
              {activeTab === 'dashboard' && (
                <div className="space-y-8">
                  
                  {/* Welcome banner */}
                  <section className="relative bg-gradient-to-r from-astu-navy via-emerald-900 to-emerald-950 rounded-3xl p-8 md:p-12 text-white overflow-hidden shadow-xl">
                    <div className="absolute right-0 bottom-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
                      <div className="max-w-2xl space-y-3">
                        <span className="px-3 py-1 bg-white/15 text-[#FFD700] text-xs font-bold uppercase tracking-wider rounded-full">ASTU SIS Integration</span>
                        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Institutional Registrar Panel 🏛️</h2>
                        <p className="text-sm opacity-90 leading-relaxed">
                          Process batch records uploads, review pending alumni requests, authorize transcript releases, and export Stata-ready census datasets.
                        </p>
                      </div>
                      <button 
                        onClick={() => setActiveTab('data_integration')}
                        className="bg-gradient-to-r from-astu-red to-red-600 hover:scale-105 px-6 py-3 rounded-xl font-extrabold text-xs tracking-wide text-white shadow-md transition-all whitespace-nowrap flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined">cloud_upload</span>
                        Batch Upload CSV
                      </button>
                    </div>
                  </section>

                  {/* Stats Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                        className={`relative bg-white rounded-3xl p-6 border border-gray-200/60 shadow-sm transition-all duration-300 cursor-pointer overflow-hidden group ${hoveredCard === stat.id ? '-translate-y-2 shadow-md' : ''}`}
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { icon: 'people', title: 'SIS Records Management', desc: 'Browse full lists, edit academic GPAs, or archive old folders.', tab: 'records' },
                      { icon: 'cloud_upload', title: 'Excel/CSV Scaffolding', desc: 'Process bulk file datasets and send automated sign-up emails.', tab: 'data_integration' },
                      { icon: 'description', title: 'Document Processing Queue', desc: 'Authorize official transcripts and degree verifications.', tab: 'documents' }
                    ].map((act, idx) => (
                      <div
                        key={idx}
                        onClick={() => setActiveTab(act.tab)}
                        className="group p-6 bg-white border border-gray-200/60 rounded-3xl hover:shadow-md hover:border-astu-navy/30 transition-all cursor-pointer text-center space-y-4"
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

                </div>
              )}

              {activeTab === 'records' && (
                <RecordsTab
                  graduates={graduates}
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
                  verifications={verifications}
                  onVerify={handleVerifyRequestAction}
                />
              )}

              {activeTab === 'documents' && (
                <DocumentProcessingTab
                  documents={documents}
                  onProcessDocument={handleProcessDocumentAction}
                />
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

    </div>
  );
};

export default RegistrarDashboard;