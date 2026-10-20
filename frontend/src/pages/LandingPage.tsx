import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell, Briefcase, Building2, CalendarDays, CircleUserRound,
  FileCheck2, Globe, GraduationCap, Handshake, LineChart, LockKeyhole,
  Menu, Search, Users, X, MapPin, ArrowRight, Star, MessageSquareText,
  ShieldCheck, Trophy, Zap, Quote, ChevronLeft, ChevronRight, Mail, Phone,
  BookOpen,
} from "lucide-react";
import homepageCmsService from "../features/admin/services/homepageCms.service";
import { usePublicMetrics } from "../services/publicMetrics.service";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Users, Building2, LineChart, FileCheck2, MessageSquareText, Briefcase,
  LockKeyhole, Globe, BookOpen, Star, Handshake, ShieldCheck, Trophy,
  GraduationCap, Zap, Quote, MapPin, Mail, Phone,
};

const portalTints: Record<string, string> = {
  Alumni: "text-astu-navy bg-astu-navy/10",
  Employers: "text-astu-red bg-astu-red/10",
  Departments: "text-astu-green bg-astu-green/10",
  Registrar: "text-[#B87900] bg-[#E8A020]/15",
  Administrator: "text-violet-700 bg-violet-100",
};

const statColors = [
  { bg: "bg-astu-navy/10", text: "text-astu-navy" },
  { bg: "bg-astu-red/10", text: "text-astu-red" },
  { bg: "bg-astu-green/10", text: "text-astu-green" },
  { bg: "bg-[#E8A020]/15", text: "text-[#B87900]" },
  { bg: "bg-violet-100", text: "text-violet-700" },
];

