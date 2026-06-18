import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  ChevronDown,
  Globe,
  Handshake,
  LineChart,
  ShieldCheck,
  Users,
  BarChart3,
  Bell,
  FileCheck2,
  FileText,
  HelpCircle,
  Image,
  LockKeyhole,
  MessageSquareText,
  MapPin,
  PlayCircle,
  Quote,
  Star,
  Trophy,
  UserRoundCheck,
  Phone,
  Mail,
} from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import ChatBot from "../components/ChatBot";
import { partnerLogos } from "../components/PartnerLogos";

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
    route: "/info/alumni-portal",
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
    route: "/info/employer-portal",
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
    route: "/info/department-portal",
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
    route: "/info/registrar-portal",
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
  { label: "Impact Numbers", id: "impact-numbers" },
  { label: "Impact", id: "impact" },
  { label: "Gallery", id: "gallery" },
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
    title: "ASTU Alumni Carnival 2026",
    date: "April 25-26, 2026",
    location: "Main Campus",
    image:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "DAAD Alumni Workshop",
    date: "March 2026",
    location: "ASTU Research Center",
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

const partners = [
  { name: "Ethio Telecom" },
  { name: "INSA" },
  { name: "Ethiopian Airlines" },
  { name: "Safaricom" },
  { name: "Huawei" },
  { name: "Commercial Bank of Ethiopia" },
];

const campusLifeCards = [
  { title: "Events and Activities", campus: "Main Campus", description: "Career expos, alumni reunions, workshops, chapter meetings, and community programs.", image: gallery2, action: "View Events" },
  { title: "Facilities", campus: "Innovation Spaces", description: "Laboratories, research centers, libraries, student services, and employer interview rooms.", image: electricLabs, action: "Explore Facilities" },
  { title: "ASTU Museums & Gallery", campus: "Campus Gallery", description: "Research showcases, graduation moments, campus photography, and public video archives.", image: arcImage, action: "View Gallery" },
];

