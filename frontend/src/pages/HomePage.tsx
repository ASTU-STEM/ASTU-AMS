import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  Globe,
  GraduationCap,
  Handshake,
  Leaf,
  Layers,
  LineChart,
  Menu,
  ShieldCheck,
  Search,
  Target,
  Users,
  X,
  BarChart3,
} from "lucide-react";

const FALLBACK_IMAGE = "/images/fallback-campus.svg";

const stakeholders = [
  {
    title: "For Alumni",
    icon: Users,
    points: [
      "Build your profile and access job opportunities.",
      "Complete tracer studies and improve ASTU programs.",
      "Mentor students and join the alumni network.",
    ],
    cta: "Join Network",
    route: "/alumni/dashboard",
    tint: "text-astu-navy bg-astu-navy/10",
  },
  {
    title: "For Employers",
    icon: Briefcase,
    points: [
      "Post jobs and internships for ASTU graduates.",
      "Search alumni by skills and department.",
      "Share feedback to strengthen curriculum alignment.",
    ],
    cta: "Partner With Us",
    route: "/employer/dashboard",
    tint: "text-astu-red bg-astu-red/10",
  },
  {
    title: "For Departments",
    icon: LineChart,
    points: [
      "Track employment rates and time-to-hire.",
      "Analyze skill gaps from employer input.",
      "Generate accreditation-ready reports.",
    ],
    cta: "View Analytics",
    route: "/department/dashboard",
    tint: "text-astu-green bg-astu-green/10",
  },
];

const navSections = [
  { label: "Home", id: "home" },
  { label: "Stakeholders", id: "stakeholders" },
  { label: "Impact", id: "impact" },
  { label: "Gallery", id: "gallery" },
  { label: "Proposal", id: "proposal" },
  { label: "Community", id: "community" },
  { label: "Events", id: "events" },
];

const searchItems = [
  { label: "Go to Stakeholders section", type: "section", id: "stakeholders" },
  { label: "Go to Impact section", type: "section", id: "impact" },
  { label: "Go to Gallery section", type: "section", id: "gallery" },
  { label: "Go to Proposal section", type: "section", id: "proposal" },
  { label: "Go to Community section", type: "section", id: "community" },
  { label: "Go to Events section", type: "section", id: "events" },
  { label: "Open Alumni Portal", type: "route", route: "/alumni/dashboard" },
  { label: "Open Employer Portal", type: "route", route: "/employer/dashboard" },
  { label: "Open Registrar Portal", type: "route", route: "/registrar/dashboard" },
  { label: "Open Department Portal", type: "route", route: "/department/dashboard" },
  { label: "Open Admin Portal", type: "route", route: "/admin/dashboard" },
];

const communityPosts = [
  {
    name: "Abebe Yosef",
    role: "Software Engineer",
    text: "I landed my new role after using ASTU-AMS job matching and mentorship support. Thank you ASTU community.",
  },
  {
    name: "Bekele Kebede",
    role: "Employer Partner",
    text: "Hiring from ASTU-AMS has been efficient. We found strong engineering candidates with the right practical skills.",
  },
];

const events = [
  {
    title: "ASTU Annual Tech Career Expo",
    date: "June 30, 2026",
    location: "Main Campus",
    image:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Class of 2014 Decade Reunion",
    date: "July 28, 2026",
    location: "Networking Hall",
    image:
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
  },
];

const galleryImages = [
  { src: gallery1, title: "ASTU Main Campus" },
  { src: gallery2, title: "Innovation and Collaboration" },
  { src: gallery3, title: "ASTU Alumni Identity" },
];

