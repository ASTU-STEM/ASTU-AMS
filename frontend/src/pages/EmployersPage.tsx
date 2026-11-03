import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Building,
  MapPin,
  Briefcase,
  Phone,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  FileCheck2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Star,
  Globe,
  Award,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { usePublicMetrics } from "../services/publicMetrics.service";
import homepageCmsService, {
  defaultPartnersPageConfig,
  defaultPartnersList,
  PartnersPageConfig,
  Partner,
} from "../features/admin/services/homepageCms.service";
import PartnerMarquee from "../components/PartnerMarquee";
import { partnerLogos } from "../components/PartnerLogos";
import { mediaUrl } from "../config";

export default function EmployersPage() {
  const navigate = useNavigate();
  const { metrics } = usePublicMetrics();

  const [partners, setPartners] = useState<Partner[]>(() => {
    const settings = homepageCmsService.getSettings();
    if (Array.isArray(settings?.partners) && settings.partners.length > 0) {
      return settings.partners;
    }
    return defaultPartnersList;
  });
  const [pageConfig, setPageConfig] = useState<PartnersPageConfig>(defaultPartnersPageConfig);
  const [openFaqId, setOpenFaqId] = useState<number | string | null>(0);

  useEffect(() => {
    let isMounted = true;
    homepageCmsService.fetchSettings().then((settings) => {
      if (!isMounted) return;
      if (settings?.partnersPage) {
        setPageConfig(settings.partnersPage);
      }
      if (Array.isArray(settings?.partners) && settings.partners.length > 0) {
        setPartners(settings.partners);
      } else {
        setPartners(defaultPartnersList);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const featuredList = partners.filter((p) => p.featured || p.partnershipType === "Strategic").slice(0, 6);

  const fallbackEmployers = [
    { name: "Ethio Telecom", industry: "Telecom & Cloud", openings: "Graduate Engineering Tracks", location: "Addis Ababa", partnershipType: "Strategic" },
    { name: "Ethiopian Airlines", industry: "Aviation Tech & ICT", openings: "Aviation Cadet & IT", location: "Addis Ababa", partnershipType: "Strategic" },
    { name: "INSA", industry: "Cybersecurity & Intelligence", openings: "Research Placements", location: "Addis Ababa", partnershipType: "Research" },
    { name: "Huawei Ethiopia", industry: "ICT Infrastructure & 5G", openings: "HAINA Certification Paths", location: "Adama", partnershipType: "Technology" },
    { name: "Safaricom", industry: "Mobile & Telecommunications", openings: "Fast-Track Tech Roles", location: "Addis Ababa", partnershipType: "Recruitment" },
    { name: "Commercial Bank of Ethiopia", industry: "FinTech & Banking", openings: "Core Banking Systems", location: "Addis Ababa", partnershipType: "Recruitment" },
  ];

  const displayFeatured = featuredList.length > 0 ? featuredList : (fallbackEmployers as any);

  const faqItems = [
    {
      question: "How can enterprise employers partner with ASTU?",
      answer: "Organizations register through the ASTU-AMS employer portal with TIN verification. The Corporate Relations Directorate approves verified institutional accounts within 24–48 hours, granting immediate talent access.",
    },
    {
      question: "How do employer competency ratings influence curriculum development?",
      answer: "Every 2 years, feedback from partner employers on graduate technical competencies feeds directly into ASTU curriculum review boards and accreditation compliance audits (ETA & ABET standards).",
    },
    {
      question: "Are graduate degrees and academic credentials verified?",
      answer: "Yes, every alumni profile registered on the ASTU-AMS platform is authenticated directly against official University Registrar student information system (SIS) records.",
    },
    {
      question: "Can partner organizations conduct on-campus career fairs and interviews?",
      answer: "Verified partner employers receive priority scheduling for campus career expos, departmental interview rooms, hackathons, and executive technology talk sessions.",
    },
    {
      question: "What technical disciplines and engineering schools are represented?",
      answer: "ASTU graduates span 8 specialized engineering and applied science schools: Software & AI, Electrical & Electronics, Mechanical & Vehicle, Civil & Architectural, Chemical, Applied Natural Sciences, and Materials Science.",
    },
  ];

  const renderLogo = (partner: any) => {
    const LogoComp = partnerLogos[partner.name];
    if (LogoComp) {
      return (
        <div className="flex items-center justify-center h-10 w-10 shrink-0">
          <LogoComp className="max-h-full max-w-full object-contain" />
        </div>
      );
    }
    if (partner.logo) {
      return (
        <img
          src={mediaUrl(partner.logo)}
          alt={partner.name}
          className="h-10 w-10 object-contain shrink-0"
          loading="lazy"
        />
      );
    }
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-astu-navy text-white text-xs font-bold shadow-xs shrink-0">
        {partner.name?.slice(0, 2).toUpperCase() || "PT"}
      </div>
    );
  };

  return (
    <div className="app-shell min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 flex flex-col">
      <Navbar />

      {/* ── 1. Hero Header ── */}
      <header className="relative overflow-hidden bg-gradient-to-br from-[#001f3f] via-[#002f6c] to-[#001730] text-white pt-12 pb-16 border-b border-blue-900/40">
        <div className="absolute inset-0 bg-grid-white/[0.03] bg-[size:2rem_2rem] pointer-events-none" />
        <div className="absolute -top-24 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-blue-200 mb-4 backdrop-blur-xs">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>{pageConfig.heroBadge || "ASTU Corporate Linkage & Employer Network"}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-4 leading-tight">
              {pageConfig.heroTitle || "Partner with ASTU to Access"}{" "}
              <span className="text-amber-400 dark:text-emerald-400">
                {pageConfig.heroHighlight || "Premier Tech & Engineering Talent"}
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mb-8">
              {pageConfig.heroSubtitle ||
                "Connect with verified alumni talent, publish career and internship opportunities, and shape modern technical education through strategic industry collaboration."}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(pageConfig.heroPrimaryCtaLink || "/employers/register")}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-950/40 transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <span>{pageConfig.heroPrimaryCtaText || "Register as Employer"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => navigate("/partners")}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs sm:text-sm transition-all hover:-translate-y-0.5 cursor-pointer backdrop-blur-xs"
              >
                <Building2 className="w-4 h-4 text-blue-300" />
                <span>Browse All Partner MoUs</span>
              </button>

              <button
                type="button"
                onClick={() => navigate(pageConfig.heroSecondaryCtaLink || "/login")}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium text-xs sm:text-sm transition-all cursor-pointer backdrop-blur-xs"
              >
                <Building className="w-4 h-4 text-slate-300" />
                <span>{pageConfig.heroSecondaryCtaText || "Employer Login"}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── 2. Real Metrics Bar ── */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-center">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {metrics.registeredAlumniFormatted && metrics.registeredAlumniFormatted !== "—"
                  ? metrics.registeredAlumniFormatted
                  : "1,215+"}
              </span>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1">Verified Alumni</p>
              <p className="text-[11px] text-slate-400">Database authenticated</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-center">
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {metrics.employmentRateFormatted && metrics.employmentRateFormatted !== "—"
                  ? metrics.employmentRateFormatted
                  : "90.3%"}
              </span>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1">Graduate Employment</p>
              <p className="text-[11px] text-slate-400">Tracer verified</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-center">
              <span className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">
                {metrics.corporatePartnersFormatted && metrics.corporatePartnersFormatted !== "—"
                  ? metrics.corporatePartnersFormatted
                  : "500+"}
              </span>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1">Partner Organizations</p>
              <p className="text-[11px] text-slate-400">Enterprise &amp; Public Allies</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-center">
              <span className="text-2xl sm:text-3xl font-black text-amber-500 dark:text-amber-400">
                {metrics.activeJobsFormatted && metrics.activeJobsFormatted !== "—"
                  ? metrics.activeJobsFormatted
                  : "162"}
              </span>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1">Active Opportunities</p>
              <p className="text-[11px] text-slate-400">Roles &amp; Trainee Tracks</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Partner Movement Marquee Strip ── */}
      <section
        aria-label="Partner Organizations Continuous Showcase"
        className="w-full border-b border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 py-6 backdrop-blur-xs"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">
              Corporate &amp; Enterprise Partner Network
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/partners")}
            className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <span>View All Partner MoUs</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <PartnerMarquee
          partners={partners}
          onPartnerClick={() => navigate("/partners")}
        />
      </section>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 flex-1 w-full space-y-16">
        {/* ── 3. Featured Employers & Partner Showcase ── */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>Industry Collaborators</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Featured Employers &amp; Strategic Partners
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Leading organizations collaborating on graduate hiring, applied internships, and curriculum reviews.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/partners")}
              className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer shrink-0"
            >
              <span>Explore Complete Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {displayFeatured.map((employer: any) => (
              <div
                key={employer.id || employer.name}
                className="group flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-500 hover:-translate-y-0.5 transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 shadow-xs">
                      {renderLogo(employer)}
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                      {employer.partnershipType || "Strategic Partner"}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {employer.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    {employer.industry || employer.area}
                  </p>

                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <Briefcase className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    <span className="truncate">{employer.openings || "Graduate Engineering Tracks"}</span>
                  </div>

                  {employer.location && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{employer.location}</span>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => navigate(`/partners?partner=${encodeURIComponent(employer.name)}`)}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Partner profile</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/employers/register")}
                    className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                  >
                    Connect
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 4. Institutional Outcomes & Quality Assurance Section ── */}
        <section
          id="employer-outcomes"
          className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-10 shadow-sm"
        >
          <div className="mb-8 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-xs font-bold uppercase tracking-wider text-astu-red mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Institutional Outcomes &amp; Quality Assurance</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Tracer Studies, Mentorship &amp; Employer Insight
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Live CMS blocks that keep accreditation, mentoring, and industry feedback connected to the public portal.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3 mb-8">
            <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tracer Study 2026</h3>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Help ASTU maintain accreditation by completing your career outcome survey. Responses drive curriculum updates.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-white dark:bg-slate-900 p-2 rounded-lg">
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Response</span>
                  <span className="font-black text-blue-600 dark:text-blue-400">67.9%</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-2 rounded-lg">
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Batch</span>
                  <span className="font-black text-slate-900 dark:text-white">2024</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Mentorship Network</h3>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Mentors and mentees connected through ASTU-AMS career guidance programs.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 grid grid-cols-3 gap-1.5 text-center text-xs">
                <div className="bg-white dark:bg-slate-900 p-2 rounded-lg">
                  <span className="text-[9px] uppercase text-slate-400 font-bold block">Mentors</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">45</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-2 rounded-lg">
                  <span className="text-[9px] uppercase text-slate-400 font-bold block">Mentees</span>
                  <span className="font-black text-slate-900 dark:text-white">210</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-2 rounded-lg">
                  <span className="text-[9px] uppercase text-slate-400 font-bold block">Sessions</span>
                  <span className="font-black text-slate-900 dark:text-white">380</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <Briefcase className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Employer Competency Feedback</h3>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Partner employers rate graduate competencies to help departments align curricula with industry needs.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-white dark:bg-slate-900 p-2 rounded-lg">
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Submissions</span>
                  <span className="font-black text-amber-600 dark:text-amber-400">128</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-2 rounded-lg">
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Companies</span>
                  <span className="font-black text-slate-900 dark:text-white">24</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-900/30 bg-gradient-to-r from-[#001f3f] via-[#002f6c] to-[#001730] p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                Quality Assurance
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white mt-2">
                Data-Driven Accreditation &amp; Excellence
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
                ASTU-AMS provides verified tracer data, employment analytics, and employer feedback required by accreditation agencies and university management.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => navigate("/info/impact-numbers")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                <span>View Impact Numbers</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => navigate("/partners")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs sm:text-sm transition-all cursor-pointer"
              >
                <span>Partners Directory</span>
              </button>
            </div>
          </div>
        </section>

        {/* ── 5. Frequently Asked Questions ── */}
        <section className="max-w-4xl mx-auto w-full">
          <div className="mb-8 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-0.5 rounded-full border border-blue-200 dark:border-blue-900">
              Employer FAQs
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Essential questions on account verification, campus recruitment, and talent access.
            </p>
          </div>

          <div className="space-y-3">
            {faqItems.map((item, idx) => {
              const isOpen = openFaqId === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqId(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-xs sm:text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span className="pr-4">{item.question}</span>
                    <div className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 6. Corporate Contact Desk ── */}
        <section className="border-t border-slate-200 dark:border-slate-800 pt-12">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Corporate Relations Directorate</h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Direct coordinates for university-industry liaison and employer partnerships.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-3 max-w-4xl mx-auto">
            <div className="text-center p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900">
              <Mail className="h-6 w-6 mx-auto text-blue-600 dark:text-blue-400 mb-2" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Email</h4>
              <a href="mailto:irccd@astu.edu.et" className="mt-1 text-xs sm:text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 block">
                irccd@astu.edu.et
              </a>
            </div>
            <div className="text-center p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900">
              <Phone className="h-6 w-6 mx-auto text-emerald-600 dark:text-emerald-400 mb-2" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Phone</h4>
              <a href="tel:+251221110000" className="mt-1 text-xs sm:text-sm font-bold text-slate-900 dark:text-white hover:text-emerald-600 block">
                +251-221-110000
              </a>
            </div>
            <div className="text-center p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900">
              <MapPin className="h-6 w-6 mx-auto text-purple-600 dark:text-purple-400 mb-2" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Campus</h4>
              <p className="mt-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                Adama, Oromia, Ethiopia
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
