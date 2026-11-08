import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users,
  Building2,
  ArrowRight,
  ShieldCheck,
  Cpu,
  GraduationCap,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { partnerLogos } from '../components/PartnerLogos';
import homepageCmsService, {
  defaultPartnersPageConfig,
  PartnersPageConfig,
  Partner,
  defaultPartnersList,
} from '../features/admin/services/homepageCms.service';
import { usePublicMetrics } from '../services/publicMetrics.service';
import CompanyDetailModal from '../components/CompanyDetailModal';

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

      {/* ── 1. PRESTIGE ACADEMIC BLUE HERO BANNER (REAL ASTU LAB/CAMPUS PHOTO + ABSTRACT BLUEPRINT) ── */}
      <header className="relative overflow-hidden bg-gradient-to-b from-[#001d4a] via-[#002b66] to-[#0a3977] pt-10 pb-14 sm:pt-14 sm:pb-20 text-white shadow-xl">
        {/* Real ASTU Engineering Lab / Research Facility Photograph Overlay */}
        <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none select-none">
          <img
            alt="ASTU Engineering Research Laboratory"
            className="h-full w-full object-cover"
            src="/images/electriclabs.jpeg"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/astu-building.jpg';
            }}
          />
        </div>

        {/* Abstract Blueprint Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:4rem_4rem] pointer-events-none" />

        {/* Abstract Dot Grid Accent Overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-15"
          style={{
            backgroundImage: 'radial-gradient(rgba(169, 196, 224, 0.25) 1.2px, transparent 1.2px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Abstract Concentric Radar Arcs & Mathematical Rings in Top-Right */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 h-full w-[650px] opacity-25 select-none overflow-visible"
          viewBox="0 0 650 350"
          fill="none"
        >
          <circle cx="520" cy="60" r="140" stroke="rgba(169, 196, 224, 0.45)" strokeWidth="1" />
          <circle cx="520" cy="60" r="240" stroke="rgba(169, 196, 224, 0.35)" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="520" cy="60" r="360" stroke="rgba(169, 196, 224, 0.25)" strokeWidth="1" />
          <circle cx="520" cy="60" r="480" stroke="rgba(169, 196, 224, 0.16)" strokeWidth="1" strokeDasharray="6 6" />
          <circle cx="520" cy="60" r="620" stroke="rgba(169, 196, 224, 0.08)" strokeWidth="1" />
        </svg>

        <div className="relative z-10 mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation: Home / Partners */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[13px] text-slate-300/80 mb-6 font-normal">
            <Link to="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span className="text-slate-400 font-light">/</span>
            <span className="text-white font-medium">Industry Partners</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            {/* Left Title and Eyebrow Block */}
            <div className="max-w-2xl">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="w-5 h-[2px] bg-[#E05A6D] inline-block rounded-full" />
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#E05A6D]">
                  {config.heroBadge || 'CORPORATE & INDUSTRY ALLIANCES'}
                </span>
              </div>

              <h1 className="font-fraunces text-3xl sm:text-4xl lg:text-[48px] font-bold text-white tracking-[-0.015em] leading-[1.14]">
                {config.heroTitle || 'Partner with ASTU to Access'}{' '}
                <span className="text-[#FFD700]">{config.heroHighlight || 'Top Graduates'}</span>
              </h1>

              <p className="mt-4 text-sm sm:text-base text-slate-200/90 leading-relaxed max-w-xl font-normal">
                {config.heroSubtitle ||
                  'Connect with verified alumni talent, post job opportunities, and shape the future of technical education through industry collaboration.'}
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => navigate(config.heroPrimaryCtaLink || '/employers/register')}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C8102E] hover:bg-[#A60D26] text-white px-7 py-3.5 text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <span>{config.heroPrimaryCtaText || 'Register as Employer'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate(config.heroSecondaryCtaLink || '/login')}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 hover:bg-white/15 text-white px-6 py-3.5 text-sm font-medium backdrop-blur-sm transition-all cursor-pointer"
                >
                  <span>{config.heroSecondaryCtaText || 'Employer Login'}</span>
                </button>
              </div>
            </div>

            {/* Right Badge: Verified Enterprise Network */}
            <div className="hidden lg:flex items-center gap-3.5 rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md px-5 py-4 shadow-xl">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-rose-300">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-white">
                  Verified Enterprise Network
                </p>
                <p className="text-[11px] text-slate-300">
                  500+ Active Institutional Alliances
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── 2. THREE PILLARS OF STRATEGIC COLLABORATION (CONSOLIDATED & NON-REPETITIVE) ── */}
      <section className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 mb-2.5">
            <span className="w-4 h-[2px] bg-[#C8102E] inline-block rounded-full" />
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#C8102E]">
              COLLABORATION TRACKS
            </span>
          </div>
          <h2 className="font-fraunces text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#002147] tracking-tight">
            How Enterprises Engage with ASTU
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            Three distinct institutional avenues designed for talent pipelines, applied R&amp;D, and workforce development.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Track 1: Direct Talent Acquisition */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-8 shadow-[0_1px_3px_rgba(0,33,71,0.04),0_10px_24px_-8px_rgba(0,33,71,0.06)] hover:shadow-md hover:border-[#002147]/30 transition-all flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 rounded-xl bg-[#002147] text-white flex items-center justify-center mb-6 shadow-xs">
                <Users className="h-6 w-6" />
              </div>

              <h3 className="font-fraunces text-xl font-bold text-[#002147] mb-3">
                1. Talent Acquisition &amp; Careers
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed mb-6 font-normal">
                Directly recruit top-tier software engineers, electrical technologists, and applied scientists with registrar-verified credentials.
              </p>

              <ul className="space-y-3.5 text-xs text-slate-700 font-medium">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#002147] shrink-0 mt-0.5" />
                  <span>Priority access to annual Campus Job Expos and dedicated interview suites</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#002147] shrink-0 mt-0.5" />
                  <span>Direct job and internship dispatches to verified graduating seniors</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#002147] shrink-0 mt-0.5" />
                  <span>Registrar-verified academic credentials, GPAs, and transcripts</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => navigate('/employers/register')}
                className="text-xs font-bold text-[#002147] hover:text-[#C8102E] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Register as Employer</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Track 2: Applied R&D & Capstones */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-8 shadow-[0_1px_3px_rgba(0,33,71,0.04),0_10px_24px_-8px_rgba(0,33,71,0.06)] hover:shadow-md hover:border-[#002147]/30 transition-all flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 rounded-xl bg-[#002147] text-white flex items-center justify-center mb-6 shadow-xs">
                <Cpu className="h-6 w-6" />
              </div>

              <h3 className="font-fraunces text-xl font-bold text-[#002147] mb-3">
                2. Applied R&amp;D &amp; Capstones
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed mb-6 font-normal">
                Co-sponsor graduation capstone projects and access ASTU’s 12+ specialized engineering and robotics laboratories.
              </p>

              <ul className="space-y-3.5 text-xs text-slate-700 font-medium">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#002147] shrink-0 mt-0.5" />
                  <span>Commission applied industry problem solving in university research centers</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#002147] shrink-0 mt-0.5" />
                  <span>Co-develop intellectual property, prototyping, and technical patents</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#002147] shrink-0 mt-0.5" />
                  <span>Joint research grant applications with senior university faculty</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => navigate('/contact')}
                className="text-xs font-bold text-[#002147] hover:text-[#C8102E] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Inquire About Lab Research</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Track 3: Curriculum Advisory & Upskilling */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-8 shadow-[0_1px_3px_rgba(0,33,71,0.04),0_10px_24px_-8px_rgba(0,33,71,0.06)] hover:shadow-md hover:border-[#002147]/30 transition-all flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 rounded-xl bg-[#002147] text-white flex items-center justify-center mb-6 shadow-xs">
                <GraduationCap className="h-6 w-6" />
              </div>

              <h3 className="font-fraunces text-xl font-bold text-[#002147] mb-3">
                3. Curriculum &amp; Upskilling
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed mb-6 font-normal">
                Shape future engineering curricula to align with real-world market needs and access executive corporate training modules.
              </p>

              <ul className="space-y-3.5 text-xs text-slate-700 font-medium">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#002147] shrink-0 mt-0.5" />
                  <span>Biennial curriculum review advisory seats aligned with ETA accreditation</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#002147] shrink-0 mt-0.5" />
                  <span>Continuous Professional Development (CPD) modules for enterprise teams</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#002147] shrink-0 mt-0.5" />
                  <span>Longitudinal graduate tracer feedback integration</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => navigate('/contact')}
                className="text-xs font-bold text-[#002147] hover:text-[#C8102E] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Curriculum Partnership</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. COLLABORATING ENTERPRISES (MARQUEE CAROUSEL) ── */}
      <section className="bg-slate-50/80 py-16 lg:py-20 border-y border-slate-200/80 overflow-hidden">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center max-w-xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#C8102E] mb-2 block">
              ENTERPRISE ALLIANCES
            </span>
            <h3 className="font-fraunces text-2xl sm:text-3xl font-bold text-[#002147]">
              Collaborating Partner Organizations
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-600">
              Institutional partners supporting employability, accreditation feedback, internships, and research collaboration.
            </p>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-5 shadow-xs">
            <div className="flex gap-6 animate-scroll hover:[animation-play-state:paused]">
              {[...partnersList, ...partnersList].map((partner, idx) => {
                const LogoComponent = partnerLogos[partner.name];
                return (
                  <div
                    key={`${partner.name}-${idx}`}
                    onClick={() => setSelectedCompanyModal(partner)}
                    className="flex min-w-[180px] flex-col items-center justify-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4 hover:bg-white hover:border-[#002147]/30 hover:shadow-xs transition-all cursor-pointer group"
                  >
                    <div className="h-12 w-full flex items-center justify-center">
                      {partner.logo ? (
                        <img
                          src={partner.logo}
                          alt={partner.name}
                          className="max-h-10 max-w-[130px] w-auto h-auto object-contain transition-transform group-hover:scale-105"
                        />
                      ) : LogoComponent ? (
                        <LogoComponent className="group-hover:scale-105" />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#002147] text-white text-xs font-bold shadow-xs">
                          {partner.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-slate-700 text-center truncate max-w-[150px] group-hover:text-[#002147]">
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
      <section className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
        {/* Telemetry Numbers */}
        <div className="grid gap-8 grid-cols-2 lg:grid-cols-4 pb-16 border-b border-slate-200">
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

        {/* Executive Directorate Strip */}
        <div
          className="mt-16 rounded-3xl p-8 sm:p-12 text-white shadow-xl border border-white/10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #001838 0%, #002244 60%, #00122e 100%)',
          }}
        >
          {/* Subtle dot pattern */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.25) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
              OFFICE OF CORPORATE COMMUNICATIONS &amp; INDUSTRY LINKAGE
            </span>
            <h3 className="font-fraunces text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
              Ready to Form a Strategic Partnership with ASTU?
            </h3>
            <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed max-w-xl">
              Connect directly with our Directorate to discuss talent pipelines, laboratory research, and sponsored campus recruitment initiatives.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-5 text-xs text-blue-200/90">
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-rose-300" /> +251 22 110 0055
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-rose-300" /> irccd@astu.edu.et
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-rose-300" /> Main Campus, Adama
              </span>
            </div>
          </div>

          <div className="relative z-10 shrink-0 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => navigate('/employers/register')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C8102E] hover:bg-[#A60D26] text-white px-7 py-3.5 text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer"
            >
              <span>Register Organization</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/contact')}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/5 hover:bg-white/10 text-white px-6 py-3.5 text-xs font-semibold backdrop-blur-sm transition-all cursor-pointer"
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