const proposalBlocks = [
  {
    title: "Background & Rationale",
    icon: ShieldCheck,
    points: [
      "Centralize fragmented alumni data across registrar and departments.",
      "Provide verified tracer data for ETA and accreditation agencies.",
      "Close curriculum-industry mismatch with real employer insights.",
    ],
  },
  {
    title: "Project Objectives",
    icon: Target,
    points: [
      "Integrate registrar and ERP data into one digital ecosystem.",
      "Automate 6, 12, and 24-month longitudinal tracer tracking.",
      "Deliver mentorship, job board, and digital document services.",
    ],
  },
  {
    title: "Expected Outcomes",
    icon: BarChart3,
    points: [
      "90%+ graduate tracking accuracy with audit-ready reports.",
      "Department-level skill-gap analytics for curriculum upgrades.",
      "Lower registrar bottlenecks through workflow automation.",
    ],
  },
  {
    title: "Methodology & Sprints",
    icon: Layers,
    points: [
      "Agile SDLC with iterative two-week sprint cycles.",
      "Pilot rollout with graduates and employer partners.",
      "Capacity building for registrar and department staff.",
    ],
  },
  {
    title: "Technical Scope",
    icon: Globe,
    points: [
      "Web platform with secure API layer and role-based access.",
      "Tracer engine, employer portal, analytics, and SIS integration.",
      "Extensible integration for Telebirr, email, and reporting tools.",
    ],
  },
  {
    title: "Sustainability Plan",
    icon: Leaf,
    points: [
      "ICT handover, annual budgeting, and regular security audits.",
      "Student-led DevOps internship for ongoing modernization.",
      "Institutional policies to keep tracer data continuously updated.",
    ],
  },
];

import astuLogo from "../assets/logos/astu-icon.jpeg";
import gallery1 from "../assets/imgs/astu-building.jpg";
import gallery2 from "../assets/imgs/campus-2.jpeg";
import gallery3 from "../assets/imgs/astu-logo.jpeg";

