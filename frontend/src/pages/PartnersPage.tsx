import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Users,
  Building2,
  ArrowRight,
  Handshake,
  Search,
  MessageSquare,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { partnerLogos, PartnerLogoBadge } from '../components/PartnerLogos';
import homepageCmsService, {
  defaultPartnersPageConfig,
  PartnersPageConfig,
  Partner,
} from '../features/admin/services/homepageCms.service';
import { usePublicMetrics } from '../services/publicMetrics.service';
import CompanyDetailModal from '../components/CompanyDetailModal';

const DEFAULT_BENEFITS = [
  {
    icon: Users,
    title: 'Hire Talented Graduates',
    description: 'Access verified ASTU graduates with practical training in engineering, technology, and sciences.',
  },
  {
    icon: Briefcase,
    title: 'Post Job Opportunities',
    description: 'Publish jobs, internships, and graduate trainee programs directly to the alumni network.',
  },
  {
    icon: MessageSquare,
    title: 'Shape the Curriculum',
    description: 'Share employer feedback that informs biennial curriculum reviews and competency alignment.',
  },
  {
    icon: Search,
    title: 'Verified Profiles',
    description: 'Search by department, skills, credentials, and graduation cohort with registrar-verified records.',
  },
  {
    icon: TrendingUp,
    title: 'Recruitment Insights',
    description: 'Track applications, hiring outcomes, and employment trends from one employer dashboard.',
  },
  {
    icon: Handshake,
    title: 'Strategic Partnerships',
    description: 'Build long-term collaboration for research, internships, campus events, and sponsorships.',
  },
];

const DEFAULT_FEATURES = [
  'TIN-verified employer accounts',
  'Direct access to verified alumni',
  'Curriculum-aligned skill matching',
  'Accreditation-ready tracer reporting',
  'Priority campus recruitment support',
  'Direct faculty and department liaison',
];

const BENEFIT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Users,
  Briefcase,
  MessageSquare,
  Search,
  TrendingUp,
  Handshake,
};

const HERO_IMAGE = '/images/astu-building.jpg';

