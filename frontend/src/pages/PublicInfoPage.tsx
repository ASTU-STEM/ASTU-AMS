import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  FileText,
  GalleryHorizontal,
  GraduationCap,
  HelpCircle,
  Lightbulb,
  PlayCircle,
  Trophy,
  Users,
  LineChart,
  ShieldCheck,
  Star,
  Globe,
  Handshake,
  MapPin,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  ArrowRight,
  Edit3,
  Clock,
  Send,
  MessageSquare,
  Layers,
  Cpu,
  Compass,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import homepageCmsService, {
  HomepageCmsConfig,
  Partner,
  defaultPartnersList,
} from "../features/admin/services/homepageCms.service";
import { defaultDetailPages, DetailPageItem } from "../features/admin/services/detailPages.data";
import storiesService, { AlumniStory } from "../features/admin/services/stories.service";
import { partnerLogos } from "../components/PartnerLogos";
import PartnerDetailLiveCustomizer from "../features/admin/components/PartnerDetailLiveCustomizer";
import CompanyDetailModal from "../components/CompanyDetailModal";
import { usePublicMetrics } from "../services/publicMetrics.service";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  FileText,
  GalleryHorizontal,
  GraduationCap,
  HelpCircle,
  Lightbulb,
  PlayCircle,
  Trophy,
  Users,
  LineChart,
  ShieldCheck,
  Star,
  Globe,
  Handshake,
  MapPin,
  Phone,
  Mail,
};

const fallbackPage: DetailPageItem = {
  slug: "not-found",
  title: "Page Not Found",
  subtitle: "The requested institutional information page is not available or has been moved.",
  iconName: "HelpCircle",
  image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1800&q=80",
  sections: [
    {
      id: "FB-1",
      heading: "Explore Available Information",
      body: "Please use the top navigation menu or return to the ASTU Alumni homepage to discover events, facilities, and portal access.",
      active: true,
    },
  ],
};

