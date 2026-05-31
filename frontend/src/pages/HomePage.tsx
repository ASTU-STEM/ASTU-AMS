import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  Globe,
  Handshake,
  Leaf,
  LineChart,
  ShieldCheck,
  Target,
  Users,
  BarChart3,
  Bell,
  FileCheck2,
  FileText,
  HelpCircle,
  Image,
  Library,
  LockKeyhole,
  MessageSquareText,
  MapPin,
  PlayCircle,
  Quote,
  Star,
  Trophy,
  UserRoundCheck,
  Wifi
} from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import ChatBot from "../components/ChatBot";

import astuLogo from "../assets/logos/astu-icon.jpeg";
import gallery1 from "../assets/imgs/astu-building.jpg";
import gallery2 from "../assets/imgs/campus-2.jpeg";
import gallery3 from "../assets/imgs/astu-logo.jpeg";
import arcImage from "../assets/images/arc.jpg";
import stateM from "../assets/images/State-M.jpg";
import gc7 from "../assets/images/gc7.jpg";
import electricLabs from "../assets/images/electriclabs.jpeg";

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
    route: "/alumni",
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
    route: "/employer",
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
    route: "/department",
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
    route: "/registrar",
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
    route: "/admin",
    tint: "text-violet-700 bg-violet-100",
  },
];

const navSections = [
  { label: "Home", id: "home" },
  { label: "Stakeholders", id: "stakeholders" },
  { label: "Impact", id: "impact" },
  { label: "Gallery", id: "gallery" },
  { label: "Quick Links", id: "quick-links" },
  { label: "Campuses", id: "campuses" },
  { label: "Announcements", id: "announcements" },
  { label: "Community", id: "community" },
  { label: "Events", id: "events" },
  { label: "Workshops", id: "workshops" },
  { label: "News", id: "news" },
  { label: "Success Stories", id: "success-stories" },
  { label: "FAQ", id: "faq" },
  { label: "Contact", id: "contact" }
];

