import React, { useState, useEffect, useRef } from 'react';
import {
  Briefcase,
  Users,
  Building2,
  CheckCircle,
  ArrowRight,
  Handshake,
  Search,
  MessageSquare,
  TrendingUp,
  Globe,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  MapPin,
  Clock,
  Award,
  CheckCircle2,
  ShieldCheck,
  Cpu,
  ExternalLink,
  Calendar,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { Partner, PartnersPageConfig, defaultPartnersPageConfig } from '../services/homepageCms.service';
import { partnerLogos } from '../../../components/PartnerLogos';
import { usePublicMetrics } from '../../../services/publicMetrics.service';
import CompanyDetailModal from '../../../components/CompanyDetailModal';

const DEFAULT_BENEFITS = [
  {
    icon: Users,
    title: 'Hire Talented Graduates',
    description: 'Access a pool of verified ASTU graduates with practical skills in engineering, technology, and sciences.',
  },
  {
    icon: Briefcase,
    title: 'Post Job Opportunities',
    description: 'Publish employment opportunities, internships, and campus recruitment events directly to our alumni network.',
  },
  {
    icon: MessageSquare,
    title: 'Give Industry Feedback',
    description: 'Provide valuable feedback on curriculum relevance and help shape future graduates to meet industry needs.',
  },
  {
    icon: Search,
    title: 'Verified Student Information',
    description: 'Search alumni by expertise, skills, department, and graduation year with verified credentials.',
  },
  {
    icon: TrendingUp,
    title: 'Track Recruitment Analytics',
    description: 'Monitor your recruitment metrics, application status, and hiring outcomes through our dashboard.',
  },
  {
    icon: Handshake,
    title: 'Build Strategic Partnerships',
    description: 'Establish long-term partnerships with ASTU for research collaboration, internships, and talent pipelines.',
  },
];

const DEFAULT_FEATURES = [
  'TIN-verified enterprise employer accounts with high trust scores',
  'Direct access to 1,238+ verified ASTU alumni and graduating seniors',
  'Curriculum-aligned technical skill matching and automated recommendations',
  'Accreditation-ready reporting and longitudinal tracer feedback loops',
  'Priority coordination for campus recruitment days and tech expos',
  'Direct engagement with academic departments and senior faculty',
];

interface PartnerLivePreviewCanvasProps {
  partnersConfig: PartnersPageConfig;
  partnersList: Partner[];
  onSelectCompany?: (partner: Partner) => void;
  deviceView?: 'mobile' | 'desktop' | 'tablet';
  activePreviewTab?: string;
  activeSidebarTab?: string;
  onTabChange?: (tab: any) => void;
}

export default function PartnerLivePreviewCanvas({
  partnersConfig,
  partnersList,
  onSelectCompany,
  activeSidebarTab,
}: PartnerLivePreviewCanvasProps) {
  const { metrics } = usePublicMetrics();
  const [selectedCompanyModal, setSelectedCompanyModal] = useState<Partner | null>(null);
  const [openFaqId, setOpenFaqId] = useState<string | null>('PF-1');
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll preview canvas to clicked section
  useEffect(() => {
    if (!activeSidebarTab || !containerRef.current) return;
    const targetEl = containerRef.current.querySelector(`#partner-section-${activeSidebarTab}`);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeSidebarTab]);

  const features =
    partnersConfig.features && partnersConfig.features.length > 0
      ? partnersConfig.features
      : DEFAULT_FEATURES;

  const activePartners = partnersList.filter((p) => p.active !== false);

  const stakeholderTracks = partnersConfig.stakeholderTracks && partnersConfig.stakeholderTracks.length > 0
    ? partnersConfig.stakeholderTracks.filter((t) => t.active !== false)
    : (defaultPartnersPageConfig.stakeholderTracks || []);

  const recruitmentTracks = partnersConfig.recruitmentTracks && partnersConfig.recruitmentTracks.length > 0
    ? partnersConfig.recruitmentTracks.filter((t) => t.active !== false)
    : (defaultPartnersPageConfig.recruitmentTracks || []);

  const faqs = partnersConfig.faqs && partnersConfig.faqs.length > 0
    ? partnersConfig.faqs
    : (defaultPartnersPageConfig.faqs || []);

  return (
    <div ref={containerRef} className="w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 text-slate-800 font-sans text-xs sm:text-sm">
      {/* Top Banner indicating Live Canvas */}
      <header className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <img src="/images/astu-seal-logo.png" alt="ASTU" className="h-5 w-5 object-contain" />
          <span className="font-bold text-[#002b66] tracking-tight text-xs">ASTU Enterprise Portal</span>
        </div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
          ⚡ Live Interactive Canvas
        </span>
      </header>

      {/* ── 1. Hero Section ── */}
      <section id="partner-section-hero" className="relative overflow-hidden bg-gradient-to-br from-astu-navy via-[#003366] to-[#002244] text-white p-6 sm:p-12 text-center">
        {/* Subtle square grid pattern overlay */}
        <div className="absolute inset-0 opacity-15 [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:3rem_3rem] pointer-events-none" />
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:3rem_3rem] pointer-events-none" />

        {/* Ambient glows & watermark */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-astu-green/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-astu-red/10 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
          <Users className="h-[280px] w-[280px] text-white" />
        </div>

        <div className="relative z-10 mx-auto max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-astu-green backdrop-blur-sm">
            <Building2 className="h-4 w-4 text-astu-green" />
            <span>{partnersConfig.heroBadge || 'Employer & Industry Partnerships'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black leading-tight text-white tracking-tight">
            {partnersConfig.heroTitle || 'Partner with ASTU to Access'}{' '}
            <span className="text-astu-green">
              {partnersConfig.heroHighlight || 'Top Engineering & Tech Graduates'}
            </span>
          </h1>

          <p className="text-xs sm:text-sm leading-relaxed text-slate-300 max-w-lg mx-auto">
            {partnersConfig.heroSubtitle ||
              'Connect with verified alumni talent, post job opportunities, and shape the future of technical education through industry collaboration.'}
          </p>

          {/* Frosted Square Stat Highlights in Center */}
          <div id="partner-section-stats" className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto py-2">
            <div className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-white/15 bg-white/10 backdrop-blur-sm shadow-sm hover:bg-white/15">
              <Users className="h-4 w-4 text-astu-green mb-1" />
              <span className="text-lg sm:text-xl font-black text-white">{metrics.registeredAlumniFormatted}</span>
              <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-300">Alumni Members</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-white/15 bg-white/10 backdrop-blur-sm shadow-sm hover:bg-white/15">
              <BookOpen className="h-4 w-4 text-astu-green mb-1" />
              <span className="text-lg sm:text-xl font-black text-white">{metrics.fieldsOfStudy}</span>
              <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-300">Fields of Study</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-white/15 bg-white/10 backdrop-blur-sm shadow-sm hover:bg-white/15">
              <Globe className="h-4 w-4 text-emerald-400 mb-1" />
              <span className="text-lg sm:text-xl font-black text-white">{metrics.corporatePartnersFormatted}</span>
              <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-300">Global Partners</span>
            </div>
          </div>

          {/* Action buttons & links at the bottom */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <span className="inline-flex items-center justify-center gap-2 rounded-xl bg-astu-green px-5 py-2.5 text-xs font-bold text-white shadow-lg cursor-pointer">
              {partnersConfig.heroPrimaryCtaText || 'Register as Employer'}
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
            <span className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-xs font-bold text-white backdrop-blur-sm cursor-pointer">
              {partnersConfig.heroSecondaryCtaText || 'Employer Login'}
            </span>
          </div>

          <div className="pt-1">
            <span className="text-[11px] text-slate-300 underline underline-offset-4 cursor-pointer">
              Explore Employer Partnership Benefits &amp; Criteria &darr;
            </span>
          </div>
        </div>
      </section>

      {/* ── 2. Benefits Section ── */}
      <section id="partner-section-benefits" className="p-6 sm:p-10 bg-white">
        <div className="mb-8 text-center">
          <span className="inline-block rounded-full bg-slate-100 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#003366] mb-2">
            Mutual Value &amp; Talent Access
          </span>
          <h2 className="mb-2 text-xl font-bold text-astu-navy sm:text-2xl">
            {partnersConfig.benefitsTitle || 'Why Partner with ASTU?'}
          </h2>
          <p className="mx-auto max-w-lg text-xs text-on-surface-variant">
            {partnersConfig.benefitsSubtitle || "Join 500+ partner organizations already hiring from ASTU's talented graduate pool"}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DEFAULT_BENEFITS.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className="group rounded-xl border border-outline-variant bg-white p-4 shadow-[0_2px_8px_rgba(0,51,102,0.06)] hover:shadow-md transition-shadow"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-astu-navy/10 text-astu-navy group-hover:bg-astu-navy group-hover:text-white transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-1 text-sm font-bold text-astu-navy">{benefit.title}</h3>
                <p className="text-xs leading-relaxed text-on-surface-variant">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 3. Partner Companies Section ── */}
      <section id="partner-section-companies" className="p-6 border-y border-outline-variant bg-slate-50/60 overflow-hidden">
        <div className="mb-4 text-center">
          <h3 className="text-base font-bold text-astu-navy">Partner Companies</h3>
          <p className="text-xs text-on-surface-variant">
            Institutional partners supporting employability and research collaboration.
          </p>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar py-2 items-center justify-center">
          {activePartners.map((partner, idx) => {
            const LogoComponent = partnerLogos[partner.name];
            return (
              <div
                key={`${partner.name}-${idx}`}
                onClick={() => {
                  setSelectedCompanyModal(partner);
                  if (onSelectCompany) onSelectCompany(partner);
                }}
                className="flex min-w-[140px] max-w-[160px] flex-col items-center gap-2 rounded-xl border border-outline-variant bg-white p-3 shadow-xs hover:shadow-sm cursor-pointer shrink-0"
              >
                <div className="h-12 w-full flex items-center justify-center">
                  {partner.logo ? (
                    <img src={partner.logo} alt={partner.name} className="max-h-9 max-w-[110px] w-auto h-auto object-contain" />
                  ) : LogoComponent ? (
                    <div className="h-9 w-full flex items-center justify-center">
                      <LogoComponent />
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-astu-navy text-white text-xs font-bold shadow-xs">
                      {partner.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-semibold text-astu-navy text-center truncate w-full">{partner.name}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 4. Strategic Alliances Tracks ── */}
      <section id="partner-section-stakeholders" className="p-6 sm:p-8 bg-white border-b border-slate-100">
        <div className="mb-6 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#003366] bg-blue-50 px-2.5 py-0.5 rounded-full">
            Multilateral Consortia
          </span>
          <h3 className="text-base sm:text-lg font-bold text-[#003366] mt-1">
            {partnersConfig.stakeholdersTitle || 'Strategic Alliances & Industry Consortia'}
          </h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stakeholderTracks.map((track) => (
            <div key={track.id} className="rounded-xl border border-slate-200 p-3.5 bg-slate-50/50">
              <span className="text-[9px] font-bold text-slate-500 uppercase bg-white px-2 py-0.5 rounded-md border border-slate-100">
                {track.badge || 'Consortium Track'}
              </span>
              <h5 className="text-xs font-bold text-[#003366] mt-2 mb-1">{track.title}</h5>
              <p className="text-[11px] text-slate-600 line-clamp-3 leading-relaxed">{track.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. Enterprise Ecosystem & Comprehensive Partner Benefits (Full-Width) ── */}
      <section className="p-6 sm:p-10 bg-white border-y border-slate-200">
        <div className="mb-6 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="h-3 w-3 text-emerald-600" />
            {partnersConfig.featuresEyebrow || 'ENTERPRISE ECOSYSTEM'}
          </span>
          <h2 className="text-lg sm:text-2xl font-bold text-astu-navy">
            {partnersConfig.featuresTitle || 'Comprehensive Partner Benefits'}
          </h2>
          <p className="mt-1 text-xs text-slate-600 max-w-xl mx-auto leading-relaxed">
            {partnersConfig.featuresSubtitle ||
              'Our dedicated employer platform provides institutions with robust tools to streamline talent sourcing, audit readiness, and direct academic collaboration.'}
          </p>
        </div>

        {/* 6 Benefits Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
          {[
            {
              icon: ShieldCheck,
              badge: 'Verified',
              title: 'TIN-Verified Trust Score',
              desc: 'Enterprise verification ensures accredited trust scores & audit readiness.',
            },
            {
              icon: Users,
              badge: 'Direct Pool',
              title: `${metrics.registeredAlumniFormatted} Alumni Pool`,
              desc: 'Direct pipeline access to pre-screened engineering & science graduates.',
            },
            {
              icon: Cpu,
              badge: 'AI Matching',
              title: 'Curriculum AI Matching',
              desc: 'Automated candidate matching aligned with rigorous technical syllabi.',
            },
            {
              icon: CheckCircle2,
              badge: 'Accreditation',
              title: 'Accreditation Reporting',
              desc: 'Traceable biennial tracer data submitted for national ETA reviews.',
            },
            {
              icon: Calendar,
              badge: 'On-Campus',
              title: 'Priority Career Expos',
              desc: 'Reserved on-campus recruitment suites, tech fairs, and interview rooms.',
            },
            {
              icon: GraduationCap,
              badge: 'R&D Liaison',
              title: 'Direct Faculty Liaison',
              desc: 'Direct sponsorship of student capstone prototypes and R&D seminars.',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-[#003366]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#003366]">{item.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Employer Account Feature</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Accelerate Hiring Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-[#001738] via-[#002b66] to-[#00142e] p-5 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-300">Immediate Talent Access</span>
            <h4 className="text-sm font-bold mt-0.5">Accelerate Your Hiring Pipeline</h4>
            <p className="text-[11px] text-slate-200 mt-0.5 max-w-lg leading-relaxed">
              Register your organization today to gain immediate access to verified graduate profiles and dedicated recruitment assistance.
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-2.5 text-xs font-bold uppercase tracking-wider shadow-sm cursor-pointer">
            <span>Register as Partner</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </section>

      {/* ── 6. Recruitment Framework & Talent Engine (Full-Width) ── */}
      <section id="partner-section-recruitment" className="p-6 sm:p-10 bg-slate-50/80 border-b border-slate-200">
        <div className="mb-6 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-[#003366] border border-blue-200 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider mb-2">
            <Cpu className="h-3 w-3 text-[#003366]" />
            Recruitment Acceleration
          </span>
          <h3 className="text-lg sm:text-2xl font-bold text-astu-navy">
            {partnersConfig.recruitmentTitle || 'Recruitment Framework & Talent Engine'}
          </h3>
          <p className="mt-1 text-xs text-slate-600 max-w-xl mx-auto leading-relaxed">
            {partnersConfig.recruitmentSubtitle ||
              'Accelerate graduate hiring and evaluate verified competency metrics through the AMS platform.'}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          {recruitmentTracks.slice(0, 4).map((track) => (
            <div key={track.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#003366]">{track.title}</span>
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {track.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{track.desc}</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                <CheckCircle2 className="h-3 w-3" />
                <span>Active Track</span>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50/70 via-white to-blue-50/70 p-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Talent Engine Match Simulator
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#003366] bg-white border border-slate-200 px-2 py-0.5 rounded">
                98.4% Syllabus Alignment
              </span>
              <span className="text-[10px] font-bold text-white bg-[#003366] px-2 py-0.5 rounded">
                +412 Ready for Placement
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-semibold text-slate-600 pt-2 border-t border-slate-200/60">
            <span className="bg-white border border-slate-200 px-2 py-0.5 rounded">Software Engineering (124)</span>
            <span className="bg-white border border-slate-200 px-2 py-0.5 rounded">Electromechanical (98)</span>
            <span className="bg-white border border-slate-200 px-2 py-0.5 rounded">Civil &amp; Architecture (85)</span>
            <span className="bg-white border border-slate-200 px-2 py-0.5 rounded">GPA &ge; 3.5 High Achievers</span>
          </div>
        </div>
      </section>

      {/* ── 7. Stats Section ── */}
      <section className="p-6 sm:p-8 bg-white border-b border-slate-200">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-astu-navy">{metrics.registeredAlumniFormatted}</div>
            <div className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider">
              Registered Alumni
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-astu-navy">{metrics.corporatePartnersFormatted}</div>
            <div className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider">
              Partner Organizations
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600">{metrics.employmentRateFormatted}</div>
            <div className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider">
              Employment Rate
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-astu-navy">{metrics.fieldsOfStudy}</div>
            <div className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider">
              Fields of Study
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. FAQs Preview ── */}
      <section id="partner-section-faqs" className="p-6 sm:p-8 bg-slate-50">
        <h4 className="text-sm font-bold text-[#003366] text-center mb-4">Partnership FAQs</h4>
        <div className="space-y-2 max-w-xl mx-auto">
          {faqs.slice(0, 3).map((faq) => {
            const isOpen = openFaqId === faq.id;
            return (
              <div key={faq.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                  className="flex w-full items-center justify-between p-3 text-left font-bold text-xs text-[#003366] cursor-pointer"
                >
                  <span>{faq.question}</span>
                  {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
                {isOpen && (
                  <div className="border-t border-slate-100 p-3 pt-2 text-[11px] text-slate-600 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 9. Contact Us (Professional & Modern with Map Link) ── */}
      <section id="partner-section-contact" className="p-6 sm:p-8 bg-white border-t border-slate-200">
        <div className="mb-6 text-center">
          <span className="inline-block rounded-full bg-slate-100 text-[#003366] px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider mb-1">
            Institutional Directory
          </span>
          <h4 className="text-base font-bold text-[#003366]">Contact Us</h4>
          <p className="text-xs text-slate-600 mt-1">Connect with the ASTU Corporate &amp; Alumni Relations Office.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3 max-w-3xl mx-auto">
          {/* Address */}
          <div className="text-center p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs flex flex-col justify-between">
            <div>
              <MapPin className="h-6 w-6 mx-auto text-[#003366] mb-2" />
              <h5 className="text-xs font-bold text-[#003366]">Address</h5>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Adama Science &amp; Technology Univ.<br />
                <span className="text-slate-400">Adama, Oromia, Ethiopia</span>
              </p>
            </div>
            <a
              href="https://maps.google.com/?q=Adama+Science+and+Technology+University"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center justify-center gap-1 text-[10px] font-bold text-[#003366] hover:underline"
            >
              <span>Open in Google Maps</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>

          {/* Phone */}
          <div className="text-center p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs flex flex-col justify-between">
            <div>
              <Phone className="h-6 w-6 mx-auto text-emerald-600 mb-2" />
              <h5 className="text-xs font-bold text-[#003366]">Phone</h5>
              <p className="text-[11px] text-slate-600 mt-0.5">
                +251-221-110000<br />
                <span className="text-slate-400">Ext: 204 / 205</span>
              </p>
            </div>
            <a
              href="tel:+251221110000"
              className="mt-3 inline-flex items-center justify-center gap-1 text-[10px] font-bold text-emerald-700 hover:underline"
            >
              <span>Call Hotline</span>
              <Phone className="h-2.5 w-2.5" />
            </a>
          </div>

          {/* Email */}
          <div className="text-center p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs flex flex-col justify-between">
            <div>
              <Mail className="h-6 w-6 mx-auto text-indigo-600 mb-2" />
              <h5 className="text-xs font-bold text-[#003366]">Email</h5>
              <p className="text-[11px] text-slate-600 mt-0.5">
                irccd@astu.edu.et<br />
                <span className="text-slate-400">Industry Linkage</span>
              </p>
            </div>
            <a
              href="mailto:irccd@astu.edu.et"
              className="mt-3 inline-flex items-center justify-center gap-1 text-[10px] font-bold text-indigo-700 hover:underline"
            >
              <span>Send Email</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        </div>
      </section>

      {/* Modal */}
      <CompanyDetailModal company={selectedCompanyModal} onClose={() => setSelectedCompanyModal(null)} />
    </div>
  );
}
