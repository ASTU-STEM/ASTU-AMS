import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users,
  Building2,
  ArrowRight,
  Cpu,
  GraduationCap,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  MessageSquare,
  Search,
  TrendingUp,
  Handshake,
  ShieldCheck,
  Award,
  ChevronDown,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { partnerLogos } from '../components/PartnerLogos';
import homepageCmsService, {
  defaultPartnersPageConfig,
  PartnersPageConfig,
  Partner,
  defaultPartnersList,
  PartnerBenefit,
} from '../features/admin/services/homepageCms.service';
import { usePublicMetrics } from '../services/publicMetrics.service';
import CompanyDetailModal from '../components/CompanyDetailModal';

const DEFAULT_BENEFITS: PartnerBenefit[] = [
  {
    id: 'B-1',
    icon: 'Users',
    title: 'Hire Talented Graduates',
    description: 'Access a vetted pool of ASTU graduates equipped with practical training in engineering, applied science, and technology.',
    active: true,
  },
  {
    id: 'B-2',
    icon: 'Briefcase',
    title: 'Post Job Opportunities',
    description: 'Publish full-time vacancies and internships directly to verified graduating students and alumni.',
    active: true,
  },
  {
    id: 'B-3',
    icon: 'MessageSquare',
    title: 'Give Industry Feedback',
    description: 'Directly inform curriculum design and departmental revisions to align graduate competencies with market demands.',
    active: true,
  },
  {
    id: 'B-4',
    icon: 'Search',
    title: 'Verified Student Information',
    description: 'Search alumni profiles with registrar-verified academic records, engineering disciplines, and graduation cohorts.',
    active: true,
  },
  {
    id: 'B-5',
    icon: 'TrendingUp',
    title: 'Track Recruitment Analytics',
    description: 'Monitor application flows, candidate engagement velocity, and hiring outcomes through enterprise partner telemetry.',
    active: true,
  },
  {
    id: 'B-6',
    icon: 'Handshake',
    title: 'Build Strategic Partnerships',
    description: 'Establish long-term ties for sponsored capstone projects, cooperative R&D laboratories, and talent pipelines.',
    active: true,
  },
];

