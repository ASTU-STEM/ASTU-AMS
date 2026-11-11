import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Users,
  LayoutDashboard,
  FileText,
  Globe,
  Calendar,
  Save,
  Laptop,
  Tablet,
  Smartphone,
  Shield,
  Briefcase,
  GraduationCap,
  Building2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminBadge from '../components/AdminBadge';
import AdminModal from '../components/AdminModal';
import AdminTablePagination from '../components/AdminTablePagination';
import CommunityMemberModal from '../components/CommunityMemberModal';
import CommunityLivePreviewCanvas from '../components/CommunityLivePreviewCanvas';
import communityMembersService, { CommunityMember } from '../services/communityMembers.service';
import { defaultDetailPages, DetailPageItem, DetailPageSection } from '../services/detailPages.data';
import homepageCmsService from '../services/homepageCms.service';
import { usePublicMetrics } from '../../../services/publicMetrics.service';

type Tab = 'members' | 'community-page' | 'regional-chapters' | 'event-banner' | 'pillars' | 'detail-page';

interface RegionalChapterItem {
  name: string;
  hub: string;
  members: string;
  focus: string;
  contact: string;
}

interface CommunityPillarItem {
  icon: string;
  title: string;
  desc: string;
  action: string;
  link: string;
}

export default function CommunityManagement() {
  const { metrics } = usePublicMetrics();
  const [activeTab, setActiveTab] = useState<Tab>('members');
  const [showLivePreview, setShowLivePreview] = useState(true);
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // ============ MEMBERS STATE ============
  const [members, setMembers] = useState<CommunityMember[]>(() => communityMembersService.getMembers());
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'executive' | 'academia' | 'engineering' | 'policy'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<CommunityMember | null>(null);
  const [memberFormData, setMemberFormData] = useState<Partial<CommunityMember>>({});

  // ============ DETAIL PAGE STATE ============
  const [detailPage, setDetailPage] = useState<DetailPageItem>(() => defaultDetailPages['community']);

  // ============ COMMUNITY PAGE HERO STATE ============
  const [communityPageHero, setCommunityPageHero] = useState({
    title: 'Your Networks Around the World',
    subtitle: 'With establishment spanning nearly three decades, Adama Science and Technology University boasts alumni excelling in global aviation, high-tech ventures, sovereign public policy, academic research chairs, and civil infrastructure worldwide.',
    stats: [
      { label: 'Registered Alumni', value: metrics.registeredAlumniFormatted, sub: 'Globally Verified' },
      { label: 'Fields of Study', value: metrics.fieldsOfStudyFormatted, sub: 'Engineering & Tech' },
      { label: 'Corporate Partners', value: `${metrics.corporatePartnersFormatted} Enterprises`, sub: 'Talent Collaborators' },
      { label: 'Historic Batches', value: metrics.historicBatchesFormatted, sub: 'Since 1993 Establishment' },
    ],
  });

  // Keep hero stats in sync with live metrics unless overridden
  useEffect(() => {
    setCommunityPageHero(prev => ({
      ...prev,
      stats: [
        { label: 'Registered Alumni', value: metrics.registeredAlumniFormatted, sub: 'Globally Verified' },
        { label: 'Fields of Study', value: metrics.fieldsOfStudyFormatted, sub: 'Engineering & Tech' },
        { label: 'Corporate Partners', value: `${metrics.corporatePartnersFormatted} Enterprises`, sub: 'Talent Collaborators' },
        { label: 'Historic Batches', value: metrics.historicBatchesFormatted, sub: 'Since 1993 Establishment' },
      ]
    }));
  }, [metrics]);

  // ============ REGIONAL CHAPTERS STATE ============
  const [regionalChapters, setRegionalChapters] = useState<RegionalChapterItem[]>([
    {
      name: 'Central Ethiopia & Addis Ababa',
      hub: 'Addis Ababa',
      members: '640+ Alumni',
      focus: 'Aviation, Telecom, Financial Technology, and Federal Ministries',
      contact: 'irccd@astu.edu.et',
    },
    {
      name: 'Main Campus & Rift Valley Hub',
      hub: 'Adama',
      members: '320+ Alumni',
      focus: 'Research Incubators, Precision Manufacturing & Water Works',
      contact: 'alumni@astu.edu.et',
    },
    {
      name: 'North America Chapter',
      hub: 'United States & Canada',
      members: '160+ Alumni',
      focus: 'Aerospace (Boeing), Cloud Computing, and US Academic Chairs',
      contact: 'alumni-na@astu.edu.et',
    },
    {
      name: 'European Union Chapter',
      hub: 'Germany, UK & Scandinavia',
      members: '110+ Alumni',
      focus: 'DAAD Research Exchange, Industrial Operations & Consulting',
      contact: 'alumni-eu@astu.edu.et',
    },
  ]);

  // ============ EVENT BANNER STATE ============
  const [eventBanner, setEventBanner] = useState({
    badge: 'Flagship Homecoming Event',
    title: 'ASTU Alumni Carnival 2026',
    description: 'Celebrating nearly three decades of ASTU heritage! Taking place on April 25 and 26, 2026 at the ASTU Main Campus in Adama.',
    features: ['1,200+ Expected Attendees', 'Enterprise Career Expo', 'Research Showcase'],
    primaryButtonText: 'Register for Homecoming',
    primaryButtonLink: '/register',
    secondaryButtonText: 'View Carnival Schedule',
    secondaryButtonLink: '/events',
  });

  // ============ COMMUNITY PILLARS STATE ============
  const [communityPillars, setCommunityPillars] = useState<CommunityPillarItem[]>([
    {
      icon: 'Users',
      title: 'Alumni Mentorship',
      desc: 'Mentor graduating seniors in CV reviews, mock technical interviews, and labor market transition.',
      action: 'Join Mentorship Roster',
      link: '/info/mentorship',
    },
    {
      icon: 'BookOpen',
      title: 'Curriculum Advisory',
      desc: 'Participate in employer tracer studies updating engineering curricula.',
      action: 'Learn More',
      link: '/info/overview',
    },
    {
      icon: 'Sparkles',
      title: 'Endowment & Innovation',
      desc: 'Sponsor student capstone projects, prototyping spaces, and entrepreneurship seed grants.',
      action: 'Support Innovation',
      link: '/info/innovation',
    },
  ]);

  // ============ MODALS STATE FOR ADD ACTIONS ============
  const [chapterModalOpen, setChapterModalOpen] = useState(false);
  const [chapterEditingIdx, setChapterEditingIdx] = useState<number | null>(null);
  const [chapterForm, setChapterForm] = useState<RegionalChapterItem>({
    name: '',
    hub: '',
    members: '',
    focus: '',
    contact: '',
  });

  const [pillarModalOpen, setPillarModalOpen] = useState(false);
  const [pillarEditingIdx, setPillarEditingIdx] = useState<number | null>(null);
  const [pillarForm, setPillarForm] = useState<CommunityPillarItem>({
    icon: 'Sparkles',
    title: '',
    desc: '',
    action: 'Learn More',
    link: '/info/overview',
  });

  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [sectionEditingIdx, setSectionEditingIdx] = useState<number | null>(null);
  const [sectionForm, setSectionForm] = useState<{ heading: string; body: string }>({
    heading: '',
    body: '',
  });

  const iconOptions = ['Users', 'BookOpen', 'Sparkles', 'Shield', 'Award', 'Briefcase', 'GraduationCap', 'Calendar'];

  // ============ EFFECTS ============
  useEffect(() => {
    let isMounted = true;
    communityMembersService.fetchMembersFromApi().then((apiMembers) => {
      if (isMounted && Array.isArray(apiMembers) && apiMembers.length) {
        setMembers(apiMembers);
      }
    });
    const handleMemberSync = () => setMembers(communityMembersService.getMembers());
    window.addEventListener('astu-cms-community-members-changed', handleMemberSync);
    return () => {
      isMounted = false;
      window.removeEventListener('astu-cms-community-members-changed', handleMemberSync);
    };
  }, []);

  useEffect(() => {
    const config = homepageCmsService.getSettings();
    if (config?.detailPages?.community) {
      setDetailPage({ ...defaultDetailPages['community'], ...config.detailPages.community });
    }
    if (config?.communityPageHero) {
      setCommunityPageHero(config.communityPageHero);
    }
    if (Array.isArray(config?.regionalChapters) && config.regionalChapters.length) {
      setRegionalChapters(config.regionalChapters);
    }
    if (config?.eventBanner) {
      setEventBanner(config.eventBanner);
    }
    if (Array.isArray(config?.communityPillars) && config.communityPillars.length) {
      setCommunityPillars(config.communityPillars);
    }
  }, []);

  // Save All CMS Settings
  const handleSaveAll = () => {
    const config = homepageCmsService.getSettings();
    homepageCmsService.saveSettings({
      ...config,
      communityPageHero,
      regionalChapters,
      eventBanner,
      communityPillars,
      detailPages: {
        ...config.detailPages,
        community: detailPage,
      },
    });
    toast.success('Community Page settings saved live!');
  };

  // Roster Filter
  const filteredMembers = members.filter((m) => {
    const matchesCategory = categoryFilter === 'all' || m.category === categoryFilter;
    const matchesSearch =
      !search.trim() ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase()) ||
      m.org.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Community Roster Pagination
  const [memberPage, setMemberPage] = useState(1);
  const [memberPageSize, setMemberPageSize] = useState(6);

  useEffect(() => {
    setMemberPage(1);
  }, [search, categoryFilter]);

  const paginatedMembers = filteredMembers.slice(
    (memberPage - 1) * memberPageSize,
    memberPage * memberPageSize
  );

  // Member CRUD handlers
  const handleAddMember = () => {
    setMemberFormData({ category: 'executive', active: true });
    setShowAddModal(true);
  };

  const handleEditMember = (member: CommunityMember) => {
    setSelectedMember(member);
    setMemberFormData(member);
    setShowEditModal(true);
  };

  const handleViewMember = (member: CommunityMember) => {
    setSelectedMember(member);
    setShowViewModal(true);
  };

  const handleDeleteMember = async (id: string) => {
    if (confirm('Delete this community leader?')) {
      const ok = await communityMembersService.deleteMember(id);
      if (ok) {
        setMembers(communityMembersService.getMembers());
        toast.success('Member removed');
      }
    }
  };

  const handleSaveMember = async (submittedData?: Partial<CommunityMember>) => {
    const dataToSave = submittedData || memberFormData;
    if (!dataToSave.name || !dataToSave.role || !dataToSave.org) {
      toast.error('Name, Role, and Organization are required');
      return;
    }

    if (showAddModal) {
      const created = await communityMembersService.addMember(dataToSave as Omit<CommunityMember, 'id'>);
      if (created) {
        setMembers(communityMembersService.getMembers());
        setShowAddModal(false);
        toast.success('Community member added');
      }
    } else if (showEditModal && selectedMember) {
      const updated = await communityMembersService.updateMember(selectedMember.id, dataToSave);
      if (updated) {
        setMembers(communityMembersService.getMembers());
        setShowEditModal(false);
        setSelectedMember(null);
        toast.success('Community member updated');
      }
    }
  };

  // Chapter Modal handlers
  const handleOpenChapterModal = (idx: number | null = null) => {
    if (idx !== null && regionalChapters[idx]) {
      setChapterEditingIdx(idx);
      setChapterForm({ ...regionalChapters[idx] });
    } else {
      setChapterEditingIdx(null);
      setChapterForm({
        name: '',
        hub: '',
        members: '100+ Alumni',
        focus: '',
        contact: 'alumni@astu.edu.et',
      });
    }
    setChapterModalOpen(true);
  };

  const handleSaveChapterModal = () => {
    if (!chapterForm.name || !chapterForm.hub) {
      toast.error('Chapter Name and Hub Location are required');
      return;
    }
    if (chapterEditingIdx !== null) {
      const updated = [...regionalChapters];
      updated[chapterEditingIdx] = chapterForm;
      setRegionalChapters(updated);
      toast.success('Regional chapter updated');
    } else {
      setRegionalChapters([...regionalChapters, chapterForm]);
      toast.success('New regional chapter added');
    }
    setChapterModalOpen(false);
  };

  // Pillar Modal handlers
  const handleOpenPillarModal = (idx: number | null = null) => {
    if (idx !== null && communityPillars[idx]) {
      setPillarEditingIdx(idx);
      setPillarForm({ ...communityPillars[idx] });
    } else {
      setPillarEditingIdx(null);
      setPillarForm({
        icon: 'Sparkles',
        title: '',
        desc: '',
        action: 'Learn More',
        link: '/info/overview',
      });
    }
    setPillarModalOpen(true);
  };

  const handleSavePillarModal = () => {
    if (!pillarForm.title || !pillarForm.desc) {
      toast.error('Title and Description are required');
      return;
    }
    if (pillarEditingIdx !== null) {
      const updated = [...communityPillars];
      updated[pillarEditingIdx] = pillarForm;
      setCommunityPillars(updated);
      toast.success('Community pillar updated');
    } else {
      setCommunityPillars([...communityPillars, pillarForm]);
      toast.success('New community pillar added');
    }
    setPillarModalOpen(false);
  };

  // Section Modal handlers
  const handleOpenSectionModal = (idx: number | null = null) => {
    if (idx !== null && detailPage.sections?.[idx]) {
      setSectionEditingIdx(idx);
      setSectionForm({ ...detailPage.sections[idx] });
    } else {
      setSectionEditingIdx(null);
      setSectionForm({ heading: '', body: '' });
    }
    setSectionModalOpen(true);
  };

  const handleSaveSectionModal = () => {
    if (!sectionForm.heading || !sectionForm.body) {
      toast.error('Section Heading and Body are required');
      return;
    }
    const currentSecs = detailPage.sections || [];
    if (sectionEditingIdx !== null) {
      const updated = currentSecs.map((sec, i) =>
        i === sectionEditingIdx ? { ...sec, ...sectionForm } : sec
      );
      setDetailPage({ ...detailPage, sections: updated });
      toast.success('Section updated');
    } else {
      const newSec: DetailPageSection = {
        id: `SEC-${Date.now()}`,
        heading: sectionForm.heading,
        body: sectionForm.body,
        active: true,
      };
      setDetailPage({ ...detailPage, sections: [...currentSecs, newSec] });
      toast.success('New section added');
    }
    setSectionModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* ── UNIFIED MODERN TOP HERO BANNER ── */}
      <div className="rounded-3xl bg-gradient-to-r from-astu-navy via-[#003366] to-[#001f3f] p-7 sm:p-9 text-white shadow-xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <span className="inline-block text-xs font-black uppercase tracking-widest text-amber-400 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20">
              COMMUNITY CMS DASHBOARD
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mt-2 tracking-tight leading-tight">
              Community Management & Live Page Editor
            </h1>
            <p className="text-sm md:text-base text-slate-200 mt-1.5 max-w-2xl leading-relaxed">
              Customize text, stats, sections, regional hubs, and member roster with real-time live preview.
            </p>
          </div>

          {/* Integrated Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowLivePreview(!showLivePreview)}
              className={`px-4 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                showLivePreview
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 shadow-xs'
                  : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
              }`}
            >
              {showLivePreview ? <Eye className="h-4 w-4 text-emerald-400" /> : <EyeOff className="h-4 w-4" />}
              <span>{showLivePreview ? 'Live Preview On' : 'Show Canvas'}</span>
            </button>

            {showLivePreview && (
              <div className="flex items-center gap-1 bg-white/10 p-1 rounded-2xl border border-white/20">
                <button
                  onClick={() => setDeviceView('desktop')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    deviceView === 'desktop' ? 'bg-white text-[#003366] font-bold shadow-xs' : 'text-slate-200 hover:text-white'
                  }`}
                >
                  <Laptop className="h-3.5 w-3.5" /> Desktop
                </button>
                <button
                  onClick={() => setDeviceView('tablet')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    deviceView === 'tablet' ? 'bg-white text-[#003366] font-bold shadow-xs' : 'text-slate-200 hover:text-white'
                  }`}
                >
                  <Tablet className="h-3.5 w-3.5" /> Tablet
                </button>
                <button
                  onClick={() => setDeviceView('mobile')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    deviceView === 'mobile' ? 'bg-white text-[#003366] font-bold shadow-xs' : 'text-slate-200 hover:text-white'
                  }`}
                >
                  <Smartphone className="h-3.5 w-3.5" /> Mobile
                </button>
              </div>
            )}

            <button
              onClick={handleSaveAll}
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <Save className="h-4 w-4" /> Save All Changes
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN SPLIT SCREEN WORKSPACE ── */}
      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* ── LEFT PANE: CMS CONTROL PANEL ── */}
        <div className={`w-full ${showLivePreview ? 'lg:w-1/2' : 'lg:w-full'} space-y-5 transition-all`}>
          {/* Section Navigation Tabs */}
          <div className="flex gap-1.5 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-xs">
            {[
              { id: 'members', label: 'Alumni Roster', icon: Users },
              { id: 'community-page', label: 'Hero & Stats', icon: LayoutDashboard },
              { id: 'regional-chapters', label: 'Regional Chapters', icon: Globe },
              { id: 'event-banner', label: 'Event Banner', icon: Calendar },
              { id: 'pillars', label: 'Community Pillars', icon: Shield },
              { id: 'detail-page', label: 'Info & Governance', icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#003366] text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ── TAB 1: ALUMNI ROSTER ── */}
          {activeTab === 'members' && (
            <div className="space-y-4 rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#003366] dark:text-sky-400" />
                    <span>Alumni Leaders Roster ({members.length})</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Manage individual featured alumni leaders</p>
                </div>
                <button
                  onClick={handleAddMember}
                  className="px-3.5 py-2 rounded-xl bg-[#003366] text-white hover:bg-[#002855] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="h-4 w-4" /> Add Community Member
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-1 flex-wrap">
                  {(['all', 'executive', 'academia', 'engineering', 'policy'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                        categoryFilter === cat ? 'bg-[#003366] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="relative w-full sm:w-48">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search roster..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Roster Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[520px] overflow-y-auto pr-1">
                {paginatedMembers.map((member) => (
                  <div
                    key={member.id}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:border-slate-300 transition-all flex flex-col justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={member.image || '/images/default-avatar.png'}
                        alt={member.name}
                        className="h-11 w-11 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{member.name}</h4>
                        <p className="text-[11px] text-[#003366] dark:text-sky-400 font-medium truncate">{member.role}</p>
                        <p className="text-[10px] text-slate-400 truncate">{member.org}</p>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                      <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                        {member.category}
                      </span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleViewMember(member)} className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"><Eye className="h-3.5 w-3.5" /></button>
                        <button onClick={() => handleEditMember(member)} className="p-1 text-blue-600 dark:text-sky-400"><Edit3 className="h-3.5 w-3.5" /></button>
                        <button onClick={() => handleDeleteMember(member.id)} className="p-1 text-rose-600 dark:text-rose-400"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredMembers.length === 0 && (
                  <div className="col-span-full py-12 text-center text-slate-400 text-xs">
                    No community members found matching your filters.
                  </div>
                )}
              </div>

              {/* Roster Pagination */}
              <AdminTablePagination
                currentPage={memberPage}
                totalItems={filteredMembers.length}
                pageSize={memberPageSize}
                onPageChange={setMemberPage}
                onPageSizeChange={(newSize) => {
                  setMemberPageSize(newSize);
                  setMemberPage(1);
                }}
                pageSizeOptions={[6, 12, 24, 48]}
                itemName="community members"
              />
            </div>
          )}

          {/* ── TAB 2: HERO & STATS ── */}
          {activeTab === 'community-page' && (
            <div className="space-y-4 rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4 text-[#003366] dark:text-sky-400" />
                <span>Community Hero & Key Stats</span>
              </h3>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Hero Main Title</label>
                <input
                  type="text"
                  value={communityPageHero.title}
                  onChange={(e) => setCommunityPageHero({ ...communityPageHero, title: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Hero Subtitle</label>
                <textarea
                  value={communityPageHero.subtitle}
                  onChange={(e) => setCommunityPageHero({ ...communityPageHero, subtitle: e.target.value })}
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2">4 Key Metric Counters</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {communityPageHero.stats.map((stat, idx) => (
                    <div key={idx} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 space-y-2">
                      <span className="text-[10px] font-bold text-slate-400">Counter #{idx + 1}</span>
                      <input
                        type="text"
                        placeholder="Value (e.g. 1,238+)"
                        value={stat.value}
                        onChange={(e) => {
                          const updated = [...communityPageHero.stats];
                          updated[idx].value = e.target.value;
                          setCommunityPageHero({ ...communityPageHero, stats: updated });
                        }}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-bold text-amber-600 dark:text-amber-400"
                      />
                      <input
                        type="text"
                        placeholder="Label"
                        value={stat.label}
                        onChange={(e) => {
                          const updated = [...communityPageHero.stats];
                          updated[idx].label = e.target.value;
                          setCommunityPageHero({ ...communityPageHero, stats: updated });
                        }}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-semibold text-slate-900 dark:text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 3: REGIONAL CHAPTERS ── */}
          {activeTab === 'regional-chapters' && (
            <div className="space-y-4 rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Globe className="h-4 w-4 text-[#003366] dark:text-sky-400" />
                    <span>Regional Alumni Chapters ({regionalChapters.length})</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Global alumni hub chapters across regions</p>
                </div>
                <button
                  onClick={() => handleOpenChapterModal(null)}
                  className="px-3.5 py-2 rounded-xl bg-[#003366] text-white hover:bg-[#002855] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="h-4 w-4" /> Add Chapter Modal
                </button>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {regionalChapters.map((ch, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{ch.name}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Hub: {ch.hub} • {ch.members}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Contact: {ch.contact}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenChapterModal(idx)}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-sky-300 text-xs font-bold flex items-center gap-1"
                      >
                        <Edit3 className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Remove chapter?')) {
                            setRegionalChapters(regionalChapters.filter((_, i) => i !== idx));
                          }
                        }}
                        className="p-1 text-rose-600 dark:text-rose-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB 4: EVENT BANNER ── */}
          {activeTab === 'event-banner' && (
            <div className="space-y-4 rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#003366] dark:text-sky-400" />
                <span>Flagship Event Banner Configuration</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Badge</label>
                  <input
                    type="text"
                    value={eventBanner.badge}
                    onChange={(e) => setEventBanner({ ...eventBanner, badge: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Event Title</label>
                  <input
                    type="text"
                    value={eventBanner.title}
                    onChange={(e) => setEventBanner({ ...eventBanner, title: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Event Description</label>
                <textarea
                  value={eventBanner.description}
                  onChange={(e) => setEventBanner({ ...eventBanner, description: e.target.value })}
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Primary Button Label</label>
                  <input
                    type="text"
                    value={eventBanner.primaryButtonText}
                    onChange={(e) => setEventBanner({ ...eventBanner, primaryButtonText: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs text-slate-900 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Secondary Button Label</label>
                  <input
                    type="text"
                    value={eventBanner.secondaryButtonText}
                    onChange={(e) => setEventBanner({ ...eventBanner, secondaryButtonText: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 5: COMMUNITY PILLARS ── */}
          {activeTab === 'pillars' && (
            <div className="space-y-4 rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Shield className="h-4 w-4 text-[#003366] dark:text-sky-400" />
                    <span>Community Pillars ({communityPillars.length})</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Strategic community initiatives and pillars</p>
                </div>
                <button
                  onClick={() => handleOpenPillarModal(null)}
                  className="px-3.5 py-2 rounded-xl bg-[#003366] text-white hover:bg-[#002855] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="h-4 w-4" /> Add Pillar Modal
                </button>
              </div>

              <div className="space-y-3">
                {communityPillars.map((p, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{p.title}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{p.desc}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenPillarModal(idx)}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-sky-300 text-xs font-bold flex items-center gap-1"
                      >
                        <Edit3 className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Remove pillar?')) {
                            setCommunityPillars(communityPillars.filter((_, i) => i !== idx));
                          }
                        }}
                        className="p-1 text-rose-600 dark:text-rose-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB 6: INFO & GOVERNANCE SECTIONS ── */}
          {activeTab === 'detail-page' && (
            <div className="space-y-4 rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#003366] dark:text-sky-400" />
                    <span>Info & Governance Sections ({(detailPage.sections || []).length})</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Institutional information cards</p>
                </div>
                <button
                  onClick={() => handleOpenSectionModal(null)}
                  className="px-3.5 py-2 rounded-xl bg-[#003366] text-white hover:bg-[#002855] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="h-4 w-4" /> Add Section Modal
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Page Main Title</label>
                <input
                  type="text"
                  value={detailPage.title}
                  onChange={(e) => setDetailPage({ ...detailPage, title: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div className="space-y-3">
                {(detailPage.sections || []).map((sec, idx) => (
                  <div key={sec.id || idx} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{sec.heading}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{sec.body}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenSectionModal(idx)}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-sky-300 text-xs font-bold flex items-center gap-1"
                      >
                        <Edit3 className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Remove section?')) {
                            const updated = (detailPage.sections || []).filter((_, i) => i !== idx);
                            setDetailPage({ ...detailPage, sections: updated });
                          }
                        }}
                        className="p-1 text-rose-600 dark:text-rose-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT PANE: LIVE PREVIEW CANVAS WITH AUTO-SCROLL ── */}
        {showLivePreview && (
          <div className="w-full lg:w-1/2 sticky top-6 self-start max-h-[850px] overflow-y-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-950/90 p-3 shadow-inner">
            <CommunityLivePreviewCanvas
              communityPageHero={communityPageHero}
              regionalChapters={regionalChapters}
              eventBanner={eventBanner}
              communityPillars={communityPillars}
              membersList={members}
              deviceView={deviceView}
              activeTab={activeTab}
              detailPage={detailPage}
            />
          </div>
        )}
      </div>

      {/* ── ADD REGIONAL CHAPTER MODAL ── */}
      {chapterModalOpen && (
        <AdminModal
          open={chapterModalOpen}
          onClose={() => setChapterModalOpen(false)}
          title={chapterEditingIdx !== null ? 'Edit Regional Chapter' : 'Add Regional Chapter'}
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Chapter Name</label>
              <input
                type="text"
                value={chapterForm.name}
                onChange={(e) => setChapterForm({ ...chapterForm, name: e.target.value })}
                placeholder="e.g. North America Chapter"
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white font-bold"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Hub Location</label>
                <input
                  type="text"
                  value={chapterForm.hub}
                  onChange={(e) => setChapterForm({ ...chapterForm, hub: e.target.value })}
                  placeholder="e.g. United States & Canada"
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Members Count</label>
                <input
                  type="text"
                  value={chapterForm.members}
                  onChange={(e) => setChapterForm({ ...chapterForm, members: e.target.value })}
                  placeholder="e.g. 160+ Alumni"
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Focus Areas & Industries</label>
              <textarea
                value={chapterForm.focus}
                onChange={(e) => setChapterForm({ ...chapterForm, focus: e.target.value })}
                rows={2}
                placeholder="Aerospace, Cloud Computing, Research Exchange..."
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white resize-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Contact Email</label>
              <input
                type="email"
                value={chapterForm.contact}
                onChange={(e) => setChapterForm({ ...chapterForm, contact: e.target.value })}
                placeholder="alumni-na@astu.edu.et"
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button onClick={() => setChapterModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
                Cancel
              </button>
              <button onClick={handleSaveChapterModal} className="px-4 py-2 rounded-xl bg-[#003366] text-white text-xs font-bold shadow-md">
                Save Chapter
              </button>
            </div>
          </div>
        </AdminModal>
      )}

      {/* ── ADD COMMUNITY PILLAR MODAL ── */}
      {pillarModalOpen && (
        <AdminModal
          open={pillarModalOpen}
          onClose={() => setPillarModalOpen(false)}
          title={pillarEditingIdx !== null ? 'Edit Community Pillar' : 'Add Community Pillar'}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Pillar Title</label>
                <input
                  type="text"
                  value={pillarForm.title}
                  onChange={(e) => setPillarForm({ ...pillarForm, title: e.target.value })}
                  placeholder="e.g. Alumni Mentorship"
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white font-bold"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Icon</label>
                <select
                  value={pillarForm.icon}
                  onChange={(e) => setPillarForm({ ...pillarForm, icon: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white font-bold"
                >
                  {iconOptions.map((ic) => (
                    <option key={ic} value={ic}>Icon: {ic}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Description</label>
              <textarea
                value={pillarForm.desc}
                onChange={(e) => setPillarForm({ ...pillarForm, desc: e.target.value })}
                rows={3}
                placeholder="Mentor graduating seniors in CV reviews and technical interviews..."
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Action Button Text</label>
                <input
                  type="text"
                  value={pillarForm.action}
                  onChange={(e) => setPillarForm({ ...pillarForm, action: e.target.value })}
                  placeholder="Join Mentorship Roster"
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white font-bold"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Link URL</label>
                <input
                  type="text"
                  value={pillarForm.link}
                  onChange={(e) => setPillarForm({ ...pillarForm, link: e.target.value })}
                  placeholder="/info/mentorship"
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button onClick={() => setPillarModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
                Cancel
              </button>
              <button onClick={handleSavePillarModal} className="px-4 py-2 rounded-xl bg-[#003366] text-white text-xs font-bold shadow-md">
                Save Pillar
              </button>
            </div>
          </div>
        </AdminModal>
      )}

      {/* ── ADD INFORMATION SECTION MODAL ── */}
      {sectionModalOpen && (
        <AdminModal
          open={sectionModalOpen}
          onClose={() => setSectionModalOpen(false)}
          title={sectionEditingIdx !== null ? 'Edit Information Section' : 'Add Information Section'}
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Section Heading</label>
              <input
                type="text"
                value={sectionForm.heading}
                onChange={(e) => setSectionForm({ ...sectionForm, heading: e.target.value })}
                placeholder="e.g. Governance & Advisory Structure"
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Section Body Content</label>
              <textarea
                value={sectionForm.body}
                onChange={(e) => setSectionForm({ ...sectionForm, body: e.target.value })}
                rows={4}
                placeholder="Provide clear, factual ASTU institutional information..."
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white resize-none"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button onClick={() => setSectionModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
                Cancel
              </button>
              <button onClick={handleSaveSectionModal} className="px-4 py-2 rounded-xl bg-[#003366] text-white text-xs font-bold shadow-md">
                Save Section
              </button>
            </div>
          </div>
        </AdminModal>
      )}

      {/* ── COMMUNITY MEMBER ADD MODAL ── */}
      {showAddModal && (
        <CommunityMemberModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={handleSaveMember}
          initialData={memberFormData}
          mode="add"
        />
      )}

      {/* ── COMMUNITY MEMBER EDIT MODAL ── */}
      {showEditModal && (
        <CommunityMemberModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveMember}
          initialData={memberFormData}
          mode="edit"
        />
      )}

      {/* ── COMMUNITY MEMBER DETAIL VIEW MODAL ── */}
      {showViewModal && selectedMember && (
        <AdminModal
          open={showViewModal}
          onClose={() => setShowViewModal(false)}
          title={`Profile Highlight — ${selectedMember.name}`}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <img
                src={selectedMember.image || '/images/default-avatar.png'}
                alt={selectedMember.name}
                className="h-16 w-16 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedMember.name}</h3>
                <p className="text-xs font-semibold text-[#003366] dark:text-sky-400">{selectedMember.role}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{selectedMember.org}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="font-bold text-slate-400 text-[10px] block">Degree & Class</span>
                <span className="text-slate-800 dark:text-slate-200">{selectedMember.degree} ({selectedMember.gradYear})</span>
              </div>
              <div>
                <span className="font-bold text-slate-400 text-[10px] block">Location / Chapter</span>
                <span className="text-slate-800 dark:text-slate-200">{selectedMember.location}</span>
              </div>
              <div className="col-span-2">
                <span className="font-bold text-slate-400 text-[10px] block">Bio & Quote</span>
                <p className="text-slate-700 dark:text-slate-300 mt-1 italic">"{selectedMember.quote || selectedMember.bio}"</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