export default function PartnersPage() {
  const navigate = useNavigate();
  const { metrics, loading: metricsLoading } = usePublicMetrics();

  const [config, setConfig] = useState<PartnersPageConfig>(() => {
    const s = homepageCmsService.getSettings();
    return s?.partnersPage || defaultPartnersPageConfig;
  });

  const [partnersList, setPartnersList] = useState<Partner[]>(() => {
    const s = homepageCmsService.getSettings();
    return Array.isArray(s?.partners) ? s.partners.filter((p) => p.active !== false) : [];
  });
  const [partnersLoading, setPartnersLoading] = useState(true);
  const [selectedCompanyModal, setSelectedCompanyModal] = useState<Partner | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  const [heroReady, setHeroReady] = useState(false);

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
    const t = requestAnimationFrame(() => setHeroReady(true));
    return () => cancelAnimationFrame(t);
  }, []);

  useEffect(() => {
    let isMounted = true;
    homepageCmsService
      .fetchFromApi()
      .then((live) => {
        if (!isMounted) return;
        if (live?.partnersPage) setConfig(live.partnersPage);
        if (Array.isArray(live?.partners)) {
          setPartnersList(live.partners.filter((p) => p.active !== false));
        }
        setPartnersLoading(false);
      })
      .catch(() => {
        if (isMounted) setPartnersLoading(false);
      });

    const handleUpdate = () => {
      const s = homepageCmsService.getSettings();
      if (s?.partnersPage) setConfig(s.partnersPage);
      if (Array.isArray(s?.partners)) {
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

  const features = config.features?.length ? config.features : DEFAULT_FEATURES;

  const cmsBenefits = (config.benefits || []).filter((b) => b.active !== false);
  const benefitCards =
    cmsBenefits.length > 0
      ? cmsBenefits.map((b) => ({
          icon: BENEFIT_ICONS[b.icon || ''] || Users,
          title: b.title,
          description: b.description,
        }))
      : DEFAULT_BENEFITS;

  const faqs = config.faqs?.length ? config.faqs : defaultPartnersPageConfig.faqs || [];

  const metricDisplay = (value: string) => (metricsLoading ? '…' : value);

  const filteredPartners = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return partnersList;
    return partnersList.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.industry && p.industry.toLowerCase().includes(q)) ||
        (p.location && p.location.toLowerCase().includes(q))
    );
  }, [partnersList, searchQuery]);

  const heroBg = config.heroBackgroundImage || HERO_IMAGE;

  return (
    <div className="min-h-screen bg-[#f3f5f8] text-slate-900 font-sans">
      <Navbar />

      {isCmsAdmin && (
        <aside className="fixed bottom-6 right-6 z-40">
          <button
            type="button"
            onClick={() => navigate('/cms/partners')}
            className="inline-flex items-center gap-2 rounded-md bg-astu-navy px-4 py-2.5 text-xs font-semibold text-white shadow-lg hover:bg-[#001a41] transition-colors cursor-pointer"
          >
            Edit in CMS
          </button>
        </aside>
      )}

      {/* ── HERO: full-bleed campus + brand-first composition ── */}
      <section className="relative isolate min-h-[88vh] overflow-hidden text-white">
        <img
          src={heroBg}
          alt="Adama Science and Technology University campus"
          className={`absolute inset-0 h-full w-full object-cover transition-transform duration-[1.4s] ease-out ${
            heroReady ? 'scale-100' : 'scale-105'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#001433]/96 via-[#002866]/88 to-[#003580]/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#001433]/70 via-transparent to-[#001433]/35" />

        <div
          className={`relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 md:px-8 md:pb-20 md:pt-32 transition-all duration-700 ${
            heroReady ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <p className="mb-3 text-[13px] font-bold uppercase tracking-[0.28em] text-[#FFCC00]">ASTU</p>
          <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
            {config.heroBadge || 'Employer & Industry Partnerships'}
          </p>

          <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl leading-[1.08]">
            {config.heroTitle || 'Partner with ASTU to Access'}{' '}
            <span className="text-astu-green">
              {config.heroHighlight || 'Top Engineering & Tech Graduates'}
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/80 md:text-lg">
            {config.heroSubtitle ||
              'Connect with verified alumni talent, publish career opportunities, and collaborate on technical education.'}
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => navigate(config.heroPrimaryCtaLink || '/employers/register')}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-astu-green px-8 py-3.5 text-sm font-bold text-white transition hover:brightness-110 cursor-pointer"
            >
              {config.heroPrimaryCtaText || 'Register as Employer'}
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate(config.heroSecondaryCtaLink || '/login')}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-white/35 bg-white/5 px-8 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/12 cursor-pointer"
            >
              {config.heroSecondaryCtaText || 'Employer Portal Login'}
            </button>
          </div>
        </div>
      </section>

      {/* ── IMPACT STRIP ── */}
      <section className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px bg-slate-100 md:grid-cols-4">
          {[
            { value: metricDisplay(metrics.registeredAlumniFormatted), label: 'Alumni Members' },
            { value: metricDisplay(String(metrics.fieldsOfStudy || '—')), label: 'Fields of Study' },
            { value: metricDisplay(metrics.corporatePartnersFormatted), label: 'Partners' },
            { value: metricDisplay(metrics.employmentRateFormatted), label: 'Employment Rate' },
          ].map((item) => (
            <div key={item.label} className="bg-white px-4 py-9 text-center md:py-10">
              <div className="text-2xl font-extrabold tracking-tight text-astu-navy md:text-3xl">{item.value}</div>
              <div className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHY PARTNER ── */}
      <section id="benefits" className="scroll-mt-20 bg-[#f3f5f8]">
        <div className="mx-auto max-w-6xl px-4 py-20 md:px-8 md:py-24">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-astu-green">
              {config.benefitsEyebrow || 'Why Partner'}
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-astu-navy md:text-4xl">
              {config.benefitsTitle || 'Why Partner with ASTU?'}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              {config.benefitsSubtitle ||
                'Join industry, public institutions, and research partners recruiting and collaborating with ASTU.'}
            </p>
          </div>

          <div className="mt-14 grid gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {benefitCards.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="group"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center bg-astu-navy text-white transition-transform duration-300 group-hover:scale-105">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-astu-navy">{benefit.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PARTNER DIRECTORY ── */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 md:px-8 md:py-24">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-astu-green">Directory</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-astu-navy md:text-4xl">
                {config.partnersCarouselTitle || 'Corporate & Institutional Partners'}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                {config.partnersCarouselSubtitle ||
                  'Employers collaborating with ASTU across technology, industry, and public sectors.'}
              </p>
            </div>

            {partnersList.length > 0 && (
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  placeholder="Search partners…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-slate-200 bg-[#f8fafc] py-3 pl-11 pr-3 text-sm outline-none transition focus:border-astu-navy focus:bg-white focus:ring-2 focus:ring-astu-navy/10"
                />
              </div>
            )}
          </div>

          <div className="mt-12">
            {partnersLoading ? (
              <p className="py-16 text-center text-sm text-slate-500">Loading partners…</p>
            ) : filteredPartners.length === 0 ? (
              <div className="border border-dashed border-slate-300 py-16 text-center">
                <Building2 className="mx-auto h-9 w-9 text-slate-300" />
                <p className="mt-4 text-sm font-semibold text-astu-navy">No partners listed yet</p>
                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                  Partner organizations appear here once published. Register as an employer to join.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/employers/register')}
                  className="mt-6 inline-flex items-center gap-2 bg-astu-green px-5 py-2.5 text-xs font-bold text-white hover:brightness-110 cursor-pointer"
                >
                  Register as Employer <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-slate-200 border-y border-slate-200">
                {filteredPartners.map((partner) => {
                  const LogoComponent = partnerLogos[partner.name];
                  return (
                    <li key={partner.id || partner.name}>
                      <button
                        type="button"
                        onClick={() => setSelectedCompanyModal(partner)}
                        className="group flex w-full items-start gap-5 py-6 text-left transition hover:bg-[#f8fafc] cursor-pointer sm:items-center sm:gap-6"
                      >
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center bg-slate-50 ring-1 ring-slate-200">
                          {partner.logo ? (
                            <PartnerLogoBadge name={partner.name} src={partner.logo} className="h-10 w-10 !shadow-none" />
                          ) : LogoComponent ? (
                            <LogoComponent className="h-10 w-10" />
                          ) : (
                            <span className="text-sm font-bold text-astu-navy">{partner.name.slice(0, 3)}</span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                            <h3 className="text-base font-bold text-astu-navy transition-colors group-hover:text-astu-green">
                              {partner.name}
                            </h3>
                            {partner.industry && (
                              <span className="text-xs font-medium text-slate-500">{partner.industry}</span>
                            )}
                          </div>
                          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-600">
                            {partner.description ||
                              'ASTU partner supporting collaboration, internships, and talent pipelines.'}
                          </p>
                          {partner.location && (
                            <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                              <MapPin className="h-3 w-3" />
                              {partner.location}
                            </p>
                          )}
                        </div>

                        <span className="mt-1 hidden shrink-0 items-center gap-1 text-xs font-bold text-astu-navy sm:inline-flex">
                          View profile
                          <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* ── WHAT PARTNERS GET ── */}
      <section className="bg-[#f3f5f8]">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 md:grid-cols-12 md:px-8 md:py-24">
          <div className="md:col-span-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-astu-green">
              {config.featuresEyebrow || 'Employer Account'}
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-astu-navy md:text-4xl">
              {config.featuresTitle || 'What Partners Get'}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              {config.featuresSubtitle ||
                'Tools to source talent, collaborate with academic departments, and support institutional excellence.'}
            </p>

            <button
              type="button"
              onClick={() => navigate(config.ctaCardButtonLink || '/employers/register')}
              className="mt-8 inline-flex items-center gap-2 bg-astu-navy px-6 py-3 text-sm font-bold text-white transition hover:bg-[#001a41] cursor-pointer"
            >
              {config.ctaCardButtonText || 'Register as Partner'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="md:col-span-7">
            <ul className="space-y-0 border-t border-slate-200">
              {features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 border-b border-slate-200 py-4 text-sm text-slate-700"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-astu-green" />
                  <span className="leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 border-l-4 border-astu-green bg-white px-5 py-5">
              <h3 className="text-lg font-bold text-astu-navy">
                {config.ctaCardTitle || 'Accelerate Your Hiring Pipeline'}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {config.ctaCardDescription ||
                  'Register today for verified graduate profiles and dedicated recruitment support.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      {faqs.length > 0 && (
        <section className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-3xl px-4 py-20 md:px-8 md:py-24">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-astu-green">FAQ</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-astu-navy md:text-4xl">
              Partnership Questions
            </h2>

            <div className="mt-12 divide-y divide-slate-200 border-y border-slate-200">
              {faqs.map((faq) => {
                const isOpen = openFaqId === faq.id;
                return (
                  <div key={faq.id}>
                    <button
                      type="button"
                      onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                      className="flex w-full items-center justify-between gap-4 py-5 text-left cursor-pointer"
                    >
                      <span className="text-sm font-bold text-astu-navy md:text-base">{faq.question}</span>
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                      )}
                    </button>
                    <div
                      className={`grid transition-all duration-300 ease-out ${
                        isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="pb-5 text-sm leading-relaxed text-slate-600">{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── CONTACT ── */}
      <section id="contact" className="scroll-mt-20 bg-[#f3f5f8]">
        <div className="mx-auto max-w-6xl px-4 py-20 md:px-8 md:py-24">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-astu-green">Contact</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-astu-navy md:text-4xl">
            Corporate & Alumni Relations
          </h2>
          <p className="mt-4 max-w-xl text-base text-slate-600">
            Reach the ASTU Industry Linkage office for partnership onboarding and campus recruitment.
          </p>

          <div className="mt-12 grid gap-10 border-t border-slate-200 pt-10 sm:grid-cols-3">
            <div>
              <MapPin className="mb-4 h-5 w-5 text-astu-navy" />
              <h3 className="text-sm font-bold text-astu-navy">Address</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Adama Science and Technology University
                <br />
                Adama, Oromia, Ethiopia
              </p>
              <a
                href="https://maps.google.com/?q=Adama+Science+and+Technology+University"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-astu-navy hover:text-astu-green"
              >
                Open in Maps <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div>
              <Phone className="mb-4 h-5 w-5 text-astu-navy" />
              <h3 className="text-sm font-bold text-astu-navy">Phone</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {config.contactPhone || '+251-221-110000'}
                <br />
                Ext: 204 / 205
              </p>
              <a
                href={`tel:${(config.contactPhone || '+251-221-110000').replace(/[^\d+]/g, '')}`}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-astu-navy hover:text-astu-green"
              >
                Call office
              </a>
            </div>

            <div>
              <Mail className="mb-4 h-5 w-5 text-astu-navy" />
              <h3 className="text-sm font-bold text-astu-navy">Email</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {config.contactEmail || 'irccd@astu.edu.et'}
                <br />
                Corporate & Alumni Relations
              </p>
              <a
                href={`mailto:${config.contactEmail || 'irccd@astu.edu.et'}`}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-astu-navy hover:text-astu-green"
              >
                Send email
              </a>
            </div>
          </div>

          <p className="mt-12 flex items-center gap-2 text-xs text-slate-500">
            <Clock className="h-3.5 w-3.5 text-astu-green" />
            Monday – Friday, 8:30 AM – 5:30 PM (EAT)
          </p>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="relative overflow-hidden bg-astu-navy text-white">
        <div className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-astu-green/20 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 md:px-8 md:py-24">
          <div className="max-w-2xl">
            <p className="text-[13px] font-bold uppercase tracking-[0.28em] text-[#FFCC00]">ASTU</p>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">
              {config.bottomCtaTitle || 'Start Building Your Talent Pipeline'}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-300">
              {config.bottomCtaDescription ||
                "Join ASTU's partner network and connect with Ethiopia's engineering and technology graduates."}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate(config.bottomCtaButtonLink || '/employers/register')}
                className="inline-flex items-center gap-2 rounded-md bg-astu-green px-8 py-3.5 text-sm font-bold text-white hover:brightness-110 cursor-pointer"
              >
                {config.bottomCtaButtonText || 'Register Your Organization'}
                <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 rounded-md border border-white/30 px-8 py-3.5 text-sm font-bold text-white hover:bg-white/10 cursor-pointer"
              >
                Contact Directorate
              </a>
            </div>
          </div>
        </div>
      </section>

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