export default function HomePage() {
  const navigate = useNavigate();
  const searchWrapRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const filteredSearch = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }

    return searchItems
      .filter((item) => item.label.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 6);
  }, [searchQuery]);

  const goToSection = (id) => {
    const node = document.getElementById(id);
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "start" });
      setIsMobileNavOpen(false);
    }
  };

  const handleSearchSelect = (item) => {
    setSearchQuery("");
    setIsSearchOpen(false);
    if (item.type === "section") {
      goToSection(item.id);
      return;
    }

    if (item.type === "route") {
      navigate(item.route);
    }
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter" && filteredSearch.length > 0) {
      handleSearchSelect(filteredSearch[0]);
    }
  };

  const handleImageError = (event) => {
    event.currentTarget.src = FALLBACK_IMAGE;
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.15 }
    );

    const nodes = document.querySelectorAll(".reveal");
    nodes.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-30% 0px -50% 0px", threshold: 0.1 }
    );

    navSections.forEach((section) => {
      const node = document.getElementById(section.id);
      if (node) {
        sectionObserver.observe(node);
      }
    });

    return () => sectionObserver.disconnect();
  }, []);

  useEffect(() => {
    const closeOnOutside = (event) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener("click", closeOnOutside);
    return () => window.removeEventListener("click", closeOnOutside);
  }, []);

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <header className="sticky top-0 z-50 border-b border-outline-variant bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between gap-4 px-4 md:px-8">
          <Link to="/" className="flex min-w-fit items-center gap-3">
            <div className="rounded-full border border-outline-variant bg-white p-1">
              <img src={astuLogo} alt="ASTU logo" className="h-9 w-9 rounded-full object-cover" />
            </div>
            <div>
              <p className="text-base font-bold leading-none text-astu-navy md:text-lg">ASTU-AMS</p>
              <p className="text-xs uppercase tracking-[0.18em] text-on-surface-variant">Alumni Ecosystem</p>
            </div>
          </Link>

          <div ref={searchWrapRef} className="relative hidden flex-1 max-w-xl md:block">
            <Search className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
            <input
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              onKeyDown={handleSearchKeyDown}
              className="w-full rounded-md border border-outline-variant bg-surface-container-low py-2 pl-9 pr-3 text-sm focus:border-astu-navy focus:outline-none"
              placeholder="Search sections or portals..."
              type="text"
            />

            {isSearchOpen && filteredSearch.length > 0 ? (
              <div className="absolute top-12 w-full overflow-hidden rounded-md border border-outline-variant bg-white shadow-lg">
                {filteredSearch.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleSearchSelect(item)}
                    className="flex w-full items-center justify-between border-b border-outline-variant px-3 py-2 text-left text-sm last:border-b-0 hover:bg-surface-container-low"
                  >
                    <span>{item.label}</span>
                    <ChevronRight className="h-4 w-4 text-on-surface-variant" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <nav className="hidden items-center gap-6 xl:flex">
            {navSections.map((item) => (
              <button
                key={item.id}
                className={`text-xs font-semibold transition-colors ${
                  activeSection === item.id
                    ? "text-astu-navy"
                    : "text-on-surface-variant hover:text-astu-navy"
                }`}
                onClick={() => goToSection(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              aria-label="notifications"
              className="rounded-full p-2.5 hover:bg-surface-container-low"
              onClick={() => navigate("/alumni/dashboard")}
            >
              <Bell className="h-5 w-5" />
            </button>
            <button
              aria-label="mobile navigation"
              className="rounded-full p-2.5 hover:bg-surface-container-low xl:hidden"
              onClick={() => setIsMobileNavOpen((prev) => !prev)}
            >
              {isMobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <button
              aria-label="profile"
              className="rounded-full border border-outline-variant p-2 hover:bg-surface-container-low"
              onClick={() => navigate("/alumni/dashboard")}
            >
              <CircleUserRound className="h-5 w-5" />
            </button>
          </div>
        </div>

        {isMobileNavOpen ? (
          <div className="border-t border-outline-variant bg-white px-4 py-4 xl:hidden">
            <div className="space-y-2">
              {navSections.map((item) => (
                <button
                  key={item.id}
                  onClick={() => goToSection(item.id)}
                  className="block w-full rounded-md border border-outline-variant px-3 py-2 text-left text-sm font-semibold text-astu-navy"
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <button
                onClick={() => navigate("/alumni/dashboard")}
                className="rounded-md bg-astu-navy px-3 py-2 text-sm font-semibold text-white"
              >
                Alumni Portal
              </button>
              <button
                onClick={() => navigate("/employer/dashboard")}
                className="rounded-md border border-outline-variant px-3 py-2 text-sm font-semibold"
              >
                Employer Portal
              </button>
            </div>
          </div>
        ) : null}
      </header>

      <main id="home">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <img
              alt="ASTU campus"
              className="h-full w-full object-cover"
              src="https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1800&q=80"
              onError={handleImageError}
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,51,102,0.84),rgba(0,30,64,0.94))]" />
          </div>

          <div className="relative z-10 mx-auto max-w-[1440px] px-4 py-20 md:px-8 md:py-28 lg:py-32">
            <div className="max-w-3xl reveal">
              <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
                Connecting ASTU&apos;s
                <br />
                Excellence to the <span className="text-astu-green">Global Industry</span>
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-100 md:text-base">
                A unified gateway for alumni, employers, and departments to foster professional growth,
                talent acquisition, and academic innovation at Adama Science and Technology University.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  className="inline-flex items-center gap-2 rounded-md bg-astu-red px-6 py-3 text-sm font-semibold text-white hover:brightness-110"
                  onClick={() => navigate("/alumni/dashboard")}
                >
                  Alumni Portal Login
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  className="inline-flex items-center gap-2 rounded-md border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20"
                  onClick={() => navigate("/employer/dashboard")}
                >
                  Employer Partnership
                  <Handshake className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="relative z-20 mx-auto -mt-12 mb-16 max-w-[1440px] px-4 md:-mt-16 md:px-8">
          <div className="grid overflow-hidden rounded-xl border border-outline-variant bg-white shadow-xl md:grid-cols-3">
            <article className="flex flex-col items-center gap-3 border-b border-outline-variant p-8 text-center md:border-b-0 md:border-r">
              <div className="rounded-full bg-astu-navy/10 p-3 text-astu-navy">
                <Users className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold text-astu-navy">24,000+</h2>
              <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Global ASTU Alumni</p>
            </article>
            <article className="flex flex-col items-center gap-3 border-b border-outline-variant p-8 text-center md:border-b-0 md:border-r">
              <div className="rounded-full bg-astu-red/10 p-3 text-astu-red">
                <Building2 className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold text-astu-navy">500+</h2>
              <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Partner Organizations</p>
            </article>
            <article className="flex flex-col items-center gap-3 p-8 text-center">
              <div className="rounded-full bg-astu-green/10 p-3 text-astu-green">
                <LineChart className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold text-astu-navy">87%</h2>
              <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Employment Rate</p>
            </article>
          </div>
        </section>

        <section id="stakeholders" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="mb-10 text-center reveal">
            <h3 className="text-2xl font-bold text-astu-navy md:text-3xl">A Platform for Every Stakeholder</h3>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-on-surface-variant">
              Specialized tools to empower our alumni network, industry collaboration, and data-driven academic excellence.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {stakeholders.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="reveal rounded-xl border border-outline-variant bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className={`mb-5 inline-flex rounded-lg p-3 ${item.tint}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="mb-4 text-lg font-semibold text-astu-navy">{item.title}</h4>
                  <ul className="space-y-3">
                    {item.points.map((point) => (
                      <li key={point} className="flex items-start gap-2 text-sm text-on-surface-variant">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-astu-green" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-astu-navy hover:text-astu-red"
                    onClick={() => navigate(item.route)}
                  >
                    {item.cta}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <section id="impact" className="mx-auto grid max-w-[1440px] gap-8 px-4 py-12 md:grid-cols-2 md:px-8 md:py-16">
          <article className="reveal">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-astu-red">Industry-Campus Bridge</p>
            <h3 className="mt-2 text-3xl font-bold text-astu-navy">Nurturing Innovation in Modern Laboratories</h3>
            <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
              ASTU combines rigorous engineering education with practical lab training. Through ASTU-AMS,
              graduate outcomes and employer feedback feed directly into curriculum updates.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <p className="text-3xl font-bold text-astu-navy">12+</p>
                <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Research Centers</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-astu-navy">80+</p>
                <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Industry Partners</p>
              </div>
            </div>
            <button
              className="mt-7 rounded-md bg-astu-navy px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110"
              onClick={() => navigate("/department/dashboard")}
            >
              Explore Campus Life
            </button>
          </article>

          <article className="reveal">
            <img
              alt="Students in modern lab"
              className="h-full min-h-[280px] w-full rounded-xl object-cover shadow-lg"
              src="https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1200&q=80"
              onError={handleImageError}
            />
          </article>
        </section>

        <section id="gallery" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="mb-10 text-center reveal">
            <h3 className="text-2xl font-bold text-astu-navy md:text-3xl">ASTU Gallery</h3>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-on-surface-variant">
              Visual highlights from ASTU campus life, innovation spaces, and alumni identity.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {galleryImages.map((item) => (
              <article key={item.title} className="reveal overflow-hidden rounded-xl border border-outline-variant bg-white shadow-sm">
                <img src={item.src} alt={item.title} className="h-64 w-full object-cover transition-all duration-500 hover:scale-105" onError={handleImageError} />
                <div className="p-4">
                  <h4 className="text-sm font-semibold text-astu-navy">{item.title}</h4>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="community" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="mb-10 text-center reveal">
            <h3 className="text-2xl font-bold text-astu-navy md:text-3xl">Community Feed</h3>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-on-surface-variant">
              Stay connected with alumni stories, employer announcements, and career opportunities.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <div className="reveal rounded-xl border border-outline-variant bg-white p-4">
                <div className="mb-3 flex items-center gap-2 rounded-md bg-surface-container-low px-3 py-2 text-xs text-on-surface-variant">
                  <BookOpen className="h-4 w-4" />
                  Share an update with the ASTU community...
                </div>
                <div className="flex gap-2">
                  <button className="rounded-md border border-outline-variant px-3 py-1.5 text-xs font-medium hover:bg-surface-container-low">Media</button>
                  <button className="rounded-md border border-outline-variant px-3 py-1.5 text-xs font-medium hover:bg-surface-container-low">Event</button>
                  <button className="rounded-md border border-outline-variant px-3 py-1.5 text-xs font-medium hover:bg-surface-container-low">Article</button>
                </div>
              </div>

              {communityPosts.map((post) => (
                <article key={post.name} className="reveal rounded-xl border border-outline-variant bg-white p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-astu-navy">{post.name}</h4>
                      <p className="text-xs text-on-surface-variant">{post.role}</p>
                    </div>
                    <button className="rounded-md px-2 py-1 text-xs text-on-surface-variant hover:bg-surface-container-low">...</button>
                  </div>
                  <p className="text-sm text-on-surface-variant">{post.text}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button className="rounded-md border border-outline-variant px-3 py-1.5 text-xs hover:bg-surface-container-low">Like</button>
                    <button className="rounded-md border border-outline-variant px-3 py-1.5 text-xs hover:bg-surface-container-low">Comment</button>
                    <button className="rounded-md border border-outline-variant px-3 py-1.5 text-xs hover:bg-surface-container-low">Share</button>
                    <button
                      className="rounded-md border border-outline-variant px-3 py-1.5 text-xs hover:bg-surface-container-low"
                      onClick={() => navigate("/alumni/dashboard")}
                    >
                      View Profile
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <aside className="space-y-4">
              <article className="reveal rounded-xl border border-outline-variant bg-white p-4">
                <h4 className="text-sm font-semibold text-astu-navy">Recommended Connections</h4>
                <div className="mt-3 space-y-3 text-sm">
                  <button className="flex w-full items-center justify-between rounded-md border border-outline-variant px-3 py-2 text-left hover:bg-surface-container-low">
                    <span>Meta Finetec PLC</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button className="flex w-full items-center justify-between rounded-md border border-outline-variant px-3 py-2 text-left hover:bg-surface-container-low">
                    <span>Summit Devs</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </article>

              <article className="reveal rounded-xl border border-outline-variant bg-white p-4">
                <h4 className="text-sm font-semibold text-astu-navy">ASTU Trending Topics</h4>
                <ul className="mt-3 space-y-2 text-sm text-on-surface-variant">
                  <li>#EngineeringCareers</li>
                  <li>#TracerStudy2026</li>
                  <li>#ASTUInnovation</li>
                </ul>
                <button
                  className="mt-4 rounded-md border border-outline-variant px-3 py-1.5 text-xs hover:bg-surface-container-low"
                  onClick={() => navigate("/department/dashboard")}
                >
                  View Insights
                </button>
              </article>
            </aside>
          </div>
        </section>

        <section className="bg-gradient-to-r from-astu-navy to-primary-container py-14 md:py-20">
          <div className="mx-auto grid max-w-[1440px] gap-8 px-4 md:grid-cols-2 md:px-8">
            <article className="reveal text-white">
              <p className="inline-flex rounded-full bg-astu-red px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]">
                Quality Assurance
              </p>
              <h3 className="mt-4 text-3xl font-bold">Data-Driven Accreditation & Excellence</h3>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-200">
                ASTU-AMS provides verified tracer data, employment analytics, and employer feedback required
                by accreditation agencies and university management.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-white/20 bg-white/5 p-4">
                  <Globe className="mb-2 h-5 w-5 text-astu-green" />
                  <h4 className="text-sm font-semibold">Global Accreditation</h4>
                  <p className="mt-1 text-xs text-slate-300">Build transparent, audited institutional reports.</p>
                </div>
                <div className="rounded-lg border border-white/20 bg-white/5 p-4">
                  <Handshake className="mb-2 h-5 w-5 text-astu-green" />
                  <h4 className="text-sm font-semibold">Market Alignment</h4>
                  <p className="mt-1 text-xs text-slate-300">Align curriculum with industry expectations.</p>
                </div>
              </div>
              <button
                className="mt-6 rounded-md bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-astu-navy hover:bg-slate-100"
                onClick={() => navigate("/department/dashboard")}
              >
                Participate in Impact Study
              </button>
            </article>

            <article className="reveal">
              <img
                alt="Analytics dashboard"
                className="h-full min-h-[260px] w-full rounded-xl border border-white/10 object-cover shadow-2xl"
                src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80"
                onError={handleImageError}
              />
            </article>
          </div>
        </section>

        <section id="events" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="reveal mb-8 flex items-end justify-between">
            <div>
              <h3 className="text-2xl font-bold text-astu-navy md:text-3xl">Upcoming Alumni Events</h3>
              <p className="mt-2 text-sm text-on-surface-variant">Networking, learning, and professional growth opportunities.</p>
            </div>
            <button
              className="hidden rounded-md border border-outline-variant px-3 py-2 text-xs font-semibold hover:bg-surface-container-low md:block"
              onClick={() => navigate("/alumni/dashboard")}
            >
              See All Events
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {events.map((event) => (
              <article key={event.title} className="reveal overflow-hidden rounded-xl border border-outline-variant bg-white shadow-sm">
                <img
                  alt={event.title}
                  className="h-52 w-full object-cover"
                  src={event.image}
                  onError={handleImageError}
                />
                <div className="p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-astu-red">Career Development</p>
                  <h4 className="mt-2 text-lg font-semibold text-astu-navy">{event.title}</h4>
                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-on-surface-variant">
                    <p className="inline-flex items-center gap-1">
                      <CalendarDays className="h-4 w-4" />
                      {event.date}
                    </p>
                    <p>{event.location}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      className="rounded-md bg-astu-navy px-4 py-2 text-xs font-semibold text-white hover:brightness-110"
                      onClick={() => navigate("/alumni/dashboard")}
                    >
                      Register
                    </button>
                    <button className="rounded-md border border-outline-variant px-4 py-2 text-xs font-semibold hover:bg-surface-container-low">
                      Learn More
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-[#1f4f86] bg-[#003366] py-10 text-white">
        <div className="mx-auto grid max-w-[1440px] gap-8 px-4 md:grid-cols-4 md:px-8">
          <div>
            <h5 className="text-sm font-bold text-[#FFD700]">ASTU-AMS</h5>
            <p className="mt-2 text-xs text-slate-200">
              The ASTU Alumni Management System connects graduates, employers, and departments in one platform.
            </p>
            <div className="mt-4 flex gap-2">
              <button className="rounded-md border border-[#FFD700]/50 px-2 py-1 text-xs text-[#FFD700] transition-colors hover:bg-[#FFD700] hover:text-[#003366]">FB</button>
              <button className="rounded-md border border-[#FFD700]/50 px-2 py-1 text-xs text-[#FFD700] transition-colors hover:bg-[#FFD700] hover:text-[#003366]">X</button>
              <button className="rounded-md border border-[#FFD700]/50 px-2 py-1 text-xs text-[#FFD700] transition-colors hover:bg-[#FFD700] hover:text-[#003366]">IN</button>
            </div>
          </div>

          <div>
            <h6 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#FFD700]">Resources</h6>
            <ul className="mt-3 space-y-2 text-xs text-slate-200">
              <li><button className="transition-colors hover:text-[#FFD700]" onClick={() => navigate("/alumni/dashboard")}>Career Portal</button></li>
              <li><button className="transition-colors hover:text-[#FFD700]" onClick={() => navigate("/alumni/dashboard")}>Tracer Survey</button></li>
              <li><button className="transition-colors hover:text-[#FFD700]" onClick={() => navigate("/alumni/dashboard")}>Mentorship</button></li>
            </ul>
          </div>

          <div>
            <h6 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#FFD700]">University</h6>
            <ul className="mt-3 space-y-2 text-xs text-slate-200">
              <li><button className="transition-colors hover:text-[#FFD700]">Official Website</button></li>
              <li><button className="transition-colors hover:text-[#FFD700]">Research Centers</button></li>
              <li><button className="transition-colors hover:text-[#FFD700]">Accreditation</button></li>
            </ul>
          </div>

          <div>
            <h6 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#FFD700]">Support</h6>
            <ul className="mt-3 space-y-2 text-xs text-slate-200">
              <li><button className="transition-colors hover:text-[#FFD700]" onClick={() => navigate("/registrar/dashboard")}>Help Center</button></li>
              <li><button className="transition-colors hover:text-[#FFD700]" onClick={() => navigate("/admin/dashboard")}>Privacy Policy</button></li>
              <li><button className="transition-colors hover:text-[#FFD700]" onClick={() => navigate("/registrar/dashboard")}>Contact Us</button></li>
            </ul>
          </div>
        </div>

        <div className="mx-auto mt-8 flex max-w-[1440px] flex-col justify-between gap-2 border-t border-[#1f4f86] px-4 pt-5 text-xs text-slate-300 md:flex-row md:px-8">
          <p>© 2026 Adama Science and Technology University. All rights reserved.</p>
          <p className="text-[#FFD700]">Designed for ASTU ICT and Tracer Study Coordination.</p>
        </div>
      </footer>
    </div>
  );
}
