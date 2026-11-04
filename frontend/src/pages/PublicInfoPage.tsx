import React, { useEffect, useMemo, useState } from "react";
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
  Quote,
  X,
  Filter,
} from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import homepageCmsService, {
  HomepageCmsConfig,
  Partner,
} from "../features/admin/services/homepageCms.service";
import { defaultDetailPages, DetailPageItem } from "../features/admin/services/detailPages.data";
import storiesService, { AlumniStory } from "../features/admin/services/stories.service";
import PaginationBar from '../components/PaginationBar';
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
  const [storyPage, setStoryPage] = useState(0);
  const [partnersList, setPartnersList] = useState<Partner[]>(() => {
    const s = homepageCmsService.getSettings();
    return Array.isArray(s?.partners) ? s.partners.filter((p) => p.active !== false) : [];
  });

  // CMS Live Customizer and Modal states
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [selectedCompanyModal, setSelectedCompanyModal] = useState<Partner | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All");

  // Stories search, category filter, and submission modal states
  const [storiesSearch, setStoriesSearch] = useState("");
  const [storiesCategory, setStoriesCategory] = useState("All");
  const [shareStoryModalOpen, setShareStoryModalOpen] = useState(false);
  const [shareStoryForm, setShareStoryForm] = useState({
    name: "",
    email: "",
    graduationYear: "",
    department: "",
    role: "",
    company: "",
    text: "",
  });
  const [isSubmittingStory, setIsSubmittingStory] = useState(false);

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
  }, [navigate, slug]);

  useEffect(() => {
    setStoryPage(0);
  }, [alumniStories.length]);

  useEffect(() => {
    setStoryPage((prev) => Math.min(prev, Math.max(0, Math.ceil(alumniStories.length / 6) - 1 || 0)));
  }, [alumniStories.length]);

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
      .replace(/94%/g, metrics.employmentRateFormatted)
      .replace(/6,000\+/g, metrics.digitalRequestsFormatted)
      .replace(/24,000\+/g, metrics.registeredAlumniFormatted)
      .replace(/12\+/g, String(metrics.fieldsOfStudy || '—'));
  };

  const liveStats = (basePage.stats || []).map((stat) => {
    const lower = `${stat.label || ''} ${stat.id || ''}`.toLowerCase();
    if (lower.includes('alumni') || lower.includes('candidate') || lower.includes('verified')) {
      return { ...stat, value: metrics.registeredAlumniFormatted };
    }
    if (lower.includes('partner') || lower.includes('enterprise') || lower.includes('allies') || lower.includes('companies')) {
      return { ...stat, value: metrics.corporatePartnersFormatted };
    }
    if (lower.includes('employment') || lower.includes('placement') || lower.includes('rate')) {
      return { ...stat, value: metrics.employmentRateFormatted };
    }
    if (lower.includes('job') || lower.includes('opening')) {
      return { ...stat, value: metrics.activeJobsFormatted };
    }
    if (lower.includes('field') || lower.includes('lab') || lower.includes('department')) {
      return { ...stat, value: String(metrics.fieldsOfStudy || '—') };
    }
    if (lower.includes('request') || lower.includes('digital')) {
      return { ...stat, value: metrics.digitalRequestsFormatted };
    }
    return { ...stat, value: liveReplacer(stat.value) };
  });

  const page: DetailPageItem = {
    ...basePage,
    title: liveReplacer(basePage.title),
    subtitle: liveReplacer(basePage.subtitle),
    stats: liveStats,
    sections: basePage.sections.map((s: any) => ({
      ...s,
      heading: liveReplacer(s.heading),
      body: liveReplacer(s.body),
    })),
  };

  const IconComponent =
    (page.iconName && iconMap[page.iconName]) || iconMap[rawDefaultPage.iconName || ""] || Trophy;

  const isStoriesPage = slug === "alumni-stories";
  const STORY_PAGE_SIZE = 6;

  const filteredAlumniStories = useMemo(() => {
    return alumniStories.filter((s) => {
      const q = storiesSearch.trim().toLowerCase();
      const matchSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        (s.company && s.company.toLowerCase().includes(q)) ||
        s.role.toLowerCase().includes(q) ||
        (s.department && s.department.toLowerCase().includes(q)) ||
        s.text.toLowerCase().includes(q);

      const combinedText = `${s.role} ${s.department || ""} ${s.company || ""} ${s.text}`.toLowerCase();
      const matchCat =
        storiesCategory === "All" ||
        (storiesCategory === "AI & Computing" &&
          (combinedText.includes("ai") ||
            combinedText.includes("computer") ||
            combinedText.includes("software") ||
            combinedText.includes("machine learning"))) ||
        (storiesCategory === "Clean Energy & Power" &&
          (combinedText.includes("energy") ||
            combinedText.includes("power") ||
            combinedText.includes("electrical") ||
            combinedText.includes("greengrid"))) ||
        (storiesCategory === "Telecom & Cloud" &&
          (combinedText.includes("cloud") ||
            combinedText.includes("telecom") ||
            combinedText.includes("network"))) ||
        (storiesCategory === "Research & Leadership" &&
          (combinedText.includes("research") ||
            combinedText.includes("scientist") ||
            combinedText.includes("director") ||
            combinedText.includes("leader") ||
            combinedText.includes("delegate")));

      return matchSearch && matchCat;
    });
  }, [alumniStories, storiesSearch, storiesCategory]);

  const storyTotalPages = filteredAlumniStories.length ? Math.ceil(filteredAlumniStories.length / STORY_PAGE_SIZE) : 1;
  const safeStoryPage = Math.min(storyPage, Math.max(0, storyTotalPages - 1));
  const pagedStories = filteredAlumniStories.slice(safeStoryPage * STORY_PAGE_SIZE, safeStoryPage * STORY_PAGE_SIZE + STORY_PAGE_SIZE);

  const handleShareStorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareStoryForm.name || !shareStoryForm.email || !shareStoryForm.text) {
      toast.error("Please provide your name, email, and your success story.");
      return;
    }
    setIsSubmittingStory(true);
    setTimeout(() => {
      setIsSubmittingStory(false);
      setShareStoryModalOpen(false);
      toast.success("Thank you! Your success story has been submitted for review by the ASTU Alumni Office.");
      setShareStoryForm({
        name: "",
        email: "",
        graduationYear: "",
        department: "",
        role: "",
        company: "",
        text: "",
      });
    }, 600);
  };
  const isEmployerPortal = slug === "employer-portal";
  const isFeaturedEmployers = slug === "featured-employers";
  const isStakeholders = slug === "stakeholders";
  const isOverviewPage = slug === "overview";
  const isContactPage = slug === "contact";

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

  return (
    <div className="flex min-h-screen flex-col bg-background text-on-surface dark:bg-slate-950 dark:text-slate-100 selection:bg-astu-navy selection:text-white">
      <Navbar />

      {/* Floating CMS Edit & Live Customizer Trigger for Admins */}
      {isCmsAdmin && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col sm:flex-row items-end sm:items-center gap-2">
          <button
            type="button"
            onClick={() => setCustomizerOpen(!customizerOpen)}
            className="inline-flex items-center gap-2 rounded-full bg-astu-navy hover:bg-astu-navy text-white px-5 py-3 text-xs font-bold shadow-2xl transition-all cursor-pointer ring-4 ring-amber-400/30 hover:scale-105"
            title="Open Live Preview CMS customizer sidebar"
          >
            <Sparkles className="h-4 w-4 text-astu-green" />
            <span>{customizerOpen ? "Close Customizer" : "Customize Page (Live Preview)"}</span>
          </button>
          <button
            type="button"
            onClick={() => navigate(`/cms/partners`)}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/95 px-4 py-2.5 text-xs font-bold text-slate-800 shadow-xl backdrop-blur-md hover:bg-slate-100 transition-all cursor-pointer"
            title="Open Full CMS Studio"
          >
            <Edit3 className="h-3.5 w-3.5 text-astu-navy" />
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
        {/* ── HERO SECTION ── */}
        <section className={`relative overflow-hidden text-white ${isStoriesPage ? '' : 'bg-gradient-to-br from-astu-navy via-primary-container to-astu-navy'}`}>
          {/* Hero background */}
          {isStoriesPage ? (
            <div className="absolute inset-0">
              <img
                alt={page.title}
                className="h-full w-full object-cover object-center scale-105 transition-transform duration-[7000ms] ease-out hover:scale-100"
                src={
                  !page.image || page.image.includes("unsplash.com")
                    ? "/images/astu-building.jpg"
                    : page.image
                }
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/images/astu-building.jpg";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/92 via-astu-navy/85 to-slate-950/90 backdrop-blur-[1px]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400/10 via-transparent to-transparent" />
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-astu-navy via-astu-red to-astu-green" />
            </div>
          ) : (
            <div className="absolute inset-0 opacity-20 mix-blend-overlay">
              <img
                alt={page.title}
                className="h-full w-full object-cover"
                src={page.image}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "/images/astu-building.jpg";
                }}
              />
            </div>
          )}

          {/* Clean grid pattern */}
          <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:4rem_4rem]" />

          <div className="relative mx-auto max-w-7xl px-4 pt-12 pb-16 sm:px-6 lg:px-8 lg:pt-16 lg:pb-24">
            {/* Top Navigation Row */}
            <div className="flex items-center justify-between mb-8">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-md transition-all hover:bg-white/20 hover:text-white cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Home</span>
              </button>

              <div className="flex items-center gap-3">
                {isCmsAdmin && (
                  <button
                    type="button"
                    onClick={() => navigate(`/cms/homepage?tab=detail-pages&page=${slug}`)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/40 bg-amber-400/20 px-3.5 py-1.5 text-xs font-bold text-amber-200 backdrop-blur-md transition-all hover:bg-amber-400 hover:text-slate-950 cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Edit Page in CMS</span>
                  </button>
                )}

                <div className="hidden sm:flex items-center gap-2 text-xs text-white/70">
                  <span>Institutional Portal</span>
                  <ChevronRight className="h-3 w-3" />
                  <span className="font-semibold text-white capitalize">{slug.replace(/-/g, " ")}</span>
                </div>
              </div>
            </div>

            {/* Hero Main Content */}
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-4 inline-flex items-center gap-2.5 rounded-xl border border-white/15 bg-white/10 p-2.5 backdrop-blur-md">
                  <IconComponent className="h-5 w-5 text-astu-green" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-astu-green">
                    {page.badge || "ASTU Institutional Resource"}
                  </span>
                </div>
                <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                  {page.title}
                </h1>
                <p className="mt-4 text-sm leading-relaxed text-slate-200/95 sm:text-base sm:leading-7 max-w-2xl">
                  {page.subtitle}
                </p>

                {isStoriesPage && (
                  <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-200">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 backdrop-blur-sm border border-white/15">
                      <GraduationCap className="h-4 w-4 text-amber-400" />
                      1,238+ Registered Alumni
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 backdrop-blur-sm border border-white/15">
                      <Trophy className="h-4 w-4 text-astu-green" />
                      87% Graduate Placement
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 backdrop-blur-sm border border-white/15">
                      <Globe className="h-4 w-4 text-sky-400" />
                      Global Alumni Network
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                {isEmployerPortal ? (
                  <>
                    <button
                      type="button"
                      onClick={() => navigate("/employers/register")}
                      className="inline-flex items-center gap-2 rounded-xl bg-astu-green px-5 py-3 text-sm font-bold text-white shadow-lg transition-all hover:brightness-110 hover:scale-105 cursor-pointer"
                    >
                      <Briefcase className="h-4 w-4" />
                      <span>Register as Employer</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/login")}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/20 cursor-pointer"
                    >
                      <span>Employer Login</span>
                    </button>
                  </>
                ) : isContactPage ? (
                  <>
                    <a
                      href="#inquiry-form"
                      className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-astu-navy shadow-lg transition-all hover:bg-slate-100 hover:scale-105 cursor-pointer"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Send Direct Message</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => navigate("/partners")}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20 cursor-pointer"
                    >
                      <span>View Partners</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : isStoriesPage ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setShareStoryModalOpen(true)}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-astu-red to-rose-600 px-5 py-3 text-sm font-bold text-white shadow-lg transition-all hover:brightness-110 hover:scale-105 cursor-pointer"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Share Your Story</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/login")}
                      className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-astu-navy shadow-lg transition-all hover:bg-slate-100 hover:scale-105 cursor-pointer"
                    >
                      <GraduationCap className="h-4 w-4" />
                      <span>Portal Login</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/partners")}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20 cursor-pointer"
                    >
                      <span>View Partners</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => navigate("/login")}
                      className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-astu-navy shadow-lg transition-all hover:bg-slate-100 hover:scale-105 cursor-pointer"
                    >
                      <GraduationCap className="h-4 w-4" />
                      <span>Portal Login</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/partners")}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20 cursor-pointer"
                    >
                      <span>View Partners</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Metric Impact Strip */}
        {page.stats && page.stats.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-10 relative z-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xl">
              {page.stats.map((stat, idx) => (
                <div key={stat.id || idx} className="text-center p-2 border-r last:border-r-0 border-slate-100">
                  <p className="text-2xl sm:text-3xl font-black text-astu-navy">{stat.value}</p>
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
            <div className="space-y-10">
              {/* Controls: Search, Category Filters, and Stats */}
              <div className="rounded-3xl border border-slate-200/90 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-astu-navy/10 dark:bg-sky-500/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-astu-navy dark:text-sky-300">
                        ASTU Alumni Directory
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-astu-green">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Verified Achievements
                      </span>
                    </div>
                    <h2 className="mt-1 text-2xl font-black tracking-tight text-astu-navy dark:text-white">
                      Featured Alumni Spotlights
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Real journeys of ASTU graduates excelling across industries worldwide.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShareStoryModalOpen(true)}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-astu-navy to-[#1a4f8a] px-4 py-2 text-xs font-bold text-white shadow-sm hover:brightness-110 transition-all cursor-pointer"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                      <span>Submit Your Story</span>
                    </button>
                    <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                      <Trophy className="h-3.5 w-3.5 text-amber-500" />
                      {filteredAlumniStories.length} {filteredAlumniStories.length === 1 ? 'Story' : 'Stories'}
                    </span>
                  </div>
                </div>

                {/* Search Bar & Categories */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={storiesSearch}
                      onChange={(e) => {
                        setStoriesSearch(e.target.value);
                        setStoryPage(0);
                      }}
                      placeholder="Search by alumni name, company, role, or major..."
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-2.5 pl-10 pr-9 text-xs font-medium text-slate-800 dark:text-slate-200 outline-none focus:border-astu-navy focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-astu-navy/10 transition-all"
                    />
                    {storiesSearch && (
                      <button
                        type="button"
                        onClick={() => {
                          setStoriesSearch("");
                          setStoryPage(0);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Filter Pills */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { id: "All", label: "All Stories" },
                      { id: "AI & Computing", label: "AI & Computing" },
                      { id: "Clean Energy & Power", label: "Clean Energy & Power" },
                      { id: "Telecom & Cloud", label: "Telecom & Cloud" },
                      { id: "Research & Leadership", label: "Research & Leadership" },
                    ].map((cat) => {
                      const isActive = storiesCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setStoriesCategory(cat.id);
                            setStoryPage(0);
                          }}
                          className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                            isActive
                              ? "bg-astu-navy text-white shadow-sm dark:bg-sky-600"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                          }`}
                        >
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Stories Cards Grid — 3 Cards Per Row ("three three display") */}
              {filteredAlumniStories.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center max-w-md mx-auto">
                  <Trophy className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-800 dark:text-white">No Stories Found</h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Try adjusting your search keywords or switching category filters.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setStoriesSearch("");
                      setStoriesCategory("All");
                      setStoryPage(0);
                    }}
                    className="mt-4 rounded-xl bg-astu-navy px-4 py-2 text-xs font-bold text-white hover:brightness-110 shadow-xs"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {pagedStories.map((story) => (
                    <article
                      key={story.id}
                      className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-astu-navy/40 dark:hover:border-sky-500/40 hover:shadow-xl"
                    >
                      <div>
                        {/* Top Badges */}
                        <div className="flex items-center justify-between gap-2 mb-4">
                          <div className="flex items-center gap-1.5">
                            {story.featured && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
                                <Sparkles className="h-3 w-3 text-amber-500" /> Featured
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[10px] font-bold text-astu-green dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                              <CheckCircle2 className="h-3 w-3" /> Verified Alum
                            </span>
                          </div>

                          {story.graduationYear && (
                            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                              {story.graduationYear}
                            </span>
                          )}
                        </div>

                        {/* Profile Header */}
                        <div className="flex items-start gap-3.5 mb-4">
                          {story.image ? (
                            <img
                              src={story.image}
                              alt={story.name}
                              className="h-16 w-16 shrink-0 rounded-2xl object-cover border-2 border-slate-100 dark:border-slate-800 shadow-sm group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/images/astu-building.jpg";
                              }}
                            />
                          ) : (
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-astu-navy text-lg font-bold text-white shadow-sm">
                              {story.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-base font-bold text-slate-900 dark:text-white group-hover:text-astu-navy dark:group-hover:text-sky-300 transition-colors">
                              {story.name}
                            </h3>
                            <p className="line-clamp-1 text-xs font-semibold text-astu-navy dark:text-sky-400">
                              {story.role}
                            </p>
                            {story.company && (
                              <p className="line-clamp-1 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                {story.company}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Department Pill */}
                        {story.department && (
                          <div className="mb-3">
                            <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[10px] font-semibold text-slate-600 dark:text-slate-300 line-clamp-1 inline-block">
                              🎓 {story.department}
                            </span>
                          </div>
                        )}

                        {/* Quote excerpt */}
                        <div className="relative mt-2">
                          <Quote className="h-4 w-4 text-slate-300 dark:text-slate-700 mb-1" />
                          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-3 italic">
                            &ldquo;{story.text}&rdquo;
                          </p>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="mt-5 border-t border-slate-100 dark:border-slate-800 pt-4">
                        <Link
                          to={`/stories/${story.id}`}
                          className="inline-flex items-center justify-between w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 px-4 py-2.5 text-xs font-bold text-astu-navy dark:text-white group-hover:bg-astu-navy group-hover:text-white dark:group-hover:bg-sky-600 transition-all shadow-2xs"
                        >
                          <span>Read Full Journey</span>
                          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {/* Pagination Controls */}
              <PaginationBar
                currentPage={safeStoryPage}
                totalPages={storyTotalPages}
                total={filteredAlumniStories.length}
                pageSize={STORY_PAGE_SIZE}
                onPageChange={setStoryPage}
                noun="stories"
              />

              {/* Inspiring "Share Your Story" Callout Card */}
              <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-gradient-to-br from-astu-navy via-[#0c3970] to-slate-900 p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-astu-green/10 blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="max-w-2xl space-y-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-astu-green border border-white/15">
                      <Sparkles className="h-3.5 w-3.5" />
                      ASTU Alumni Voice
                    </span>
                    <h3 className="text-2xl font-black text-white">
                      Are You an ASTU Graduate with a Story to Tell?
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                      Inspire current engineering and applied science students. Share your career progression, research breakthroughs, startup milestones, or industry advice with the university network.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShareStoryModalOpen(true)}
                    className="shrink-0 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-astu-red to-rose-600 px-6 py-3.5 text-xs sm:text-sm font-black text-white shadow-lg hover:brightness-110 hover:scale-105 transition-all cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Submit Your Success Story</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
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
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-astu-navy border border-blue-200/60 mb-3">
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
                            className="inline-flex items-center gap-2 rounded-xl bg-astu-navy px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-astu-navy transition-all"
                          >
                            <span>{page.sections[0].linkText || "Learn More"}</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => navigate("/login")}
                            className="inline-flex items-center gap-2 rounded-xl bg-astu-navy px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-astu-navy transition-all cursor-pointer"
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
                    <h3 className="text-xl font-black text-astu-navy">Strategic Pillars & Capabilities</h3>
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
                        className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-7 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-astu-navy/40 hover:shadow-lg"
                      >
                        <div>
                          {section.image && (
                            <div className="mb-4 overflow-hidden rounded-xl border border-slate-100">
                              <img src={section.image} alt={section.heading} className="h-36 w-full object-cover" />
                            </div>
                          )}

                          <div className="flex items-center justify-between mb-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-astu-navy ring-1 ring-blue-500/10 group-hover:bg-astu-navy group-hover:text-white transition-colors">
                              <SectionIcon className="h-5 w-5" />
                            </div>
                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                              {section.badge || `Pillar ${idx + 2}`}
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-slate-900 group-hover:text-astu-navy transition-colors">
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
                              className="inline-flex items-center gap-1 font-bold text-astu-navy hover:underline"
                            >
                              <span>{section.linkText || "View Details"}</span>
                              <ChevronRight className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="font-semibold text-slate-400 text-[11px]">
                              Section {idx + 2}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 font-bold text-astu-green text-[11px]">
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
                    <p className="text-2xl sm:text-3xl font-black text-astu-navy">{stat.value}</p>
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
                    <h2 className="text-2xl font-black tracking-tight text-astu-navy">
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
                          className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col justify-between hover:border-astu-navy/30 transition-all"
                        >
                          <div>
                            <div className="flex items-center gap-3 mb-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-astu-navy">
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
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-astu-navy hover:underline"
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
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-astu-green/10 text-astu-green">
                        <MessageSquare className="h-4 w-4" />
                      </div>
                      <h3 className="text-lg font-black text-slate-900">Send an Official Inquiry</h3>
                    </div>
                    <p className="text-xs text-slate-500 mb-6">
                      Have a query about transcripts, employer partnerships, or alumni chapters? Submit your request directly.
                    </p>

                    {inquirySent ? (
                      <div className="rounded-2xl bg-astu-green/10 border border-astu-green/20 p-6 text-center space-y-3">
                        <CheckCircle2 className="h-10 w-10 text-astu-green mx-auto" />
                        <h4 className="text-sm font-bold text-astu-navy">Inquiry Dispatched Successfully</h4>
                        <p className="text-xs text-astu-green">
                          Thank you for contacting ASTU. Your message has been routed to the respective institutional department.
                        </p>
                        <button
                          type="button"
                          onClick={() => setInquirySent(false)}
                          className="mt-2 text-xs font-bold text-astu-green underline cursor-pointer"
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
                            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-astu-navy/20"
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
                              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-astu-navy/20"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-700">Phone (Optional)</label>
                            <input
                              type="tel"
                              placeholder="+251-9..."
                              value={inquiryForm.phone}
                              onChange={(e) => setInquiryForm((prev) => ({ ...prev, phone: e.target.value }))}
                              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-astu-navy/20"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700">Stakeholder Role</label>
                          <select
                            value={inquiryForm.category}
                            onChange={(e) => setInquiryForm((prev) => ({ ...prev, category: e.target.value }))}
                            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-astu-navy/20"
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
                            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-astu-navy/20"
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
                            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-astu-navy/20 resize-none"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmittingInquiry}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-astu-navy hover:bg-astu-navy text-white py-3 text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-60"
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
                  <h2 className="text-2xl font-black text-astu-navy">Verified Partner Organizations</h2>
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
                    className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs font-medium text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-astu-navy/20"
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
                        ? "bg-astu-navy text-white shadow-sm"
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
                        className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-7 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-astu-navy/40 hover:shadow-xl"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-4 mb-5">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 p-2 shadow-xs group-hover:scale-105 transition-transform">
                              {company.logo ? (
                                <img src={company.logo} alt={company.name} className="h-full w-full object-contain" />
                              ) : LogoComponent ? (
                                <LogoComponent className="h-10 w-10" />
                              ) : (
                                <Building2 className="h-7 w-7 text-astu-navy" />
                              )}
                            </div>

                            <div className="flex flex-col items-end gap-1.5">
                              <span className="inline-flex items-center gap-1 rounded-full bg-astu-green/10 px-2.5 py-0.5 text-[10px] font-bold text-astu-green">
                                <ShieldCheck className="h-3 w-3 text-astu-green" />
                                Verified
                              </span>
                              {company.featured && (
                                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                                  ⭐ Top Partner
                                </span>
                              )}
                            </div>
                          </div>

                          <h3 className="text-base font-black text-slate-900 group-hover:text-astu-navy transition-colors">
                            {company.name}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1">{company.industry || "Technology & Engineering"}</p>

                          <div className="mt-4 flex items-center gap-2 rounded-xl bg-blue-50/60 p-2.5 text-xs font-bold text-astu-navy">
                            <Briefcase className="h-3.5 w-3.5 text-astu-navy" />
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
                            className="font-bold text-astu-navy hover:underline cursor-pointer inline-flex items-center gap-1"
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
                    <h3 className="text-xl font-black text-astu-navy">Recruitment Framework & Institutional Pillars</h3>
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
                      className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col justify-between hover:border-astu-navy/30 transition-all"
                    >
                      <div>
                        <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-astu-navy">
                          {sec.badge || `Pillar ${idx + 1}`}
                        </span>
                        <h4 className="text-base font-bold text-slate-900 mt-3">{sec.heading}</h4>
                        <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">{sec.body}</p>
                      </div>

                      <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-400 text-[11px]">Track {idx + 1}</span>
                        <span className="inline-flex items-center gap-1 text-astu-green font-bold text-[11px]">
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
                  <h3 className="text-xl font-black text-astu-navy">Frequently Asked Questions</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {page.faqs.map((faq, idx) => (
                      <div key={faq.id || idx} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                          <HelpCircle className="h-4 w-4 text-astu-navy shrink-0" />
                          <span>{faq.question}</span>
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed pl-6">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Corporate CTA */}
              <div className="rounded-3xl border border-slate-200/90 bg-gradient-to-r from-astu-navy via-primary-container to-astu-navy p-8 sm:p-12 text-white shadow-xl flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                <div className="max-w-xl">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-astu-green">
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
                    className="rounded-xl bg-astu-green px-6 py-3 text-xs font-bold text-white hover:brightness-110 shadow-md transition-all cursor-pointer"
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
                <h2 className="text-2xl font-black text-astu-navy">Strategic Alliances & Industry Consortia</h2>
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
                        className="rounded-3xl border border-slate-200/90 bg-white p-7 shadow-xs flex flex-col justify-between hover:border-astu-navy/40 hover:shadow-lg transition-all"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-3 mb-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 p-1.5">
                              {company.logo ? (
                                <img src={company.logo} alt={company.name} className="h-full w-full object-contain" />
                              ) : LogoComponent ? (
                                <LogoComponent className="h-8 w-8" />
                              ) : (
                                <Building2 className="h-6 w-6 text-astu-navy" />
                              )}
                            </div>
                            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-astu-navy">
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
                            className="font-bold text-astu-navy hover:underline cursor-pointer"
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
                  <h3 className="text-xl font-black text-astu-navy">Institutional Cooperation Pillars</h3>
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
                      <span className="rounded-md bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-astu-navy">
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
                  <h3 className="text-xl font-black text-astu-navy">Stakeholder & Partnership FAQs</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {page.faqs.map((faq, idx) => (
                      <div key={faq.id || idx} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                          <HelpCircle className="h-4 w-4 text-astu-navy shrink-0" />
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
                      className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-7 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-astu-navy/40 hover:shadow-lg hover:shadow-slate-200/60"
                    >
                      <div>
                        {section.image && (
                          <div className="mb-4 overflow-hidden rounded-xl border border-slate-100">
                            <img src={section.image} alt={section.heading} className="h-36 w-full object-cover" />
                          </div>
                        )}

                        <div className="mb-5 flex items-center justify-between">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-astu-navy ring-1 ring-blue-500/10 group-hover:bg-astu-navy group-hover:text-white transition-colors duration-200">
                            <SectionIcon className="h-6 w-6" />
                          </div>
                          {section.badge && (
                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                              {section.badge}
                            </span>
                          )}
                        </div>

                        <h2 className="text-lg font-bold text-slate-900 group-hover:text-astu-navy transition-colors">
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
                            className="inline-flex items-center gap-1 font-bold text-astu-navy hover:underline"
                          >
                            <span>{section.linkText || "View Portal"}</span>
                            <ChevronRight className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="font-semibold text-slate-400">Section {index + 1}</span>
                        )}
                        <span className="inline-flex items-center gap-1 font-bold text-astu-navy opacity-0 group-hover:opacity-100 transition-opacity">
                          <span>Verified</span>
                          <CheckCircle2 className="h-3.5 w-3.5 text-astu-green" />
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Quick Institutional Action Banner */}
              <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-r from-astu-navy to-astu-navy p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
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
                    className="rounded-xl bg-astu-green px-5 py-2.5 text-xs font-bold text-white hover:brightness-110 transition-all cursor-pointer shadow-md"
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
            </div>
          )}
        </section>
      </main>

      <Footer />

      {/* Share Story Submission Modal */}
      {shareStoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-astu-navy/10 dark:bg-sky-500/15 text-astu-navy dark:text-sky-300">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Submit Your Success Story</h3>
              </div>
              <button
                type="button"
                onClick={() => setShareStoryModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleShareStorySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={shareStoryForm.name}
                  onChange={(e) => setShareStoryForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Dr. Ruth Alemu"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-astu-navy"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={shareStoryForm.email}
                    onChange={(e) => setShareStoryForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="you@alumni.astu.edu.et"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-astu-navy"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Graduation Cohort
                  </label>
                  <input
                    type="text"
                    value={shareStoryForm.graduationYear}
                    onChange={(e) =>
                      setShareStoryForm((p) => ({ ...p, graduationYear: e.target.value }))
                    }
                    placeholder="e.g. Class of 2018"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-astu-navy"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Current Job Title
                  </label>
                  <input
                    type="text"
                    value={shareStoryForm.role}
                    onChange={(e) => setShareStoryForm((p) => ({ ...p, role: e.target.value }))}
                    placeholder="e.g. AI Research Scientist"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-astu-navy"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    value={shareStoryForm.company}
                    onChange={(e) => setShareStoryForm((p) => ({ ...p, company: e.target.value }))}
                    placeholder="e.g. Ethio Telecom / Lab"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-astu-navy"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Department / Field of Study
                </label>
                <input
                  type="text"
                  value={shareStoryForm.department}
                  onChange={(e) => setShareStoryForm((p) => ({ ...p, department: e.target.value }))}
                  placeholder="e.g. Computer Science & Engineering"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-astu-navy"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Your Story & Key Achievements *
                </label>
                <textarea
                  required
                  rows={4}
                  value={shareStoryForm.text}
                  onChange={(e) => setShareStoryForm((p) => ({ ...p, text: e.target.value }))}
                  placeholder="Describe your career milestones, how ASTU influenced your path, and any advice for current students..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-astu-navy resize-none"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShareStoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingStory}
                  className="px-5 py-2.5 rounded-xl bg-astu-navy hover:bg-astu-navy/90 text-white text-xs font-bold shadow-md disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isSubmittingStory ? "Submitting..." : "Submit Story"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Company Modal */}
      <CompanyDetailModal company={selectedCompanyModal} onClose={() => setSelectedCompanyModal(null)} />
    </div>
  );
}