export default function PublicInfoPage() {
  const navigate = useNavigate();
  const { slug = "overview" } = useParams();
  const { metrics } = usePublicMetrics();
  const [cmsConfig, setCmsConfig] = useState<HomepageCmsConfig | null>(() => homepageCmsService.getSettings());
  const [alumniStories, setAlumniStories] = useState<AlumniStory[]>(() => storiesService.getStories());
  const [partnersList, setPartnersList] = useState<Partner[]>(() => {
    const s = homepageCmsService.getSettings();
    return s?.partners && s.partners.length > 0 ? s.partners : defaultPartnersList;
  });

  // CMS Live Customizer and Modal states
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [selectedCompanyModal, setSelectedCompanyModal] = useState<Partner | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All");

  // Contact form state
  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    email: "",
    phone: "",
    category: "Alumni",
    subject: "",
    message: "",
  });
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);

  // Check if current user is CMS Admin
  const isCmsAdmin = (() => {
    try {
      const raw = localStorage.getItem("user");
      const role = raw ? JSON.parse(raw)?.role?.toUpperCase() : localStorage.getItem("astu_ams_user_role")?.toUpperCase();
      return ["ADMIN", "SUPER_ADMIN", "CMS_MANAGER", "ALUMNI_OFFICE"].includes(role || "");
    } catch {
      return false;
    }
  })();

  useEffect(() => {
    if (slug === 'featured-employers') {
      navigate('/partners?tab=employers', { replace: true });
      return;
    }
    if (slug === 'stakeholders') {
      navigate('/partners?tab=stakeholders', { replace: true });
      return;
    }
    if (slug === 'employer-portal') {
      navigate('/partners?tab=recruitment', { replace: true });
      return;
    }

    let isMounted = true;
    const fetchLiveConfig = async () => {
      try {
        const live = await homepageCmsService.fetchFromApi();
        if (isMounted && live) {
          setCmsConfig(live);
          if (Array.isArray(live.partners) && live.partners.length > 0) {
            setPartnersList(live.partners);
          }
        }
      } catch {
        /* fallback to local snapshot */
      }
    };
    fetchLiveConfig();

    const handleUpdate = () => {
      const updated = homepageCmsService.getSettings();
      if (updated) {
        setCmsConfig(updated);
        if (Array.isArray(updated.partners) && updated.partners.length > 0) {
          setPartnersList(updated.partners);
        }
      }
      setAlumniStories(storiesService.getStories());
    };

    window.addEventListener("astu-cms-homepage-updated", handleUpdate);
    window.addEventListener("astu-cms-stories-changed", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("astu-cms-homepage-updated", handleUpdate);
      window.removeEventListener("astu-cms-stories-changed", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const rawDefaultPage = defaultDetailPages[slug] ?? fallbackPage;

  // Check for CMS overrides
  let cmsOverride: any = null;
  if (cmsConfig?.detailPages && cmsConfig.detailPages[slug]) {
    cmsOverride = cmsConfig.detailPages[slug];
  } else if (slug === "campus-life" && cmsConfig?.campusLifePage) {
    cmsOverride = cmsConfig.campusLifePage;
  } else if (slug === "facilities" && cmsConfig?.facilitiesPage) {
    cmsOverride = cmsConfig.facilitiesPage;
  } else if (slug === "events" && cmsConfig?.eventsPage) {
    cmsOverride = cmsConfig.eventsPage;
  } else if (slug === "gallery" && cmsConfig?.galleryPage) {
    cmsOverride = cmsConfig.galleryPage;
  }

  const basePage: DetailPageItem = cmsOverride
    ? {
        ...rawDefaultPage,
        title: cmsOverride.title || rawDefaultPage.title,
        subtitle: cmsOverride.subtitle || rawDefaultPage.subtitle,
        image: cmsOverride.image || rawDefaultPage.image,
        iconName: cmsOverride.iconName || rawDefaultPage.iconName,
        badge: cmsOverride.badge || rawDefaultPage.badge,
        stats: cmsOverride.stats || rawDefaultPage.stats,
        faqs: cmsOverride.faqs || rawDefaultPage.faqs,
        primaryCtaText: cmsOverride.primaryCtaText || rawDefaultPage.primaryCtaText,
        primaryCtaLink: cmsOverride.primaryCtaLink || rawDefaultPage.primaryCtaLink,
        secondaryCtaText: cmsOverride.secondaryCtaText || rawDefaultPage.secondaryCtaText,
        secondaryCtaLink: cmsOverride.secondaryCtaLink || rawDefaultPage.secondaryCtaLink,
        sections:
          Array.isArray(cmsOverride.sections) && cmsOverride.sections.length > 0
            ? cmsOverride.sections.filter((s: any) => s.active !== false)
            : rawDefaultPage.sections,
      }
    : rawDefaultPage;

  const liveReplacer = (text: string) => {
    if (!text) return text;
    return text
      .replace(/1,238\+/g, metrics.registeredAlumniFormatted)
      .replace(/1,238/g, metrics.registeredAlumni.toLocaleString())
      .replace(/500\+/g, metrics.corporatePartnersFormatted)
      .replace(/87%/g, metrics.employmentRateFormatted)
      .replace(/6,000\+/g, metrics.digitalRequestsFormatted);
  };

  const page: DetailPageItem = {
    ...basePage,
    title: liveReplacer(basePage.title),
    subtitle: liveReplacer(basePage.subtitle),
    sections: basePage.sections.map((s: any) => ({
      ...s,
      heading: liveReplacer(s.heading),
      body: liveReplacer(s.body),
    })),
  };

  const IconComponent =
    (page.iconName && iconMap[page.iconName]) || iconMap[rawDefaultPage.iconName || ""] || Trophy;

  const isStoriesPage = slug === "alumni-stories";
  const isEmployerPortal = slug === "employer-portal";
  const isFeaturedEmployers = slug === "featured-employers";
  const isStakeholders = slug === "stakeholders";
  const isOverviewPage = slug === "overview";
  const isContactPage = slug === "contact";

  // ── Pagination State for Alumni Stories (/info/alumni-stories) ──
  const [storiesPage, setStoriesPage] = useState(1);
  const [storiesPageSize, setStoriesPageSize] = useState(6); // 6 stories per page provides 3 clean 2-col rows

  // ── Pagination State for General Institutional Sections ──
  const [sectionsPage, setSectionsPage] = useState(1);
  const [sectionsPageSize, setSectionsPageSize] = useState(6);

  // Reset pagination on slug change
  useEffect(() => {
    setStoriesPage(1);
    setSectionsPage(1);
  }, [slug]);

  const totalStoryPages = Math.max(1, Math.ceil(alumniStories.length / storiesPageSize));
  const storyStartIndex = (storiesPage - 1) * storiesPageSize;
  const paginatedStories = useMemo(() => {
    return alumniStories.slice(storyStartIndex, storyStartIndex + storiesPageSize);
  }, [alumniStories, storyStartIndex, storiesPageSize]);

  const totalSectionPages = Math.max(1, Math.ceil(page.sections.length / sectionsPageSize));
  const sectionStartIndex = (sectionsPage - 1) * sectionsPageSize;
  const paginatedSections = useMemo(() => {
    return page.sections.slice(sectionStartIndex, sectionStartIndex + sectionsPageSize);
  }, [page.sections, sectionStartIndex, sectionsPageSize]);

  const getPageNumbers = (current: number, total: number) => {
    const delta = 1;
    const range: (number | string)[] = [];
    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      range.push(i);
    }
    if (current - delta > 2) {
      range.unshift('...');
    }
    if (current + delta < total - 1) {
      range.push('...');
    }
    range.unshift(1);
    if (total > 1) {
      range.push(total);
    }
    return range;
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryForm.name || !inquiryForm.email || !inquiryForm.message) {
      toast.error("Please fill in your name, email, and message.");
      return;
    }
    setIsSubmittingInquiry(true);
    setTimeout(() => {
      setIsSubmittingInquiry(false);
      setInquirySent(true);
      toast.success("Your message has been sent to the ASTU administration!");
      setInquiryForm({
        name: "",
        email: "",
        phone: "",
        category: "Alumni",
        subject: "",
        message: "",
      });
    }, 600);
  };

  // ── Institutional Information Topics Sequence (Page Handler) ──
  const publicInfoTopics = [
    { slug: 'overview', title: 'ASTU-AMS Overview' },
    { slug: 'impact-numbers', title: 'Impact Metrics' },
    { slug: 'accreditation', title: 'Accreditation & Quality' },
    { slug: 'achievements', title: 'Institutional Achievements' },
    { slug: 'campus-life', title: 'Campus Life & Culture' },
    { slug: 'facilities', title: 'Research Facilities' },
    { slug: 'mentorship', title: 'Alumni Mentorship' },
    { slug: 'research', title: 'Applied Research Centers' },
    { slug: 'innovation', title: 'Incubation & Arc' },
    { slug: 'faq', title: 'Frequently Asked Questions' },
    { slug: 'contact', title: 'Institutional Directory' },
  ];

  const currentTopicIndex = publicInfoTopics.findIndex((t) => t.slug === slug);
  const prevTopic = currentTopicIndex > 0 ? publicInfoTopics[currentTopicIndex - 1] : null;
  const nextTopic =
    currentTopicIndex >= 0 && currentTopicIndex < publicInfoTopics.length - 1
      ? publicInfoTopics[currentTopicIndex + 1]
      : null;

  // Keyboard navigation for info pages (ArrowLeft / ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      if (e.key === 'ArrowLeft' && prevTopic) {
        navigate(`/info/${prevTopic.slug}`);
      } else if (e.key === 'ArrowRight' && nextTopic) {
        navigate(`/info/${nextTopic.slug}`);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevTopic, nextTopic, navigate]);

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 antialiased selection:bg-[#003580] selection:text-white">
      <Navbar />

      {/* Floating CMS Edit & Live Customizer Trigger for Admins */}
      {isCmsAdmin && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col sm:flex-row items-end sm:items-center gap-2">
          <button
            type="button"
            onClick={() => setCustomizerOpen(!customizerOpen)}
            className="inline-flex items-center gap-2 rounded-full bg-[#003366] hover:bg-[#002244] text-white px-5 py-3 text-xs font-bold shadow-2xl transition-all cursor-pointer ring-4 ring-amber-400/30 hover:scale-105"
            title="Open Live Preview CMS customizer sidebar"
          >
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span>{customizerOpen ? "Close Customizer" : "Customize Page (Live Preview)"}</span>
          </button>
          <button
            type="button"
            onClick={() => navigate(`/cms/partners`)}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/95 px-4 py-2.5 text-xs font-bold text-slate-800 shadow-xl backdrop-blur-md hover:bg-slate-100 transition-all cursor-pointer"
            title="Open Full CMS Studio"
          >
            <Edit3 className="h-3.5 w-3.5 text-[#003366]" />
            <span>CMS Studio</span>
          </button>
        </div>
      )}

      {/* Sliding In-Page Live Customizer Sidebar */}
      {customizerOpen && (
        <PartnerDetailLiveCustomizer
          slug={slug}
          pageData={page}
          cmsConfig={cmsConfig}
          partnersList={partnersList}
          onPageChange={(updated) => {
            setCmsConfig((prev) => {
              const full = prev || ({} as any);
              const detailPages = full.detailPages ? { ...full.detailPages } : {};
              detailPages[slug] = updated;
              return { ...full, detailPages };
            });
          }}
          onPartnersChange={(updatedPartners) => {
            setPartnersList(updatedPartners);
            setCmsConfig((prev) => {
              const full = prev || ({} as any);
              return { ...full, partners: updatedPartners };
            });
          }}
          onClose={() => setCustomizerOpen(false)}
        />
      )}

      <main>
        {/* ── HERO SECTION (Clean & Modern) ── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#001d4a] via-[#002b66] to-[#0a3977] text-white pt-10 pb-14 sm:pt-14 sm:pb-16 shadow-xl">
          {/* Background image overlay - clear, crisp and visible */}
          <div className="absolute inset-0 opacity-25 pointer-events-none">
            <img
              alt={page.title}
              className="h-full w-full object-cover"
              src={page.image}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1800&q=80";
              }}
            />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb Navigation: Home / [Page Title] */}
            <div className="flex items-center justify-between mb-5">
              <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[13px] text-slate-300/80 font-normal">
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
                <span className="text-slate-400 font-light">/</span>
                <span className="text-white font-medium">{page.title}</span>
              </nav>

              {isCmsAdmin && (
                <button
                  type="button"
                  onClick={() => navigate(`/cms/homepage?tab=detail-pages&page=${slug}`)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/40 bg-amber-400/20 px-3.5 py-1.5 text-xs font-bold text-amber-200 backdrop-blur-md transition-all hover:bg-amber-400 hover:text-slate-950 cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit in CMS</span>
                </button>
              )}
            </div>

            {/* Hero Main Content */}
            <div className="max-w-3xl space-y-2.5">
              <h1 className="font-fraunces text-3xl sm:text-4xl lg:text-[44px] font-bold tracking-tight text-white leading-tight">
                {page.title}
              </h1>
              <p className="text-sm sm:text-base text-slate-200/90 leading-relaxed font-normal max-w-xl">
                {page.subtitle}
              </p>

              {/* Action Buttons (Only when contextual/needed) */}
              {(isEmployerPortal || isContactPage) && (
                <div className="flex flex-wrap items-center gap-3 pt-3">
                  {isEmployerPortal ? (
                    <>
                      <button
                        type="button"
                        onClick={() => navigate("/employers/register")}
                        className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-red-500 cursor-pointer"
                      >
                        <Briefcase className="h-4 w-4" />
                        <span>Register as Employer</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/20 cursor-pointer"
                      >
                        <span>Employer Login</span>
                      </button>
                    </>
                  ) : (
                    <a
                      href="#inquiry-form"
                      className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-[#003580] shadow-lg transition-all hover:bg-slate-100 cursor-pointer"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Send Direct Message</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Metric Impact Strip */}
        {page.stats && page.stats.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-10 relative z-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xl">
              {page.stats.map((stat, idx) => (
                <div key={stat.id || idx} className="text-center p-2 border-r last:border-r-0 border-slate-100">
                  <p className="text-2xl sm:text-3xl font-black text-[#003366]">{stat.value}</p>
                  <p className="text-xs font-bold text-slate-800 mt-1">{stat.label}</p>
                  {stat.desc && <p className="text-[11px] text-slate-500 mt-0.5">{stat.desc}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── CONTENT SECTION ── */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          {/* 1. SPECIAL RICH GRID FOR ALUMNI STORIES */}
          {isStoriesPage ? (
            <div id="stories-feed-top" className="space-y-12">
              <div className="space-y-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-[#002b66]">
                      Featured Alumni Spotlights
                    </h2>
                    <p className="text-xs text-slate-500">
                      Real journeys of ASTU graduates excelling across industries worldwide.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#003580]">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    {alumniStories.length} Verified Stories
                  </span>
                </div>

                {/* 2-Column Responsive Card Grid (Comfortable Wideness - Not Too Wide, Not Crowded) */}
                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
                  {paginatedStories.map((story) => (
                    <article
                      key={story.id}
                      className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-[#003580]/40 hover:shadow-lg"
                    >
                      <div>
                        <div className="flex items-center gap-4 mb-4">
                          {story.image ? (
                            <img
                              src={story.image}
                              alt={story.name}
                              className="h-16 w-16 shrink-0 rounded-2xl object-cover border border-slate-100 shadow-xs"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/images/astu-building.jpg";
                              }}
                            />
                          ) : (
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#003580]/10 text-xl font-bold text-[#003580]">
                              {story.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="truncate text-base font-bold text-slate-900 group-hover:text-[#003580] transition-colors">
                                {story.name}
                              </h3>
                              {story.featured && (
                                <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200 shrink-0">
                                  <Sparkles className="h-3 w-3 text-amber-500" /> Featured
                                </span>
                              )}
                            </div>
                            <p className="line-clamp-1 text-xs font-semibold text-[#003580]">
                              {story.role}
                            </p>
                            {story.company && (
                              <p className="line-clamp-1 text-[11px] text-slate-400">
                                {story.company}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="mb-3 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                          {story.graduationYear && (
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                              {story.graduationYear}
                            </span>
                          )}
                          {story.department && (
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-600 truncate max-w-[220px]">
                              {story.department}
                            </span>
                          )}
                        </div>

                        <p className="text-xs leading-relaxed text-slate-600 line-clamp-2">
                          {story.text}
                        </p>
                      </div>

                      <div className="mt-5 border-t border-slate-100 pt-3.5">
                        <Link
                          to={`/stories/${story.id}`}
                          className="inline-flex items-center justify-between w-full rounded-xl bg-slate-50 px-4 py-2.5 text-xs font-bold text-[#003580] group-hover:bg-[#003580] group-hover:text-white transition-all shadow-2xs"
                        >
                          <span>Read Story</span>
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>

                {/* ── Alumni Stories Page Handler Pagination Bar ── */}
                {alumniStories.length > 0 && (
                  <div className="card-soft mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-xs">
                    {/* Left: Summary text */}
                    <div className="text-xs text-slate-500 font-medium text-center sm:text-left">
                      Showing{' '}
                      <span className="font-bold text-slate-900">{storyStartIndex + 1}</span>{' '}
                      to{' '}
                      <span className="font-bold text-slate-900">
                        {Math.min(storyStartIndex + storiesPageSize, alumniStories.length)}
                      </span>{' '}
                      of{' '}
                      <span className="font-bold text-slate-900">{alumniStories.length}</span>{' '}
                      Alumni Stories
                    </div>

                    {/* Middle: Page navigation pills */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setStoriesPage((prev) => Math.max(1, prev - 1));
                          const el = document.getElementById('stories-feed-top');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        disabled={storiesPage === 1}
                        className={`inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                          storiesPage === 1
                            ? 'opacity-40 cursor-not-allowed bg-slate-50 text-slate-400'
                            : 'bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                        title="Previous page"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Prev</span>
                      </button>

                      <div className="flex items-center gap-1">
                        {getPageNumbers(storiesPage, totalStoryPages).map((p, idx) => {
                          if (p === '...') {
                            return (
                              <span key={`story-ellipsis-${idx}`} className="px-2 text-xs text-slate-400">
                                ...
                              </span>
                            );
                          }
                          const pageNum = Number(p);
                          const isActive = pageNum === storiesPage;
                          return (
                            <button
                              key={`story-page-${pageNum}`}
                              type="button"
                              onClick={() => {
                                setStoriesPage(pageNum);
                                const el = document.getElementById('stories-feed-top');
                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                              }}
                              className={`h-8 w-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                isActive
                                  ? 'bg-[#003580] text-white shadow-xs'
                                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setStoriesPage((prev) => Math.min(totalStoryPages, prev + 1));
                          const el = document.getElementById('stories-feed-top');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        disabled={storiesPage === totalStoryPages}
                        className={`inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                          storiesPage === totalStoryPages
                            ? 'opacity-40 cursor-not-allowed bg-slate-50 text-slate-400'
                            : 'bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                        title="Next page"
                      >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Right: Items per page selector */}
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="text-[11px] font-medium hidden sm:inline">Per page:</span>
                      <select
                        value={storiesPageSize}
                        onChange={(e) => {
                          setStoriesPageSize(Number(e.target.value));
                          setStoriesPage(1);
                        }}
                        className="rounded-xl border border-slate-200 bg-slate-50/80 px-2.5 py-1 text-xs font-semibold text-slate-700 outline-none focus:border-[#003580] cursor-pointer"
                      >
                        <option value={4}>4</option>
                        <option value={6}>6</option>
                        <option value={8}>8</option>
                        <option value={12}>12</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* ── Connected Beyond Graduation Community & Testimonials Section ── */}
                <div className="pt-12 mt-12 border-t border-slate-200/90">
                  <div className="mb-8 text-center max-w-2xl mx-auto">
                    <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-[#C8102E] mb-2">
                      CONNECTED BEYOND GRADUATION
                    </span>
                    <h3 className="font-fraunces text-2xl sm:text-3xl font-bold text-[#003580] tracking-tight">
                      Voices of the ASTU Alumni Community
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      Discover how graduates and industry mentors stay engaged, support career development, and empower the next generation.
                    </p>
                  </div>

                  {/* 3 Compact Testimonial Cards in clean white editorial style */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                    {[
                      {
                        name: "Abebe Yosef",
                        role: "Software Engineer",
                        text: "I landed my new role after using ASTU-AMS job matching and mentorship support. The direct connection to senior alumni made all the difference.",
                        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
                      },
                      {
                        name: "Bekele Kebede",
                        role: "Employer Partner",
                        text: "Hiring from ASTU-AMS has been efficient. We found strong engineering candidates with the right practical foundation and problem-solving readiness.",
                        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
                      },
                      {
                        name: "Helina Sileshi",
                        role: "Mentor & Alumni",
                        text: "Proud to mentor ASTU students through the AMS platform. Giving back and guiding upcoming innovators is one of the most rewarding parts of being an alumnus.",
                        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs hover:shadow-md hover:border-[#003580]/40 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-3.5 mb-4">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-12 w-12 rounded-full object-cover border border-slate-200"
                            />
                            <div>
                              <h4 className="text-sm font-bold text-[#003580] leading-snug">
                                {item.name}
                              </h4>
                              <p className="text-[11px] font-semibold text-slate-500">
                                {item.role}
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed italic">
                            "{item.text}"
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Alumni Community Action CTAs */}
                  <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={() => navigate("/register")}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#C8102E] hover:bg-[#A60D26] text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
                    >
                      <Users className="h-4 w-4" />
                      <span>Join ASTU Alumni Network</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/info/community")}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-300 hover:border-[#003580] bg-white hover:bg-slate-50 text-[#003580] text-xs sm:text-sm font-bold shadow-2xs transition-all cursor-pointer"
                    >
                      <Globe className="h-4 w-4 text-[#003580]" />
                      <span>Explore Community</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : isOverviewPage ? (
            /* 2. DEDICATED INSTITUTIONAL OVERVIEW LAYOUT */
            <div className="space-y-12">
              {/* Executive Spotlight Card (Section 1) */}
              {page.sections.length > 0 && (
                <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-10 shadow-md">
                  <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
                    <div className={page.sections[0].image ? "lg:col-span-7" : "lg:col-span-12"}>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#003580] border border-blue-200/60 mb-3">
                        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                        {page.sections[0].badge || "Platform Foundation & Executive Summary"}
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        {page.sections[0].heading}
                      </h2>
                      <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-600 whitespace-pre-line">
                        {page.sections[0].body}
                      </p>

                      <div className="mt-6 flex flex-wrap items-center gap-3">
                        {page.sections[0].linkUrl ? (
                          <a
                            href={page.sections[0].linkUrl}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#003580] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#002b66] transition-all"
                          >
                            <span>{page.sections[0].linkText || "Learn More"}</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => navigate("/login")}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#003580] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#002b66] transition-all cursor-pointer"
                          >
                            <span>Access AMS Portal</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => navigate("/info/impact-numbers")}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                        >
                          <BarChart3 className="h-3.5 w-3.5 text-slate-500" />
                          <span>View Impact Metrics</span>
                        </button>
                      </div>
                    </div>

                    {page.sections[0].image && (
                      <div className="lg:col-span-5">
                        <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
                          <img
                            src={page.sections[0].image}
                            alt={page.sections[0].heading}
                            className="h-64 sm:h-80 w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/images/astu-building.jpg";
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Strategic Pillars & Capabilities Grid (Sections 2 to N) */}
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="text-xl font-black text-[#002b66]">Strategic Pillars & Capabilities</h3>
                    <p className="text-xs text-slate-500">
                      Core institutional mechanisms, system architecture, and accreditation mandates.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-400 mt-1 sm:mt-0">
                    {page.sections.length} Managed Sections
                  </span>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {page.sections.slice(1).map((section, idx) => {
                    const icons = [Compass, BookOpen, Layers, Cpu, Globe, Award, ShieldCheck, Users, Briefcase];
                    const SectionIcon = icons[idx % icons.length];
                    return (
                      <article
                        key={section.id || section.heading + idx}
                        className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-7 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-[#003580]/40 hover:shadow-lg"
                      >
                        <div>
                          {section.image && (
                            <div className="mb-4 overflow-hidden rounded-xl border border-slate-100">
                              <img src={section.image} alt={section.heading} className="h-36 w-full object-cover" />
                            </div>
                          )}

                          <div className="flex items-center justify-between mb-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#003580] ring-1 ring-blue-500/10 group-hover:bg-[#003580] group-hover:text-white transition-colors">
                              <SectionIcon className="h-5 w-5" />
                            </div>
                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                              {section.badge || `Pillar ${idx + 2}`}
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-slate-900 group-hover:text-[#003580] transition-colors">
                            {section.heading}
                          </h4>
                          <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-slate-600 whitespace-pre-line">
                            {section.body}
                          </p>
                        </div>

                        <div className="mt-6 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                          {section.linkUrl ? (
                            <a
                              href={section.linkUrl}
                              className="inline-flex items-center gap-1 font-bold text-[#003580] hover:underline"
                            >
                              <span>{section.linkText || "View Details"}</span>
                              <ChevronRight className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="font-semibold text-slate-400 text-[11px]">
                              Section {idx + 2}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-600 text-[11px]">
                            <span>Verified</span>
                            <CheckCircle2 className="h-3 w-3" />
                          </span>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>

              {/* ASTU Metrics Strip */}
              <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                {[
                  { value: metrics.registeredAlumniFormatted, label: "Registered Alumni", desc: "Active network members" },
                  { value: String(metrics.fieldsOfStudy), label: "Fields of Study", desc: "Applied Sciences & Tech" },
                  { value: metrics.corporatePartnersFormatted, label: "Partner Companies", desc: "Hiring & research links" },
                  { value: metrics.employmentRateFormatted, label: "Employment Tracked", desc: "Longitudinal survey data" },
                ].map((stat, i) => (
                  <div key={i} className="rounded-2xl border border-slate-200/80 bg-white p-5 text-center shadow-xs">
                    <p className="text-2xl sm:text-3xl font-black text-[#003580]">{stat.value}</p>
                    <p className="text-xs font-bold text-slate-800 mt-1">{stat.label}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{stat.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : isContactPage ? (
            /* 3. DEDICATED INSTITUTIONAL CONTACT DIRECTORY LAYOUT */
            <div className="space-y-12">
              <div className="grid gap-8 lg:grid-cols-12">
                {/* Left Column: Official Contact Channels */}
                <div className="lg:col-span-7 space-y-6">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-[#002b66]">
                      Institutional Contact Directory
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Direct contact points for the ASTU Alumni Relations Directorate, Industry Liaison, and Registrar.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {page.sections.map((sec, idx) => {
                      const headingLower = sec.heading.toLowerCase();
                      let Icon = Building2;
                      let actionText = "";
                      let actionHref = "";

                      if (headingLower.includes("address") || headingLower.includes("campus") || headingLower.includes("location")) {
                        Icon = MapPin;
                        actionText = "Open in Maps";
                        actionHref = "https://maps.google.com/?q=Adama+Science+and+Technology+University";
                      } else if (headingLower.includes("phone") || headingLower.includes("call")) {
                        Icon = Phone;
                        actionText = "Call Hotline";
                        actionHref = "tel:+251221110000";
                      } else if (headingLower.includes("email") || headingLower.includes("mail")) {
                        Icon = Mail;
                        actionText = "Send Email";
                        actionHref = "mailto:irccd@astu.edu.et";
                      } else if (headingLower.includes("hour")) {
                        Icon = Clock;
                      } else if (headingLower.includes("social") || headingLower.includes("telegram")) {
                        Icon = Globe;
                        actionText = "Join Telegram";
                        actionHref = "https://t.me/Adama_STU_Almuni";
                      }

                      return (
                        <div
                          key={sec.id || idx}
                          className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col justify-between hover:border-[#003580]/30 transition-all"
                        >
                          <div>
                            <div className="flex items-center gap-3 mb-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#003580]">
                                <Icon className="h-5 w-5" />
                              </div>
                              <div>
                                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                  {sec.heading}
                                </h3>
                                {sec.badge && (
                                  <span className="text-[10px] text-slate-400 font-semibold">{sec.badge}</span>
                                )}
                              </div>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-600 whitespace-pre-line leading-relaxed">
                              {sec.body}
                            </p>
                          </div>

                          {(sec.linkUrl || actionHref) && (
                            <div className="mt-4 pt-3 border-t border-slate-100">
                              <a
                                href={sec.linkUrl || actionHref}
                                target={actionHref.startsWith("http") ? "_blank" : undefined}
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#003580] hover:underline"
                              >
                                <span>{sec.linkText || actionText || "Open"}</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Column: Interactive Direct Message Form */}
                <div id="inquiry-form" className="lg:col-span-5">
                  <div className="rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-8 shadow-md">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                        <MessageSquare className="h-4 w-4" />
                      </div>
                      <h3 className="text-lg font-black text-slate-900">Send an Official Inquiry</h3>
                    </div>
                    <p className="text-xs text-slate-500 mb-6">
                      Have a query about transcripts, employer partnerships, or alumni chapters? Submit your request directly.
                    </p>

                    {inquirySent ? (
                      <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center space-y-3">
                        <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
                        <h4 className="text-sm font-bold text-emerald-900">Inquiry Dispatched Successfully</h4>
                        <p className="text-xs text-emerald-700">
                          Thank you for contacting ASTU. Your message has been routed to the respective institutional department.
                        </p>
                        <button
                          type="button"
                          onClick={() => setInquirySent(false)}
                          className="mt-2 text-xs font-bold text-emerald-800 underline cursor-pointer"
                        >
                          Send another inquiry
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleInquirySubmit} className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-slate-700">Full Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Dr. Abebe Bikila"
                            value={inquiryForm.name}
                            onChange={(e) => setInquiryForm((prev) => ({ ...prev, name: e.target.value }))}
                            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003580]/20"
                          />
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <label className="text-xs font-bold text-slate-700">Email Address *</label>
                            <input
                              type="email"
                              required
                              placeholder="name@example.com"
                              value={inquiryForm.email}
                              onChange={(e) => setInquiryForm((prev) => ({ ...prev, email: e.target.value }))}
                              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003580]/20"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-700">Phone (Optional)</label>
                            <input
                              type="tel"
                              placeholder="+251-9..."
                              value={inquiryForm.phone}
                              onChange={(e) => setInquiryForm((prev) => ({ ...prev, phone: e.target.value }))}
                              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003580]/20"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700">Stakeholder Role</label>
                          <select
                            value={inquiryForm.category}
                            onChange={(e) => setInquiryForm((prev) => ({ ...prev, category: e.target.value }))}
                            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003580]/20"
                          >
                            <option value="Alumni">ASTU Alum / Graduate</option>
                            <option value="Employer">Corporate Employer / Recruiter</option>
                            <option value="Student">Current Student</option>
                            <option value="Faculty">Faculty / Researcher</option>
                            <option value="General">General Inquirer</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700">Subject</label>
                          <input
                            type="text"
                            placeholder="e.g. Tracer survey clarification or transcript verification"
                            value={inquiryForm.subject}
                            onChange={(e) => setInquiryForm((prev) => ({ ...prev, subject: e.target.value }))}
                            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003580]/20"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700">Your Message *</label>
                          <textarea
                            required
                            rows={3}
                            placeholder="Type your detailed inquiry or feedback here..."
                            value={inquiryForm.message}
                            onChange={(e) => setInquiryForm((prev) => ({ ...prev, message: e.target.value }))}
                            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003580]/20 resize-none"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmittingInquiry}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#003580] hover:bg-[#002255] text-white py-3 text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-60"
                        >
                          <Send className="h-3.5 w-3.5" />
                          <span>{isSubmittingInquiry ? "Sending Inquiry..." : "Submit Inquiry to Directorate"}</span>
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : isFeaturedEmployers ? (
            /* 4. FEATURED EMPLOYERS SPECIALIZED LAYOUT */
            <div className="space-y-12">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
                <div>
                  <h2 className="text-2xl font-black text-[#003366]">Verified Partner Organizations</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Leading enterprise companies actively hiring, hosting internships, and collaborating with ASTU.
                  </p>
                </div>

                {/* Search Input */}
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by company, sector, location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs font-medium text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#003366]/20"
                  />
                </div>
              </div>

              {/* Industry Filter Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-400 mr-1">Industry:</span>
                {["All", "Telecom", "Aviation", "Cybersecurity", "ICT", "Fintech", "Research"].map((ind) => (
                  <button
                    key={ind}
                    type="button"
                    onClick={() => setSelectedIndustry(ind)}
                    className={`rounded-xl px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                      selectedIndustry === ind
                        ? "bg-[#003366] text-white shadow-sm"
                        : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    {ind}
                  </button>
                ))}
              </div>

              {/* Employers Grid */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {partnersList
                  .filter((p) => p.active !== false)
                  .filter((p) => {
                    const matchesSearch =
                      !searchQuery ||
                      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (p.industry && p.industry.toLowerCase().includes(searchQuery.toLowerCase())) ||
                      (p.location && p.location.toLowerCase().includes(searchQuery.toLowerCase()));

                    const matchesIndustry =
                      selectedIndustry === "All" ||
                      (p.industry && p.industry.toLowerCase().includes(selectedIndustry.toLowerCase())) ||
                      (p.partnershipType && p.partnershipType.toLowerCase().includes(selectedIndustry.toLowerCase()));

                    return matchesSearch && matchesIndustry;
                  })
                  .map((company) => {
                    const LogoComponent = partnerLogos[company.name];
                    return (
                      <article
                        key={company.id}
                        className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-7 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-[#003366]/40 hover:shadow-xl"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-4 mb-5">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 p-2 shadow-xs group-hover:scale-105 transition-transform">
                              {company.logo ? (
                                <img src={company.logo} alt={company.name} className="h-full w-full object-contain" />
                              ) : LogoComponent ? (
                                <LogoComponent className="h-10 w-10" />
                              ) : (
                                <Building2 className="h-7 w-7 text-[#003366]" />
                              )}
                            </div>

                            <div className="flex flex-col items-end gap-1.5">
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                                <ShieldCheck className="h-3 w-3 text-emerald-600" />
                                Verified
                              </span>
                              {company.featured && (
                                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                                  ⭐ Top Partner
                                </span>
                              )}
                            </div>
                          </div>

                          <h3 className="text-base font-black text-slate-900 group-hover:text-[#003366] transition-colors">
                            {company.name}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1">{company.industry || "Technology & Engineering"}</p>

                          <div className="mt-4 flex items-center gap-2 rounded-xl bg-blue-50/60 p-2.5 text-xs font-bold text-[#003366]">
                            <Briefcase className="h-3.5 w-3.5 text-[#003366]" />
                            <span>{company.openings || "Active Trainee Roles"}</span>
                          </div>

                          <p className="mt-3 text-xs leading-relaxed text-slate-600 line-clamp-3">
                            {company.description ||
                              `${company.name} collaborates with ASTU through verified graduate employment tracks and student internships.`}
                          </p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                          <button
                            type="button"
                            onClick={() => setSelectedCompanyModal(company)}
                            className="font-bold text-[#003366] hover:underline cursor-pointer inline-flex items-center gap-1"
                          >
                            <span>Company Profile</span>
                            <ChevronRight className="h-3 w-3" />
                          </button>

                          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{company.location || "Ethiopia"}</span>
                          </span>
                        </div>
                      </article>
                    );
                  })}
              </div>

              {/* Strategic Recruitment Pillars (Managed Sections) */}
              <div className="space-y-6 pt-6">
                <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-[#003366]">Recruitment Framework & Institutional Pillars</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Strategic mechanisms enabling longitudinal career tracking and verified employer placement.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-400">
                    {page.sections.length} Verified Modules
                  </span>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {page.sections.map((sec, idx) => (
                    <div
                      key={sec.id || idx}
                      className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col justify-between hover:border-[#003366]/30 transition-all"
                    >
                      <div>
                        <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-[#003366]">
                          {sec.badge || `Pillar ${idx + 1}`}
                        </span>
                        <h4 className="text-base font-bold text-slate-900 mt-3">{sec.heading}</h4>
                        <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">{sec.body}</p>
                      </div>

                      <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-400 text-[11px]">Track {idx + 1}</span>
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Accredited</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQs Accordion */}
              {page.faqs && page.faqs.length > 0 && (
                <div className="space-y-4 pt-6">
                  <h3 className="text-xl font-black text-[#003366]">Frequently Asked Questions</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {page.faqs.map((faq, idx) => (
                      <div key={faq.id || idx} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                          <HelpCircle className="h-4 w-4 text-[#003366] shrink-0" />
                          <span>{faq.question}</span>
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed pl-6">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Corporate CTA */}
              <div className="rounded-3xl border border-slate-200/90 bg-gradient-to-r from-slate-900 via-[#002244] to-[#003366] p-8 sm:p-12 text-white shadow-xl flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                <div className="max-w-xl">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-amber-300">
                    Institutional Partnership
                  </span>
                  <h3 className="mt-3 text-2xl sm:text-3xl font-black tracking-tight">
                    Accelerate Your Enterprise Talent Pipeline
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Connect with verified ASTU alumni, publish job openings, participate in campus interview suites, and
                    guide curriculum revisions.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => navigate('/employers/register')}
                    className="rounded-xl bg-red-600 px-6 py-3 text-xs font-bold text-white hover:bg-red-500 shadow-md transition-all cursor-pointer"
                  >
                    Register as Corporate Partner
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/partners')}
                    className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-xs font-bold text-white hover:bg-white/20 transition-all cursor-pointer"
                  >
                    Explore Partner Hub
                  </button>
                </div>
              </div>
            </div>
          ) : isStakeholders ? (
            /* 5. STAKEHOLDERS & INDUSTRY COLLABORATORS LAYOUT */
            <div className="space-y-12">
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-2xl font-black text-[#003366]">Strategic Alliances & Industry Consortia</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Active cooperation frameworks with government agencies, multinational tech enterprises, and international research organizations.
                </p>
              </div>

              {/* Strategic Collaborators Grid */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {partnersList
                  .filter((p) => p.active !== false)
                  .map((company) => {
                    const LogoComponent = partnerLogos[company.name];
                    return (
                      <div
                        key={company.id}
                        className="rounded-3xl border border-slate-200/90 bg-white p-7 shadow-xs flex flex-col justify-between hover:border-[#003366]/40 hover:shadow-lg transition-all"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-3 mb-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 p-1.5">
                              {company.logo ? (
                                <img src={company.logo} alt={company.name} className="h-full w-full object-contain" />
                              ) : LogoComponent ? (
                                <LogoComponent className="h-8 w-8" />
                              ) : (
                                <Building2 className="h-6 w-6 text-[#003366]" />
                              )}
                            </div>
                            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-[#003366]">
                              {company.partnershipType || "Strategic Alliance"}
                            </span>
                          </div>

                          <h3 className="text-base font-black text-slate-900">{company.name}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">{company.industry}</p>
                          <p className="mt-3 text-xs leading-relaxed text-slate-600 line-clamp-3">
                            {company.description ||
                              `${company.name} collaborates with ASTU on applied research projects, faculty development, and graduate placement.`}
                          </p>
                        </div>

                        <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                          <button
                            type="button"
                            onClick={() => setSelectedCompanyModal(company)}
                            className="font-bold text-[#003366] hover:underline cursor-pointer"
                          >
                            Alliance Details →
                          </button>
                          <span className="text-[11px] text-slate-400">{company.location || "Ethiopia"}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Stakeholder Pillars */}
              <div className="space-y-6 pt-6">
                <div className="border-b border-slate-200 pb-3">
                  <h3 className="text-xl font-black text-[#003366]">Institutional Cooperation Pillars</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Curriculum advisory boards, joint applied laboratories, and international grants.
                  </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  {page.sections.map((sec, idx) => (
                    <div
                      key={sec.id || idx}
                      className="rounded-2xl border border-slate-200/90 bg-white p-6 space-y-2.5"
                    >
                      <span className="rounded-md bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-[#003366]">
                        {sec.badge || `Alliance Track ${idx + 1}`}
                      </span>
                      <h4 className="text-base font-bold text-slate-900">{sec.heading}</h4>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{sec.body}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQs */}
              {page.faqs && page.faqs.length > 0 && (
                <div className="space-y-4 pt-6">
                  <h3 className="text-xl font-black text-[#003366]">Stakeholder & Partnership FAQs</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {page.faqs.map((faq, idx) => (
                      <div key={faq.id || idx} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                          <HelpCircle className="h-4 w-4 text-[#003366] shrink-0" />
                          <span>{faq.question}</span>
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed pl-6">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* 4. MODERN PROFESSIONAL SECTIONS GRID FOR ALL OTHER 20+ DETAIL PAGES */
            <div className="space-y-12">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {page.sections.map((section, index) => {
                  const icons = [
                    BookOpen,
                    Users,
                    Briefcase,
                    PlayCircle,
                    Lightbulb,
                    Globe,
                    ShieldCheck,
                    Star,
                    Handshake,
                    MapPin,
                    Phone,
                    Mail,
                    Award,
                    CalendarDays,
                    Trophy,
                  ];
                  const SectionIcon = icons[index % icons.length];
                  return (
                    <article
                      key={section.id || section.heading + index}
                      className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-7 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-[#003580]/40 hover:shadow-lg hover:shadow-slate-200/60"
                    >
                      <div>
                        {section.image && (
                          <div className="mb-4 overflow-hidden rounded-xl border border-slate-100">
                            <img src={section.image} alt={section.heading} className="h-36 w-full object-cover" />
                          </div>
                        )}

                        <div className="mb-5 flex items-center justify-between">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#003580] ring-1 ring-blue-500/10 group-hover:bg-[#003580] group-hover:text-white transition-colors duration-200">
                            <SectionIcon className="h-6 w-6" />
                          </div>
                          {section.badge && (
                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                              {section.badge}
                            </span>
                          )}
                        </div>

                        <h2 className="text-lg font-bold text-slate-900 group-hover:text-[#003580] transition-colors">
                          {section.heading}
                        </h2>
                        <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-600 whitespace-pre-line">
                          {section.body}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                        {section.linkUrl ? (
                          <a
                            href={section.linkUrl}
                            className="inline-flex items-center gap-1 font-bold text-[#003580] hover:underline"
                          >
                            <span>{section.linkText || "View Portal"}</span>
                            <ChevronRight className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="font-semibold text-slate-400">Section {index + 1}</span>
                        )}
                        <span className="inline-flex items-center gap-1 font-bold text-[#003580] opacity-0 group-hover:opacity-100 transition-opacity">
                          <span>Verified</span>
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Quick Institutional Action Banner */}
              <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-r from-slate-900 to-[#002b66] p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div>
                  <h3 className="text-xl font-black text-white">Need Further Institutional Assistance?</h3>
                  <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-xl">
                    Reach the ASTU Industry Relations, Quality Assurance Directorate, or Registrar Office directly through our verified digital channels.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => navigate("/partners")}
                    className="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-500 transition-all cursor-pointer shadow-md"
                  >
                    Partner Office
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/info/contact")}
                    className="rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition-all cursor-pointer"
                  >
                    Contact Directory
                  </button>
                </div>
              </div>

              {/* ── Institutional Topic Page Handler Bar ── */}
              {currentTopicIndex >= 0 && (
                <nav
                  aria-label="Institutional Topic Navigation"
                  className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 mt-6"
                >
                  {/* Previous Topic */}
                  {prevTopic ? (
                    <Link
                      to={`/info/${prevTopic.slug}`}
                      className="group flex items-center gap-3 text-left w-full sm:w-auto p-2 rounded-xl hover:bg-slate-50 transition-colors"
                      title="Previous topic (or press ← ArrowLeft)"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 group-hover:border-[#003580] group-hover:bg-[#003580] group-hover:text-white transition-all shadow-xs">
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-[#003580]">
                          Previous Topic
                        </span>
                        <span className="block text-xs sm:text-sm font-bold text-slate-800 truncate max-w-[200px]">
                          {prevTopic.title}
                        </span>
                      </div>
                    </Link>
                  ) : (
                    <div className="hidden sm:block w-36" />
                  )}

                  {/* Topic Counter & Index */}
                  <div className="flex flex-col items-center justify-center text-center px-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Topic {currentTopicIndex + 1} of {publicInfoTopics.length}
                    </span>
                    <Link
                      to="/info/overview"
                      className="text-xs font-semibold text-[#003580] hover:underline mt-0.5"
                    >
                      All Topics
                    </Link>
                  </div>

                  {/* Next Topic */}
                  {nextTopic ? (
                    <Link
                      to={`/info/${nextTopic.slug}`}
                      className="group flex items-center justify-end gap-3 text-right w-full sm:w-auto p-2 rounded-xl hover:bg-slate-50 transition-colors"
                      title="Next topic (or press → ArrowRight)"
                    >
                      <div className="min-w-0">
                        <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-[#003580]">
                          Next Topic
                        </span>
                        <span className="block text-xs sm:text-sm font-bold text-slate-800 truncate max-w-[200px]">
                          {nextTopic.title}
                        </span>
                      </div>
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 group-hover:border-[#003580] group-hover:bg-[#003580] group-hover:text-white transition-all shadow-xs">
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </Link>
                  ) : (
                    <div className="hidden sm:block w-36" />
                  )}
                </nav>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Selected Company Modal */}
      <CompanyDetailModal
        company={selectedCompanyModal}
        partners={partnersList}
        onSelectCompany={(company) => setSelectedCompanyModal(company)}
        onClose={() => setSelectedCompanyModal(null)}
      />
    </div>
  );
}