const communityPosts = [
  {
    name: "Abebe Yosef",
    role: "Software Engineer",
    text: "I landed my new role after using ASTU-AMS job matching and mentorship support. Thank you ASTU community.",
    image: stateM,
  },
  {
    name: "Bekele Kebede",
    role: "Employer Partner",
    text: "Hiring from ASTU-AMS has been efficient. We found strong engineering candidates with the right practical skills.",
    image: gc7,
  },
  {
    name: "Helina Sileshi",
    role: "Mentor & Alumni",
    text: "Proud to mentor ASTU students through the AMS platform. The next generation of innovators is ready!",
    image: arcImage,
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

const workshops = [
  { title: "AI for Engineering Research", date: "June 14, 2026", seats: "120 seats", focus: "Research & Innovation" },
  { title: "CV Builder and Interview Lab", date: "June 20, 2026", seats: "80 seats", focus: "Career Readiness" },
  { title: "Startup Finance for Alumni", date: "July 4, 2026", seats: "60 seats", focus: "Entrepreneurship" },
];

const featuredAlumni = [
  { name: "Dr. Ruth Alemu", role: "AI Research Scientist", impact: "Published 18 applied AI papers and mentors ASTU research teams.", image: arcImage },
  { name: "Yonas Bekele", role: "Founder, GreenGrid Labs", impact: "Built a renewable-energy startup serving industrial campuses.", image: electricLabs },
  { name: "Kalkidan Tadesse", role: "Cloud Platform Lead", impact: "Leads enterprise cloud migration programs for regional partners.", image: stateM },
];

const featuredEmployers = [
  { name: "Ethio Telecom", area: "Telecom & Cloud", openings: "14 graduate roles" },
  { name: "Ethiopian Airlines", area: "Aviation Technology", openings: "8 internship tracks" },
  { name: "INSA", area: "Cybersecurity", openings: "6 research placements" },
  { name: "Huawei Ethiopia", area: "Network Engineering", openings: "11 certification paths" },
];

const partners = ["Ethio Telecom", "INSA", "Ethiopian Airlines", "Safaricom", "Huawei", "Commercial Bank of Ethiopia"];

const quickLinks = [
  { label: "Portal", detail: "Access dashboards and services", icon: LockKeyhole, route: "/login" },
  { label: "Library", detail: "Digital resources and research support", icon: Library, section: "research" },
  { label: "e-Learning", detail: "Training, workshops, and learning links", icon: Wifi, section: "workshops" },
  { label: "Campus Life", detail: "Events, facilities, and galleries", icon: Image, section: "campus-life" },
  { label: "Alumni", detail: "Directory, jobs, mentorship, and ID", icon: Users, route: "/alumni/dashboard" },
  { label: "Meet Employers", detail: "Partners, jobs, internships, and fairs", icon: Building2, route: "/employers" },
];

const announcements = [
  { title: "Tracer Study 2026 response window is open", date: "May 31, 2026", type: "Alumni Announcement" },
  { title: "Call for employer partners: campus recruitment week", date: "May 28, 2026", type: "Employer Announcement" },
  { title: "Graduate verification batch import schedule", date: "May 25, 2026", type: "Registrar Notice" },
  { title: "Workshop registration: AI for Engineering Research", date: "May 21, 2026", type: "Public Announcement" },
  { title: "Emergency contact and campus service directory updated", date: "May 18, 2026", type: "Internal Notice" },
];

const campusLifeCards = [
  { title: "Events and Activities", campus: "Main Campus", description: "Career expos, alumni reunions, workshops, chapter meetings, and community programs.", image: gallery2, action: "View Events" },
  { title: "Facilities", campus: "Innovation Spaces", description: "Laboratories, research centers, libraries, student services, and employer interview rooms.", image: electricLabs, action: "Explore Facilities" },
  { title: "ASTU Museums & Gallery", campus: "Campus Gallery", description: "Research showcases, graduation moments, campus photography, and public video archives.", image: arcImage, action: "View Gallery" },
];

const campuses = [
  { name: "Main Campus", description: "Central hub for alumni services, registrar workflows, and institutional engagement.", image: gallery1 },
  { name: "Engineering Labs", description: "Applied research, workshops, innovation programs, and industry-linked training.", image: electricLabs },
  { name: "Graduation & Events Hall", description: "Ceremonies, career fairs, alumni awards, and university achievement programs.", image: gc7 },
  { name: "Research Collaboration Center", description: "Research publications, industry projects, and department KPI evidence.", image: arcImage },
];

const faqItems = [
  { question: "Who can use ASTU-AMS?", answer: "Verified alumni, employers, registrar teams, departments, and system administrators each access role-specific services." },
  { question: "How are tracer studies used?", answer: "Responses support employment analytics, skill-gap reviews, curriculum updates, and accreditation evidence." },
  { question: "Can employers register events?", answer: "Employer partners can coordinate job posts, internships, campus recruitment events, interviews, and feedback reports." },
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
                className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
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
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 z-35 -translate-y-1/2 rounded-full border border-white/20 bg-slate-900/40 p-2.5 text-white hover:bg-astu-navy/80 hover:scale-105 transition-all duration-200 backdrop-blur-sm hidden sm:block shadow"
            aria-label="Next slide"
          >
            <ArrowRight className="h-5 w-5" />
          </button>

          {/* Bottom active slide indicator dots */}
          <div className="absolute bottom-6 left-1/2 z-35 flex -translate-x-1/2 gap-2.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${idx === currentSlide ? "w-6 bg-[#FFD700]" : "w-2.5 bg-white/40 hover:bg-white/60"
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

        <section id="quick-links" className="mx-auto max-w-[1440px] px-4 py-10 md:px-8">
          <div className="reveal mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-astu-red">Quick Links</p>
              <h3 className="mt-1 text-2xl font-bold text-astu-navy md:text-3xl">Essential ASTU-AMS Services</h3>
            </div>
            <button className="rounded-md border border-outline-variant px-3 py-2 text-xs font-semibold text-astu-navy hover:bg-surface-container-low">
              View all
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => {
                    if (link.section) {
                      document.getElementById(link.section)?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                    if (link.route) {
                      navigate(link.route);
                    }
                  }}
                  className="reveal rounded-xl border border-outline-variant bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-astu-navy/30 hover:shadow-md"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-astu-navy/10 text-astu-navy">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h4 className="mt-4 text-sm font-bold text-astu-navy">{link.label}</h4>
                  <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">{link.detail}</p>
                </button>
              );
            })}
          </div>
        </section>

        <section id="stakeholders" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="mb-10 text-center reveal">
            <h3 className="text-2xl font-bold text-astu-navy md:text-3xl">Stakeholder Portals</h3>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-on-surface-variant">
              Dedicated interfaces for alumni, employers, departments, registrar, and administrators.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {stakeholders.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="reveal rounded-xl border border-outline-variant bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className={`mb-4 inline-flex rounded-lg p-3 ${item.tint}`}>
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <h4 className="mb-3 text-base font-semibold text-astu-navy sm:text-lg">{item.title}</h4>
                  <ul className="space-y-2.5 text-sm text-on-surface-variant">
                    {item.points.map((point) => (
                      <li key={point} className="flex items-start gap-2">
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-astu-navy hover:text-astu-red"
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
              alt="ASTU Innovation Arc"
              className="h-full min-h-[280px] w-full rounded-xl object-cover shadow-lg"
              src={arcImage}
              onError={handleImageError}
            />
          </article>
        </section>

        <section id="campus-life" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="mb-8 text-center reveal">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-astu-red">Explore Life At ASTU</p>
            <h3 className="mt-2 text-2xl font-bold text-astu-navy md:text-3xl">Campus Life, Facilities, Events, and Galleries</h3>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-on-surface-variant">
              A public gateway for the same institutional experiences AAU highlights: events, facilities, campus activities, media galleries, and services.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {campusLifeCards.map((card) => (
              <article key={card.title} className="reveal overflow-hidden rounded-xl border border-outline-variant bg-white shadow-sm">
                <img src={card.image} alt={card.title} className="h-52 w-full object-cover" onError={handleImageError} />
                <div className="p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-astu-red">{card.campus}</p>
                  <h4 className="mt-2 text-lg font-semibold text-astu-navy">{card.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{card.description}</p>
                  <button className="mt-4 rounded-md border border-outline-variant px-3 py-2 text-xs font-semibold text-astu-navy hover:bg-surface-container-low">
                    {card.action}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="campuses" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="reveal mb-8 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-astu-red">Campuses</p>
              <h3 className="mt-2 text-2xl font-bold text-astu-navy md:text-3xl">Explore ASTU Spaces</h3>
            </div>
            <button className="rounded-md border border-outline-variant px-3 py-2 text-xs font-semibold text-astu-navy hover:bg-surface-container-low">
              View all
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {campuses.map((campus) => (
              <article key={campus.name} className="reveal overflow-hidden rounded-xl border border-outline-variant bg-white shadow-sm">
                <img src={campus.image} alt={campus.name} className="h-44 w-full object-cover" onError={handleImageError} />
                <div className="p-4">
                  <h4 className="text-sm font-semibold text-astu-navy">{campus.name}</h4>
                  <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">{campus.description}</p>
                  <button className="mt-3 text-xs font-semibold text-astu-red hover:underline">Explore</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="gallery" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="mb-10 text-center reveal">
            <h3 className="text-2xl font-bold text-astu-navy md:text-3xl">ASTU Gallery</h3>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-on-surface-variant">
              Visual highlights from ASTU campus life, innovation spaces, and alumni identity.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {galleryImages.map((item) => (
              <article key={item.title} className="reveal overflow-hidden rounded-xl border border-outline-variant bg-white shadow-sm">
                <img src={item.src} alt={item.title} className="h-48 w-full object-cover transition-all duration-500 hover:scale-105 sm:h-56 md:h-64" onError={handleImageError} />
                <div className="p-3 md:p-4">
                  <h4 className="text-sm font-semibold text-astu-navy">{item.title}</h4>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="video-gallery" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="reveal mb-8 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h3 className="text-2xl font-bold text-astu-navy sm:text-3xl">Video Gallery</h3>
              <p className="mt-2 text-sm text-on-surface-variant">Livestreams, workshop recordings, graduation moments, and research showcases.</p>
            </div>
            <button className="rounded-md border border-outline-variant px-3 py-2 text-xs font-semibold hover:bg-surface-container-low">
              View Media Library
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { title: "Career Expo Highlights", image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80" },
              { title: "Research & Innovation Forum", image: arcImage },
              { title: "Graduation Ceremony Replay", image: gc7 },
            ].map((video) => (
              <article key={video.title} className="reveal overflow-hidden rounded-xl border border-outline-variant bg-white shadow-sm">
                <div className="relative">
                  <img src={video.image} alt={video.title} className="h-52 w-full object-cover" onError={handleImageError} />
                  <button className="absolute inset-0 flex items-center justify-center bg-slate-950/20 text-white" aria-label={`Play ${video.title}`}>
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                      <PlayCircle className="h-8 w-8" />
                    </span>
                  </button>
                </div>
                <div className="p-4">
                  <h4 className="text-sm font-semibold text-astu-navy">{video.title}</h4>
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

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-4 sm:col-span-2 lg:col-span-2">
              <div className="reveal rounded-xl border border-outline-variant bg-white p-4">
                <div className="mb-3 flex items-center gap-2 rounded-md bg-surface-container-low px-3 py-2 text-xs text-on-surface-variant">
                  <BookOpen className="h-4 w-4" />
                  Share an update with the ASTU community...
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="rounded-md border border-outline-variant px-3 py-1.5 text-xs font-medium hover:bg-surface-container-low">Media</button>
                  <button className="rounded-md border border-outline-variant px-3 py-1.5 text-xs font-medium hover:bg-surface-container-low">Event</button>
                  <button className="rounded-md border border-outline-variant px-3 py-1.5 text-xs font-medium hover:bg-surface-container-low">Article</button>
                </div>
              </div>

              {communityPosts.map((post) => (
                <article key={post.name} className="reveal rounded-xl border border-outline-variant bg-white p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {post.image && (
                        <img src={post.image} alt={post.name} className="h-10 w-10 rounded-full object-cover" />
                      )}
                      <div>
                        <h4 className="font-semibold text-astu-navy">{post.name}</h4>
                        <p className="text-xs text-on-surface-variant">{post.role}</p>
                      </div>
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
                      onClick={() => navigate("/alumni")}
                    >
                      View Profile
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <aside className="space-y-4 lg:col-span-1">
              <article className="reveal rounded-xl border border-outline-variant bg-white p-4">
                <h4 className="text-sm font-semibold text-astu-navy">Recommended Connections</h4>
                <div className="mt-3 space-y-3 text-sm">
                  <button className="flex w-full items-center justify-between rounded-md border border-outline-variant px-3 py-2 text-left hover:bg-surface-container-low">
                    <span>Meta Finetec PLC</span>
                  </button>
                  <button className="flex w-full items-center justify-between rounded-md border border-outline-variant px-3 py-2 text-left hover:bg-surface-container-low">
                    <span>Summit Devs</span>
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

            <article className="reveal grid gap-2 sm:col-span-2 sm:grid-cols-2 md:col-span-1">
              <img
                alt="ASTU Innovation Arc"
                className="h-40 w-full rounded-xl border border-white/10 object-cover shadow-lg sm:h-48"
                src={arcImage}
                onError={handleImageError}
              />
              <img
                alt="Electric Labs"
                className="h-40 w-full rounded-xl border border-white/10 object-cover shadow-lg sm:h-48"
                src={electricLabs}
                onError={handleImageError}
              />
            </article>
          </div>
        </section>

        <section id="events" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="reveal mb-8 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h3 className="text-2xl font-bold text-astu-navy sm:text-3xl">Upcoming Alumni Events</h3>
              <p className="mt-2 text-sm text-on-surface-variant">Networking, learning, and professional growth opportunities.</p>
            </div>
            <button
              className="rounded-md border border-outline-variant px-3 py-2 text-xs font-semibold hover:bg-surface-container-low"
              onClick={() => navigate("/alumni")}
            >
              See All Events
            </button>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {events.map((event) => (
              <article key={event.title} className="reveal overflow-hidden rounded-xl border border-outline-variant bg-white shadow-sm">
                <img
                  alt={event.title}
                  className="h-48 w-full object-cover sm:h-52"
                  src={event.image}
                  onError={handleImageError}
                />
                <div className="p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-astu-red">Career Development</p>
                  <h4 className="mt-2 text-lg font-semibold text-astu-navy">{event.title}</h4>
                  <div className="mt-3 flex flex-col gap-2 text-xs text-on-surface-variant sm:flex-row sm:flex-wrap sm:gap-4">
                    <p className="inline-flex items-center gap-1">
                      <CalendarDays className="h-4 w-4" />
                      {event.date}
                    </p>
                    <p>{event.location}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      className="rounded-md bg-astu-navy px-4 py-2 text-xs font-semibold text-white hover:brightness-110"
                      onClick={() => navigate("/alumni")}
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

        <section id="workshops" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="mb-10 text-center reveal">
            <h3 className="text-2xl font-bold text-astu-navy md:text-3xl">Upcoming Workshops</h3>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-on-surface-variant">
              Practical training with RSVP tracking, approval workflows, QR attendance, certificates, and feedback forms.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {workshops.map((workshop) => (
              <article key={workshop.title} className="reveal rounded-xl border border-outline-variant bg-white p-5 shadow-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-astu-red">{workshop.focus}</p>
                <h4 className="mt-2 text-lg font-semibold text-astu-navy">{workshop.title}</h4>
                <div className="mt-4 space-y-2 text-sm text-on-surface-variant">
                  <p className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4" /> {workshop.date}</p>
                  <p>{workshop.seats}</p>
                </div>
                <button className="mt-5 rounded-md bg-astu-navy px-4 py-2 text-xs font-semibold text-white hover:brightness-110" onClick={() => navigate("/alumni")}>
                  Register for Workshop
                </button>
              </article>
            ))}
          </div>
        </section>

        <section id="news" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16 bg-slate-50/30">
          <div className="mb-10 text-center reveal">
            <h3 className="text-2xl font-bold text-astu-navy md:text-3xl">Latest News</h3>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-on-surface-variant">
              Stay updated with ASTU announcements and university news.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "New Engineering Lab Inaugurated", date: "May 28, 2026" },
              { title: "ASTU Research Grant Winners", date: "May 25, 2026" },
              { title: "Annual Career Expo Announced", date: "May 20, 2026" }
            ].map((news, idx) => (
              <article key={idx} className="reveal rounded-xl border border-outline-variant bg-white p-5 shadow-sm">
                <p className="text-xs text-astu-red font-semibold uppercase tracking-wider">Announcement</p>
                <h4 className="mt-1 text-base font-semibold text-astu-navy">{news.title}</h4>
                <p className="mt-2 text-xs text-on-surface-variant">{news.date}</p>
                <button className="mt-3 text-xs font-medium text-astu-navy hover:underline" onClick={() => navigate("/alumni")}>
                  Read More
                </button>
              </article>
            ))}
          </div>
        </section>

        <section id="announcements" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <article className="reveal rounded-xl border border-outline-variant bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-astu-navy/10">
                    <img src="/images/announcementIcon.svg" alt="announcement" loading="lazy" width="100" height="100" className="h-7 w-7" />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-astu-red">Announcements</p>
                    <h3 className="text-2xl font-bold text-astu-navy md:text-3xl">Official Notices</h3>
                  </div>
                </div>
                <button className="rounded-md border border-outline-variant px-3 py-2 text-xs font-semibold text-astu-navy hover:bg-surface-container-low">
                  View all
                </button>
              </div>
              <div className="divide-y divide-outline-variant">
                {announcements.map((announcement) => (
                  <button key={announcement.title} className="flex w-full items-start gap-3 py-4 text-left hover:bg-surface-container-low/60">
                    <Bell className="mt-1 h-4 w-4 shrink-0 text-astu-red" />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-astu-navy">{announcement.title}</span>
                      <span className="mt-1 block text-xs text-on-surface-variant">{announcement.type} · {announcement.date}</span>
                    </span>
                  </button>
                ))}
              </div>
            </article>

            <aside className="reveal rounded-xl border border-outline-variant bg-astu-navy p-5 text-white shadow-sm">
              <FileText className="h-7 w-7 text-astu-green" />
              <h4 className="mt-4 text-xl font-bold">Subscribe to official updates</h4>
              <p className="mt-2 text-sm leading-relaxed text-white/75">
                Receive announcements, events, workshops, partner calls, tracer survey reminders, and campus notices.
              </p>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  toast.success("Subscribed to ASTU-AMS announcements.");
                  (event.currentTarget as HTMLFormElement).reset();
                }}
                className="mt-5 space-y-3"
              >
                <input type="email" required placeholder="Enter your email" className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-3 text-sm text-white outline-none placeholder:text-white/55 focus:border-astu-green" />
                <button className="w-full rounded-md bg-astu-green px-4 py-3 text-sm font-bold text-white hover:brightness-110">
                  Subscribe
                </button>
              </form>
            </aside>
          </div>
        </section>

        <section id="success-stories" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="mb-10 text-center reveal">
            <h3 className="text-2xl font-bold text-astu-navy md:text-3xl">Alumni Success Stories</h3>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-on-surface-variant">
              Inspiring journeys of ASTU graduates making impact globally.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {communityPosts.slice(0, 3).map((story, idx) => (
              <article key={idx} className="reveal rounded-xl border border-outline-variant bg-white p-5 shadow-sm">
                {story.image && (
                  <img src={story.image} alt={story.name} className="h-40 w-full rounded-xl object-cover mb-3" onError={handleImageError} />
                )}
                <h4 className="font-semibold text-astu-navy">{story.name}</h4>
                <p className="text-xs text-on-surface-variant">{story.role}</p>
                <p className="mt-2 text-sm text-on-surface-variant line-clamp-2">{story.text}</p>
                <button className="mt-3 text-xs font-medium text-astu-navy hover:underline" onClick={() => navigate("/alumni")}>
                  Read Story
                </button>
              </article>
            ))}
          </div>
        </section>

        <section id="featured-network" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="grid gap-8 xl:grid-cols-2">
            <div>
              <div className="mb-6 reveal">
                <h3 className="text-2xl font-bold text-astu-navy md:text-3xl">Featured Alumni</h3>
                <p className="mt-2 text-sm text-on-surface-variant">Approved profiles highlighting leadership, research, startups, and career progress.</p>
              </div>
              <div className="space-y-4">
                {featuredAlumni.map((alumnus) => (
                  <article key={alumnus.name} className="reveal flex gap-4 rounded-xl border border-outline-variant bg-white p-4 shadow-sm">
                    <img src={alumnus.image} alt={alumnus.name} className="h-20 w-20 rounded-xl object-cover" onError={handleImageError} />
                    <div>
                      <h4 className="font-semibold text-astu-navy">{alumnus.name}</h4>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-astu-red">{alumnus.role}</p>
                      <p className="mt-2 text-sm text-on-surface-variant">{alumnus.impact}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-6 reveal">
                <h3 className="text-2xl font-bold text-astu-navy md:text-3xl">Featured Employers</h3>
                <p className="mt-2 text-sm text-on-surface-variant">Verified partner companies supporting jobs, internships, job fairs, and campus recruitment.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {featuredEmployers.map((employer) => (
                  <article key={employer.name} className="reveal rounded-xl border border-outline-variant bg-white p-5 shadow-sm">
                    <Building2 className="h-7 w-7 text-astu-navy" />
                    <h4 className="mt-4 font-semibold text-astu-navy">{employer.name}</h4>
                    <p className="mt-1 text-xs text-on-surface-variant">{employer.area}</p>
                    <p className="mt-3 rounded-md bg-astu-green/10 px-3 py-2 text-xs font-semibold text-astu-green">{employer.openings}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="research" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <article className="reveal rounded-xl bg-astu-navy p-6 text-white">
              <Trophy className="h-8 w-8 text-astu-green" />
              <h3 className="mt-4 text-2xl font-bold md:text-3xl">Research, Innovation & University Achievements</h3>
              <p className="mt-4 text-sm leading-relaxed text-slate-200">
                ASTU-AMS connects graduate research publications, startup showcases, employer collaborations, and department KPI evidence into one institutional analytics layer.
              </p>
            </article>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Research Publications", value: "1,240", icon: BookOpen },
                { label: "Startup Showcases", value: "38", icon: Star },
                { label: "Industry Projects", value: "72", icon: Handshake },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.label} className="reveal rounded-xl border border-outline-variant bg-white p-5 shadow-sm">
                    <Icon className="h-6 w-6 text-astu-navy" />
                    <p className="mt-4 text-2xl font-bold text-astu-navy">{item.value}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-on-surface-variant">{item.label}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="partners" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="mb-8 text-center reveal">
            <h3 className="text-2xl font-bold text-astu-navy md:text-3xl">Partner Companies</h3>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-on-surface-variant">Institutional partners supporting employability, accreditation feedback, internships, and research collaboration.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {partners.map((partner) => (
              <div key={partner} className="reveal flex min-h-24 items-center justify-center rounded-xl border border-outline-variant bg-white p-4 text-center text-sm font-semibold text-astu-navy shadow-sm">
                {partner}
              </div>
            ))}
          </div>
        </section>

        <section id="testimonials" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { quote: "ASTU-AMS gave our department the evidence we needed for skill-gap review.", by: "Department Head" },
              { quote: "The candidate search and feedback tools improved our campus recruitment cycle.", by: "Employer Partner" },
              { quote: "I found mentorship, events, and job matches without leaving the alumni portal.", by: "ASTU Alumna" },
            ].map((item) => (
              <article key={item.by} className="reveal rounded-xl border border-outline-variant bg-white p-5 shadow-sm">
                <Quote className="h-6 w-6 text-astu-red" />
                <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">{item.quote}</p>
                <p className="mt-4 text-sm font-semibold text-astu-navy">{item.by}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="career-opportunities" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="reveal rounded-xl border border-outline-variant bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-astu-red">Career Opportunities</p>
                <h3 className="mt-2 text-2xl font-bold text-astu-navy">Jobs, internships, AI matching, and candidate shortlisting</h3>
                <p className="mt-2 max-w-3xl text-sm text-on-surface-variant">Employers can post bulk jobs, manage talent pools, shortlist candidates, schedule interviews, and join job fairs.</p>
              </div>
              <button className="inline-flex items-center justify-center gap-2 rounded-md bg-astu-red px-5 py-3 text-sm font-semibold text-white hover:brightness-110" onClick={() => navigate("/employers")}>
                <UserRoundCheck className="h-4 w-4" />
                Explore Opportunities
              </button>
            </div>
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="mb-8 text-center reveal">
            <h3 className="text-2xl font-bold text-astu-navy md:text-3xl">FAQ</h3>
          </div>
          <div className="mx-auto grid max-w-4xl gap-3">
            {faqItems.map((item) => (
              <details key={item.question} className="reveal rounded-xl border border-outline-variant bg-white p-5 shadow-sm">
                <summary className="flex cursor-pointer list-none items-center gap-3 text-sm font-semibold text-astu-navy">
                  <HelpCircle className="h-5 w-5 text-astu-red" />
                  {item.question}
                </summary>
                <p className="mt-3 pl-8 text-sm leading-relaxed text-on-surface-variant">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="cta" className="bg-gradient-to-r from-astu-navy to-slate-900 py-16 text-center">
          <div className="max-w-[1440px] mx-auto px-4 reveal">
            <h3 className="text-3xl font-bold text-white md:text-4xl">Ready to Join ASTU-AMS?</h3>
            <p className="mt-4 text-slate-200 max-w-2xl mx-auto">
              Connect with fellow alumni, discover career opportunities, and contribute to university excellence.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button className="px-6 py-3 bg-white text-astu-navy font-bold rounded-xl hover:bg-slate-100 transition-all shadow-md" onClick={() => navigate("/alumni")}>
                Alumni Portal
              </button>
              <button className="px-6 py-3 border border-white/30 text-white font-bold rounded-xl hover:bg-white/10 transition-all" onClick={() => navigate("/employer")}>
                Employer Portal
              </button>
            </div>
          </div>
        </section>

        <section id="contact" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="mb-10 text-center reveal">
            <h3 className="text-2xl font-bold text-astu-navy md:text-3xl">Contact Us</h3>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-on-surface-variant">
              Have questions? Reach out to the ASTU Alumni Relations Office.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
            <div className="text-center p-6 rounded-xl border border-outline-variant bg-white">
              <MapPin className="h-8 w-8 mx-auto text-astu-navy mb-3" />
              <h4 className="font-semibold text-astu-navy">Address</h4>
              <p className="text-xs text-on-surface-variant mt-1">Adama, Oromia, Ethiopia</p>
            </div>
            <div className="text-center p-6 rounded-xl border border-outline-variant bg-white">
              <span className="material-symbols-outlined text-astu-navy text-3xl mb-3">phone</span>
              <h4 className="font-semibold text-astu-navy">Phone</h4>
              <p className="text-xs text-on-surface-variant mt-1">+251-221-110000</p>
            </div>
            <div className="text-center p-6 rounded-xl border border-outline-variant bg-white">
              <span className="material-symbols-outlined text-astu-navy text-3xl mb-3">mail</span>
              <h4 className="font-semibold text-astu-navy">Email</h4>
              <p className="text-xs text-on-surface-variant mt-1">alumni.office@astu.edu.et</p>
            </div>
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
