import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  User,
  Briefcase,
  Building2,
  GraduationCap,
  MapPin,
  Award,
  Quote,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Eye,
  Camera,
  Layers,
  FileText,
  Share2,
  Edit3,
} from 'lucide-react';
import CreatableCombobox from './CreatableCombobox';
import ImageUploader from './ImageUploader';
import { CommunityMember } from '../services/communityMembers.service';

export interface CommunityMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (memberData: Partial<CommunityMember>) => void;
  onSwitchToEdit?: () => void;
  initialData?: Partial<CommunityMember> | null;
  mode?: 'add' | 'edit' | 'view';
}

const CATEGORY_PRESETS = [
  'executive',
  'academia',
  'engineering',
  'policy',
  'entrepreneurship',
  'research',
  'healthcare',
];

const ROLE_PRESETS = [
  'Chief Executive Officer (CEO)',
  'Senior Software Engineer',
  'Assistant Professor & Researcher',
  'Lead Cloud Solutions Architect',
  'Director of Engineering',
  'Founder & Managing Director',
  'Principal Systems Consultant',
  'Senior Project Manager',
  'Aviation Systems Specialist',
  'Data Science & AI Lead',
  'Dean of Faculty',
  'Chief Technology Officer (CTO)',
];

const ORG_PRESETS = [
  'Adama Science and Technology University (ASTU)',
  'Ethiopian Airlines Group',
  'Ethio Telecom',
  'Commercial Bank of Ethiopia',
  'Google',
  'Microsoft Corporation',
  'Boeing Commercial Airplanes',
  'Ministry of Innovation & Technology (MInT)',
  'Safaricom Ethiopia',
  'Amazon Web Services (AWS)',
  'Siemens Energy',
  'Meta Platforms',
];

const DEGREE_PRESETS = [
  'B.Sc. Software Engineering',
  'B.Sc. Electrical & Computer Engineering',
  'B.Sc. Mechanical Engineering',
  'B.Sc. Civil & Environmental Engineering',
  'B.Sc. Chemical Engineering',
  'M.Sc. Computer Science',
  'M.Sc. Power & Energy Systems',
  'Ph.D. in Engineering & Applied Technology',
  'B.Sc. Applied Chemistry',
  'Executive MBA in Technology Management',
];

const GRAD_YEAR_PRESETS = [
  '2025',
  '2024',
  '2023',
  '2022',
  '2021',
  '2020',
  '2018',
  '2015',
  '2012',
  '2010',
  '2005',
  '1998',
  '1993',
];

const LOCATION_PRESETS = [
  'Addis Ababa, Ethiopia',
  'Adama / Main Campus, Ethiopia',
  'Seattle, WA, United States',
  'Frankfurt, Germany',
  'Dubai, United Arab Emirates',
  'Nairobi, Kenya',
  'London, United Kingdom',
  'Toronto, Canada',
  'Doha, Qatar',
  'Zurich, Switzerland',
];

const BADGE_PRESETS = [
  'Distinguished Alum',
  'Chapter Lead',
  'Executive Leader',
  'Tech Innovator',
  'Keynote Speaker',
  'Industry Pioneer',
  "Dean's Honor",
  'Founder',
  'Global Ambassador',
  'Research Fellow',
];

const PHOTO_PRESETS = [
  { name: 'Samson Arega', url: 'https://astualumni.astu.edu.et/media/communityProfile/Samson_Arega_Bekele.jpg' },
  { name: 'Zenebe Mideksa', url: 'https://astualumni.astu.edu.et/media/communityProfile/Zenebe_Mideksa_Abebe.png' },
  { name: 'Tadesse', url: 'https://astualumni.astu.edu.et/media/communityProfile/Tadesse.jpg' },
  { name: 'Melaku Assefa', url: 'https://astualumni.astu.edu.et/media/communityProfile/MelakuAssefa.jpg' },
  { name: 'Dr. Tafesse', url: 'https://astualumni.astu.edu.et/media/communityProfile/Dr._Tafesse_Asrat_Abera.png' },
  { name: 'Tibebu Bekele', url: 'https://astualumni.astu.edu.et/media/communityProfile/Tibebu_Tegegne_Bekele.jpg' },
  { name: 'Eng. Assefa', url: 'https://astualumni.astu.edu.et/media/communityProfile/Eng._Assefa_Dida.png' },
  { name: 'Habtamu Beri', url: 'https://astualumni.astu.edu.et/media/communityProfile/HabtamuBeri.jpg' },
  { name: 'Niguse Assefa', url: 'https://astualumni.astu.edu.et/media/communityProfile/NiguseAssefa.jpg' },
];