const announcements = [
  { title: "ASTU Alumni Association Inspires Graduating Class with Career Tips!", date: "March 7, 2025", type: "Alumni Announcement" },
  { title: "ASTU hosts a five-day DAAD Alumni workshop", date: "March 7, 2025", type: "Employer Announcement" },
  { title: "ASTU alumni serve as model United Nations secretariats!", date: "January 7, 2025", type: "Alumni Achievement" },
  { title: "Tracer Study 2026 response window is open", date: "May 31, 2026", type: "Alumni Announcement" },
  { title: "Call for employer partners: campus recruitment week", date: "May 28, 2026", type: "Employer Announcement" },
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

const impactStats = [
  {
    title: "Alumni Members",
    value: "1,238+",
    detail: "Registered in the alumni network",
    icon: Users,
    action: "View Network",
    target: "/register",
  },
  {
    title: "Fields of Study",
    value: "5",
    detail: "Engineering, Science, Tech & more",
    icon: BookOpen,
    action: "Explore Programs",
    target: "/info/overview",
  },
  {
    title: "Partner Employers",
    value: "500+",
    detail: "Hiring, internships, and feedback",
    icon: Building2,
    action: "Meet Partners",
    target: "/info/featured-employers",
  },
];

export default function HomePage() {
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("home");
  const [user, setUser] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  const slides = useMemo(() => [
    {
      image: gallery1, // real astu-building.jpg
      tagline: "Quality Assurance & Accreditation",
      title: "Connecting ASTU's Excellence to the Global Industry",
      description: "A unified gateway for alumni, employers, and departments to foster professional growth, talent acquisition, and academic innovation at Adama Science and Technology University. Join 1,238+ alumni already connected.",
    },
    {
      image: gallery2, // real campus-2.jpeg
      tagline: "Enterprise Networking & Placement",
      title: "Empowering ASTU Graduates Through Innovation, Skills, and Modern Workplace Opportunities",
      description: "Discover corporate partners, publish practical career openings, and track your employment outcomes. Building bridges between classroom theory and real-world placement across 5 fields of study.",
    },
    {
      image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1800&q=80", // third beautiful campus photo
      tagline: "Academic Innovation & Tracer Feedback",
      title: "Coordinating Strategic Tracer Studies to Identify Workforce Trends and Skill Gaps",
      description: "Enabling department heads and partner companies to identify technological skill gaps directly from the workforce, supporting data-driven curriculum improvements, strengthening industry collaboration, enhancing graduate employability, and contributing to successful university accreditation and continuous quality assurance outcomes.",
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

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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
      <Navbar />

      <div className="fixed top-0 left-0 z-[60] w-full h-0.5 bg-slate-800/20">
        <div
          className="h-full bg-gradient-to-r from-astu-green via-astu-navy to-astu-red transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <main id="home">
        <section className="relative overflow-hidden min-h-[700px] md:h-[580px] lg:h-[750px] bg-slate-950">
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
            <div className="absolute top-20 left-[10%] w-2 h-2 rounded-full bg-astu-green/30 animate-float" style={{ animationDelay: "0s", animationDuration: "5s" }} />
            <div className="absolute top-40 left-[30%] w-1.5 h-1.5 rounded-full bg-astu-red/30 animate-float" style={{ animationDelay: "1s", animationDuration: "7s" }} />
            <div className="absolute top-60 left-[60%] w-2.5 h-2.5 rounded-full bg-astu-green/20 animate-float" style={{ animationDelay: "2s", animationDuration: "6s" }} />
            <div className="absolute top-32 right-[20%] w-1.5 h-1.5 rounded-full bg-white/20 animate-float" style={{ animationDelay: "0.5s", animationDuration: "8s" }} />
            <div className="absolute bottom-20 right-[40%] w-2 h-2 rounded-full bg-astu-red/20 animate-float" style={{ animationDelay: "1.5s", animationDuration: "5.5s" }} />
            <div className="absolute bottom-40 left-[50%] w-1 h-1 rounded-full bg-white/15 animate-float" style={{ animationDelay: "3s", animationDuration: "9s" }} />
          </div>
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

          {/* Compact text - hero is immediately visible below navbar */}
          <div className="relative z-20 mx-auto flex h-full max-w-[1440px] items-center px-4 py-16 md:px-6 lg:py-20">
            <div className="max-w-2xl space-y-4">
              <span className="inline-block rounded-full bg-astu-red px-3 py-1 text-xs font-bold uppercase tracking-widest text-white shadow-lg animate-glow">
                {slides[currentSlide].tagline}
              </span>
              <h1 className="text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl">
                {slides[currentSlide].title.includes(" to the ") ? (
                  <>
                    {slides[currentSlide].title.split(" to the ")[0]}
                    <br />
                    to the <span className="text-astu-green">{slides[currentSlide].title.split(" to the ")[1]}</span>
                  </>
                ) : (
                  slides[currentSlide].title
                )}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-100 md:text-base">
                {slides[currentSlide].description}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  className="inline-flex items-center gap-2 rounded-md bg-astu-red px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110 transition-all shadow-lg hover:shadow-xl hover:shadow-astu-red/20 hover:scale-105 btn-magnetic"
                  onClick={() => navigate("/info/alumni-portal")}
                >
                  Alumni Portal
                </button>
                <button
                  className="inline-flex items-center gap-2 rounded-md border border-white/40 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/20 transition-all hover:scale-105 btn-magnetic backdrop-blur-sm"
                  onClick={() => navigate("/info/employer-portal")}
                >
                  Employer Partnership
                  <Handshake className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Left/Right navigation arrow buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 z-35 -translate-y-1/2 rounded-full border border-white/20 bg-slate-900/40 p-2.5 text-white hover:bg-astu-navy/80 hover:scale-110 transition-all duration-300 backdrop-blur-sm hidden sm:block shadow-lg hover:shadow-xl"
            aria-label="Previous slide"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 z-35 -translate-y-1/2 rounded-full border border-white/20 bg-slate-900/40 p-2.5 text-white hover:bg-astu-navy/80 hover:scale-110 transition-all duration-300 backdrop-blur-sm hidden sm:block shadow-lg hover:shadow-xl"
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
          <button
            onClick={() => {
              window.scrollTo({
                top: window.innerHeight,
                behavior: "smooth",
              });
            }}
            className="absolute bottom-12 left-1/2 z-40 -translate-x-1/2 text-white animate-bounce"
            aria-label="Scroll down"
          >
            <ChevronDown className="h-8 w-8 md:h-10 md:w-10" style={{ marginTop: "-100px" }} />
          </button>
        </section>

        <section className="relative z-20 mx-auto -mt-12 mb-16 max-w-[1440px] px-4 md:-mt-16 md:px-8" style={{ marginTop: "100px" }}>
          <div className="grid overflow-hidden rounded-xl shadow-[0_8px_32px_rgba(0,51,102,0.12)] md:grid-cols-5 glass">
            <article className="flex flex-col items-center gap-3 border-b border-white/20 p-8 text-center md:border-b-0 md:border-r card-hover">
              <div className="rounded-full bg-astu-navy/10 p-3 text-astu-navy">
                <Users className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold text-astu-navy">1,238+</h2>
              <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Registered Alumni Members</p>
            </article>
            <article className="flex flex-col items-center gap-3 border-b border-white/20 p-8 text-center md:border-b-0 md:border-r card-hover">
              <div className="rounded-full bg-astu-red/10 p-3 text-astu-red">
                <Building2 className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold text-astu-navy">500+</h2>
              <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Partner Organizations</p>
            </article>
            <article className="flex flex-col items-center gap-3 p-8 text-center card-hover">
              <div className="rounded-full bg-astu-green/10 p-3 text-astu-green">
                <LineChart className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold text-astu-navy">87%</h2>
              <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Employment Rate</p>
            </article>
            <article className="flex flex-col items-center gap-3 border-t border-white/20 p-8 text-center md:border-l md:border-t-0 card-hover">
              <div className="rounded-full bg-[#E8A020]/15 p-3 text-[#B87900]">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold text-astu-navy">6K+</h2>
              <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Digital Requests</p>
            </article>
            <article className="flex flex-col items-center gap-3 border-t border-white/20 p-8 text-center md:border-l md:border-t-0 card-hover">
              <div className="rounded-full bg-violet-100 p-3 text-violet-700">
                <MessageSquareText className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold text-astu-navy">24/7</h2>
              <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Engagement Hub</p>
            </article>
          </div>
        </section>

        <section id="impact" className="mx-auto grid max-w-[1440px] gap-8 px-4 py-12 md:grid-cols-2 md:px-8 md:py-16">
          <article className="reveal">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-astu-red">Industry-Campus Bridge</p>
            <h3 className="mt-2 text-3xl font-bold animate-gradient-text">Nurturing Innovation in Modern Laboratories</h3>
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
              className="mt-7 rounded-md bg-astu-navy px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110 hover:scale-105 transition-all btn-magnetic shadow-lg hover:shadow-xl"
              onClick={() => navigate("/info/campus-life")}
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

        <section id="stakeholders" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="mb-8 text-center reveal">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-astu-red">Portal Access</p>
            <h3 className="mt-2 text-2xl font-bold text-astu-navy md:text-3xl">Choose Your Portal</h3>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-on-surface-variant">
              Role-based access for alumni, employers, departments, registrar, and administrators.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {stakeholders.slice(0, 3).map((item, idx) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className={`reveal reveal-delay-${idx + 1} rounded-xl border border-outline-variant bg-white p-6 card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)]`}>
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${item.tint}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h4 className="text-lg font-bold text-astu-navy">{item.title}</h4>
                  <ul className="mt-3 space-y-2">
                    {item.points.map((point) => (
                      <li key={point} className="flex items-start gap-2 text-sm text-on-surface-variant">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-astu-green" />
                        {point}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => navigate(item.route)}
                    className="mt-5 w-full rounded-lg bg-astu-navy px-4 py-2.5 text-sm font-bold text-white hover:bg-astu-navy/90 transition-all hover:scale-105"
                  >
                    {item.cta}
                  </button>
                </article>
              );
            })}
            {stakeholders.slice(3).map((item, idx) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className={`reveal reveal-delay-${idx + 4} rounded-xl border border-outline-variant bg-white p-6 card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)]`}>
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${item.tint}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h4 className="text-lg font-bold text-astu-navy">{item.title}</h4>
                  <ul className="mt-3 space-y-2">
                    {item.points.map((point) => (
                      <li key={point} className="flex items-start gap-2 text-sm text-on-surface-variant">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-astu-green" />
                        {point}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => navigate(item.route)}
                    className="mt-5 w-full rounded-lg px-4 py-2.5 text-sm font-bold text-white transition-all hover:scale-105"
                    style={{ backgroundColor: item.tint.includes('violet') ? '#7c3aed' : item.tint.includes('[#B87900]') ? '#B87900' : '#1e3a5f' }}
                  >
                    {item.cta}
                  </button>
                </article>
              );
            })}
          </div>
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
            {campusLifeCards.map((card, idx) => (
              <article key={card.title} className={`reveal reveal-delay-${idx + 1} overflow-hidden rounded-xl border border-outline-variant bg-white card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)]`}>
                <img src={card.image} alt={card.title} className="h-52 w-full object-cover transition-transform duration-700 hover:scale-105" onError={handleImageError} />
                <div className="p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-astu-red">{card.campus}</p>
                  <h4 className="mt-2 text-lg font-semibold text-astu-navy">{card.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{card.description}</p>
                  <button className="mt-4 rounded-md border border-outline-variant px-3 py-2 text-xs font-semibold text-astu-navy hover:bg-surface-container-low btn-magnetic">
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
            {campuses.map((campus, idx) => (
              <article key={campus.name} className={`reveal reveal-delay-${(idx % 4) + 1} overflow-hidden rounded-xl border border-outline-variant bg-white card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)]`}>
                <img src={campus.image} alt={campus.name} className="h-44 w-full object-cover transition-transform duration-700 hover:scale-105" onError={handleImageError} />
                <div className="p-4">
                  <h4 className="text-sm font-semibold text-astu-navy">{campus.name}</h4>
                  <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">{campus.description}</p>
                  <button className="mt-3 text-xs font-semibold text-astu-red hover:underline btn-magnetic">Explore</button>
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
            {galleryImages.map((item, idx) => (
              <article key={item.title} className={`reveal reveal-delay-${(idx % 3) + 1} overflow-hidden rounded-xl border border-outline-variant bg-white card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)]`}>
                <img src={item.src} alt={item.title} className="h-48 w-full object-cover transition-all duration-700 hover:scale-110 sm:h-56 md:h-64" onError={handleImageError} />
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
            ].map((video, idx) => (
              <article key={video.title} className={`reveal reveal-delay-${(idx % 3) + 1} overflow-hidden rounded-xl border border-outline-variant bg-white card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)]`}>
                <div className="relative">
                  <img src={video.image} alt={video.title} className="h-52 w-full object-cover" onError={handleImageError} />
                  <button className="absolute inset-0 flex items-center justify-center bg-slate-950/20 text-white" aria-label={`Play ${video.title}`}>
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all hover:scale-110">
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



        <section className="relative bg-gradient-to-r from-astu-navy to-primary-container py-14 md:py-20 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-astu-green/5 animate-float-slow" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-astu-red/5 animate-float" style={{ animationDelay: "2s" }} />
          </div>
          <div className="mx-auto grid max-w-[1440px] gap-8 px-4 md:grid-cols-2 md:px-8 relative z-10">
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
                onClick={() => navigate("/info/impact-numbers")}
              >
                View Impact Numbers
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
              onClick={() => navigate("/login")}
            >
              See All Events
            </button>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {events.map((event, idx) => (
              <article key={event.title} className={`reveal reveal-delay-${(idx % 2) + 1} overflow-hidden rounded-xl border border-outline-variant bg-white card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)]`}>
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
                      onClick={() => navigate("/login")}
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
            {workshops.map((workshop, idx) => (
              <article key={workshop.title} className={`reveal reveal-delay-${(idx % 3) + 1} rounded-xl border border-outline-variant bg-white p-5 card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)]`}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-astu-red">{workshop.focus}</p>
                <h4 className="mt-2 text-lg font-semibold text-astu-navy">{workshop.title}</h4>
                <div className="mt-4 space-y-2 text-sm text-on-surface-variant">
                  <p className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4" /> {workshop.date}</p>
                  <p>{workshop.seats}</p>
                </div>
                <button className="mt-5 rounded-md bg-astu-navy px-4 py-2 text-xs font-semibold text-white hover:brightness-110" onClick={() => navigate("/login")}>
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
              <article key={idx} className={`reveal reveal-delay-${(idx % 3) + 1} rounded-xl border border-outline-variant bg-white p-5 card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)]`}>
                <p className="text-xs text-astu-red font-semibold uppercase tracking-wider">Announcement</p>
                <h4 className="mt-1 text-base font-semibold text-astu-navy">{news.title}</h4>
                <p className="mt-2 text-xs text-on-surface-variant">{news.date}</p>
                <button className="mt-3 text-xs font-medium text-astu-navy hover:underline" onClick={() => navigate("/login")}>
                  Read More
                </button>
              </article>
            ))}
          </div>
        </section>

        <section id="announcements" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <article className="reveal rounded-xl border border-outline-variant bg-white p-5 card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)]">
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
              <article key={idx} className={`reveal reveal-delay-${(idx % 3) + 1} rounded-xl border border-outline-variant bg-white p-5 card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)]`}>
                {story.image && (
                  <img src={story.image} alt={story.name} className="h-40 w-full rounded-xl object-cover mb-3" onError={handleImageError} />
                )}
                <h4 className="font-semibold text-astu-navy">{story.name}</h4>
                <p className="text-xs text-on-surface-variant">{story.role}</p>
                <p className="mt-2 text-sm text-on-surface-variant line-clamp-2">{story.text}</p>
                <button className="mt-3 text-xs font-medium text-astu-navy hover:underline" onClick={() => navigate("/login")}>
                  Read Story
                </button>
              </article>
            ))}
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
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <article key={item.label} className={`reveal reveal-delay-${(idx % 3) + 1} rounded-xl border border-outline-variant bg-white p-5 card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)]`}>
                    <Icon className="h-6 w-6 text-astu-navy" />
                    <p className="mt-4 text-2xl font-bold text-astu-navy">{item.value}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-on-surface-variant">{item.label}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="partners" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16 overflow-hidden bg-gradient-to-b from-[#f8faff] to-white rounded-2xl my-8">
          <div className="mb-10 text-center reveal">
            <h3 className="text-2xl font-bold text-astu-navy md:text-3xl">Partner Companies</h3>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-on-surface-variant">Institutional partners supporting employability, accreditation feedback, internships, and research collaboration.</p>
          </div>
          <div className="relative">
            <div className="flex gap-6 animate-scroll hover:[animation-play-state:paused]">
              {[...partners, ...partners].map((partner, idx) => {
                const LogoComponent = partnerLogos[partner.name];
                return (
                  <div
                    key={`${partner.name}-${idx}`}
                    className="flex min-w-[180px] flex-col items-center gap-3 rounded-xl border border-outline-variant bg-white p-5 card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)]"
                  >
                    {LogoComponent ? (
                      <LogoComponent />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-astu-navy text-white text-sm font-bold shadow-md">
                        {partner.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span className="text-xs font-semibold text-astu-navy text-center leading-tight">{partner.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="testimonials" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { quote: "ASTU-AMS gave our department the evidence we needed for skill-gap review.", by: "Department Head" },
              { quote: "The candidate search and feedback tools improved our campus recruitment cycle.", by: "Employer Partner" },
              { quote: "I found mentorship, events, and job matches without leaving the alumni portal.", by: "ASTU Alumna" },
            ].map((item, idx) => (
              <article key={item.by} className={`reveal reveal-delay-${(idx % 3) + 1} rounded-xl border border-outline-variant bg-white p-5 card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)]`}>
                <Quote className="h-6 w-6 text-astu-red" />
                <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">{item.quote}</p>
                <p className="mt-4 text-sm font-semibold text-astu-navy">{item.by}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="mb-10 text-center reveal">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-astu-red">FAQ</p>
            <h3 className="mt-2 text-2xl font-bold text-astu-navy md:text-3xl">Frequently Asked Questions</h3>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-on-surface-variant">
              Common questions about ASTU-AMS, tracer studies, and alumni services.
            </p>
          </div>
          <div className="mx-auto max-w-3xl space-y-3">
            {faqItems.map((item, idx) => (
              <details key={idx} className={`reveal reveal-delay-${(idx % 3) + 1} group rounded-xl border border-outline-variant bg-white overflow-hidden card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)]`}>
                <summary className="flex cursor-pointer items-center justify-between gap-3 px-5 py-4 text-sm font-semibold text-astu-navy hover:bg-slate-50 transition-colors [&::-webkit-details-marker]:hidden">
                  <span>{item.question}</span>
                  <HelpCircle className="h-5 w-5 shrink-0 text-astu-red transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <div className="border-t border-outline-variant px-5 py-4 text-sm leading-relaxed text-on-surface-variant">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </section>

        <section id="career-opportunities" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="reveal rounded-xl border border-outline-variant bg-white p-6 card-hover shadow-[0_4px_16px_rgba(0,51,102,0.08)]">
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



        <section id="cta" className="relative bg-gradient-to-r from-astu-navy via-primary-container to-slate-900 py-16 text-center overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-[20%] w-3 h-3 rounded-full bg-astu-green/20 animate-float" style={{ animationDelay: "0s" }} />
            <div className="absolute bottom-10 right-[30%] w-2 h-2 rounded-full bg-astu-red/20 animate-float" style={{ animationDelay: "1.5s" }} />
            <div className="absolute top-20 right-[15%] w-1.5 h-1.5 rounded-full bg-white/15 animate-float" style={{ animationDelay: "3s" }} />
          </div>
          <div className="max-w-[1440px] mx-auto px-4 reveal relative z-10">
            <h3 className="text-3xl font-bold text-white md:text-4xl">Ready to Join ASTU-AMS?</h3>
            <p className="mt-4 text-slate-200 max-w-2xl mx-auto">
              Connect with fellow alumni, discover career opportunities, and contribute to university excellence.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button className="px-6 py-3 bg-white text-astu-navy font-bold rounded-xl hover:bg-slate-100 transition-all shadow-md hover:scale-105 btn-magnetic" onClick={() => navigate("/login")}>
                Alumni Portal
              </button>
              <button className="px-6 py-3 border border-white/30 text-white font-bold rounded-xl hover:bg-white/10 transition-all hover:scale-105 btn-magnetic" onClick={() => navigate("/login")}>
                Employer Portal
              </button>
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
                    onClick={() => navigate("/info/overview")}
                  >
                    Career Placement Portal
                  </button>
                </li>
                <li>
                  <button
                    className="flex items-center gap-1 transition-all duration-300 hover:text-white hover:translate-x-1 text-left"
                    onClick={() => navigate("/info/overview")}
                  >
                    Tracer Survey Hub
                  </button>
                </li>
                <li>
                  <button
                    className="flex items-center gap-1 transition-all duration-300 hover:text-white hover:translate-x-1 text-left"
                    onClick={() => navigate("/info/mentorship")}
                  >
                    Mentorship Scheduling
                  </button>
                </li>
                <li>
                  <a
                    href="https://estudent.astu.edu.et/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 transition-all duration-300 hover:text-white hover:translate-x-1 text-left"
                  >
                    Student Portal
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h6 className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#FFD700] border-b border-white/10 pb-2 mb-4">Official Contact Details</h6>
              <ul className="space-y-3 text-xs text-slate-400">
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-astu-green mt-0.5" />
                  <span>Adama, Oromia, Ethiopia</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-astu-green" />
                  <span>+251-</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-astu-green" />
                  <a href="mailto:irccd@astu.edu.et" className="hover:text-white transition-colors">irccd@astu.edu.et</a>
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
              <ArrowLeft className="h-4 w-4 rotate-180" />
            </button>
          </div>

        </div>
      </footer>
      <ChatBot />
    </div>
  );
}
