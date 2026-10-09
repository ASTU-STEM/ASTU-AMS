import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Sparkles,
  Globe,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Award,
  Layers,
  Cpu,
  CheckCircle2,
  X,
  Send,
  FileText,
  Clock,
  Filter,
  Calendar,
  GraduationCap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { partnerLogos } from '../components/PartnerLogos';
import homepageCmsService, {
  defaultPartnersPageConfig,
  PartnersPageConfig,
  Partner,
  defaultPartnersList,
  UnifiedPartnerTrack,
  UnifiedPartnerFaq,
} from '../features/admin/services/homepageCms.service';
import { usePublicMetrics } from '../services/publicMetrics.service';
import CompanyDetailModal from '../components/CompanyDetailModal';

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

export default function PartnersPage() {
  const navigate = useNavigate();
  const { metrics } = usePublicMetrics();

  const [config, setConfig] = useState<PartnersPageConfig>(() => {
    const s = homepageCmsService.getSettings();
    return s?.partnersPage || defaultPartnersPageConfig;
  });

  const [partnersList, setPartnersList] = useState<Partner[]>(() => {
    const s = homepageCmsService.getSettings();
    return s?.partners && s.partners.length > 0 ? s.partners : defaultPartnersList;
  });

  const [selectedCompanyModal, setSelectedCompanyModal] = useState<Partner | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [openFaqId, setOpenFaqId] = useState<string | null>('PF-1');

  // Check if current user is CMS Admin
  const isCmsAdmin = (() => {
    try {
      const raw = localStorage.getItem('user');
      const role = raw ? JSON.parse(raw)?.role?.toUpperCase() : localStorage.getItem('astu_ams_user_role')?.toUpperCase();
      return ['ADMIN', 'SUPER_ADMIN', 'CMS_MANAGER', 'ALUMNI_OFFICE'].includes(role || '');
    } catch {
      return false;
    }
  })();

  useEffect(() => {
    let isMounted = true;
    homepageCmsService.fetchFromApi().then((live) => {
      if (!isMounted || !live) return;
      if (live.partnersPage) setConfig(live.partnersPage);
      if (Array.isArray(live.partners) && live.partners.length > 0) {
        setPartnersList(live.partners.filter((p) => p.active !== false));
      }
    });

    const handleUpdate = () => {
      const s = homepageCmsService.getSettings();
      if (s?.partnersPage) setConfig(s.partnersPage);
      if (Array.isArray(s?.partners) && s.partners.length > 0) {
        setPartnersList(s.partners.filter((p) => p.active !== false));
      }
    };

    window.addEventListener('astu-cms-homepage-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('astu-cms-homepage-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Smooth scroll reveal observer like main homepage
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.08 }
    );

    const nodes = document.querySelectorAll('.reveal');
    nodes.forEach((node) => observer.observe(node));

    const timeout = setTimeout(() => {
      document.querySelectorAll('.reveal').forEach((node) => {
        const rect = node.getBoundingClientRect();
        if (rect.top < window.innerHeight * 1.25 && rect.bottom > -100) {
          node.classList.add('is-visible');
        }
      });
    }, 150);

    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, [partnersList]);

  const features = config.features && config.features.length > 0 ? config.features : DEFAULT_FEATURES;

  const stakeholderTracks = config.stakeholderTracks && config.stakeholderTracks.length > 0
    ? config.stakeholderTracks.filter((t) => t.active !== false)
    : (defaultPartnersPageConfig.stakeholderTracks || []);

  const recruitmentTracks = config.recruitmentTracks && config.recruitmentTracks.length > 0
    ? config.recruitmentTracks.filter((t) => t.active !== false)
    : (defaultPartnersPageConfig.recruitmentTracks || []);

  const faqs = config.faqs && config.faqs.length > 0
    ? config.faqs
    : (defaultPartnersPageConfig.faqs || []);

  // Filtered partners for interactive directory
  const filteredPartners = useMemo(() => {
    return partnersList.filter((p) => {
      const matchesIndustry =
        selectedIndustry === 'All' ||
        (p.industry && p.industry.toLowerCase().includes(selectedIndustry.toLowerCase()));
      const matchesQuery =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.industry && p.industry.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.location && p.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesIndustry && matchesQuery;
    });
  }, [partnersList, selectedIndustry, searchQuery]);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <Navbar />

      {/* Floating CMS Edit Button for Admins */}
      {isCmsAdmin && (
        <aside className="fixed bottom-6 right-6 z-40">
          <button
            type="button"
            onClick={() => navigate('/cms/partners')}
            className="group inline-flex items-center gap-2.5 rounded-full bg-[#002b66] hover:bg-[#001d4a] text-white px-5 py-3 text-xs font-bold tracking-wide shadow-2xl transition-all duration-300 ring-4 ring-amber-400/30 hover:scale-105 active:scale-95 cursor-pointer"
            title="Open Partners Management Studio"
          >
            <Sparkles className="h-4 w-4 text-amber-300 transition-transform group-hover:rotate-12" />
            <span>Customize Partner Portal (CMS)</span>
          </button>
        </aside>
      )}

      {/* ── 1. HERO SECTION (BLUE WITH SQUARE GRID & SQUARES) ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-astu-navy via-[#003366] to-[#002244] text-white py-16 md:py-24">
        {/* Subtle square grid pattern overlay */}
        <div className="absolute inset-0 opacity-15 [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:3rem_3rem] pointer-events-none" />
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:3rem_3rem] pointer-events-none" />

        {/* Ambient glows & watermark */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-astu-green/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-astu-red/10 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
          <Users className="h-[420px] w-[420px] text-white" />
        </div>

        <div className="relative z-10 mx-auto max-w-[1440px] px-4 md:px-8">
          <div className="mx-auto max-w-3xl text-center">
            {/* Tag badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-astu-green backdrop-blur-md">
              <Building2 className="h-4 w-4 text-astu-green" />
              <span>{config.heroBadge || 'Employer & Industry Partnerships'}</span>
            </div>

            {/* Headline */}
            <h1 className="mb-6 text-3xl font-black text-white md:text-5xl lg:text-6xl tracking-tight leading-tight">
              {config.heroTitle || 'Partner with ASTU to Access'}{' '}
              <span className="text-astu-green">
                {config.heroHighlight || 'Top Engineering & Tech Graduates'}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mb-10 max-w-2xl text-sm md:text-base leading-relaxed text-slate-300">
              {config.heroSubtitle ||
                'Connect with verified alumni talent, post job opportunities, and shape the future of technical education through industry collaboration.'}
            </p>

            {/* 3 Square Stat Cards in the center */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 max-w-2xl mx-auto">
              <div className="flex flex-col items-center justify-center p-5 rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm shadow-lg transition-transform hover:-translate-y-1 hover:bg-white/15">
                <Users className="h-6 w-6 text-astu-green mb-2" />
                <span className="text-2xl sm:text-3xl font-black text-white">{metrics.registeredAlumniFormatted}</span>
                <span className="text-[11px] uppercase tracking-wider text-slate-300 mt-1 font-semibold">Alumni Members</span>
              </div>
              <div className="flex flex-col items-center justify-center p-5 rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm shadow-lg transition-transform hover:-translate-y-1 hover:bg-white/15">
                <BookOpen className="h-6 w-6 text-astu-green mb-2" />
                <span className="text-2xl sm:text-3xl font-black text-white">{metrics.fieldsOfStudy}</span>
                <span className="text-[11px] uppercase tracking-wider text-slate-300 mt-1 font-semibold">Fields of Study</span>
              </div>
              <div className="flex flex-col items-center justify-center p-5 rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm shadow-lg transition-transform hover:-translate-y-1 hover:bg-white/15">
                <Globe className="h-6 w-6 text-emerald-400 mb-2" />
                <span className="text-2xl sm:text-3xl font-black text-white">{metrics.corporatePartnersFormatted}</span>
                <span className="text-[11px] uppercase tracking-wider text-slate-300 mt-1 font-semibold">Global Partners</span>
              </div>
            </div>

            {/* Action buttons & links at the bottom */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate(config.heroPrimaryCtaLink || '/employers/register')}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-astu-green px-8 py-3.5 text-sm font-bold text-white hover:brightness-110 transition-all hover:scale-105 shadow-lg hover:shadow-astu-green/25 cursor-pointer"
              >
                {config.heroPrimaryCtaText || 'Register as Employer'}
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigate(config.heroSecondaryCtaLink || '/login')}
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 px-8 py-3.5 text-sm font-bold text-white hover:bg-white/20 transition-all hover:scale-105 backdrop-blur-sm cursor-pointer"
              >
                {config.heroSecondaryCtaText || 'Employer Login'}
              </button>
            </div>

            {/* Bottom link */}
            <div className="mt-5">
              <a
                href="#benefits"
                className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors underline underline-offset-4 cursor-pointer"
              >
                <span>Explore Employer Partnership Benefits &amp; Criteria</span>
                <span>&darr;</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. BENEFITS SECTION (6 VALUE PILLARS) ── */}
      <section id="benefits" className="mx-auto max-w-[1440px] px-4 py-16 md:px-8 md:py-24 scroll-mt-16 bg-white">
        <div className="mb-14 text-center">
          <span className="inline-block rounded-full bg-slate-100 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#003366] mb-3">
            {config.benefitsEyebrow || 'MUTUAL VALUE & TALENT ACCESS'}
          </span>
          <h2 className="text-3xl font-black text-[#003366] md:text-4xl tracking-tight">
            {config.benefitsTitle || 'Why Partner with ASTU?'}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-slate-600 leading-relaxed">
            {config.benefitsSubtitle ||
              "Join 500+ leading industry enterprises, public institutions, and research consortia actively recruiting and collaborating with ASTU."}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {DEFAULT_BENEFITS.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className="group relative rounded-2xl border border-slate-200/80 bg-white p-7 shadow-xs transition-all duration-300 hover:shadow-xl hover:border-[#003366]/30 hover:-translate-y-1.5"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#003366]/5 text-[#003366] group-hover:bg-[#003366] group-hover:text-white transition-all duration-300 shadow-xs">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="mb-2.5 text-xl font-bold text-[#003366] group-hover:text-[#002244] transition-colors">
                  {benefit.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 3. PARTNER COMPANIES MARQUEE & INTERACTIVE DIRECTORY ── */}
      <section className="bg-slate-50/80 py-16 border-y border-slate-200/70">
        <div className="mx-auto max-w-[1440px] px-4 md:px-8">
          <div className="mb-10 text-center">
            <span className="inline-block rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/70 px-3.5 py-1 text-xs font-bold uppercase tracking-wider mb-2">
              Corporate Employers &amp; Strategic Sponsors
            </span>
            <h3 className="text-2xl font-black text-[#003366] md:text-3xl">
              {config.partnersCarouselTitle || 'Featured Partner Organizations'}
            </h3>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-600">
              {config.partnersCarouselSubtitle ||
                'Institutional partners supporting graduate employability, accreditation feedback, internships, and applied research.'}
            </p>
          </div>

          {/* Marquee Slider */}
          <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-xs border border-slate-200 mb-12">
            <div className="flex gap-6 animate-scroll hover:[animation-play-state:paused]">
              {[...partnersList, ...partnersList].map((partner, idx) => {
                const LogoComponent = partnerLogos[partner.name];
                return (
                  <div
                    key={`${partner.name}-${idx}`}
                    onClick={() => setSelectedCompanyModal(partner)}
                    className="flex min-w-[190px] flex-col items-center justify-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4 shadow-2xs hover:shadow-md hover:bg-white hover:border-[#003366]/20 transition-all cursor-pointer"
                  >
                    <div className="h-14 w-full flex items-center justify-center">
                      {partner.logo ? (
                        <img
                          src={partner.logo}
                          alt={partner.name}
                          className="max-h-11 max-w-[140px] w-auto h-auto object-contain"
                        />
                      ) : LogoComponent ? (
                        <LogoComponent />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#003366] text-white text-xs font-bold shadow-xs">
                          {partner.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-[#003366] text-center truncate max-w-[160px]">
                      {partner.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Search & Filter Controls */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
                <Filter className="h-3.5 w-3.5" /> Sector:
              </span>
              {['All', 'Telecom', 'Aviation', 'Cybersecurity', 'ICT', 'Fintech', 'Banking'].map((ind) => (
                <button
                  key={ind}
                  type="button"
                  onClick={() => setSelectedIndustry(ind)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    selectedIndustry === ind
                      ? 'bg-[#003366] text-white shadow-xs scale-105'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {ind}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search partners, roles, cities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs font-medium text-slate-900 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#003366]/20"
              />
            </div>
          </div>

          {/* Partner Cards Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPartners.map((partner) => {
              const LogoComponent = partnerLogos[partner.name];
              return (
                <div
                  key={partner.id || partner.name}
                  onClick={() => setSelectedCompanyModal(partner)}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-xl hover:border-[#003366]/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                >
                  <div>
                    {/* Top row */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-12 w-28 flex items-center justify-center bg-slate-50 rounded-lg p-1.5 border border-slate-100">
                        {partner.logo ? (
                          <img
                            src={partner.logo}
                            alt={partner.name}
                            className="max-h-10 max-w-[100px] w-auto h-auto object-contain"
                          />
                        ) : LogoComponent ? (
                          <LogoComponent />
                        ) : (
                          <span className="text-xs font-bold text-[#003366]">{partner.name.slice(0, 3)}</span>
                        )}
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 border border-emerald-200">
                        {partner.partnershipType || 'Strategic Partner'}
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-[#003366] group-hover:text-emerald-700 transition-colors">
                      {partner.name}
                    </h4>

                    {partner.industry && (
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">{partner.industry}</p>
                    )}

                    <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {partner.description ||
                        'Verified ASTU partner supporting academic collaboration, internships, and engineering talent pipelines.'}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                      <Award className="h-3.5 w-3.5" />
                      {partner.openings || 'Active Collaborator'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#003366] group-hover:translate-x-1 transition-transform">
                      <span>View Profile</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 4. STRATEGIC ALLIANCES & INDUSTRY CONSORTIA ── */}
      <section className="mx-auto max-w-[1440px] px-4 py-16 md:px-8 md:py-24 bg-white">
        <div className="mb-14 text-center">
          <span className="inline-block rounded-full bg-blue-50 text-[#003366] border border-blue-200 px-3.5 py-1 text-xs font-bold uppercase tracking-wider mb-2">
            Multilateral Consortia &amp; Institutional Partnerships
          </span>
          <h2 className="text-3xl font-black text-[#003366] md:text-4xl tracking-tight">
            {config.stakeholdersTitle || 'Strategic Alliances & Industry Consortia'}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-slate-600 leading-relaxed">
            {config.stakeholdersSubtitle ||
              'Active cooperation frameworks with government agencies, multinational tech enterprises, and international research organizations.'}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stakeholderTracks.map((track) => (
            <div
              key={track.id || track.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-lg hover:border-[#003366]/20 transition-all flex flex-col justify-between"
            >
              <div>
                <span className="inline-block rounded-full bg-slate-100 text-slate-700 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider mb-3">
                  {track.badge || 'Consortium Track'}
                </span>
                <h4 className="text-base font-bold text-[#003366] mb-2">{track.title}</h4>
                <p className="text-xs leading-relaxed text-slate-600">{track.desc}</p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Active Framework</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. ENTERPRISE ECOSYSTEM & COMPREHENSIVE PARTNER BENEFITS (DEDICATED FULL-WIDTH SECTION) ── */}
      <section id="enterprise-ecosystem" className="py-20 md:py-28 bg-white border-y border-slate-200/80 scroll-mt-16">
        <div className="mx-auto max-w-[1440px] px-4 md:px-8">
          <div className="mb-14 text-center reveal">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-4 py-1 text-xs font-bold uppercase tracking-wider mb-3">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              {config.featuresEyebrow || 'ENTERPRISE ECOSYSTEM'}
            </span>
            <h2 className="text-3xl font-black text-[#003366] md:text-5xl tracking-tight">
              {config.featuresTitle || 'Comprehensive Partner Benefits'}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base text-slate-600 leading-relaxed">
              {config.featuresSubtitle ||
                'Our dedicated employer platform provides institutions with robust tools to streamline talent sourcing, audit readiness, and direct academic collaboration.'}
            </p>
          </div>

          {/* 6 Rich Benefit Cards in Modern 3-Column Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
            {[
              {
                icon: ShieldCheck,
                badge: 'Verified',
                badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                title: 'TIN-Verified Trust Score',
                desc: 'Enterprise tax ID verification ensures high institutional trust scores, accredited employer credentials, and government audit readiness.',
              },
              {
                icon: Users,
                badge: 'Direct Pool',
                badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
                title: `${metrics.registeredAlumniFormatted} Alumni Talent Pool`,
                desc: 'Direct pipeline access to pre-screened engineering, applied science, and computing graduates with verifiable GPA and transcript records.',
              },
              {
                icon: Cpu,
                badge: 'AI Matching',
                badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                title: 'Curriculum-Aligned AI Matching',
                desc: 'Automated skill matching mapped directly against rigorous ASTU laboratory course syllabi and capstone engineering proficiencies.',
              },
              {
                icon: CheckCircle2,
                badge: 'Accreditation',
                badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
                title: 'Accreditation Tracer Reporting',
                desc: 'Traceable longitudinal graduate tracer feedback loops submitted for national Higher Education Relevance and Quality Agency (ETA) audits.',
              },
              {
                icon: Calendar,
                badge: 'On-Campus',
                badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
                title: 'Priority Career Expos & Tech Fairs',
                desc: 'Guaranteed reservation for annual on-campus recruitment suites, tech expos, hackathons, and private interview rooms in Adama.',
              },
              {
                icon: GraduationCap,
                badge: 'R&D Liaison',
                badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
                title: 'Direct Faculty & R&D Liaison',
                desc: 'Direct engagement with academic department heads, senior professors, and sponsored graduate capstone thesis evaluation committees.',
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className={`group relative rounded-2xl border border-slate-200/90 bg-white p-7 shadow-xs hover:shadow-xl hover:border-[#003366]/30 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between reveal reveal-delay-${(idx % 3) + 1}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 text-[#003366] group-hover:bg-[#003366] group-hover:text-white transition-all duration-300 shadow-2xs">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-[#003366] group-hover:text-[#001f3f] transition-colors mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Included in Employer Account</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Full-Width Accelerate Hiring Pipeline Enterprise Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#001738] via-[#002b66] to-[#00142e] p-8 sm:p-12 text-white shadow-xl border border-white/10 reveal">
            <div className="absolute inset-0 opacity-10 [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:2rem_2rem] pointer-events-none" />
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-300 backdrop-blur-md mb-3">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                  Immediate Talent Access
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
                  {config.ctaCardTitle || 'Accelerate Your Hiring Pipeline'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-xl">
                  {config.ctaCardDescription ||
                    'Register your organization today to gain immediate access to verified graduate profiles, post job vacancies, and schedule on-campus recruitment sessions.'}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-emerald-200 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Instant Portal Verification
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Direct Faculty Contact
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Zero Placement Fees for ASTU Partners
                  </span>
                </div>
              </div>
              <div className="shrink-0">
                <button
                  type="button"
                  onClick={() => navigate(config.ctaCardButtonLink || '/employers/register')}
                  className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 px-8 py-4 text-xs font-black uppercase tracking-wider transition-all hover:scale-105 shadow-xl hover:shadow-emerald-500/25 cursor-pointer"
                >
                  <span>{config.ctaCardButtonText || 'Register as Partner'}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. RECRUITMENT FRAMEWORK & TALENT ENGINE (DEDICATED FULL-WIDTH SECTION) ── */}
      <section id="recruitment-engine" className="py-20 md:py-28 bg-slate-50/70 border-b border-slate-200/80 scroll-mt-16">
        <div className="mx-auto max-w-[1440px] px-4 md:px-8">
          <div className="mb-14 text-center reveal">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-[#003366] border border-blue-200 px-4 py-1 text-xs font-bold uppercase tracking-wider mb-3">
              <Cpu className="h-4 w-4 text-[#003366]" />
              Recruitment Acceleration
            </span>
            <h2 className="text-3xl font-black text-[#003366] md:text-5xl tracking-tight">
              {config.recruitmentTitle || 'Recruitment Framework & Talent Engine'}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base text-slate-600 leading-relaxed">
              {config.recruitmentSubtitle ||
                'Accelerate graduate hiring and evaluate verified competency metrics through the AMS platform.'}
            </p>
          </div>

          {/* 4 Interactive Recruitment Track Cards in 4-Column Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10">
            {recruitmentTracks.map((track, idx) => {
              const iconMap: Record<string, any> = {
                'Direct Opportunity Publishing': Briefcase,
                'Smart Candidate Search & Filters': Search,
                'Employer Competency Feedback': MessageSquare,
                'On-Campus Career Expos & Interviews': Calendar,
              };
              const TrackIcon = iconMap[track.title] || Briefcase;

              return (
                <div
                  key={track.id || track.title}
                  className={`group relative rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs hover:shadow-xl hover:border-[#003366]/30 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between reveal reveal-delay-${(idx % 4) + 1}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#003366] group-hover:bg-[#003366] group-hover:text-white transition-all shadow-2xs">
                        <TrackIcon className="h-5 w-5" />
                      </div>
                      <span className="rounded-full bg-slate-100 text-slate-700 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border border-slate-200/70">
                        {track.badge || 'Talent Track'}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#003366] group-hover:text-[#001f3f] transition-colors mb-2">
                      {track.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {track.desc}
                    </p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Real-Time Engine</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live Talent Engine Match Simulator Console */}
          <div className="rounded-3xl border border-emerald-300/80 bg-gradient-to-r from-emerald-50/90 via-white to-blue-50/90 p-6 md:p-8 shadow-sm reveal">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Live Talent Engine Match Simulator</h4>
                  <p className="text-xs text-slate-500">Continuous syllabus competency alignment across 5 ASTU Engineering Schools</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-bold border border-emerald-300">
                  98.4% Syllabus Match
                </span>
                <span className="rounded-full bg-[#003366] text-white px-3 py-1 text-xs font-bold shadow-xs">
                  +412 Ready for Immediate Placement
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/80">
              <span className="text-xs font-bold text-slate-400 mr-1">Active Syllabi Filters:</span>
              <span className="inline-flex items-center gap-1 bg-white border border-slate-200 px-3 py-1 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs">
                Software Engineering (124)
              </span>
              <span className="inline-flex items-center gap-1 bg-white border border-slate-200 px-3 py-1 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs">
                Electromechanical &amp; Robotics (98)
              </span>
              <span className="inline-flex items-center gap-1 bg-white border border-slate-200 px-3 py-1 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs">
                Civil &amp; Architectural Engineering (85)
              </span>
              <span className="inline-flex items-center gap-1 bg-white border border-slate-200 px-3 py-1 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs">
                Applied Physics &amp; Materials (42)
              </span>
              <span className="inline-flex items-center gap-1 bg-white border border-slate-200 px-3 py-1 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs">
                GPA &ge; 3.5 High Achievers
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. ACCREDITED IMPACT METRICS ── */}
      <section className="mx-auto max-w-[1440px] px-4 py-16 md:px-8 md:py-24 bg-white">
        <div className="mb-12 text-center">
          <span className="inline-block rounded-full bg-slate-100 text-slate-700 px-3.5 py-1 text-xs font-bold uppercase tracking-wider mb-2">
            Audited Verification Data
          </span>
          <h2 className="text-3xl font-black text-[#003366] md:text-4xl">
            Accreditation &amp; Placement Metrics
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl mx-auto">
            Longitudinal graduate performance data submitted to national accreditation audits and industry partners.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-xs hover:shadow-lg transition-all">
            <div className="mb-2 text-4xl font-black text-[#003366] md:text-5xl">{metrics.registeredAlumniFormatted}</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
              Verified Registered Alumni
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Active across global &amp; domestic markets</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-xs hover:shadow-lg transition-all">
            <div className="mb-2 text-4xl font-black text-[#003366] md:text-5xl">{metrics.corporatePartnersFormatted}</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
              Partner Organizations
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Enterprises, ministries &amp; research labs</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-xs hover:shadow-lg transition-all">
            <div className="mb-2 text-4xl font-black text-emerald-600 md:text-5xl">{metrics.employmentRateFormatted}</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
              Graduate Employment Rate
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Within 6 months of graduation</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-xs hover:shadow-lg transition-all">
            <div className="mb-2 text-4xl font-black text-[#003366] md:text-5xl">{metrics.fieldsOfStudy}</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
              Engineering &amp; Applied Schools
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Rigorous hands-on laboratory curricula</p>
          </div>
        </div>
      </section>

      {/* ── 8. STAKEHOLDER & PARTNERSHIP FAQS ── */}
      <section className="bg-slate-50 py-16 md:py-24 border-t border-slate-200">
        <div className="mx-auto max-w-4xl px-4 md:px-8">
          <div className="mb-12 text-center">
            <span className="inline-block rounded-full bg-blue-50 text-[#003366] border border-blue-200 px-3.5 py-1 text-xs font-bold uppercase tracking-wider mb-2">
              Common Questions
            </span>
            <h2 className="text-3xl font-black text-[#003366] md:text-4xl">
              Partnership FAQs &amp; Governance
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Learn how employer onboarding, registrar verification, and accreditation tracer surveys work.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    className="flex w-full items-center justify-between p-6 text-left font-bold text-[#003366] hover:bg-slate-50/70 transition-colors cursor-pointer"
                  >
                    <span className="text-base sm:text-lg pr-4">{faq.question}</span>
                    <span className="shrink-0 rounded-full bg-slate-100 p-1.5 text-slate-600">
                      {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="border-t border-slate-100 bg-slate-50/40 p-6 pt-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 9. CONTACT SECTION (PROFESSIONAL & MODERN UI/UX WITH MAP LINK) ── */}
      <section id="contact" className="mx-auto max-w-[1440px] px-4 py-16 md:px-8 md:py-24 bg-white scroll-mt-16">
        <div className="mb-14 text-center reveal">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-[#003366] border border-slate-200 px-4 py-1 text-xs font-bold uppercase tracking-wider mb-3">
            <Building2 className="h-4 w-4 text-[#003366]" />
            Institutional Directory
          </span>
          <h2 className="text-3xl font-black text-[#003366] md:text-5xl tracking-tight">Contact Us</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base text-slate-600 leading-relaxed">
            Connect directly with the ASTU Corporate &amp; Alumni Relations Office and Directorate for Industry Linkage.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {/* Card 1: Address (Clickable to ASTU Google Map) */}
          <div className="group rounded-3xl border border-slate-200/90 bg-white p-8 shadow-xs hover:shadow-xl hover:border-[#003366]/30 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between text-center reveal reveal-delay-1">
            <div>
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#003366] group-hover:bg-[#003366] group-hover:text-white transition-all shadow-2xs">
                <MapPin className="h-8 w-8" />
              </div>
              <span className="rounded-full bg-slate-100 text-slate-700 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                Main Campus
              </span>
              <h3 className="mt-3 text-xl font-bold text-[#003366]">Address</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Adama Science and Technology University<br />
                <span className="text-slate-500">Adama, Oromia Regional State, Ethiopia</span>
              </p>
            </div>
            <div className="mt-6 pt-5 border-t border-slate-100">
              <a
                href="https://maps.google.com/?q=Adama+Science+and+Technology+University"
                target="_blank"
                rel="noopener noreferrer"
                className="group/link inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-[#003366] text-[#003366] hover:text-white px-5 py-2.5 text-xs font-bold transition-all w-full cursor-pointer shadow-2xs"
              >
                <span>Navigate on Google Maps</span>
                <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
              </a>
            </div>
          </div>

          {/* Card 2: Phone */}
          <div className="group rounded-3xl border border-slate-200/90 bg-white p-8 shadow-xs hover:shadow-xl hover:border-[#003366]/30 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between text-center reveal reveal-delay-2">
            <div>
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-2xs">
                <Phone className="h-8 w-8" />
              </div>
              <span className="rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                Official Hotline
              </span>
              <h3 className="mt-3 text-xl font-bold text-[#003366]">Phone</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                +251-221-110000<br />
                <span className="text-slate-500">Ext: 204 / 205 (Industry Linkage)</span>
              </p>
            </div>
            <div className="mt-6 pt-5 border-t border-slate-100">
              <a
                href="tel:+251221110000"
                className="group/link inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-emerald-600 text-[#003366] hover:text-white px-5 py-2.5 text-xs font-bold transition-all w-full cursor-pointer shadow-2xs"
              >
                <span>Call Institutional Hotline</span>
                <Phone className="h-3.5 w-3.5 transition-transform group-hover/link:scale-110" />
              </a>
            </div>
          </div>

          {/* Card 3: Email */}
          <div className="group rounded-3xl border border-slate-200/90 bg-white p-8 shadow-xs hover:shadow-xl hover:border-[#003366]/30 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between text-center reveal reveal-delay-3">
            <div>
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-2xs">
                <Mail className="h-8 w-8" />
              </div>
              <span className="rounded-full bg-indigo-50 text-indigo-700 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                Digital Desk
              </span>
              <h3 className="mt-3 text-xl font-bold text-[#003366]">Email</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                irccd@astu.edu.et<br />
                <span className="text-slate-500">Corporate &amp; Alumni Relations</span>
              </p>
            </div>
            <div className="mt-6 pt-5 border-t border-slate-100">
              <a
                href="mailto:irccd@astu.edu.et"
                className="group/link inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-[#003366] text-[#003366] hover:text-white px-5 py-2.5 text-xs font-bold transition-all w-full cursor-pointer shadow-2xs"
              >
                <span>Send Official Email</span>
                <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Directorate Footnote Banner */}
        <div className="mt-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2 reveal">
          <Clock className="h-3.5 w-3.5 text-emerald-600" />
          <span>Directorate Hours: Monday – Friday, 8:30 AM – 5:30 PM (EAT) • Adama, Ethiopia</span>
        </div>
      </section>

      {/* ── 10. FINAL BOTTOM CTA ── */}
      <section className="bg-gradient-to-br from-[#001d4a] via-[#002b66] to-[#001433] text-white">
        <div className="mx-auto max-w-[1440px] px-4 py-16 text-center md:px-8 md:py-24 reveal">
          <h2 className="mb-4 text-3xl font-black text-white md:text-5xl tracking-tight">
            {config.bottomCtaTitle || 'Start Building Your High-Impact Talent Pipeline Today'}
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-base text-slate-200 leading-relaxed">
            {config.bottomCtaDescription ||
              "Join ASTU's corporate partner network and connect directly with Ethiopia's premier engineering, applied science, and technology graduates."}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => navigate(config.bottomCtaButtonLink || '/employers/register')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-astu-green hover:brightness-110 text-white px-9 py-4 text-sm font-bold transition-all hover:scale-105 shadow-xl hover:shadow-astu-green/25 cursor-pointer"
            >
              <span>{config.bottomCtaButtonText || 'Register Your Organization'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <a
              href="#contact"
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 hover:bg-white/20 text-white px-8 py-4 text-sm font-bold transition-all hover:scale-105 backdrop-blur-sm cursor-pointer"
            >
              <span>Contact Directorate</span>
            </a>
          </div>
        </div>
      </section>

      {/* Company Detail Modal */}
      {selectedCompanyModal && (
        <CompanyDetailModal
          company={selectedCompanyModal}
          onClose={() => setSelectedCompanyModal(null)}
          onRegisterInterest={(company) => {
            setSelectedCompanyModal(null);
            navigate(`/employers/register?partner=${encodeURIComponent(company.name)}`);
          }}
        />
      )}

      <Footer />
    </div>
  );
}
