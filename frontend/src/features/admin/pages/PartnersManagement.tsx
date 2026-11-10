import React, { useEffect, useMemo, useState } from 'react';
import {
  Briefcase,
  Building2,
  CheckCircle2,
  ExternalLink,
  Plus,
  Save,
  Trash2,
  Eye,
  Handshake,
  TrendingUp,
  Search,
  Users,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Edit3,
  Globe,
  Sliders,
  Type,
  Layout,
  HelpCircle,
  Award,
  Link as LinkIcon,
  RotateCcw,
  Smartphone,
  Tablet,
  Monitor,
  X,
  MapPin,
  Mail,
  ChevronRight,
  Maximize2,
  Minimize2,
  Phone,
  Check,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminModal from '../components/AdminModal';
import AdminTablePagination from '../components/AdminTablePagination';
import homepageCmsService, {
  defaultPartnersPageConfig,
  PartnersPageConfig,
  PartnerBenefit,
  Partner,
  defaultPartnersList,
  HomepageCmsConfig,
  UnifiedPartnerTrack,
  UnifiedPartnerFaq,
  PartnerStat,
} from '../services/homepageCms.service';
import PartnerLivePreviewCanvas from '../components/PartnerLivePreviewCanvas';

const PARTNER_LOGO_PRESETS = [
  { name: 'Ethiopian Airlines', path: '/images/partners/ethiopian-airlines.svg' },
  { name: 'Ethio Telecom', path: '/images/partners/ethio-telecom.png' },
  { name: 'Safaricom Ethiopia', path: '/images/partners/safaricom.png' },
  { name: 'Huawei Technologies', path: '/images/partners/huawei.svg' },
  { name: 'Commercial Bank of Ethiopia', path: '/images/partners/cbe.png' },
  { name: 'INSA', path: '/images/partners/insa.png' },
  { name: 'ASTU Official Seal', path: '/images/astu-seal-logo.png' },
];

type SidebarTab = 'hero' | 'stats' | 'companies' | 'stakeholders' | 'recruitment' | 'benefits' | 'faqs' | 'contact';

export default function PartnersManagement() {
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('hero');
  const [previewActiveTab, setPreviewActiveTab] = useState<'employers' | 'stakeholders' | 'recruitment' | 'benefits' | 'faqs' | 'contact'>('employers');

  // Partners Page config (/partners)
  const [partnersConfig, setPartnersConfig] = useState<PartnersPageConfig>(() => {
    const s = homepageCmsService.getSettings();
    return s?.partnersPage || defaultPartnersPageConfig;
  });

  // Partner Companies list
  const [partners, setPartners] = useState<Partner[]>(() => {
    const s = homepageCmsService.getSettings();
    return s?.partners && s.partners.length > 0 ? s.partners : defaultPartnersList;
  });

  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Partner Pagination & Search
  const [partnerPage, setPartnerPage] = useState(1);
  const [partnerPageSize, setPartnerPageSize] = useState(8);
  const [partnerSearch, setPartnerSearch] = useState('');

  const filteredPartners = useMemo(() => {
    if (!partnerSearch.trim()) return partners;
    const q = partnerSearch.toLowerCase();
    return partners.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      (p.industry && p.industry.toLowerCase().includes(q)) ||
      (p.location && p.location.toLowerCase().includes(q))
    );
  }, [partners, partnerSearch]);

  const paginatedPartners = useMemo(() => {
    const start = (partnerPage - 1) * partnerPageSize;
    return filteredPartners.slice(start, start + partnerPageSize);
  }, [filteredPartners, partnerPage, partnerPageSize]);

  useEffect(() => {
    setPartnerPage(1);
  }, [partnerSearch]);

  // ── MODAL STATES FOR ALL "ADD" ACTIONS ──
  // 1. Company Modal
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Partner | null>(null);
  const logoFileInputRef = React.useRef<HTMLInputElement>(null);
  const [logoInputMode, setLogoInputMode] = useState<'upload' | 'url' | 'presets'>('upload');
  const [logoDragActive, setLogoDragActive] = useState(false);

  // 2. Stakeholder Track Modal
  const [stakeholderModalOpen, setStakeholderModalOpen] = useState(false);
  const [stakeholderEditingIdx, setStakeholderEditingIdx] = useState<number | null>(null);
  const [stakeholderForm, setStakeholderForm] = useState<UnifiedPartnerTrack>({
    id: '',
    title: '',
    desc: '',
    badge: 'Consortium Track',
    active: true,
  });

  // 3. Recruitment Track Modal
  const [recruitmentModalOpen, setRecruitmentModalOpen] = useState(false);
  const [recruitmentEditingIdx, setRecruitmentEditingIdx] = useState<number | null>(null);
  const [recruitmentForm, setRecruitmentForm] = useState<UnifiedPartnerTrack>({
    id: '',
    title: '',
    desc: '',
    badge: 'Pipeline Pillar',
    active: true,
  });

  // 4. Benefit Modal
  const [benefitModalOpen, setBenefitModalOpen] = useState(false);
  const [benefitEditingIdx, setBenefitEditingIdx] = useState<number | null>(null);
  const [benefitForm, setBenefitForm] = useState<PartnerBenefit>({
    id: '',
    title: '',
    description: '',
    icon: 'Handshake',
    active: true,
  });

  // 5. FAQ Modal
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [faqEditingIdx, setFaqEditingIdx] = useState<number | null>(null);
  const [faqForm, setFaqForm] = useState<UnifiedPartnerFaq>({
    id: '',
    question: '',
    answer: '',
  });

  useEffect(() => {
    let isMounted = true;
    homepageCmsService.fetchFromApi().then((live) => {
      if (!isMounted || !live) return;
      if (live.partnersPage) setPartnersConfig(live.partnersPage);
      if (Array.isArray(live.partners) && live.partners.length > 0) {
        setPartners(live.partners);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const updatePartnersConfig = (partial: Partial<PartnersPageConfig>) => {
    setHasChanges(true);
    setPartnersConfig((prev) => ({ ...prev, ...partial }));
  };

  const handleSidebarTabSwitch = (tab: SidebarTab) => {
    setSidebarTab(tab);
    if (tab === 'companies') setPreviewActiveTab('employers');
    else if (tab === 'stakeholders') setPreviewActiveTab('stakeholders');
    else if (tab === 'recruitment') setPreviewActiveTab('recruitment');
    else if (tab === 'benefits') setPreviewActiveTab('benefits');
    else if (tab === 'faqs') setPreviewActiveTab('faqs');
    else if (tab === 'contact') setPreviewActiveTab('contact');
  };

  // ── COMPANY HANDLERS ──
  const handleLogoFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, SVG, WebP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Logo file size must be less than 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && editingCompany) {
        setEditingCompany({ ...editingCompany, logo: e.target.result as string });
        toast.success(`Logo loaded: ${file.name}`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleOpenAddCompany = () => {
    setEditingCompany({
      id: `P-${Date.now().toString().slice(-4)}`,
      name: '',
      logo: '',
      industry: 'Technology & Software',
      location: 'Addis Ababa / Adama, Ethiopia',
      openings: '3 Active Graduate Roles',
      partnershipType: 'Enterprise',
      description: 'Collaborates with ASTU on talent acquisition, technical workshops, and student internships.',
      website: '',
      contactEmail: '',
      featured: true,
      active: true,
    });
    setLogoInputMode('upload');
    setCompanyModalOpen(true);
  };

  const handleEditCompany = (company: Partner) => {
    setEditingCompany({ ...company });
    setLogoInputMode(company.logo?.startsWith('data:') ? 'upload' : company.logo ? 'url' : 'upload');
    setCompanyModalOpen(true);
  };

  const handleDeleteCompany = (id: string) => {
    if (window.confirm('Are you sure you want to remove this partner organization?')) {
      setHasChanges(true);
      setPartners((prev) => prev.filter((p) => p.id !== id));
      toast.success('Partner organization removed.');
    }
  };

  const handleSaveCompanyModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany || !editingCompany.name.trim()) {
      toast.error('Organization name is required.');
      return;
    }

    setHasChanges(true);
    setPartners((prev) => {
      const idx = prev.findIndex((p) => p.id === editingCompany.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = editingCompany;
        return copy;
      }
      return [editingCompany, ...prev];
    });

    setCompanyModalOpen(false);
    setEditingCompany(null);
    toast.success(`Saved "${editingCompany.name}"!`);
  };

  // ── STAKEHOLDER TRACK MODAL HANDLERS ──
  const handleOpenStakeholderModal = (idx: number | null = null) => {
    const list = partnersConfig.stakeholderTracks || [];
    if (idx !== null && list[idx]) {
      setStakeholderEditingIdx(idx);
      setStakeholderForm({ ...list[idx] });
    } else {
      setStakeholderEditingIdx(null);
      setStakeholderForm({
        id: `ST-${Date.now().toString().slice(-4)}`,
        title: '',
        desc: '',
        badge: 'Consortium Track',
        active: true,
      });
    }
    setStakeholderModalOpen(true);
  };

  const handleSaveStakeholderModal = () => {
    if (!stakeholderForm.title || !stakeholderForm.desc) {
      toast.error('Framework Title and Description are required.');
      return;
    }
    setHasChanges(true);
    const list = [...(partnersConfig.stakeholderTracks || [])];
    if (stakeholderEditingIdx !== null) {
      list[stakeholderEditingIdx] = stakeholderForm;
      toast.success('Stakeholder track updated.');
    } else {
      list.push(stakeholderForm);
      toast.success('New stakeholder track added.');
    }
    updatePartnersConfig({ stakeholderTracks: list });
    setStakeholderModalOpen(false);
  };

  const handleDeleteStakeholderTrack = (index: number) => {
    if (window.confirm('Remove this stakeholder track?')) {
      setHasChanges(true);
      const list = (partnersConfig.stakeholderTracks || []).filter((_, i) => i !== index);
      updatePartnersConfig({ stakeholderTracks: list });
      toast.success('Track removed.');
    }
  };

  // ── RECRUITMENT PILLAR MODAL HANDLERS ──
  const handleOpenRecruitmentModal = (idx: number | null = null) => {
    const list = partnersConfig.recruitmentTracks || [];
    if (idx !== null && list[idx]) {
      setRecruitmentEditingIdx(idx);
      setRecruitmentForm({ ...list[idx] });
    } else {
      setRecruitmentEditingIdx(null);
      setRecruitmentForm({
        id: `RT-${Date.now().toString().slice(-4)}`,
        title: '',
        desc: '',
        badge: 'Pipeline Pillar',
        active: true,
      });
    }
    setRecruitmentModalOpen(true);
  };

  const handleSaveRecruitmentModal = () => {
    if (!recruitmentForm.title || !recruitmentForm.desc) {
      toast.error('Pillar Title and Description are required.');
      return;
    }
    setHasChanges(true);
    const list = [...(partnersConfig.recruitmentTracks || [])];
    if (recruitmentEditingIdx !== null) {
      list[recruitmentEditingIdx] = recruitmentForm;
      toast.success('Recruitment pillar updated.');
    } else {
      list.push(recruitmentForm);
      toast.success('New recruitment pillar added.');
    }
    updatePartnersConfig({ recruitmentTracks: list });
    setRecruitmentModalOpen(false);
  };

  const handleDeleteRecruitmentTrack = (index: number) => {
    if (window.confirm('Remove this recruitment pillar?')) {
      setHasChanges(true);
      const list = (partnersConfig.recruitmentTracks || []).filter((_, i) => i !== index);
      updatePartnersConfig({ recruitmentTracks: list });
      toast.success('Pillar removed.');
    }
  };

  // ── BENEFIT MODAL HANDLERS ──
  const handleOpenBenefitModal = (idx: number | null = null) => {
    const list = partnersConfig.benefits || [];
    if (idx !== null && list[idx]) {
      setBenefitEditingIdx(idx);
      setBenefitForm({ ...list[idx] });
    } else {
      setBenefitEditingIdx(null);
      setBenefitForm({
        id: `B-${Date.now().toString().slice(-4)}`,
        title: '',
        description: '',
        icon: 'Handshake',
        active: true,
      });
    }
    setBenefitModalOpen(true);
  };

  const handleSaveBenefitModal = () => {
    if (!benefitForm.title || !benefitForm.description) {
      toast.error('Benefit Title and Description are required.');
      return;
    }
    setHasChanges(true);
    const list = [...(partnersConfig.benefits || [])];
    if (benefitEditingIdx !== null) {
      list[benefitEditingIdx] = benefitForm;
      toast.success('Benefit card updated.');
    } else {
      list.push(benefitForm);
      toast.success('New benefit card added.');
    }
    updatePartnersConfig({ benefits: list });
    setBenefitModalOpen(false);
  };

  const handleDeleteBenefit = (index: number) => {
    if (window.confirm('Remove this benefit card?')) {
      setHasChanges(true);
      const list = (partnersConfig.benefits || []).filter((_, i) => i !== index);
      updatePartnersConfig({ benefits: list });
      toast.success('Benefit removed.');
    }
  };

  // ── FAQ MODAL HANDLERS ──
  const handleOpenFaqModal = (idx: number | null = null) => {
    const list = partnersConfig.faqs || [];
    if (idx !== null && list[idx]) {
      setFaqEditingIdx(idx);
      setFaqForm({ ...list[idx] });
    } else {
      setFaqEditingIdx(null);
      setFaqForm({
        id: `FAQ-${Date.now().toString().slice(-4)}`,
        question: '',
        answer: '',
      });
    }
    setFaqModalOpen(true);
  };

  const handleSaveFaqModal = () => {
    if (!faqForm.question || !faqForm.answer) {
      toast.error('Question and Answer are required.');
      return;
    }
    setHasChanges(true);
    const list = [...(partnersConfig.faqs || [])];
    if (faqEditingIdx !== null) {
      list[faqEditingIdx] = faqForm;
      toast.success('FAQ updated.');
    } else {
      list.push(faqForm);
      toast.success('New FAQ added.');
    }
    updatePartnersConfig({ faqs: list });
    setFaqModalOpen(false);
  };

  const handleDeleteFaq = (index: number) => {
    if (window.confirm('Remove this FAQ?')) {
      setHasChanges(true);
      const list = (partnersConfig.faqs || []).filter((_, i) => i !== index);
      updatePartnersConfig({ faqs: list });
      toast.success('FAQ removed.');
    }
  };

  // Save all changes
  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const payload: Partial<HomepageCmsConfig> = {
        partnersPage: partnersConfig,
        partners: partners,
      };
      await homepageCmsService.saveSettings(payload);
      setHasChanges(false);
      toast.success('Unified Partner & Employer Portal published live!');
    } catch {
      toast.error('Failed to sync with API. Cached locally.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Reset the unified Partners & Employers portal to default settings?')) {
      setHasChanges(true);
      setPartnersConfig(defaultPartnersPageConfig);
      setPartners(defaultPartnersList);
      toast.success('Restored default configuration.');
    }
  };

  return (
    <div className="space-y-6">
      {/* ── TOP PAGE HEADER ── */}
      <AdminPageHeader
        title="Partner & Employer Portal Management"
        subtitle="Manage all corporate partnerships, recruitment frameworks, consortium tracks, and live landing page configuration."
        breadcrumbs={[{ label: 'CMS' }, { label: 'Partners & Employers' }]}
      >
        <div className="flex flex-wrap items-center gap-2">
          {/* Device view switcher */}
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setDeviceView('desktop')}
              className={`rounded-lg p-1.5 transition-colors cursor-pointer ${
                deviceView === 'desktop' ? 'bg-[#003366] text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
              title="Desktop View"
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setDeviceView('tablet')}
              className={`rounded-lg p-1.5 transition-colors cursor-pointer ${
                deviceView === 'tablet' ? 'bg-[#003366] text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
              title="Tablet View (768px)"
            >
              <Tablet className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setDeviceView('mobile')}
              className={`rounded-lg p-1.5 transition-colors cursor-pointer ${
                deviceView === 'mobile' ? 'bg-[#003366] text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
              title="Mobile View (390px)"
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>

          <a
            href="/partners"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <Eye className="h-4 w-4 text-emerald-600" />
            <span>Open Live Portal</span>
          </a>

          <button
            type="button"
            onClick={handleResetToDefaults}
            className="rounded-xl border border-slate-200 bg-white p-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
            title="Reset to factory defaults"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold text-white shadow-sm transition-all cursor-pointer ${
              hasChanges ? 'bg-red-600 hover:bg-red-500 ring-2 ring-red-400/50 shadow-red-500/30' : 'bg-[#003366] hover:bg-[#002244]'
            }`}
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'Publishing...' : hasChanges ? 'Save Changes *' : 'Published Live'}</span>
          </button>
        </div>
      </AdminPageHeader>

      {/* ── SPLIT STUDIO CONTAINER: SIDEBAR ON LEFT, LIVE PREVIEW ON RIGHT ── */}
      <div className="flex flex-col lg:flex-row gap-5 items-stretch min-h-[750px]">
        {/* ── LEFT PANE: DOCKED SIDEBAR EDITOR CONTROLS ── */}
        <div className="w-full lg:w-[480px] shrink-0 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm flex flex-col overflow-hidden">
          {/* Sidebar Top Nav Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50/80 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/60 overflow-x-auto scrollbar-none gap-1">
            {[
              { id: 'hero', label: 'Hero Header', icon: Type },
              { id: 'stats', label: `Stats (${partnersConfig.stats?.length || 0})`, icon: Sliders },
              { id: 'companies', label: `Directory (${partners.length})`, icon: Building2 },
              { id: 'stakeholders', label: `Alliances (${partnersConfig.stakeholderTracks?.length || 0})`, icon: Handshake },
              { id: 'recruitment', label: `Recruitment (${partnersConfig.recruitmentTracks?.length || 0})`, icon: Briefcase },
              { id: 'benefits', label: `Benefits (${partnersConfig.benefits?.length || 0})`, icon: Award },
              { id: 'faqs', label: `FAQs (${partnersConfig.faqs?.length || 0})`, icon: HelpCircle },
              { id: 'contact', label: 'Contact Directorate', icon: Phone },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleSidebarTabSwitch(tab.id as SidebarTab)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    sidebarTab === tab.id
                      ? 'bg-white text-[#003366] shadow-xs ring-1 ring-slate-200 dark:bg-slate-900 dark:text-sky-300 dark:ring-slate-700'
                      : 'text-slate-500 hover:bg-slate-200/60 dark:text-slate-400'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sidebar Body Content with Scroll */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[700px]">
            {/* ── 1. HERO TAB ── */}
            {sidebarTab === 'hero' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 text-xs text-blue-900">
                  <p className="font-bold flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    Unified Portal Hero Section
                  </p>
                  <p className="text-[11px] text-blue-700 mt-0.5">
                    Modifications update the flagship header and button links on /partners in real-time.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Badge Tag</label>
                  <input
                    type="text"
                    value={partnersConfig.heroBadge}
                    onChange={(e) => updatePartnersConfig({ heroBadge: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Main Title Prefix</label>
                  <input
                    type="text"
                    value={partnersConfig.heroTitle}
                    onChange={(e) => updatePartnersConfig({ heroTitle: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Highlighted Title Text</label>
                  <input
                    type="text"
                    value={partnersConfig.heroHighlight}
                    onChange={(e) => updatePartnersConfig({ heroHighlight: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold text-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-emerald-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Subtitle & Value Proposition</label>
                  <textarea
                    rows={3}
                    value={partnersConfig.heroSubtitle}
                    onChange={(e) => updatePartnersConfig({ heroSubtitle: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Primary CTA Text</label>
                    <input
                      type="text"
                      value={partnersConfig.heroPrimaryCtaText}
                      onChange={(e) => updatePartnersConfig({ heroPrimaryCtaText: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Primary Link</label>
                    <input
                      type="text"
                      value={partnersConfig.heroPrimaryCtaLink}
                      onChange={(e) => updatePartnersConfig({ heroPrimaryCtaLink: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Secondary CTA Text</label>
                    <input
                      type="text"
                      value={partnersConfig.heroSecondaryCtaText}
                      onChange={(e) => updatePartnersConfig({ heroSecondaryCtaText: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Secondary Link</label>
                    <input
                      type="text"
                      value={partnersConfig.heroSecondaryCtaLink}
                      onChange={(e) => updatePartnersConfig({ heroSecondaryCtaLink: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── 2. STATS TAB ── */}
            {sidebarTab === 'stats' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Impact Metric Cards</span>

                {(partnersConfig.stats || []).map((stat, i) => (
                  <div
                    key={stat.id || i}
                    className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-700 dark:bg-slate-800 space-y-2"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Value / Number</label>
                        <input
                          type="text"
                          value={stat.value}
                          onChange={(e) => {
                            setHasChanges(true);
                            const updated = [...(partnersConfig.stats || [])];
                            updated[i] = { ...updated[i], value: e.target.value };
                            updatePartnersConfig({ stats: updated });
                          }}
                          className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white p-1.5 text-xs font-black text-[#003366] dark:border-slate-600 dark:bg-slate-700"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Metric Label</label>
                        <input
                          type="text"
                          value={stat.label}
                          onChange={(e) => {
                            setHasChanges(true);
                            const updated = [...(partnersConfig.stats || [])];
                            updated[i] = { ...updated[i], label: e.target.value };
                            updatePartnersConfig({ stats: updated });
                          }}
                          className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white p-1.5 text-xs dark:border-slate-600 dark:bg-slate-700"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── 3. COMPANIES DIRECTORY TAB ── */}
            {sidebarTab === 'companies' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Corporate Employer Alliances ({partners.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleOpenAddCompany}
                    className="inline-flex items-center gap-1 rounded-xl bg-[#003366] px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#002244] cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Organization Modal</span>
                  </button>
                </div>

                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={partnerSearch}
                    onChange={(e) => setPartnerSearch(e.target.value)}
                    placeholder="Search partner companies..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-white outline-none focus:border-[#003366]"
                  />
                </div>

                <div className="space-y-2">
                  {paginatedPartners.map((company) => (
                    <div
                      key={company.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 hover:border-[#003366]/40 transition-all dark:border-slate-700 dark:bg-slate-800"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200 dark:border-slate-700 text-xs font-black text-[#003366] shadow-2xs overflow-hidden p-1">
                          {company.logo ? (
                            <img
                              src={company.logo}
                              alt={company.name}
                              className="h-full w-full object-contain"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                                if (e.currentTarget.parentElement) {
                                  e.currentTarget.parentElement.innerText = company.name.slice(0, 2).toUpperCase();
                                }
                              }}
                            />
                          ) : (
                            <span>{company.name.slice(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate dark:text-white flex items-center gap-1.5">
                            <span>{company.name}</span>
                            {company.featured && (
                              <span className="rounded bg-amber-100 px-1 text-[9px] font-black text-amber-800">Key</span>
                            )}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate dark:text-slate-400">
                            {company.industry || 'Technology'} • {company.location || 'Ethiopia'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleEditCompany(company)}
                          className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCompany(company.id)}
                          className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {filteredPartners.length === 0 && (
                    <div className="text-center py-6 text-xs text-slate-400">
                      No partner companies found matching your query.
                    </div>
                  )}
                </div>

                {filteredPartners.length > 0 && (
                  <AdminTablePagination
                    currentPage={partnerPage}
                    totalItems={filteredPartners.length}
                    pageSize={partnerPageSize}
                    onPageChange={setPartnerPage}
                    onPageSizeChange={setPartnerPageSize}
                    pageSizeOptions={[5, 8, 16, 32]}
                    itemName="partner companies"
                    className="rounded-xl border border-slate-200 dark:border-slate-800 p-2"
                  />
                )}
              </div>
            )}

            {/* ── 4. STAKEHOLDERS TAB ── */}
            {sidebarTab === 'stakeholders' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Stakeholder Framework Tracks ({partnersConfig.stakeholderTracks?.length || 0})
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenStakeholderModal(null)}
                    className="inline-flex items-center gap-1 rounded-xl bg-[#003366] px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#002244] cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Framework Modal</span>
                  </button>
                </div>

                {(partnersConfig.stakeholderTracks || []).map((track, i) => (
                  <div
                    key={track.id || i}
                    className="flex items-center justify-between gap-2 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60"
                  >
                    <div>
                      <span className="text-[9px] font-bold text-[#003366] dark:text-sky-400 uppercase bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                        {track.badge || 'Consortium Track'}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">{track.title}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{track.desc}</p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenStakeholderModal(i)}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-sky-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteStakeholderTrack(i)}
                        className="p-1 text-rose-600 dark:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── 5. RECRUITMENT TAB ── */}
            {sidebarTab === 'recruitment' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Recruitment Pillars ({partnersConfig.recruitmentTracks?.length || 0})
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenRecruitmentModal(null)}
                    className="inline-flex items-center gap-1 rounded-xl bg-[#003366] px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#002244] cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Pillar Modal</span>
                  </button>
                </div>

                {(partnersConfig.recruitmentTracks || []).map((track, i) => (
                  <div
                    key={track.id || i}
                    className="flex items-center justify-between gap-2 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60"
                  >
                    <div>
                      <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 uppercase bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                        {track.badge || 'Pipeline Pillar'}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">{track.title}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{track.desc}</p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenRecruitmentModal(i)}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-sky-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRecruitmentTrack(i)}
                        className="p-1 text-rose-600 dark:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── 6. BENEFITS TAB ── */}
            {sidebarTab === 'benefits' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Mutual Value Cards ({partnersConfig.benefits?.length || 0})
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenBenefitModal(null)}
                    className="inline-flex items-center gap-1 rounded-xl bg-[#003366] px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#002244] cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Benefit Modal</span>
                  </button>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Section Title</label>
                  <input
                    type="text"
                    value={partnersConfig.benefitsTitle}
                    onChange={(e) => updatePartnersConfig({ benefitsTitle: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>

                {(partnersConfig.benefits || []).map((benefit, i) => (
                  <div
                    key={benefit.id || i}
                    className="flex items-center justify-between gap-2 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{benefit.title}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{benefit.description}</p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenBenefitModal(i)}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-sky-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBenefit(i)}
                        className="p-1 text-rose-600 dark:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── 7. FAQS TAB ── */}
            {sidebarTab === 'faqs' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Frequently Asked Questions ({partnersConfig.faqs?.length || 0})
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenFaqModal(null)}
                    className="inline-flex items-center gap-1 rounded-xl bg-[#003366] px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#002244] cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add FAQ Modal</span>
                  </button>
                </div>

                {(partnersConfig.faqs || []).map((faq, i) => (
                  <div
                    key={faq.id || i}
                    className="flex items-center justify-between gap-2 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-[#003366] dark:text-sky-300">Q: {faq.question}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">A: {faq.answer}</p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenFaqModal(i)}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-sky-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteFaq(i)}
                        className="p-1 text-rose-600 dark:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── 8. CONTACT TAB ── */}
            {sidebarTab === 'contact' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 space-y-3 dark:border-slate-700 dark:bg-slate-800">
                  <h4 className="text-xs font-bold text-[#003366]">Industry Linkage Directorate Contact</h4>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Office Location</label>
                    <input
                      type="text"
                      value={partnersConfig.contactAddress || ''}
                      onChange={(e) => updatePartnersConfig({ contactAddress: e.target.value })}
                      placeholder="ASTU Main Campus, Adama, Ethiopia"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs dark:border-slate-600 dark:bg-slate-700"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Email Address</label>
                    <input
                      type="email"
                      value={partnersConfig.contactEmail || ''}
                      onChange={(e) => updatePartnersConfig({ contactEmail: e.target.value })}
                      placeholder="industry.linkage@astu.edu.et"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs dark:border-slate-600 dark:bg-slate-700"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Telephone</label>
                    <input
                      type="text"
                      value={partnersConfig.contactPhone || ''}
                      onChange={(e) => updatePartnersConfig({ contactPhone: e.target.value })}
                      placeholder="+251 22 110 0024"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs dark:border-slate-600 dark:bg-slate-700"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT PANE: INTERACTIVE LIVE PREVIEW CANVAS WITH AUTO-SCROLL ── */}
        <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-100/70 dark:border-slate-800 dark:bg-slate-950/70 p-2 sm:p-4 overflow-y-auto max-h-[820px] flex justify-center items-start">
          <PartnerLivePreviewCanvas
            partnersConfig={partnersConfig}
            partnersList={partners}
            deviceView={deviceView}
            activePreviewTab={previewActiveTab}
            activeSidebarTab={sidebarTab}
            onTabChange={(tab) => setPreviewActiveTab(tab)}
          />
        </div>
      </div>

      {/* ── ADD / EDIT COMPANY MODAL ── */}
      {companyModalOpen && editingCompany && (
        <AdminModal
          open={companyModalOpen}
          onClose={() => setCompanyModalOpen(false)}
          title={editingCompany.name ? `Edit Partner — ${editingCompany.name}` : 'Add Corporate Employer Organization'}
          size="lg"
        >
          <form onSubmit={handleSaveCompanyModal} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Organization Name *</label>
              <input
                type="text"
                required
                value={editingCompany.name}
                onChange={(e) => setEditingCompany({ ...editingCompany, name: e.target.value })}
                placeholder="e.g. Ethiopian Airlines Group"
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white font-bold"
              />
            </div>

            {/* ── PARTNER / EMPLOYER LOGO SECTION ── */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4 text-[#003366] dark:text-sky-400" />
                    <span>Partner / Employer Logo</span>
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Upload an image file (SVG, PNG, JPG, WebP) or enter a direct image URL.
                  </p>
                </div>
                {editingCompany.logo ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                    <Check className="h-3 w-3" /> Logo Configured
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                    Default Initials Badge
                  </span>
                )}
              </div>

              {/* Mode switch tabs */}
              <div className="flex rounded-xl bg-slate-200/80 dark:bg-slate-700/60 p-1 gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => setLogoInputMode('upload')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    logoInputMode === 'upload'
                      ? 'bg-white dark:bg-slate-800 text-[#003366] dark:text-sky-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload File</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLogoInputMode('url')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    logoInputMode === 'url'
                      ? 'bg-white dark:bg-slate-800 text-[#003366] dark:text-sky-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <LinkIcon className="h-3.5 w-3.5" />
                  <span>Image URL</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLogoInputMode('presets')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    logoInputMode === 'presets'
                      ? 'bg-white dark:bg-slate-800 text-[#003366] dark:text-sky-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Quick Presets</span>
                </button>
              </div>

              {/* Tab 1: Upload File */}
              {logoInputMode === 'upload' && (
                <div>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setLogoDragActive(true);
                    }}
                    onDragLeave={() => setLogoDragActive(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setLogoDragActive(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleLogoFileUpload(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => logoFileInputRef.current?.click()}
                    className={`cursor-pointer rounded-xl border-2 border-dashed p-4 text-center transition-all ${
                      logoDragActive
                        ? 'border-[#003366] bg-[#003366]/5 dark:border-sky-400 dark:bg-sky-950/20'
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800/80 hover:border-[#003366]/60 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-[#003366] dark:text-sky-400 mb-1.5">
                      <Upload className="h-4 w-4" />
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Click to choose image <span className="font-normal text-slate-500">or drag and drop here</span>
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                      Supports SVG, PNG, JPG, or WebP (max 5MB)
                    </p>
                  </div>
                  <input
                    ref={logoFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleLogoFileUpload(e.target.files[0]);
                    }}
                    className="hidden"
                  />
                </div>
              )}

              {/* Tab 2: URL input */}
              {logoInputMode === 'url' && (
                <div className="space-y-1.5">
                  <div className="relative">
                    <input
                      type="text"
                      value={editingCompany.logo || ''}
                      onChange={(e) => setEditingCompany({ ...editingCompany, logo: e.target.value })}
                      placeholder="e.g. /images/partners/ethiopian-airlines.svg or https://..."
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-3 pr-8 py-2 text-xs text-slate-900 dark:text-white font-medium"
                    />
                    {editingCompany.logo && (
                      <button
                        type="button"
                        onClick={() => setEditingCompany({ ...editingCompany, logo: '' })}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                        title="Clear URL"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">
                    Paste any local asset path (/images/...) or external HTTPS image URL.
                  </p>
                </div>
              )}

              {/* Tab 3: Presets */}
              {logoInputMode === 'presets' && (
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    Click to select from partner & university logos:
                  </p>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                    {PARTNER_LOGO_PRESETS.map((preset) => {
                      const isSelected = editingCompany.logo === preset.path;
                      return (
                        <button
                          key={preset.path}
                          type="button"
                          onClick={() => {
                            setEditingCompany({
                              ...editingCompany,
                              logo: preset.path,
                              name: editingCompany.name || preset.name,
                            });
                            toast.success(`Loaded ${preset.name} logo`);
                          }}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#003366] text-white border-[#003366] shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#003366]/40'
                          }`}
                        >
                          <img
                            src={preset.path}
                            alt={preset.name}
                            className="h-4 w-4 object-contain"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                          <span>{preset.name}</span>
                          {isSelected && <Check className="h-3 w-3 shrink-0 ml-0.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── LIVE LOGO PREVIEW BOX ── */}
              <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative flex h-14 w-16 shrink-0 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1 overflow-hidden">
                    {editingCompany.logo ? (
                      <img
                        src={editingCompany.logo}
                        alt={editingCompany.name || 'Logo preview'}
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#003366] text-white text-xs font-black shadow-xs">
                        {(editingCompany.name || 'P').slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {editingCompany.logo ? 'Active Logo Display' : 'Initials Avatar Badge'}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {editingCompany.logo
                        ? editingCompany.logo.startsWith('data:')
                          ? 'Local uploaded image file'
                          : editingCompany.logo
                        : 'No logo provided — 2-letter initials will display on public portal.'}
                    </p>
                  </div>
                </div>

                {editingCompany.logo && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCompany({ ...editingCompany, logo: '' });
                      toast.success('Logo removed');
                    }}
                    className="shrink-0 text-xs font-bold text-red-600 hover:text-red-700 dark:text-red-400 hover:underline px-2 py-1 cursor-pointer"
                  >
                    Remove Logo
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Industry Sector</label>
                <input
                  type="text"
                  value={editingCompany.industry || ''}
                  onChange={(e) => setEditingCompany({ ...editingCompany, industry: e.target.value })}
                  placeholder="e.g. Commercial Aviation & Logistics"
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Partnership Tier</label>
                <select
                  value={editingCompany.partnershipType || 'Enterprise'}
                  onChange={(e) => setEditingCompany({ ...editingCompany, partnershipType: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs text-slate-900 dark:text-white font-bold"
                >
                  <option value="Strategic Alliance">Strategic Alliance</option>
                  <option value="Enterprise">Enterprise</option>
                  <option value="Academic Sponsor">Academic Sponsor</option>
                  <option value="Recruitment Partner">Recruitment Partner</option>
                  <option value="Research">Research</option>
                  <option value="Internship">Internship</option>
                  <option value="Technology">Technology</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Location</label>
                <input
                  type="text"
                  value={editingCompany.location || ''}
                  onChange={(e) => setEditingCompany({ ...editingCompany, location: e.target.value })}
                  placeholder="e.g. Addis Ababa, Ethiopia"
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Active Graduate Openings</label>
                <input
                  type="text"
                  value={editingCompany.openings || ''}
                  onChange={(e) => setEditingCompany({ ...editingCompany, openings: e.target.value })}
                  placeholder="e.g. 5 Graduate Engineering Roles"
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Globe className="h-3 w-3 text-[#003366] dark:text-sky-400" />
                  <span>Website URL</span>
                </label>
                <input
                  type="url"
                  value={editingCompany.website || ''}
                  onChange={(e) => setEditingCompany({ ...editingCompany, website: e.target.value })}
                  placeholder="e.g. https://www.ethiopianairlines.com"
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Mail className="h-3 w-3 text-[#003366] dark:text-sky-400" />
                  <span>HR / Contact Email</span>
                </label>
                <input
                  type="email"
                  value={editingCompany.contactEmail || ''}
                  onChange={(e) => setEditingCompany({ ...editingCompany, contactEmail: e.target.value })}
                  placeholder="e.g. recruitment@company.com"
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Partnership Overview</label>
              <textarea
                value={editingCompany.description || ''}
                onChange={(e) => setEditingCompany({ ...editingCompany, description: e.target.value })}
                rows={3}
                placeholder="Collaborates with ASTU on talent acquisition, technical workshops, and student internships..."
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white resize-none"
              />
            </div>

            <div className="flex items-center gap-6 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={editingCompany.featured ?? true}
                  onChange={(e) => setEditingCompany({ ...editingCompany, featured: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-[#003366] focus:ring-[#003366]"
                />
                <span>Key Featured Partner (Show in Key spotlights)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={editingCompany.active ?? true}
                  onChange={(e) => setEditingCompany({ ...editingCompany, active: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-[#003366] focus:ring-[#003366]"
                />
                <span>Active & Published</span>
              </label>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCompanyModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#003366] text-white text-xs font-bold shadow-md hover:bg-[#002244] cursor-pointer"
              >
                Save Organization
              </button>
            </div>
          </form>
        </AdminModal>
      )}

      {/* ── ADD / EDIT STAKEHOLDER TRACK MODAL ── */}
      {stakeholderModalOpen && (
        <AdminModal
          open={stakeholderModalOpen}
          onClose={() => setStakeholderModalOpen(false)}
          title={stakeholderEditingIdx !== null ? 'Edit Strategic Alliance Track' : 'Add Strategic Alliance Track'}
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tier Badge / Category</label>
              <input
                type="text"
                value={stakeholderForm.badge || ''}
                onChange={(e) => setStakeholderForm({ ...stakeholderForm, badge: e.target.value })}
                placeholder="e.g. Consortium Track"
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Framework Title</label>
              <input
                type="text"
                value={stakeholderForm.title}
                onChange={(e) => setStakeholderForm({ ...stakeholderForm, title: e.target.value })}
                placeholder="e.g. Industry Advisory Board"
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Description</label>
              <textarea
                value={stakeholderForm.desc}
                onChange={(e) => setStakeholderForm({ ...stakeholderForm, desc: e.target.value })}
                rows={3}
                placeholder="Details of joint curriculum alignment, research grants..."
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white resize-none"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button onClick={() => setStakeholderModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
                Cancel
              </button>
              <button onClick={handleSaveStakeholderModal} className="px-4 py-2 rounded-xl bg-[#003366] text-white text-xs font-bold shadow-md">
                Save Track
              </button>
            </div>
          </div>
        </AdminModal>
      )}

      {/* ── ADD / EDIT RECRUITMENT PILLAR MODAL ── */}
      {recruitmentModalOpen && (
        <AdminModal
          open={recruitmentModalOpen}
          onClose={() => setRecruitmentModalOpen(false)}
          title={recruitmentEditingIdx !== null ? 'Edit Recruitment Pillar' : 'Add Recruitment Pillar'}
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Pillar Badge</label>
              <input
                type="text"
                value={recruitmentForm.badge || ''}
                onChange={(e) => setRecruitmentForm({ ...recruitmentForm, badge: e.target.value })}
                placeholder="e.g. Pipeline Pillar"
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Pillar Title</label>
              <input
                type="text"
                value={recruitmentForm.title}
                onChange={(e) => setRecruitmentForm({ ...recruitmentForm, title: e.target.value })}
                placeholder="e.g. Priority Campus Expo Placement"
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Description</label>
              <textarea
                value={recruitmentForm.desc}
                onChange={(e) => setRecruitmentForm({ ...recruitmentForm, desc: e.target.value })}
                rows={3}
                placeholder="Process flow details regarding student vetting, campus interviews..."
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white resize-none"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button onClick={() => setRecruitmentModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
                Cancel
              </button>
              <button onClick={handleSaveRecruitmentModal} className="px-4 py-2 rounded-xl bg-[#003366] text-white text-xs font-bold shadow-md">
                Save Pillar
              </button>
            </div>
          </div>
        </AdminModal>
      )}

      {/* ── ADD / EDIT BENEFIT MODAL ── */}
      {benefitModalOpen && (
        <AdminModal
          open={benefitModalOpen}
          onClose={() => setBenefitModalOpen(false)}
          title={benefitEditingIdx !== null ? 'Edit Partner Benefit' : 'Add Partner Benefit'}
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Benefit Title</label>
              <input
                type="text"
                value={benefitForm.title}
                onChange={(e) => setBenefitForm({ ...benefitForm, title: e.target.value })}
                placeholder="e.g. Hire Talented Graduates"
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Description</label>
              <textarea
                value={benefitForm.description}
                onChange={(e) => setBenefitForm({ ...benefitForm, description: e.target.value })}
                rows={3}
                placeholder="Detailing mutual institutional advantages..."
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white resize-none"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button onClick={() => setBenefitModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
                Cancel
              </button>
              <button onClick={handleSaveBenefitModal} className="px-4 py-2 rounded-xl bg-[#003366] text-white text-xs font-bold shadow-md">
                Save Benefit
              </button>
            </div>
          </div>
        </AdminModal>
      )}

      {/* ── ADD / EDIT FAQ MODAL ── */}
      {faqModalOpen && (
        <AdminModal
          open={faqModalOpen}
          onClose={() => setFaqModalOpen(false)}
          title={faqEditingIdx !== null ? 'Edit Partnership FAQ' : 'Add Partnership FAQ'}
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Question</label>
              <input
                type="text"
                value={faqForm.question}
                onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                placeholder="e.g. How can our company request campus recruitment space?"
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Answer</label>
              <textarea
                value={faqForm.answer}
                onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                rows={4}
                placeholder="Clear institutional response outlining university procedures..."
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white resize-none"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button onClick={() => setFaqModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
                Cancel
              </button>
              <button onClick={handleSaveFaqModal} className="px-4 py-2 rounded-xl bg-[#003366] text-white text-xs font-bold shadow-md">
                Save FAQ
              </button>
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
