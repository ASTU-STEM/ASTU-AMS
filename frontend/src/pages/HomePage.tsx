import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Globe,
  Handshake,
  Leaf,
  Layers,
  LineChart,
  ShieldCheck,
  Target,
  Users,
  BarChart3,
  FileCheck2,
  LockKeyhole,
  MessageSquareText,
} from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import ChatBot from "../components/ChatBot";

import astuLogo from "../assets/logos/astu-icon.jpeg";
import gallery1 from "../assets/imgs/astu-building.jpg";
import gallery2 from "../assets/imgs/campus-2.jpeg";
import gallery3 from "../assets/imgs/astu-logo.jpeg";

const FALLBACK_IMAGE = "/images/fallback-campus.svg";

const stakeholders = [
  {
    title: "Alumni",
    icon: Users,
    points: [
      "Create and maintain your professional profile.",
      "Access verified job listings and internship opportunities.",
      "Complete tracer surveys to guide curriculum development.",
      "Mentor current students and connect with peers.",
    ],
    cta: "Access Alumni Portal",
    route: "/alumni/dashboard",
    tint: "text-astu-navy bg-astu-navy/10",
  },
  {
    title: "Employers",
    icon: Briefcase,
    points: [
      "Post employment opportunities for ASTU graduates.",
      "Search alumni by expertise, skills, and department.",
      "Provide feedback to enhance curriculum relevance.",
    ],
    cta: "Partner With ASTU",
    route: "/employer/dashboard",
    tint: "text-astu-red bg-astu-red/10",
  },
  {
    title: "Departments",
    icon: LineChart,
    points: [
      "Monitor graduate employment outcomes and metrics.",
      "Identify skill gaps through employer analytics.",
      "Generate accreditation-ready reports.",
    ],
    cta: "View Department Analytics",
    route: "/department/dashboard",
    tint: "text-astu-green bg-astu-green/10",
  },
  {
    title: "Registrar",
    icon: FileCheck2,
    points: [
      "Validate alumni credentials against SIS records.",
      "Process transcript and certificate requests.",
      "Send tracer study reminders and audit notifications.",
    ],
    cta: "Open Registrar Portal",
    route: "/registrar/dashboard",
    tint: "text-[#B87900] bg-[#E8A020]/15",
  },
  {
    title: "Administrator",
    icon: LockKeyhole,
    points: [
      "Manage users, roles, and department records.",
      "Monitor system logs, backups, and security protocols.",
      "Oversee institutional analytics and accreditation reports.",
    ],
    cta: "Admin Console",
    route: "/admin/dashboard",
    tint: "text-violet-700 bg-violet-100",
  },
];