const DEFAULT_CONFIG = {
  welcomeMessage: "The ASTU Alumni Management System connects graduates, employers, and departments in one platform.",
  heroSlides: [
    { id: "HS-1", image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1800&q=80", tagline: "Quality Assurance & Accreditation", title: "Connecting ASTU\u2019s Excellence to the Global Industry", description: "A unified gateway for alumni, employers, and departments to foster professional growth, talent acquisition, and academic innovation at Adama Science and Technology University.", active: true },
    { id: "HS-2", image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1800&q=80", tagline: "Enterprise Networking & Placement", title: "Empowering ASTU Graduates in Modern Workspaces", description: "Discover corporate partners, publish practical career openings, and track your employment outcomes.", active: true },
  ],
  impactStats: [
    { id: "IS-1", label: "Registered Alumni Members", value: "—", suffix: "", icon: "Users", active: true },
    { id: "IS-2", label: "Partner Organizations", value: "—", suffix: "", icon: "Building2", active: true },
    { id: "IS-3", label: "Employment Rate", value: "—", suffix: "", icon: "LineChart", active: true },
    { id: "IS-4", label: "Digital Requests", value: "—", suffix: "", icon: "FileCheck2", active: true },
    { id: "IS-5", label: "Engagement Hub", value: "24/7", suffix: "", icon: "MessageSquareText", active: true },
  ],
  portals: [
    { id: "SP-1", title: "Alumni", icon: "Users", points: ["Create and maintain your professional profile.", "Access verified job listings and internship opportunities.", "Complete tracer surveys to guide curriculum development.", "Mentor current students and connect with peers."], cta: "Access Alumni Portal", route: "/alumni", active: true },
    { id: "SP-2", title: "Employers", icon: "Briefcase", points: ["Post employment opportunities for ASTU graduates.", "Search alumni by expertise, skills, and department.", "Provide feedback to enhance curriculum relevance."], cta: "Partner With ASTU", route: "/employer", active: true },
    { id: "SP-3", title: "Departments", icon: "LineChart", points: ["Monitor graduate employment outcomes and metrics.", "Identify skill gaps through employer analytics.", "Generate accreditation-ready reports."], cta: "View Department Analytics", route: "/department", active: true },
    { id: "SP-4", title: "Registrar", icon: "FileCheck2", points: ["Validate alumni credentials against SIS records.", "Process transcript and certificate requests.", "Send tracer study reminders and audit notifications."], cta: "Open Registrar Portal", route: "/registrar", active: true },
    { id: "SP-5", title: "Administrator", icon: "LockKeyhole", points: ["Manage users, roles, and department records.", "Monitor system logs, backups, and security protocols.", "Oversee institutional analytics and accreditation reports."], cta: "Admin Console", route: "/admin", active: true },
  ],
  campusLife: [], campuses: [], gallery: [], videos: [], workshops: [],
  events: [],
  newsItems: [],
  announcements: [],
  stories: [],
  partners: [],
  testimonials: [],
  faq: [
    { id: "FQ-1", question: "Who can use ASTU-AMS?", answer: "Verified alumni, employers, registrar teams, departments, and system administrators each access role-specific services.", active: true },
    { id: "FQ-2", question: "How are tracer studies used?", answer: "Responses support employment analytics, skill-gap reviews, curriculum updates, and accreditation evidence.", active: true },
    { id: "FQ-3", question: "How do I request a transcript?", answer: "Log into your alumni profile, navigate to Document Requests, and submit a digital request through the Registrar portal.", active: true },
  ],
};

const navSections = [
  { label: "Home", id: "home" },
  { label: "Stakeholders", id: "stakeholders" },
  { label: "Gallery", id: "gallery" },
  { label: "Events", id: "events" },
  { label: "News", id: "news" },
  { label: "Stories", id: "success-stories" },
  { label: "Contact", id: "contact" },
];

function useCmsConfig() {
  const [config, setConfig] = useState<any>(() => {
    const saved = homepageCmsService.getSettings();
    return saved ? { ...DEFAULT_CONFIG, ...saved } : DEFAULT_CONFIG;
  });
  useEffect(() => {
    const update = () => {
      const saved = homepageCmsService.getSettings();
      if (saved) setConfig((p: any) => ({ ...p, ...saved }));
    };
    window.addEventListener("astu-cms-homepage-updated", update);
    window.addEventListener("storage", update);
    homepageCmsService.fetchFromApi().then((api: any) => {
      if (api) setConfig((p: any) => ({ ...p, ...api }));
    });
    return () => {
      window.removeEventListener("astu-cms-homepage-updated", update);
      window.removeEventListener("storage", update);
    };
  }, []);
  return config;
}

export default function LandingPage() {
  const navigate = useNavigate();
  const config = useCmsConfig();
  const { metrics } = usePublicMetrics();
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [heroIndex, setHeroIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const active = (arr: any[]) => (arr || []).filter((i) => i.active);
  const heroSlides = active(config.heroSlides);
  const stats = useMemo(() => {
    return active(config.impactStats).map((stat: any) => {
      const lower = (stat.label || '').toLowerCase();
      if (stat.id === 'IS-1' || lower.includes('alumni')) {
        return { ...stat, value: metrics.registeredAlumniFormatted, suffix: '' };
      }
      if (stat.id === 'IS-2' || lower.includes('partner') || lower.includes('organization')) {
        return { ...stat, value: metrics.corporatePartnersFormatted, suffix: '' };
      }
      if (stat.id === 'IS-3' || lower.includes('rate') || lower.includes('employment')) {
        return { ...stat, value: metrics.employmentRateFormatted, suffix: '' };
      }
      if (stat.id === 'IS-4' || lower.includes('request') || lower.includes('digital')) {
        return { ...stat, value: metrics.digitalRequestsFormatted, suffix: '' };
      }
      return stat;
    });
  }, [config.impactStats, metrics]);
  const portals = active(config.portals);
  const gallery = active(config.gallery);
  const campuses = active(config.campuses);
  const events = active(config.events);
  const workshops = active(config.workshops);
  const newsItems = active(config.newsItems);
  const announcements = active(config.announcements);
  const stories = active(config.stories);
  const partners = active(config.partners);
  const testimonials = active(config.testimonials);
  const faq = active(config.faq);
  const currentHero = heroSlides[heroIndex] || heroSlides[0];

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const t = setInterval(() => setHeroIndex((i) => (i + 1) % heroSlides.length), 5000);
    return () => clearInterval(t);
  }, [heroSlides.length]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("is-visible"); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal").forEach((n) => obs.observe(n));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActiveSection(e.target.id); }),
      { rootMargin: "-30% 0px -50% 0px", threshold: 0.1 }
    );
    navSections.forEach(({ id }) => { const n = document.getElementById(id); if (n) obs.observe(n); });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) setIsSearchOpen(false);
    };
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  const goToSection = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setIsMobileNavOpen(false);
  }, []);

  const onImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "/images/fallback-campus.svg";
  };

  return (
    <div className="min-h-screen bg-background text-on-surface">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-outline-variant bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-3 px-4 md:px-8">
          <Link to="/" className="flex min-w-fit items-center gap-2.5">
            <img src="/images/astu-seal-logo.png" alt="ASTU Logo" className="h-10 w-10 object-contain scale-110 shrink-0" />
            <div>
              <p className="text-sm font-bold leading-none text-astu-navy">ASTU AMS</p>
              <p className="text-[10px] text-on-surface-variant">Alumni Management</p>
            </div>
          </Link>
          <div ref={searchWrapRef} className="relative hidden flex-1 max-w-xl md:block">
            <Search className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
            <input value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setIsSearchOpen(true); }}
              onFocus={() => setIsSearchOpen(true)}
              className="w-full rounded-md border border-outline-variant bg-surface-container-low py-2 pl-9 pr-3 text-sm focus:border-astu-navy focus:outline-none"
              placeholder="Search sections or portals..." type="text" />
            {isSearchOpen && searchQuery.trim() && (
              <div className="absolute top-12 w-full overflow-hidden rounded-md border border-outline-variant bg-white shadow-lg z-50">
                {navSections.filter((s) => s.label.toLowerCase().includes(searchQuery.toLowerCase())).map((s) => (
                  <button key={s.id} onClick={() => { goToSection(s.id); setSearchQuery(""); setIsSearchOpen(false); }}
                    className="flex w-full items-center border-b border-outline-variant px-3 py-2 text-left text-sm last:border-b-0 hover:bg-surface-container-low">
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <nav className="hidden items-center gap-5 xl:flex">
            {navSections.map((item) => (
              <button key={item.id}
                className={`text-xs font-semibold transition-colors ${activeSection === item.id ? "text-astu-navy" : "text-on-surface-variant hover:text-astu-navy"}`}
                onClick={() => goToSection(item.id)}>{item.label}</button>
            ))}
          </nav>
          <div className="flex items-center gap-1 md:gap-2">
            <button aria-label="notifications" className="rounded-full p-2 hover:bg-surface-container-low" onClick={() => navigate("/alumni/dashboard")}><Bell className="h-4 w-4" /></button>
            <button aria-label="mobile menu" className="rounded-full p-2 hover:bg-surface-container-low xl:hidden" onClick={() => setIsMobileNavOpen((p) => !p)}>
              {isMobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            <button aria-label="profile" className="rounded-full border border-outline-variant p-1.5 hover:bg-surface-container-low" onClick={() => navigate("/alumni/dashboard")}><CircleUserRound className="h-4 w-4" /></button>
          </div>
        </div>
        {isMobileNavOpen && (
          <div className="border-t border-outline-variant bg-white px-4 py-4 xl:hidden">
            <div className="space-y-2">
              {navSections.map((item) => (
                <button key={item.id} onClick={() => goToSection(item.id)} className="block w-full rounded-md border border-outline-variant px-3 py-2 text-left text-sm font-semibold text-astu-navy">{item.label}</button>
              ))}
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <button onClick={() => navigate("/alumni/dashboard")} className="rounded-md bg-astu-navy px-3 py-2 text-sm font-semibold text-white">Alumni Portal</button>
              <button onClick={() => navigate("/employer/dashboard")} className="rounded-md border border-outline-variant px-3 py-2 text-sm font-semibold">Employer Portal</button>
            </div>
          </div>
        )}
      </header>

      <main id="home">
        {/* HERO SLIDER */}
        {currentHero && (
          <section className="relative overflow-hidden min-h-[520px] md:min-h-[600px]">
            <div className="absolute inset-0">
              <img alt={currentHero.title} className="h-full w-full object-cover transition-all duration-700" src={currentHero.image} onError={onImgError} />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,51,102,0.84),rgba(0,30,64,0.94))]" />
            </div>
            <div className="relative z-10 mx-auto max-w-[1440px] px-4 py-20 md:px-8 md:py-28 lg:py-36">
              <div className="max-w-3xl reveal">
                {currentHero.tagline && <span className="mb-4 inline-flex rounded-full bg-astu-red/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white">{currentHero.tagline}</span>}
                <h1 className="mt-2 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">{currentHero.title}</h1>
                <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-100 md:text-base">{currentHero.description}</p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <button className="inline-flex items-center gap-2 rounded-md bg-astu-red px-6 py-3 text-sm font-semibold text-white hover:brightness-110" onClick={() => navigate("/alumni/dashboard")}>Alumni Portal Login</button>
                  <button className="inline-flex items-center gap-2 rounded-md border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20" onClick={() => navigate("/employer/dashboard")}>Employer Partnership <Handshake className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
            {heroSlides.length > 1 && (
              <>
                <button onClick={() => setHeroIndex((i) => (i - 1 + heroSlides.length) % heroSlides.length)} className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-2 hover:bg-white/40 transition-all"><ChevronLeft className="h-5 w-5 text-white" /></button>
                <button onClick={() => setHeroIndex((i) => (i + 1) % heroSlides.length)} className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-2 hover:bg-white/40 transition-all"><ChevronRight className="h-5 w-5 text-white" /></button>
                <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
                  {heroSlides.map((_: any, i: number) => (<button key={i} onClick={() => setHeroIndex(i)} className={`h-2 rounded-full transition-all ${i === heroIndex ? "w-6 bg-white" : "w-2 bg-white/40"}`} />))}
                </div>
              </>
            )}
          </section>
        )}

        {/* IMPACT STATS */}
        {stats.length > 0 && (
          <section className="relative z-20 mx-auto -mt-12 mb-16 max-w-[1440px] px-4 md:-mt-16 md:px-8">
            <div className="grid overflow-hidden rounded-xl border border-outline-variant bg-white shadow-xl" style={{ gridTemplateColumns: `repeat(${Math.min(stats.length, 5)}, 1fr)` }}>
              {stats.map((stat: any, i: number) => {
                const Icon = (iconMap[stat.icon] || Users) as React.ComponentType<{ className?: string }>;
                const c = statColors[i % statColors.length];
                return (
                  <article key={stat.id} className="flex flex-col items-center gap-2 border-b border-outline-variant p-6 text-center last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
                    <div className={`rounded-full p-3 ${c.bg}`}><Icon className={`h-5 w-5 ${c.text}`} /></div>
                    <p className={`text-2xl font-bold ${c.text}`}>{stat.value}{stat.suffix}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">{stat.label}</p>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* STAKEHOLDER PORTALS */}
        {portals.length > 0 && (
          <section id="stakeholders" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
            <div className="mb-10 text-center reveal">
              <h2 className="text-2xl font-bold text-astu-navy md:text-3xl">Stakeholder Portals</h2>
              <p className="mx-auto mt-2 max-w-2xl text-sm text-on-surface-variant">Dedicated interfaces for alumni, employers, departments, registrar, and administrators.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {portals.map((portal: any) => {
                const Icon = (iconMap[portal.icon] || Users) as React.ComponentType<{ className?: string }>;
                const tint = portalTints[portal.title] || "text-astu-navy bg-astu-navy/10";
                return (
                  <article key={portal.id} className="reveal rounded-xl border border-outline-variant bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                    <div className={`mb-4 inline-flex rounded-lg p-3 ${tint}`}><Icon className="h-5 w-5 sm:h-6 sm:w-6" /></div>
                    <h3 className="mb-3 text-base font-semibold text-astu-navy sm:text-lg">{portal.title}</h3>
                    <ul className="space-y-2.5 text-sm text-on-surface-variant">
                      {(portal.points || []).map((pt: string) => (<li key={pt} className="flex items-start gap-2"><span>{pt}</span></li>))}
                    </ul>
                    <button className="mt-5 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-astu-navy hover:text-astu-red" onClick={() => navigate(portal.route)}>
                      {portal.cta} <ArrowRight className="h-3 w-3" />
                    </button>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* GALLERY */}
        {gallery.length > 0 && (
          <section id="gallery" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16 bg-surface-container-low/30">
            <div className="mb-10 text-center reveal">
              <h2 className="text-2xl font-bold text-astu-navy md:text-3xl">Campus Gallery</h2>
              <p className="mx-auto mt-2 max-w-2xl text-sm text-on-surface-variant">A glimpse into life at Adama Science and Technology University.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((img: any) => (
                <div key={img.id} className="reveal overflow-hidden rounded-xl border border-outline-variant shadow-sm">
                  <img src={img.src} alt={img.title} className="h-52 w-full object-cover transition-transform duration-500 hover:scale-105" onError={onImgError} />
                  {img.title && <p className="px-3 py-2 text-xs font-semibold text-astu-navy">{img.title}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CAMPUSES */}
        {campuses.length > 0 && (
          <section className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
            <div className="mb-10 text-center reveal"><h2 className="text-2xl font-bold text-astu-navy md:text-3xl">Our Campuses</h2></div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {campuses.map((campus: any) => (
                <article key={campus.id} className="reveal overflow-hidden rounded-xl border border-outline-variant bg-white shadow-sm">
                  <img src={campus.image} alt={campus.name} className="h-40 w-full object-cover" onError={onImgError} />
                  <div className="p-4"><h3 className="font-semibold text-astu-navy">{campus.name}</h3><p className="mt-1 text-xs text-on-surface-variant">{campus.description}</p></div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* EVENTS */}
        {events.length > 0 && (
          <section id="events" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
            <div className="reveal mb-8 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-2xl font-bold text-astu-navy sm:text-3xl">Upcoming Alumni Events</h2>
                <p className="mt-2 text-sm text-on-surface-variant">Networking, learning, and professional growth opportunities.</p>
              </div>
              <button className="rounded-md border border-outline-variant px-3 py-2 text-xs font-semibold hover:bg-surface-container-low" onClick={() => navigate("/events")}>See All Events</button>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event: any) => (
                <article key={event.id} className="reveal overflow-hidden rounded-xl border border-outline-variant bg-white shadow-sm">
                  <img alt={event.title} className="h-48 w-full object-cover" src={event.image} onError={onImgError} />
                  <div className="p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-astu-red">{event.category || "Career Development"}</p>
                    <h3 className="mt-2 text-lg font-semibold text-astu-navy">{event.title}</h3>
                    <div className="mt-3 flex flex-col gap-1 text-xs text-on-surface-variant">
                      <p className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{event.date}</p>
                      {event.location && <p className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{event.location}</p>}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button className="rounded-md bg-astu-navy px-4 py-2 text-xs font-semibold text-white hover:brightness-110" onClick={() => navigate("/alumni")}>Register</button>
                      <button className="rounded-md border border-outline-variant px-4 py-2 text-xs font-semibold hover:bg-surface-container-low">Learn More</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* WORKSHOPS */}
        {workshops.length > 0 && (
          <section className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16 bg-surface-container-low/30">
            <div className="mb-8 text-center reveal"><h2 className="text-2xl font-bold text-astu-navy md:text-3xl">Upcoming Workshops</h2></div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {workshops.map((ws: any) => (
                <article key={ws.id} className="reveal rounded-xl border border-outline-variant bg-white p-5 shadow-sm">
                  <span className="inline-block rounded-full bg-astu-navy/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-astu-navy">{ws.focus || "Workshop"}</span>
                  <h3 className="mt-3 font-semibold text-astu-navy">{ws.title}</h3>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-on-surface-variant">
                    <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{ws.date}</span>
                    {ws.seats && <span>{ws.seats}</span>}
                  </div>
                  <button className="mt-4 rounded-md bg-astu-navy px-4 py-2 text-xs font-semibold text-white hover:brightness-110" onClick={() => navigate("/alumni")}>Register</button>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* NEWS & ANNOUNCEMENTS */}
        {(newsItems.length > 0 || announcements.length > 0) && (
          <section id="news" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
            <div className="mb-10 text-center reveal">
              <h2 className="text-2xl font-bold text-astu-navy md:text-3xl">Latest News & Announcements</h2>
              <p className="mx-auto mt-2 max-w-2xl text-sm text-on-surface-variant">Stay updated with the latest ASTU announcements and university news.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...newsItems, ...announcements].slice(0, 6).map((item: any) => (
                <article key={item.id} className="reveal rounded-xl border border-outline-variant bg-white p-5 shadow-sm">
                  <span className="inline-block rounded-full bg-astu-red/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-astu-red mb-2">{item.type || "Announcement"}</span>
                  <h3 className="font-semibold text-astu-navy">{item.title}</h3>
                  <p className="mt-2 text-xs text-on-surface-variant">{item.date}</p>
                  <button className="mt-3 text-xs text-astu-navy hover:underline" onClick={() => navigate("/alumni")}>Read More</button>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* SUCCESS STORIES */}
        {stories.length > 0 && (
          <section id="success-stories" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16 bg-surface-container-low/30">
            <div className="mb-10 text-center reveal">
              <h2 className="text-2xl font-bold text-astu-navy md:text-3xl">Alumni Success Stories</h2>
              <p className="mx-auto mt-2 max-w-2xl text-sm text-on-surface-variant">Inspiring journeys of ASTU graduates making global impact.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              {stories.map((story: any) => (
                <article key={story.id} className="reveal rounded-xl border border-outline-variant bg-white overflow-hidden shadow-sm">
                  {story.image && <img src={story.image} alt={story.name} className="h-48 w-full object-cover" onError={onImgError} />}
                  <div className="p-4">
                    <h3 className="font-semibold text-astu-navy">{story.name}</h3>
                    <p className="text-xs text-on-surface-variant">{story.role}</p>
                    <p className="mt-2 text-sm line-clamp-3 text-on-surface-variant">{story.text}</p>
                    <button className="mt-3 text-xs text-astu-navy hover:underline" onClick={() => navigate("/alumni")}>Read Story</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* TESTIMONIALS */}
        {testimonials.length > 0 && (
          <section className="bg-gradient-to-r from-astu-navy to-primary-container py-14 md:py-20">
            <div className="mx-auto max-w-[1440px] px-4 md:px-8">
              <div className="mb-10 text-center"><h2 className="text-2xl font-bold text-white md:text-3xl">What People Say</h2></div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {testimonials.map((t: any) => (
                  <article key={t.id} className="reveal rounded-xl border border-white/20 bg-white/10 p-6">
                    <Quote className="h-6 w-6 text-astu-green mb-3" />
                    <p className="text-sm leading-relaxed text-slate-200">"{t.quote}"</p>
                    <p className="mt-3 text-xs font-semibold text-white">\u2014 {t.by}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* PARTNERS */}
        {partners.length > 0 && (
          <section className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
            <div className="mb-8 text-center reveal">
              <h2 className="text-2xl font-bold text-astu-navy md:text-3xl">Our Partners</h2>
              <p className="mx-auto mt-2 max-w-2xl text-sm text-on-surface-variant">Trusted organizations working with ASTU graduates.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {partners.map((p: any) => (
                <div key={p.id} className="reveal rounded-lg border border-outline-variant bg-white px-5 py-3 text-sm font-semibold text-astu-navy shadow-sm hover:shadow-md transition-all">{p.name}</div>
              ))}
            </div>
          </section>
        )}

        {/* FAQ */}
        {faq.length > 0 && (
          <section className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16 bg-surface-container-low/30">
            <div className="mb-10 text-center reveal"><h2 className="text-2xl font-bold text-astu-navy md:text-3xl">Frequently Asked Questions</h2></div>
            <div className="max-w-3xl mx-auto space-y-3">
              {faq.map((item: any) => (
                <div key={item.id} className="reveal rounded-xl border border-outline-variant bg-white overflow-hidden">
                  <button className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold text-astu-navy" onClick={() => setOpenFaq(openFaq === item.id ? null : item.id)}>
                    {item.question}
                    <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${openFaq === item.id ? "rotate-90" : ""}`} />
                  </button>
                  {openFaq === item.id && <div className="px-5 pb-4 text-sm text-on-surface-variant">{item.answer}</div>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CONTACT */}
        <section id="contact" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="mb-10 text-center reveal">
            <h2 className="text-2xl font-bold text-astu-navy md:text-3xl">Contact Us</h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-on-surface-variant">Connect with the ASTU Alumni Relations Office.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
            <div className="reveal text-center p-6 rounded-xl border border-outline-variant bg-white"><MapPin className="h-8 w-8 mx-auto text-astu-navy mb-3" /><h3 className="font-semibold text-astu-navy">Address</h3><p className="text-xs text-on-surface-variant mt-1">Adama, Oromia, Ethiopia</p></div>
            <div className="reveal text-center p-6 rounded-xl border border-outline-variant bg-white"><Phone className="h-8 w-8 mx-auto text-astu-navy mb-3" /><h3 className="font-semibold text-astu-navy">Phone</h3><p className="text-xs text-on-surface-variant mt-1">+251-000-0000</p></div>
            <div className="reveal text-center p-6 rounded-xl border border-outline-variant bg-white"><Mail className="h-8 w-8 mx-auto text-astu-navy mb-3" /><h3 className="font-semibold text-astu-navy">Email</h3><p className="text-xs text-on-surface-variant mt-1">irccd@astu.edu.et</p></div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-outline-variant bg-surface py-10">
        <div className="mx-auto grid max-w-[1440px] gap-8 px-4 md:grid-cols-4 md:px-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <img src="/images/astu-seal-logo.png" alt="ASTU Logo" className="h-8 w-8 object-contain scale-110" />
              <h5 className="text-sm font-bold text-astu-navy">ASTU-AMS</h5>
            </div>
            <p className="mt-1 text-xs text-on-surface-variant">{config.welcomeMessage || "The ASTU Alumni Management System connects graduates, employers, and departments in one platform."}</p>
            <div className="mt-4 flex gap-2">
              <button className="rounded-md border border-outline-variant px-2 py-1 text-xs hover:bg-surface-container-low">FB</button>
              <button className="rounded-md border border-outline-variant px-2 py-1 text-xs hover:bg-surface-container-low">X</button>
              <button className="rounded-md border border-outline-variant px-2 py-1 text-xs hover:bg-surface-container-low">IN</button>
            </div>
          </div>
          <div>
            <h6 className="text-xs font-semibold uppercase tracking-[0.14em] text-astu-navy">Resources</h6>
            <ul className="mt-3 space-y-2 text-xs text-on-surface-variant">
              <li><button className="hover:text-astu-navy" onClick={() => navigate("/alumni")}>Career Portal</button></li>
              <li><button className="hover:text-astu-navy" onClick={() => navigate("/alumni")}>Tracer Survey</button></li>
              <li><button className="hover:text-astu-navy" onClick={() => navigate("/alumni")}>Mentorship</button></li>
            </ul>
          </div>
          <div>
            <h6 className="text-xs font-semibold uppercase tracking-[0.14em] text-astu-navy">University</h6>
            <ul className="mt-3 space-y-2 text-xs text-on-surface-variant">
              <li><button className="hover:text-astu-navy">Official Website</button></li>
              <li><button className="hover:text-astu-navy">Research Centers</button></li>
              <li><button className="hover:text-astu-navy">Accreditation</button></li>
            </ul>
          </div>
          <div>
            <h6 className="text-xs font-semibold uppercase tracking-[0.14em] text-astu-navy">Support</h6>
            <ul className="mt-3 space-y-2 text-xs text-on-surface-variant">
              <li><button className="hover:text-astu-navy" onClick={() => navigate("/registrar/dashboard")}>Help Center</button></li>
              <li><button className="hover:text-astu-navy" onClick={() => navigate("/admin/dashboard")}>Privacy Policy</button></li>
              <li><button className="hover:text-astu-navy" onClick={() => navigate("/registrar/dashboard")}>Contact Us</button></li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-8 flex max-w-[1440px] flex-col justify-between gap-2 border-t border-outline-variant px-4 pt-5 text-xs text-on-surface-variant md:flex-row md:px-8">
          <p>\u00a9 2026 Adama Science and Technology University. All rights reserved.</p>
          <p>Designed for ASTU ICT and Tracer Study Coordination.</p>
        </div>
      </footer>
    </div>
  );
}