const QUOTE_PRESETS = [
  'ASTU gave me the rigorous engineering foundation to lead global technical teams with confidence.',
  'Proud to give back to the university that shaped my leadership journey and professional values.',
  'The ASTU alumni network is the bridge between student ambition and global industry reality.',
  'Practical laboratory excellence at ASTU prepared our cohort for direct corporate impact.',
];

export default function CommunityMemberModal({
  isOpen,
  onClose,
  onSave,
  onSwitchToEdit,
  initialData,
  mode = 'add',
}: CommunityMemberModalProps) {
  const [formData, setFormData] = useState<Partial<CommunityMember>>({
    name: '',
    role: '',
    org: '',
    category: 'executive',
    degree: 'B.Sc. Software Engineering',
    gradYear: '2022',
    location: 'Addis Ababa, Ethiopia',
    badge: 'Distinguished Alum',
    quote: '',
    bio: '',
    image: 'https://astualumni.astu.edu.et/media/communityProfile/Samson_Arega_Bekele.jpg',
    active: true,
  });

  const [activeTab, setActiveTab] = useState<'details' | 'bio' | 'photo'>('details');
  const [previewMode, setPreviewMode] = useState<'card' | 'detail'>('card');

  // Lock body scroll and keydown listener when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Sync initialData
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        category: (initialData.category as any) || 'executive',
        active: initialData.active !== false,
      });
    } else {
      setFormData({
        name: '',
        role: '',
        org: '',
        category: 'executive',
        degree: 'B.Sc. Software Engineering',
        gradYear: '2022',
        location: 'Addis Ababa, Ethiopia',
        badge: 'Distinguished Alum',
        quote: '',
        bio: '',
        image: 'https://astualumni.astu.edu.et/media/communityProfile/Samson_Arega_Bekele.jpg',
        active: true,
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) {
      onSave(formData);
    }
  };

  const categoryColors: Record<string, string> = {
    executive: 'bg-amber-100 text-amber-800 border-amber-200',
    academia: 'bg-blue-100 text-blue-800 border-blue-200',
    engineering: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    policy: 'bg-purple-100 text-purple-800 border-purple-200',
    entrepreneurship: 'bg-orange-100 text-orange-800 border-orange-200',
    research: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  };

  const modalNode = (
    <div
      className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen z-[999999] flex items-center justify-center bg-slate-950/85 p-3 sm:p-5 md:p-6 backdrop-blur-md overflow-y-auto"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`relative w-full ${
          mode === 'view' ? 'max-w-4xl' : 'max-w-6xl'
        } rounded-3xl border border-slate-700/80 bg-white shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Executive Header Banner with ASTU Seal Logo */}
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-r from-[#00173d] via-[#002d6b] to-[#004899] px-6 py-4 text-white shadow-md border-b border-[#002254]/60">
          <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/5 blur-2xl" />
          <div className="pointer-events-none absolute left-1/3 -bottom-10 h-28 w-28 rounded-full bg-[#1D9E75]/20 blur-xl" />
          <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400" />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              {/* Official ASTU Logo Badge */}
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white p-1.5 shadow-md border border-white/30">
                <img
                  src="/images/astu-seal-logo.png"
                  alt="ASTU Logo"
                  className="h-full w-full object-contain"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold tracking-tight text-white sm:text-lg">
                    {mode === 'add' && 'Add Community Member'}
                    {mode === 'edit' && `Edit Member: ${formData.name || 'Profile'}`}
                    {mode === 'view' && `Community Profile: ${formData.name || 'Member Details'}`}
                  </h2>
                  <span className="inline-flex items-center rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300 border border-emerald-400/30">
                    ASTU System
                  </span>
                </div>
                <p className="text-[11px] font-medium text-blue-100/80 mt-0.5">
                  Adama Science & Technology University • Alumni Community Network
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-white/70 hover:bg-white/15 hover:text-white transition-all border border-transparent hover:border-white/20 active:scale-95 cursor-pointer"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ─── MODE: VIEW ONLY ─── */}
        {mode === 'view' ? (
          <div className="overflow-y-auto p-6 space-y-6">
            {/* Top Member Card */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200">
              <div className="relative shrink-0">
                <img
                  src={formData.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                  alt={formData.name || 'Member'}
                  className="h-28 w-28 rounded-2xl object-cover border-4 border-white shadow-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
                  }}
                />
                <span
                  className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white ring-4 ring-white shadow-md"
                  title="Verified ASTU Leader"
                >
                  <CheckCircle2 className="h-4 w-4" />
                </span>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-[11px] font-bold uppercase border ${
                      categoryColors[formData.category || 'executive'] || 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {formData.category || 'executive'}
                  </span>
                  {formData.badge && (
                    <span className="rounded-md bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 border border-amber-200">
                      ★ {formData.badge}
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-[11px] font-semibold ${
                      formData.active !== false
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {formData.active !== false ? '● Live on Directory' : '○ Hidden from Directory'}
                  </span>
                </div>

                <h1 className="text-2xl font-black text-slate-900 leading-tight">
                  {formData.name || 'Full Name'}
                </h1>
                <p className="text-sm font-bold text-[#C8102E] mt-0.5">
                  {formData.role || 'Role / Professional Title'}
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-semibold text-slate-600 mt-1">
                  <Building2 className="h-4 w-4 text-[#003366]" />
                  <span>{formData.org || 'Organization'}</span>
                </div>
              </div>
            </div>

            {/* Credentials & Location Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  <GraduationCap className="h-3.5 w-3.5 text-[#003366]" />
                  Degree
                </div>
                <p className="text-xs font-bold text-slate-800 line-clamp-2">{formData.degree || 'Not Specified'}</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  <Award className="h-3.5 w-3.5 text-amber-500" />
                  Graduation Class
                </div>
                <p className="text-sm font-bold text-slate-800">Class of {formData.gradYear || '2022'}</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  <MapPin className="h-3.5 w-3.5 text-rose-500" />
                  Chapter / Location
                </div>
                <p className="text-xs font-bold text-slate-800 truncate">{formData.location || 'Ethiopia'}</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  Verification
                </div>
                <p className="text-xs font-bold text-emerald-600">Official ASTU Verified</p>
              </div>
            </div>

            {/* Quote Callout */}
            {formData.quote && (
              <div className="relative overflow-hidden rounded-2xl border-l-4 border-[#003366] bg-slate-50 p-4 pl-5">
                <Quote className="absolute right-4 bottom-2 h-12 w-12 text-slate-200/60 pointer-events-none" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Alumni Impact Quote</p>
                <p className="text-sm italic font-medium text-slate-700 leading-relaxed">
                  "{formData.quote}"
                </p>
              </div>
            )}

            {/* Biography */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Biography & Career Summary</p>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {formData.bio || 'No biography has been added yet for this community leader.'}
              </p>
            </div>

            {/* Footer Actions for View Mode */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Close
              </button>
              {onSwitchToEdit && (
                <button
                  type="button"
                  onClick={onSwitchToEdit}
                  className="rounded-xl bg-[#003366] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#002855] transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <Edit3 className="h-3.5 w-3.5" /> Edit Profile Details
                </button>
              )}
            </div>
          </div>
        ) : (
          /* ─── MODE: ADD / EDIT WITH SPLIT SCREEN & LIVE PREVIEW ─── */
          <div className="grid lg:grid-cols-12 overflow-y-auto">
            {/* Left Column: Form Editor (7 cols) */}
            <div className="lg:col-span-7 p-6 space-y-6 border-b lg:border-b-0 lg:border-r border-slate-100">
              {/* Editor Sub-Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('details')}
                  className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'details'
                      ? 'bg-[#003366] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Briefcase className="h-3.5 w-3.5" /> Identity & Role
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('bio')}
                  className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'bio'
                      ? 'bg-[#003366] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Quote className="h-3.5 w-3.5" /> Quote & Story
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('photo')}
                  className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'photo'
                      ? 'bg-[#003366] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Camera className="h-3.5 w-3.5" /> Avatar & Presets
                </button>
              </div>

              <form id="member-form" onSubmit={handleSubmit} className="space-y-5">
                {/* TAB 1: IDENTITY & ROLE */}
                {activeTab === 'details' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                        <span>
                          Full Name <span className="text-rose-500 font-black">*</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">e.g., Samson Arega Bekele</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={formData.name || ''}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Enter member's full legal or professional name"
                          className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] transition-all shadow-2xs"
                        />
                      </div>
                    </div>

                    {/* Role / Title (Typable Combobox) */}
                    <CreatableCombobox
                      label="Professional Role / Title"
                      required
                      value={formData.role || ''}
                      onChange={(val) => setFormData({ ...formData, role: val })}
                      placeholder="e.g. Chief Executive Officer, Senior Software Engineer"
                      presets={ROLE_PRESETS}
                      icon={Briefcase}
                    />

                    {/* Organization / Company (Typable Combobox) */}
                    <CreatableCombobox
                      label="Organization / Company / Affiliation"
                      required
                      value={formData.org || ''}
                      onChange={(val) => setFormData({ ...formData, org: val })}
                      placeholder="e.g. Ethiopian Airlines Group, Google, ASTU"
                      presets={ORG_PRESETS}
                      icon={Building2}
                    />

                    {/* Category & Distinction Badge (Grid) */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <CreatableCombobox
                        label="Community Category"
                        required
                        value={formData.category || 'executive'}
                        onChange={(val) => setFormData({ ...formData, category: val as any })}
                        placeholder="e.g. executive, academia, engineering"
                        presets={CATEGORY_PRESETS}
                        icon={Layers}
                      />

                      <CreatableCombobox
                        label="Distinction / Status Badge"
                        value={formData.badge || ''}
                        onChange={(val) => setFormData({ ...formData, badge: val })}
                        placeholder="e.g. Distinguished Alum, Chapter Lead"
                        presets={BADGE_PRESETS}
                        icon={Award}
                      />
                    </div>

                    {/* Degree & Graduation Year (Grid) */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <CreatableCombobox
                        label="Degree / Major"
                        value={formData.degree || ''}
                        onChange={(val) => setFormData({ ...formData, degree: val })}
                        placeholder="e.g. B.Sc. Software Engineering"
                        presets={DEGREE_PRESETS}
                        icon={GraduationCap}
                      />

                      <CreatableCombobox
                        label="Graduation Year / Batch"
                        value={formData.gradYear || ''}
                        onChange={(val) => setFormData({ ...formData, gradYear: val })}
                        placeholder="e.g. 2022, 2018, 1998"
                        presets={GRAD_YEAR_PRESETS}
                      />
                    </div>

                    {/* Location / Chapter Hub */}
                    <CreatableCombobox
                      label="Location / Chapter Hub"
                      value={formData.location || ''}
                      onChange={(val) => setFormData({ ...formData, location: val })}
                      placeholder="e.g. Addis Ababa, Ethiopia or Seattle, WA, USA"
                      presets={LOCATION_PRESETS}
                      icon={MapPin}
                    />

                    {/* Visibility Checkbox */}
                    <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                      <input
                        type="checkbox"
                        id="member-active-check"
                        checked={formData.active !== false}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        className="h-4 w-4 rounded border-slate-300 text-[#003366] focus:ring-[#003366] cursor-pointer"
                      />
                      <label htmlFor="member-active-check" className="text-xs font-semibold text-slate-700 cursor-pointer">
                        Publish profile on Public Alumni Directory (`active: true`)
                      </label>
                    </div>
                  </div>
                )}

                {/* TAB 2: QUOTE & BIO */}
                {activeTab === 'bio' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Quote className="h-3.5 w-3.5 text-[#003366]" />
                          Alumni Impact Quote
                        </label>
                        <span className="text-[10px] text-slate-400">Featured quotation on card</span>
                      </div>
                      <textarea
                        value={formData.quote || ''}
                        onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                        rows={2}
                        placeholder="Share a short inspirational sentence or alumni memory..."
                        className="w-full rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] transition-all resize-none shadow-2xs"
                      />
                      {/* Suggested Quotes */}
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Quick Quote Inspirations (Click to use):
                        </span>
                        <div className="flex flex-col gap-1.5">
                          {QUOTE_PRESETS.map((q, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setFormData({ ...formData, quote: q })}
                              className="text-left text-[11px] text-slate-600 hover:text-[#003366] bg-slate-50 hover:bg-blue-50/60 p-2 rounded-lg border border-slate-200 transition-colors"
                            >
                              "{q}"
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-[#003366]" />
                        Full Biography & Professional Achievements
                      </label>
                      <textarea
                        value={formData.bio || ''}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        rows={5}
                        placeholder="Provide comprehensive background details, career journey, academic milestones, and contributions to ASTU community..."
                        className="w-full rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] transition-all resize-none shadow-2xs leading-relaxed"
                      />
                    </div>
                  </div>
                )}

                {/* TAB 3: AVATAR & PRESETS */}
                {activeTab === 'photo' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800">Profile Image URL</label>
                      <input
                        type="text"
                        value={formData.image || ''}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        placeholder="https://... or /images/..."
                        className="w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] transition-all shadow-2xs"
                      />
                    </div>

                    <ImageUploader
                      label="Or Upload / Select Photo File"
                      value={formData.image || ''}
                      onChange={(val) => setFormData({ ...formData, image: val })}
                    />

                    {/* One-Click Verified Alumni Presets */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                          Verified Alumni Photo Presets:
                        </span>
                        <span className="text-[10px] text-slate-400">Click to apply instantly</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {PHOTO_PRESETS.map((preset) => {
                          const isChosen = formData.image === preset.url;
                          return (
                            <button
                              key={preset.name}
                              type="button"
                              onClick={() => setFormData({ ...formData, image: preset.url })}
                              className={`flex items-center gap-2 p-1.5 rounded-xl border text-left transition-all cursor-pointer ${
                                isChosen
                                  ? 'border-[#003366] bg-blue-50/60 ring-2 ring-[#003366]/20'
                                  : 'border-slate-200 bg-white hover:bg-slate-50'
                              }`}
                            >
                              <img
                                src={preset.url}
                                alt={preset.name}
                                className="h-8 w-8 rounded-lg object-cover border border-slate-200 shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                              <div className="min-w-0">
                                <p className="text-[10px] font-bold text-slate-800 truncate">{preset.name}</p>
                                <p className="text-[9px] text-slate-400">Verified</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Right Column: Interactive Live Preview (5 cols) */}
            <div className="lg:col-span-5 bg-slate-50/80 p-6 flex flex-col justify-between space-y-6">
              <div>
                {/* Preview Header & View Mode Switcher */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                      Live Public Preview
                    </span>
                  </div>

                  <div className="flex items-center bg-white rounded-lg p-0.5 border border-slate-200 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setPreviewMode('card')}
                      className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                        previewMode === 'card'
                          ? 'bg-[#003366] text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Directory Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode('detail')}
                      className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                        previewMode === 'detail'
                          ? 'bg-[#003366] text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Detail Modal
                    </button>
                  </div>
                </div>

                {/* Simulation Mode 1: Public Grid Card */}
                {previewMode === 'card' && (
                  <div className="mt-4">
                    <p className="text-[10px] text-slate-400 mb-2 font-medium">
                      Rendered in <code className="text-[#003366]">/community</code> public directory grid:
                    </p>

                    <article className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-md hover:shadow-lg transition-all">
                      <div>
                        {/* Top Bar with Badge & Share */}
                        <div className="flex items-center justify-between gap-2 mb-4">
                          {formData.badge ? (
                            <span className="rounded-md bg-[#003366]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#003366] uppercase tracking-wider border border-[#003366]/20">
                              {formData.badge}
                            </span>
                          ) : (
                            <span className="rounded-md bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                              Class of {formData.gradYear || '2024'}
                            </span>
                          )}
                          <span className="rounded-lg p-1 text-slate-400 bg-slate-50 border border-slate-100">
                            <Share2 className="h-3.5 w-3.5" />
                          </span>
                        </div>

                        {/* Profile Photo & Name */}
                        <div className="flex items-start gap-3.5 mb-3">
                          <div className="relative shrink-0">
                            <img
                              src={formData.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                              alt={formData.name || 'Member'}
                              className="h-16 w-16 rounded-2xl object-cover border-2 border-slate-100 shadow-md"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
                              }}
                            />
                            <span
                              className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-white"
                              title="Verified Alumni"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                            </span>
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                              {formData.name || 'Full Name'}
                            </h3>
                            <p className="text-xs font-semibold text-[#C8102E] line-clamp-1 mt-0.5">
                              {formData.role || 'Professional Role'}
                            </p>
                            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 mt-1 line-clamp-1">
                              <Building2 className="h-3 w-3 shrink-0 text-slate-400" />
                              <span className="truncate">{formData.org || 'Organization'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Degree & Year */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-2">
                          <GraduationCap className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">
                            {formData.gradYear || 'Year'} • {formData.degree || 'Degree'}
                          </span>
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{formData.location || 'Location'}</span>
                        </div>

                        {/* Quote Snippet */}
                        {formData.quote && (
                          <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100 mb-3">
                            <p className="text-[11px] italic text-slate-600 line-clamp-2 leading-relaxed">
                              "{formData.quote}"
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <button
                        type="button"
                        className="mt-2 w-full rounded-xl bg-slate-100 py-2 text-xs font-bold text-slate-700 hover:bg-[#003366] hover:text-white transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Eye className="h-3.5 w-3.5" /> View Profile
                      </button>
                    </article>
                  </div>
                )}

                {/* Simulation Mode 2: Detail Profile Modal View */}
                {previewMode === 'detail' && (
                  <div className="mt-4">
                    <p className="text-[10px] text-slate-400 mb-2 font-medium">
                      Rendered when public visitors click "View Profile":
                    </p>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md space-y-4">
                      <div className="flex items-start gap-4">
                        <img
                          src={formData.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                          alt={formData.name}
                          className="h-20 w-20 rounded-2xl object-cover border-2 border-slate-200 shadow-sm"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <span
                              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase border ${
                                categoryColors[formData.category || 'executive'] ||
                                'bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              {formData.category || 'executive'}
                            </span>
                            {formData.badge && (
                              <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                                {formData.badge}
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-black text-slate-900 leading-snug">
                            {formData.name || 'Member Name'}
                          </h3>
                          <p className="text-xs font-semibold text-[#C8102E]">{formData.role || 'Role'}</p>
                          <p className="text-xs text-slate-500">{formData.org || 'Organization'}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div>
                          <span className="text-slate-400 block font-semibold">Degree</span>
                          <span className="text-slate-800 font-bold">{formData.degree || 'B.Sc.'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-semibold">Class Year</span>
                          <span className="text-slate-800 font-bold">{formData.gradYear || '2024'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-semibold">Location</span>
                          <span className="text-slate-800 font-bold truncate block">
                            {formData.location || 'Ethiopia'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-semibold">Directory Status</span>
                          <span
                            className={`font-bold ${
                              formData.active !== false ? 'text-emerald-600' : 'text-slate-400'
                            }`}
                          >
                            {formData.active !== false ? 'Active & Live' : 'Draft / Hidden'}
                          </span>
                        </div>
                      </div>

                      {formData.quote && (
                        <div className="border-l-2 border-[#003366] pl-3 py-1">
                          <p className="text-xs italic text-slate-700 font-medium">"{formData.quote}"</p>
                        </div>
                      )}

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Biography</p>
                        <p className="text-xs text-slate-600 line-clamp-4 leading-relaxed">
                          {formData.bio ||
                            'Biography text provides readers with career background and contributions.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Actions inside Right Panel */}
              <div className="pt-4 border-t border-slate-200/80 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="rounded-xl bg-[#003366] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#002855] transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  {mode === 'add' ? 'Save New Member' : 'Save Profile Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalNode, document.body);
}