const iconMap: Record<string, React.ElementType> = {
  Users,
  Briefcase,
  MessageSquare,
  Search,
  TrendingUp,
  Handshake,
  ShieldCheck,
  Award,
  Cpu,
  GraduationCap,
  Building2,
};

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

  const benefitsList =
    config.benefits && config.benefits.length > 0
      ? config.benefits.filter((b) => b.active !== false)
      : DEFAULT_BENEFITS;

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#C8102E]/10 selection:text-[#C8102E]">
      <Navbar />

      {/* Floating CMS Edit Button for Admins */}
      {isCmsAdmin && (
        <aside className="fixed bottom-6 right-6 z-40">
          <button
            type="button"
            onClick={() => navigate('/cms/partners')}
            className="group inline-flex items-center gap-2.5 rounded-full bg-[#002147] hover:bg-[#001838] text-white px-5 py-3 text-xs font-bold tracking-wide shadow-2xl transition-all duration-300 ring-4 ring-[#C8102E]/30 hover:scale-105 active:scale-95 cursor-pointer"
            title="Open Partners Management Studio"
          >
            <Sparkles className="h-4 w-4 text-amber-300 transition-transform group-hover:rotate-12" />
            <span>Customize Partner Portal (CMS)</span>
          </button>
        </aside>
      )}

      {/* ── 1. Full Hero Section (Full Viewport, Real Partnership Ceremony, Subtle Blur & Clean) ── */}
      <header className="relative overflow-hidden min-h-[calc(100vh-76px)] sm:min-h-[calc(100vh-80px)] flex flex-col items-center justify-between text-white shadow-xl">
        {/* Real ASTU Industry Partnership Signing Ceremony Photography (Gently Blurred, Not Too Blurred) */}
        <div className="absolute inset-0 select-none pointer-events-none overflow-hidden">
          <img
            alt="ASTU Strategic Industry Partnership Signing Ceremony"
            className="h-full w-full object-cover object-[center_30%] scale-105"
            src="/images/partner-mou.jpg"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/regofficephoto.jpg';
            }}
          />
          {/* Balanced Academic Scrim — Keeps Real Handshake & Ceremony Visible while Text Stays Crisp */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#00142e]/65 via-[#002147]/50 to-[#001026]/75" />
        </div>

        {/* Abstract Blueprint Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:4rem_4rem] pointer-events-none" />

        {/* Top Spacer for perfect vertical balance */}
        <div className="w-full h-8 sm:h-12 pointer-events-none" />

        {/* Centered Hero Content */}
        <div className="relative z-10 mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center justify-center text-center my-auto">
          {/* Headline Title */}
          <h1 className="font-fraunces text-3xl sm:text-5xl lg:text-[60px] font-bold text-white tracking-tight leading-[1.14] max-w-4xl mx-auto drop-shadow-[0_2px_10px_rgba(0,0,0,0.65)]">
            {config.heroTitle || 'Partner with ASTU to Access'}{' '}
            <span>{config.heroHighlight || 'Top Engineering & Tech Graduates'}</span>
          </h1>

          {/* One Unified Expressive Idea */}
          <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-100 leading-relaxed max-w-2xl font-normal mx-auto drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)]">
            Collaborate with Ethiopia&apos;s premier technology university to recruit verified engineering talent, co-sponsor applied research, and build strategic industry pipelines.
          </p>

          {/* Action Buttons */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => navigate(config.heroPrimaryCtaLink || '/employers/register')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C8102E] hover:bg-[#A60D26] text-white px-8 py-4 text-sm font-bold shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <span>{config.heroPrimaryCtaText || 'Register as Employer'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate(config.heroSecondaryCtaLink || '/login')}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 hover:bg-white/20 text-white px-8 py-4 text-sm font-semibold backdrop-blur-sm transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <span>{config.heroSecondaryCtaText || 'Employer Portal Login'}</span>
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="relative z-10 pb-8 text-white/60 text-xs flex flex-col items-center gap-1.5 animate-pulse pointer-events-none select-none">
          <span className="tracking-wide">Explore Partnership Opportunities</span>
          <ChevronDown className="h-4 w-4" />
        </div>
      </header>

      {/* ── 2. KEY PARTNERSHIP BENEFITS (CLEAN & PROFESSIONAL GRID) ── */}
      <section className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 mb-2.5">
            <span className="w-4 h-[2px] bg-[#C8102E] inline-block rounded-full" />
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#C8102E]">
              {config.benefitsEyebrow || 'MUTUAL VALUE & TALENT ACCESS'}
            </span>
          </div>
          <h2 className="font-fraunces text-3xl sm:text-4xl font-bold text-[#002147] tracking-tight">
            {config.benefitsTitle || 'Why Partner with ASTU?'}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            {config.benefitsSubtitle ||
              'Join 500+ leading industry enterprises, public institutions, and research consortia actively recruiting and collaborating with ASTU.'}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefitsList.map((benefit) => {
            const Icon = iconMap[benefit.icon] || Users;
            return (
              <div
                key={benefit.id || benefit.title}
                className="group rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,33,71,0.04),0_6px_16px_-4px_rgba(0,33,71,0.04)] hover:shadow-md hover:border-[#002147]/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="h-11 w-11 rounded-xl bg-[#002147]/5 text-[#002147] group-hover:bg-[#002147] group-hover:text-white transition-all flex items-center justify-center mb-4 shadow-2xs">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-fraunces text-lg font-bold text-[#002147] mb-2 group-hover:text-[#C8102E] transition-colors">
                    {benefit.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {benefit.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 3. COLLABORATING ENTERPRISES (MARQUEE CAROUSEL) ── */}
      <section className="bg-slate-50/70 py-14 lg:py-16 border-y border-slate-200/80 overflow-hidden">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center max-w-xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#C8102E] mb-1.5 block">
              ENTERPRISE ALLIANCES
            </span>
            <h3 className="font-fraunces text-2xl sm:text-3xl font-bold text-[#002147]">
              Collaborating Partner Organizations
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-600">
              Institutional partners supporting employability, accreditation feedback, internships, and research collaboration.
            </p>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 shadow-2xs">
            <div className="flex gap-6 animate-scroll hover:[animation-play-state:paused]">
              {[...partnersList, ...partnersList].map((partner, idx) => {
                const LogoComponent = partnerLogos[partner.name];
                return (
                  <div
                    key={`${partner.name}-${idx}`}
                    onClick={() => setSelectedCompanyModal(partner)}
                    className="flex min-w-[170px] flex-col items-center justify-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/60 p-4 hover:bg-white hover:border-[#002147]/30 hover:shadow-2xs transition-all cursor-pointer group"
                  >
                    <div className="h-11 w-full flex items-center justify-center">
                      {partner.logo ? (
                        <img
                          src={partner.logo}
                          alt={partner.name}
                          className="max-h-9 max-w-[120px] w-auto h-auto object-contain transition-transform group-hover:scale-105"
                        />
                      ) : LogoComponent ? (
                        <LogoComponent className="group-hover:scale-105" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#002147] text-white text-xs font-bold shadow-xs">
                          {partner.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-slate-700 text-center truncate max-w-[140px] group-hover:text-[#002147]">
                      {partner.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. INSTITUTIONAL TELEMETRY & EXECUTIVE LIAISON DESK ── */}
      <section className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        {/* Telemetry Numbers */}
        <div className="grid gap-8 grid-cols-2 lg:grid-cols-4 pb-14 border-b border-slate-200">
          <div className="text-center">
            <div className="font-fraunces text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#002147]">
              {metrics.corporatePartnersFormatted || '500+'}
            </div>
            <div className="mt-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Partner Enterprises
            </div>
          </div>
          <div className="text-center">
            <div className="font-fraunces text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#002147]">
              {metrics.registeredAlumniFormatted || '25,000+'}
            </div>
            <div className="mt-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Alumni Network
            </div>
          </div>
          <div className="text-center">
            <div className="font-fraunces text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#002147]">
              {metrics.employmentRateFormatted || '94%'}
            </div>
            <div className="mt-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Placement Rate
            </div>
          </div>
          <div className="text-center">
            <div className="font-fraunces text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#002147]">
              {metrics.fieldsOfStudy || '5'}
            </div>
            <div className="mt-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Engineering Schools
            </div>
          </div>
        </div>

        {/* Executive Directorate Strip - Clean, Soft & Simple */}
        <div className="mt-14 rounded-3xl p-8 sm:p-11 bg-slate-50 border border-slate-200/90 shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2">
              <span className="w-3.5 h-[2px] bg-[#C8102E] inline-block rounded-full" />
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#C8102E]">
                OFFICE OF CORPORATE COMMUNICATIONS &amp; INDUSTRY LINKAGE
              </span>
            </div>
            <h3 className="font-fraunces text-2xl sm:text-3xl font-bold text-[#002147] tracking-tight leading-snug">
              Ready to Form a Strategic Partnership with ASTU?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl font-normal">
              Connect directly with our Directorate to discuss talent pipelines, laboratory research, and sponsored campus recruitment initiatives.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-semibold text-[#002147]">
              <span className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200/90 px-3.5 py-2 shadow-2xs">
                <Phone className="h-3.5 w-3.5 text-[#C8102E]" /> +251 22 110 0055
              </span>
              <span className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200/90 px-3.5 py-2 shadow-2xs">
                <Mail className="h-3.5 w-3.5 text-[#C8102E]" /> irccd@astu.edu.et
              </span>
              <span className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200/90 px-3.5 py-2 shadow-2xs">
                <MapPin className="h-3.5 w-3.5 text-[#C8102E]" /> Main Campus, Adama
              </span>
            </div>
          </div>

          <div className="relative z-10 shrink-0 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => navigate('/employers/register')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C8102E] hover:bg-[#A60D26] text-white px-7 py-3.5 text-xs font-bold uppercase tracking-wider shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <span>Register Organization</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/contact')}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-[#002147] px-6 py-3.5 text-xs font-bold uppercase tracking-wider shadow-2xs transition-all cursor-pointer"
            >
              <span>Contact Directorate</span>
            </button>
          </div>
        </div>
      </section>

      {/* Company Detail Modal */}
      {selectedCompanyModal && (
        <CompanyDetailModal
          company={selectedCompanyModal}
          partners={partnersList}
          onSelectCompany={(company) => setSelectedCompanyModal(company)}
          onClose={() => setSelectedCompanyModal(null)}
          onRegisterInterest={(company) => {
            setSelectedCompanyModal(null);
            navigate(`/employers/register?partner=${encodeURIComponent(company.name)}`);
          }}
        />
      )}
    </div>
  );
}