const navSections = [
  { label: "Home", id: "home" },
  { label: "Stakeholders", id: "stakeholders" },
  { label: "Impact", id: "impact" },
  { label: "Gallery", id: "gallery" },
  { label: "Community", id: "community" },
  { label: "Events", id: "events" },
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

export default function HomePage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("home");
  const [user, setUser] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = useMemo(() => [
    {
      image: gallery1, // real astu-building.jpg
      tagline: "Quality Assurance & Accreditation",
      title: "Connecting ASTU's Excellence to the Global Industry",
      description: "A unified gateway for alumni, employers, and departments to foster professional growth, talent acquisition, and academic innovation at Adama Science and Technology University.",
    },
    {
      image: gallery2, // real campus-2.jpeg
      tagline: "Enterprise Networking & Placement",
      title: "Empowering ASTU Graduates in Modern Workspaces",
      description: "Discover corporate partners, publish practical career openings, and track your employment outcomes. Building bridges between classroom theory and real-world placement.",
    },
    {
      image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1800&q=80", // third beautiful campus photo
      tagline: "Academic Innovation & Tracer Feedback",
      title: "Coordinating Strategic Tracer Studies & Skill Gaps",
      description: "Enabling department heads and partner companies to identify technological skill gaps directly from the workforce, securing university accreditation outcomes.",
    }
  ], []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const getDashboardRoute = (role: string) => {
    switch (role) {
      case 'ALUMNI': return '/alumni/dashboard';
      case 'EMPLOYER': return '/employer/dashboard';
      case 'REGISTRAR': return '/registrar/dashboard';
      case 'DEPARTMENT_HEAD': return '/department/dashboard';
      case 'ADMIN': return '/admin/dashboard';
      default: return '/';
    }
  };

  useEffect(() => {
    const checkUserSession = () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          setUser(null);
        }
      } catch (e) {
        console.error("Failed to parse user session", e);
      }
    };

    checkUserSession();
    window.addEventListener("storage", checkUserSession);
    return () => window.removeEventListener("storage", checkUserSession);
  }, []);

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
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

  // Removed redundant header listeners (now handled natively inside Navbar component)

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Navbar activeSection={activeSection} />

      <main id="home">
        <section className="relative overflow-hidden h-[580px] md:h-[620px] lg:h-[680px] bg-slate-950">
          {/* Background Slides */}
          <div className="absolute inset-0 w-full h-full">
            {slides.map((slide, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                  idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                {/* Background image - zoomed out for clear visibility */}
                <img
                  alt={slide.title}
                  className="h-full w-full object-cover object-[center_30%]"
                  src={slide.image}
                  onError={handleImageError}
                />
                {/* Gentle overlay for rich aesthetic with high photo transparency */}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,25,50,0.55),rgba(0,10,25,0.78))]" />
              </div>
            ))}
          </div>

          {/* Spacious clean text - exactly like the original large layout */}
          <div className="relative z-20 mx-auto flex h-full max-w-[1440px] items-center px-4 py-20 md:px-8 md:py-28 lg:py-32">
            <div className="max-w-3xl space-y-6">
              <span className="inline-block rounded-full bg-astu-red px-4 py-1 text-xs font-bold uppercase tracking-widest text-white shadow-md">
                {slides[currentSlide].tagline}
              </span>
              <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
                {slides[currentSlide].title.split(" to the ")[0]}
                <br />
                {slides[currentSlide].title.includes(" to the ") ? (
                  <>
                    to the <span className="text-astu-green">{slides[currentSlide].title.split(" to the ")[1]}</span>
                  </>
                ) : (
                  slides[currentSlide].title
                )}
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-100 md:text-base">
                {slides[currentSlide].description}
              </p>
              
              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  className="inline-flex items-center gap-2 rounded-md bg-astu-red px-6 py-3 text-sm font-semibold text-white hover:brightness-110 transition-all shadow"
                  onClick={() => {
                    if (user) {
                      navigate(getDashboardRoute(user.role));
                    } else {
                      navigate("/login");
                    }
                  }}
                >
                  {user ? "Go to My Dashboard" : "Alumni Portal Login"}
                  <ChevronRight className="h-5 w-5" />
                </button>
                <button
                  className="inline-flex items-center gap-2 rounded-md border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-all"
                  onClick={() => {
                    if (user) {
                      navigate(getDashboardRoute(user.role));
                    } else {
                      navigate("/login");
                    }
                  }}
                >
                  {user ? "Employer Services" : "Employer Partnership"}
                  <Handshake className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Left/Right navigation arrow buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 z-35 -translate-y-1/2 rounded-full border border-white/20 bg-slate-900/40 p-2.5 text-white hover:bg-astu-navy/80 hover:scale-105 transition-all duration-200 backdrop-blur-sm hidden sm:block shadow"
            aria-label="Previous slide"
          >
            <ChevronRight className="h-5 w-5 rotate-180" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 z-35 -translate-y-1/2 rounded-full border border-white/20 bg-slate-900/40 p-2.5 text-white hover:bg-astu-navy/80 hover:scale-105 transition-all duration-200 backdrop-blur-sm hidden sm:block shadow"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Bottom active slide indicator dots */}
          <div className="absolute bottom-6 left-1/2 z-35 flex -translate-x-1/2 gap-2.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  idx === currentSlide ? "w-6 bg-[#FFD700]" : "w-2.5 bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </section>

        <section className="relative z-20 mx-auto -mt-12 mb-16 max-w-[1440px] px-4 md:-mt-16 md:px-8">
          <div className="grid overflow-hidden rounded-xl border border-outline-variant bg-white shadow-xl md:grid-cols-5">
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
            <article className="flex flex-col items-center gap-3 border-t border-outline-variant p-8 text-center md:border-l md:border-t-0">
              <div className="rounded-full bg-[#E8A020]/15 p-3 text-[#B87900]">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold text-astu-navy">6K+</h2>
              <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Digital Requests</p>
            </article>
            <article className="flex flex-col items-center gap-3 border-t border-outline-variant p-8 text-center md:border-l md:border-t-0">
              <div className="rounded-full bg-violet-100 p-3 text-violet-700">
                <MessageSquareText className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold text-astu-navy">24/7</h2>
              <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Engagement Hub</p>
            </article>
          </div>
        </section>

        <section id="stakeholders" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="mb-10 text-center reveal">
            <h3 className="text-2xl font-bold text-astu-navy md:text-3xl">Stakeholder Portals</h3>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-on-surface-variant">
              Dedicated interfaces for alumni, employers, departments, registrar, and administrators.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {stakeholders.map((item) => {
              const Icon = item.icon;
              return (
<article
                    key={item.title}
                    className="reveal rounded-xl border border-outline-variant bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className={`mb-5 inline-flex rounded-lg p-3.5 ${item.tint}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h4 className="mb-4 text-lg font-semibold text-astu-navy">{item.title}</h4>
                  <ul className="space-y-3">
                    {item.points.map((point) => (
                      <li key={point} className="flex items-start gap-2 text-sm text-on-surface-variant">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-astu-green" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-astu-navy hover:text-astu-red"
                    onClick={() => {
                      if (user) {
                        navigate(item.route);
                      } else {
                        toast("Please log in to access this portal.", { icon: "🔒" });
                        navigate("/login");
                      }
                    }}
                  >
                    {item.cta}
                    <ChevronRight className="h-5 w-5" />
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
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <button className="flex w-full items-center justify-between rounded-md border border-outline-variant px-3 py-2 text-left hover:bg-surface-container-low">
                    <span>Summit Devs</span>
                    <ChevronRight className="h-5 w-5" />
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

      <footer className="border-t-2 border-astu-green/30 bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 py-16 text-slate-300">
        <div className="mx-auto max-w-[1440px] px-4 md:px-8 space-y-12">
          
          {/* Top Panel: Newsletter Registration */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-10 border-b border-white/5">
            <div className="max-w-md">
              <h5 className="text-base font-bold text-white uppercase tracking-wider">Stay Connected with ASTU</h5>
              <p className="text-xs text-slate-400 mt-1">Get updates on annual reunions, tech career expos, and graduate employment reports.</p>
            </div>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                toast.success('Thank you! You are subscribed to ASTU Alumni newsletter.');
                (e.target as HTMLFormElement).reset();
              }}
              className="flex w-full lg:w-auto max-w-md gap-2"
            >
              <input
                type="email"
                placeholder="Enter email for campus news..."
                className="w-full lg:w-64 text-xs px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD700]/30 text-white"
                required
              />
              <button
                type="submit"
                className="px-5 py-3 bg-[#FFD700] hover:bg-[#FFD700]/95 text-indigo-950 font-bold text-xs rounded-xl hover:scale-105 transition-all shadow-md whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>

          {/* Middle Panel: Four Column Information Links */}
          <div className="grid gap-10 md:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img
                  alt="ASTU Official Emblem"
                  className="h-12 w-12 object-contain rounded-xl bg-white/10 p-1.5 border border-white/10 shadow-md"
                  src={astuLogo}
                />
                <div>
                  <h5 className="text-lg font-black text-white tracking-wider uppercase">ASTU-AMS</h5>
                  <p className="text-[10px] text-astu-green uppercase tracking-widest font-extrabold">Alumni Network</p>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-slate-400">
                Connecting graduates, corporate employers, and department heads in one unified ecosystem. Improving national quality audits and modernizing student career placements.
              </p>
              <div className="flex gap-2 pt-2">
                <button className="rounded-lg border border-white/10 hover:border-[#FFD700] px-3.5 py-2 text-[10px] font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-all">Facebook</button>
                <button className="rounded-lg border border-white/10 hover:border-[#FFD700] px-3.5 py-2 text-[10px] font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-all">Twitter</button>
                <button className="rounded-lg border border-white/10 hover:border-[#FFD700] px-3.5 py-2 text-[10px] font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-all">LinkedIn</button>
              </div>
            </div>

            <div>
              <h6 className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#FFD700] border-b border-white/10 pb-2 mb-4">Resources & Portals</h6>
              <ul className="space-y-3 text-xs text-slate-400">
                <li>
                  <button
                    className="flex items-center gap-1 transition-all duration-300 hover:text-white hover:translate-x-1 text-left"
                    onClick={() => navigate(user ? getDashboardRoute(user.role) : "/login")}
                  >
                    Career Placement Portal
                  </button>
                </li>
                <li>
                  <button
                    className="flex items-center gap-1 transition-all duration-300 hover:text-white hover:translate-x-1 text-left"
                    onClick={() => navigate(user ? getDashboardRoute(user.role) : "/login")}
                  >
                    Tracer Survey Hub
                  </button>
                </li>
                <li>
                  <button
                    className="flex items-center gap-1 transition-all duration-300 hover:text-white hover:translate-x-1 text-left"
                    onClick={() => navigate(user ? getDashboardRoute(user.role) : "/login")}
                  >
                    Mentorship Scheduling
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h6 className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#FFD700] border-b border-white/10 pb-2 mb-4">Official Contact Details</h6>
              <ul className="space-y-3 text-xs text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-sm mt-0.5 text-astu-green">location_on</span>
                  <span>Adama, Oromia, Ethiopia</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-astu-green">phone</span>
                  <span>+251-221-110000</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-astu-green">mail</span>
                  <a href="mailto:alumni.office@astu.edu.et" className="hover:text-white transition-colors">alumni.office@astu.edu.et</a>
                </li>
              </ul>
            </div>

            <div>
              <h6 className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#FFD700] border-b border-white/10 pb-2 mb-4">Accreditation Support</h6>
              <ul className="space-y-3 text-xs text-slate-400">
                <li><button className="transition-all duration-300 hover:text-white hover:translate-x-1 text-left">Quality Assurance Deans</button></li>
                <li><button className="transition-all duration-300 hover:text-white hover:translate-x-1 text-left">Accreditation Outcomes</button></li>
                <li><button className="transition-all duration-300 hover:text-white hover:translate-x-1 text-left">Institutional Research</button></li>
              </ul>
            </div>
          </div>

          {/* Bottom Panel: Copyright and Back to Top button */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-white/5 pt-8 text-xs text-slate-500 font-semibold">
            <div className="flex flex-wrap items-center gap-3">
              <p>© {new Date().getFullYear()} Adama Science and Technology University. All rights reserved.</p>
              <span>&bull;</span>
              <p className="text-astu-green">Tracer Study & ICT Coordination</p>
            </div>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-1 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-slate-300 hover:text-white transition-all hover:scale-105"
            >
              Back to Top
              <span className="material-symbols-outlined text-sm">arrow_upward</span>
            </button>
          </div>

        </div>
      </footer>
      <ChatBot />
    </div>
  );
}
