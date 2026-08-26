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
  ExternalLink,
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
  CircleUserRound,
  CheckCircle2,
  Search,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import ChatBot from "../components/ChatBot";
import { partnerLogos } from "../components/PartnerLogos";
import eventsService from "../features/admin/services/events.service";
import contentService from "../features/admin/services/content.service";
import storiesService from "../features/admin/services/stories.service";
import homepageCmsService from "../features/admin/services/homepageCms.service";

import astuLogo from "../assets/logos/astu-icon.jpeg";
import gallery1 from "../assets/imgs/astu-building.jpg";
import gallery2 from "../assets/imgs/campus-2.jpeg";
import gallery3 from "../assets/imgs/astu-logo.jpeg";
import arcImage from "../assets/images/arc.jpg";
import stateM from "../assets/images/State-M.jpg";
import gc7 from "../assets/images/gc7.jpg";
import electricLabs from "../assets/images/electriclabs.jpeg";

const FALLBACK_IMAGE = "/images/fallback-campus.svg";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Users, Building2, LineChart, FileCheck2, MessageSquareText, Briefcase, LockKeyhole, Globe, BookOpen, Star, Handshake, ShieldCheck, Trophy, CircleUserRound, Search,
};

const howItWorksSteps = [
  {
    step: 1,
    icon: CircleUserRound,
    title: "Create Your Profile",
    description:
      "Sign up and build your professional profile. Add your graduation details, skills, work experience, and career interests to get started.",
    color: "from-astu-navy to-[#1a4f8a]",
    iconBg: "bg-astu-navy/10 text-astu-navy",
  },
  {
    step: 2,
    icon: Search,
    title: "Discover Opportunities",
    description:
      "Browse verified job listings, internship postings, and mentorship programs tailored to your expertise and career goals.",
    color: "from-astu-red to-[#c0392b]",
    iconBg: "bg-astu-red/10 text-astu-red",
  },
  {
    step: 3,
    icon: Handshake,
    title: "Connect & Collaborate",
    description:
      "Network with fellow alumni, engage with employers, and participate in community events that advance your professional journey.",
    color: "from-astu-green to-[#1e8449]",
    iconBg: "bg-astu-green/10 text-astu-green",
  },
  {
    step: 4,
    icon: LineChart,
    title: "Grow & Give Back",
    description:
      "Complete tracer surveys, mentor current students, and contribute to curriculum development that shapes the next generation.",
    color: "from-violet-600 to-violet-800",
    iconBg: "bg-violet-100 text-violet-700",
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
  const [liveEvents, setLiveEvents] = useState<any[]>(events);
  const [liveWorkshops, setLiveWorkshops] = useState<any[]>(workshops);
  const [liveNews, setLiveNews] = useState<any[]>(() => {
    const published = contentService.getPublishedNews();
    return published.length ? published : [
      { title: "New Engineering Lab Inaugurated", date: "May 28, 2026" },
      { title: "ASTU Research Grant Winners", date: "May 25, 2026" },
      { title: "Annual Career Expo Announced", date: "May 20, 2026" }
    ];
  });
  const [liveAnnouncements, setLiveAnnouncements] = useState<any[]>(() => {
    const published = contentService.getPublishedAnnouncements();
    return published.length ? published : announcements;
  });
  const [liveStories, setLiveStories] = useState<any[]>(() => storiesService.getStories());
  const [liveSlides, setLiveSlides] = useState<any[]>(() => {
    const cmsConfig = homepageCmsService.getSettings();
    if (cmsConfig?.heroSlides?.length) {
      const active = cmsConfig.heroSlides.filter((s: any) => s.active);
      if (active.length) return active;
    }
    return [
      {
        id: "HS-1",
        image: gallery1,
        tagline: "Quality Assurance & Accreditation",
        title: "Connecting ASTU's Excellence to the Global Industry",
        description: "A unified gateway for alumni, employers, and departments to foster professional growth, talent acquisition, and academic innovation at Adama Science and Technology University. Join 1,238+ alumni already connected.",
        active: true,
      },
      {
        id: "HS-2",
        image: gallery2,
        tagline: "Enterprise Networking & Placement",
        title: "Empowering ASTU Graduates Through Innovation, Skills, and Modern Workplace Opportunities",
        description: "Discover corporate partners, publish practical career openings, and track your employment outcomes. Building bridges between classroom theory and real-world placement across 5 fields of study.",
        active: true,
      },
      {
        id: "HS-3",
        image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1800&q=80",
        tagline: "Academic Innovation & Tracer Feedback",
        title: "Coordinating Strategic Tracer Studies to Identify Workforce Trends and Skill Gaps",
        description: "Enabling department heads and partner companies to identify technological skill gaps directly from the workforce, supporting data-driven curriculum improvements, strengthening industry collaboration, enhancing graduate employability, and contributing to successful university accreditation and continuous quality assurance outcomes.",
        active: true,
      }
    ];
  });
  const [liveStats, setLiveStats] = useState<any[]>(() => {
    const config = homepageCmsService.getSettings();
    if (config?.impactStats?.length) {
      const active = config.impactStats.filter((s: any) => s.active);
      if (active.length) return active;
    }
    return impactStats;
  });
  const [livePortals, setLivePortals] = useState<any[]>(() => {
    const config = homepageCmsService.getSettings();
    if (config?.portals?.length) {
      const active = config.portals.filter((p: any) => p.active);
      if (active.length) return active;
    }
    return howItWorksSteps;
  });
  const [liveCampusLife, setLiveCampusLife] = useState<any[]>(() => {
    const config = homepageCmsService.getSettings();
    if (config?.campusLife?.length) {
      const active = config.campusLife.filter((c: any) => c.active);
      if (active.length) return active;
    }
    return campusLifeCards;
  });
  const [liveCampuses, setLiveCampuses] = useState<any[]>(() => {
    const config = homepageCmsService.getSettings();
    if (config?.campuses?.length) {
      const active = config.campuses.filter((c: any) => c.active);
      if (active.length) return active;
    }
    return campuses;
  });
  const [liveGallery, setLiveGallery] = useState<any[]>(() => {
    const config = homepageCmsService.getSettings();
    if (config?.gallery?.length) {
      const active = config.gallery.filter((g: any) => g.active);
      if (active.length) return active;
    }
    return galleryImages;
  });
  const [liveVideos, setLiveVideos] = useState<any[]>(() => {
    const config = homepageCmsService.getSettings();
    if (config?.videos?.length) {
      const active = config.videos.filter((v: any) => v.active);
      if (active.length) return active;
    }
    return [];
  });
  const [livePartners, setLivePartners] = useState<any[]>(() => {
    const config = homepageCmsService.getSettings();
    if (config?.partners?.length) {
      const active = config.partners.filter((p: any) => p.active);
      if (active.length) return active;
    }
    return partners;
  });
  const [liveFaq, setLiveFaq] = useState<any[]>(() => {
    const config = homepageCmsService.getSettings();
    if (config?.faq?.length) {
      const active = config.faq.filter((f: any) => f.active);
      if (active.length) return active;
    }
    return faqItems;
  });

  const [selectedNotice, setSelectedNotice] = useState<any | null>(null);
  const [showAllNotices, setShowAllNotices] = useState(false);
  const [noticeSearch, setNoticeSearch] = useState('');

  // RSVP / Registration State & Handlers
  const [registeredTitles, setRegisteredTitles] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('astu_user_registered_events');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [rsvpModalItem, setRsvpModalItem] = useState<{ title: string; kind: string; date: string; location?: string; id?: string } | null>(null);
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpEmail, setRsvpEmail] = useState('');
  const [rsvpPhone, setRsvpPhone] = useState('');
  const [rsvpAffiliation, setRsvpAffiliation] = useState('');
  const [rsvpRole, setRsvpRole] = useState('Alumni');
  const [rsvpNotes, setRsvpNotes] = useState('');
  const [confirmedQrPass, setConfirmedQrPass] = useState<string | null>(null);

  const handleRegisterClick = (item: { title: string; kind: 'Event' | 'Workshop'; date: string; location?: string; id?: string }) => {
    if (registeredTitles.includes(item.title)) {
      toast.success(`You are already registered for "${item.title}"!`);
      return;
    }

    const storedUser = localStorage.getItem('user');
    let defaultName = '';
    let defaultEmail = '';
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        defaultName = parsed.name || '';
        defaultEmail = parsed.email || '';
      } catch {}
    }

    setRsvpModalItem(item);
    setRsvpName(defaultName);
    setRsvpEmail(defaultEmail);
    setRsvpPhone('');
    setRsvpAffiliation('ASTU School of Engineering');
    setRsvpRole('Alumni');
    setRsvpNotes('');
    setConfirmedQrPass(null);
  };

  const confirmRsvpRegistration = async () => {
    if (!rsvpModalItem) return;
    if (!rsvpName.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    if (!rsvpEmail.trim() || !rsvpEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Call backend API if event ID or slug available
    const eventIdOrSlug = rsvpModalItem.id || rsvpModalItem.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
    try {
      await eventsService.rsvpToEvent(eventIdOrSlug, 'GOING');
    } catch {}

    const updated = [...registeredTitles, rsvpModalItem.title];
    setRegisteredTitles(updated);
    localStorage.setItem('astu_user_registered_events', JSON.stringify(updated));

    toast.success(`Registration Confirmed for "${rsvpModalItem.title}"! Ticket emailed to ${rsvpEmail}.`);
    setConfirmedQrPass(`ASTU-PASS-${Date.now()}-${rsvpName.replace(/\s+/g, '-')}`);
  };

  useEffect(() => {
    let isMounted = true;

    const syncContent = async () => {
      const publishedNews = contentService.getPublishedNews();
      if (publishedNews.length && isMounted) setLiveNews(publishedNews);

      const publishedAnnounce = contentService.getPublishedAnnouncements();
      if (publishedAnnounce.length && isMounted) setLiveAnnouncements(publishedAnnounce);

      if (isMounted) setLiveStories(storiesService.getStories());

      const cmsConfig = homepageCmsService.getSettings();
      if (cmsConfig && isMounted) {
        if (cmsConfig.heroSlides?.length) {
          const active = cmsConfig.heroSlides.filter((s: any) => s.active);
          if (active.length) setLiveSlides(active);
        }
        if (cmsConfig.impactStats?.length) {
          const active = cmsConfig.impactStats.filter((s: any) => s.active);
          if (active.length) setLiveStats(active);
        }
        if (cmsConfig.portals?.length) {
          const active = cmsConfig.portals.filter((p: any) => p.active);
          if (active.length) setLivePortals(active);
          else setLivePortals(howItWorksSteps);
        } else {
          setLivePortals(howItWorksSteps);
        }
        if (cmsConfig.campusLife?.length) {
          const active = cmsConfig.campusLife.filter((c: any) => c.active);
          if (active.length) setLiveCampusLife(active);
        }
        if (cmsConfig.campuses?.length) {
          const active = cmsConfig.campuses.filter((c: any) => c.active);
          if (active.length) setLiveCampuses(active);
        }
        if (cmsConfig.gallery?.length) {
          const active = cmsConfig.gallery.filter((g: any) => g.active);
          if (active.length) setLiveGallery(active);
        }
        if (cmsConfig.videos?.length) {
          const active = cmsConfig.videos.filter((v: any) => v.active);
          if (active.length) setLiveVideos(active);
        }
        if (cmsConfig.newsItems?.length) {
          const active = cmsConfig.newsItems.filter((n: any) => n.active);
          if (active.length) setLiveNews(active);
        }
        if (cmsConfig.announcements?.length) {
          const active = cmsConfig.announcements.filter((a: any) => a.active);
          if (active.length) setLiveAnnouncements(active);
        }
        if (cmsConfig.stories?.length) {
          const active = cmsConfig.stories.filter((s: any) => s.active);
          if (active.length) setLiveStories(active);
          else setLiveStories(storiesService.getStories());
        } else {
          setLiveStories(storiesService.getStories());
        }
        if (cmsConfig.partners?.length) {
          const active = cmsConfig.partners.filter((p: any) => p.active);
          if (active.length) setLivePartners(active);
        }
        if (cmsConfig.faq?.length) {
          const active = cmsConfig.faq.filter((f: any) => f.active);
          if (active.length) setLiveFaq(active);
        }
      }

      // Sync Events & Workshops from DB API + fallback to Local Storage + fallback to initial defaults
      try {
        const apiEvents = await eventsService.getAllEvents();
        let fetchedEvents: any[] = [];
        let fetchedWorkshops: any[] = [];

        if (apiEvents && apiEvents.length > 0) {
          fetchedEvents = apiEvents
            .filter((e) => e.type !== 'Workshop' && e.type !== 'WORKSHOP')
            .map((e) => ({
              title: e.title,
              date: typeof e.date === 'string' ? e.date.split('T')[0] : new Date(e.date).toLocaleDateString(),
              location: e.location || 'ASTU Main Campus',
              image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
            }));

          fetchedWorkshops = apiEvents
            .filter((e) => e.type === 'Workshop' || e.type === 'WORKSHOP')
            .map((e) => ({
              title: e.title,
              date: typeof e.date === 'string' ? e.date.split('T')[0] : new Date(e.date).toLocaleDateString(),
              seats: 'Open Registration',
              focus: 'Career Readiness',
            }));
        }

        if (!fetchedEvents.length) {
          const stored = localStorage.getItem('astu_ams_cms_events_items');
          if (stored) {
            const parsed = JSON.parse(stored);
            fetchedEvents = parsed
              .filter((e: any) => e.kind === 'Event' && e.status === 'Open')
              .map((e: any) => ({
                title: e.title,
                date: e.date,
                location: e.location,
                image: e.image || '/images/astu-building.jpg',
              }));
          }
        }

        if (!fetchedWorkshops.length) {
          const stored = localStorage.getItem('astu_ams_cms_events_items');
          if (stored) {
            const parsed = JSON.parse(stored);
            fetchedWorkshops = parsed
              .filter((e: any) => e.kind === 'Workshop' && e.status === 'Open')
              .map((e: any) => ({
                title: e.title,
                date: e.date,
                seats: `${e.rsvps} seats registered`,
                focus: e.category || 'Career Readiness',
              }));
          }
        }

        if (isMounted) {
          setLiveEvents(fetchedEvents.length ? fetchedEvents : events);
          setLiveWorkshops(fetchedWorkshops.length ? fetchedWorkshops : workshops);
        }
      } catch (err) {
        if (isMounted) {
          setLiveEvents(events);
          setLiveWorkshops(workshops);
        }
      }
    };

    syncContent();
    window.addEventListener('astu-cms-content-changed', syncContent);
    window.addEventListener('astu-cms-events-changed', syncContent);
    window.addEventListener('astu-cms-homepage-updated', syncContent);
    return () => {
      isMounted = false;
      window.removeEventListener('astu-cms-content-changed', syncContent);
      window.removeEventListener('astu-cms-events-changed', syncContent);
      window.removeEventListener('astu-cms-homepage-updated', syncContent);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % (liveSlides.length || 1));
    }, 6000);
    return () => clearInterval(timer);
  }, [liveSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % (liveSlides.length || 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + (liveSlides.length || 1)) % (liveSlides.length || 1));
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
      { threshold: 0.05 }
    );

    const nodes = document.querySelectorAll(".reveal");
    nodes.forEach((node) => observer.observe(node));

    // Force visibility check for elements already in viewport
    setTimeout(() => {
      document.querySelectorAll(".reveal").forEach((node) => {
        const rect = node.getBoundingClientRect();
        if (rect.top < window.innerHeight * 1.2 && rect.bottom > -100) {
          node.classList.add("is-visible");
        }
      });
    }, 150);

    return () => observer.disconnect();
  }, [liveEvents, liveWorkshops, liveNews, liveAnnouncements, liveStories, liveSlides, liveGallery]);

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
            {liveSlides.map((slide, idx) => (
              <div
                key={slide.id || idx}
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

          {/* Compact text - hero is immediately visible below navbar */}
          <div className="relative z-20 mx-auto flex h-full max-w-[1440px] items-center px-4 py-16 md:px-6 lg:py-20">
            <div className="max-w-2xl space-y-4">
              <span className="inline-block rounded-full bg-astu-red px-3 py-1 text-xs font-bold uppercase tracking-widest text-white shadow-lg animate-glow">
                {(liveSlides[currentSlide] || liveSlides[0])?.tagline}
              </span>
              <h1 className="text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl">
                {((liveSlides[currentSlide] || liveSlides[0])?.title || '').includes(" to the ") ? (
                  <>
                    {(liveSlides[currentSlide] || liveSlides[0])?.title.split(" to the ")[0]}
                    <br />
                    to the <span className="text-astu-green">{(liveSlides[currentSlide] || liveSlides[0])?.title.split(" to the ")[1]}</span>
                  </>
                ) : (
                  (liveSlides[currentSlide] || liveSlides[0])?.title
                )}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-100 md:text-base">
                {(liveSlides[currentSlide] || liveSlides[0])?.description}
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
            {liveSlides.map((_, idx) => (
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
          <div className="grid overflow-hidden rounded-xl shadow-[0_8px_32px_rgba(0,51,102,0.12)] md:grid-cols-4 lg:grid-cols-5 glass">
            {liveStats.map((stat, idx) => (
              <article key={stat.id || stat.label || idx} className="flex flex-col items-center gap-3 border-b border-white/20 p-8 text-center md:border-b-0 md:border-r card-hover">
                <div className="rounded-full bg-astu-navy/10 p-3 text-astu-navy">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-bold text-astu-navy">{stat.value}{stat.suffix || ''}</h2>
                <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">{stat.label}</p>
                {stat.detail && <p className="text-[10px] text-slate-400 mt-1">{stat.detail}</p>}
              </article>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="mb-12 text-center reveal">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-astu-red">Get Started</p>
            <h3 className="mt-2 text-2xl font-bold text-astu-navy md:text-3xl">How ASTU-AMS Works</h3>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-on-surface-variant">
              From registration to real impact — here's how our platform empowers alumni,
              employers, and the university community in four simple steps.
            </p>
          </div>

          <div className="relative">
            {/* Connector line for desktop */}
            <div className="absolute left-0 right-0 top-[60px] hidden h-0.5 bg-gradient-to-r from-astu-navy via-astu-red to-astu-green lg:block" />

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {livePortals.map((item, idx) => {
                const Icon = typeof item.icon === 'function' ? item.icon : (iconMap[item.icon] || Users);
                const descText = item.description || (Array.isArray(item.points) ? item.points[0] : item.text || '');
                return (
                  <article
                    key={item.id || item.step || item.title || idx}
                    className={`reveal reveal-delay-${(idx % 4) + 1} group relative rounded-2xl border border-outline-variant bg-white p-6 shadow-[0_2px_8px_rgba(0,51,102,0.06)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_24px_rgba(0,51,102,0.12)]`}
                  >
                    <div className="mb-5 flex items-center gap-3">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.color || 'from-astu-navy to-[#1a4f8a]'} text-lg font-bold text-white shadow-md transition-transform duration-300 group-hover:scale-110`}
                      >
                        {item.step || idx + 1}
                      </div>
                      <div className={`rounded-lg p-2.5 ${item.iconBg || 'bg-astu-navy/10 text-astu-navy'} transition-colors`}>
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>

                    <h4 className="mb-2 text-lg font-bold text-astu-navy">
                      {item.title}
                    </h4>
                    <p className="text-sm leading-relaxed text-on-surface-variant line-clamp-3">
                      {descText}
                    </p>

                    {item.cta && (
                      <button
                        onClick={() => navigate(item.route || '/login')}
                        className="mt-3 text-xs font-semibold text-[#003580] hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        {item.cta} <ArrowRight className="h-3 w-3" />
                      </button>
                    )}

                    <div
                      className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl bg-gradient-to-r ${item.color || 'from-astu-navy to-[#1a4f8a]'} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                    />
                  </article>
                );
              })}
            </div>
          </div>

          <div className="mt-10 flex justify-center reveal">
            <button
              className="inline-flex items-center gap-2 rounded-lg bg-astu-navy px-7 py-3 text-sm font-bold text-white shadow-md transition-all hover:brightness-110 hover:shadow-lg hover:scale-105"
              onClick={() => navigate("/login")}
            >
              Get Started Today
              <ArrowRight className="h-4 w-4" />
            </button>
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

        <section id="campus-life" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="mb-8 text-center reveal">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-astu-red">Explore Life At ASTU</p>
            <h3 className="mt-2 text-2xl font-bold text-astu-navy md:text-3xl">Campus Life, Facilities, Events, and Galleries</h3>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-on-surface-variant">
              A public gateway for the same institutional experiences AAU highlights: events, facilities, campus activities, media galleries, and services.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {liveCampusLife.map((card, idx) => (
              <article key={card.id || card.title || idx} className={`reveal reveal-delay-${(idx % 3) + 1} overflow-hidden rounded-xl border border-outline-variant bg-white card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)]`}>
                <img src={card.image} alt={card.title} className="h-52 w-full object-cover transition-transform duration-700 hover:scale-105" onError={handleImageError} />
                <div className="p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-astu-red">{card.campus}</p>
                  <h4 className="mt-2 text-lg font-semibold text-astu-navy">{card.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{card.description}</p>
                  {card.action && (
                    <button className="mt-4 rounded-md border border-outline-variant px-3 py-2 text-xs font-semibold text-astu-navy hover:bg-surface-container-low btn-magnetic">
                      {card.action}
                    </button>
                  )}
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
            {liveCampuses.map((campus, idx) => (
              <article key={campus.id || campus.name || idx} className={`reveal reveal-delay-${(idx % 4) + 1} overflow-hidden rounded-xl border border-outline-variant bg-white card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)]`}>
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
            {liveGallery.map((item, idx) => (
              <article key={item.id || item.title || idx} className={`reveal reveal-delay-${(idx % 3) + 1} overflow-hidden rounded-xl border border-outline-variant bg-white card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)]`}>
                <img src={item.src || item.image} alt={item.title} className="h-48 w-full object-cover transition-all duration-700 hover:scale-110 sm:h-56 md:h-64" onError={handleImageError} />
                <div className="p-3 md:p-4">
                  <h4 className="text-sm font-semibold text-astu-navy">{item.title}</h4>
                  {item.album && <p className="text-[10px] font-bold text-astu-red uppercase tracking-wider mt-1">{item.album}</p>}
                </div>
              </article>
            ))}
          </div>
          <div className="mt-8 text-center">
            <button
              onClick={() => window.open('/gallery', '_blank')}
              className="inline-flex items-center gap-2 rounded-lg bg-astu-navy px-6 py-3 text-xs font-bold uppercase tracking-wider text-white hover:brightness-110 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              Explore Full Gallery & Albums <ExternalLink className="h-4 w-4 text-[#FFD700]" />
            </button>
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
            {liveEvents.map((event, idx) => (
              <article key={event.title + idx} className={`reveal reveal-delay-${(idx % 2) + 1} overflow-hidden rounded-xl border border-outline-variant bg-white card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)]`}>
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
                      className={`rounded-md px-4 py-2 text-xs font-semibold transition-all ${
                        registeredTitles.includes(event.title)
                          ? 'bg-emerald-600 text-white cursor-default'
                          : 'bg-astu-navy text-white hover:brightness-110'
                      }`}
                      onClick={() => handleRegisterClick({ title: event.title, kind: 'Event', date: event.date, location: event.location })}
                    >
                      {registeredTitles.includes(event.title) ? '✓ Registered' : 'Register'}
                    </button>
                    <button
                      onClick={() => {
                        const eventSlug = event.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
                        window.open(`/events/${eventSlug}`, '_blank');
                      }}
                      className="rounded-md border border-outline-variant px-4 py-2 text-xs font-semibold hover:bg-surface-container-low"
                    >
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
            {liveWorkshops.map((workshop, idx) => (
              <article key={workshop.title + idx} className={`reveal reveal-delay-${(idx % 3) + 1} rounded-xl border border-outline-variant bg-white p-5 card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)]`}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-astu-red">{workshop.focus}</p>
                <h4 className="mt-2 text-lg font-semibold text-astu-navy">{workshop.title}</h4>
                <div className="mt-4 space-y-2 text-sm text-on-surface-variant">
                  <p className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4" /> {workshop.date}</p>
                  <p>{workshop.seats}</p>
                </div>
                <button
                  className={`mt-5 rounded-md px-4 py-2 text-xs font-semibold transition-all ${
                    registeredTitles.includes(workshop.title)
                      ? 'bg-emerald-600 text-white cursor-default'
                      : 'bg-astu-navy text-white hover:brightness-110'
                  }`}
                  onClick={() => handleRegisterClick({ title: workshop.title, kind: 'Workshop', date: workshop.date, location: workshop.focus })}
                >
                  {registeredTitles.includes(workshop.title) ? '✓ Registered for Workshop' : 'Register for Workshop'}
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
            {liveNews.map((news, idx) => (
              <article key={idx} className={`reveal reveal-delay-${(idx % 3) + 1} rounded-xl border border-outline-variant bg-white p-5 card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)]`}>
                <p className="text-xs text-astu-red font-semibold uppercase tracking-wider">Announcement</p>
                <h4 className="mt-1 text-base font-semibold text-astu-navy">{news.title}</h4>
                {news.excerpt && <p className="mt-1 text-xs text-slate-600 line-clamp-2">{news.excerpt}</p>}
                <p className="mt-2 text-xs text-on-surface-variant">{news.date}</p>
                <button className="mt-3 text-xs font-medium text-astu-navy hover:underline" onClick={() => navigate(`/announcements/${news.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`)}>
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
                <button
                  onClick={() => navigate('/announcements')}
                  className="rounded-md border border-outline-variant px-3 py-2 text-xs font-semibold text-astu-navy hover:bg-surface-container-low transition-colors"
                >
                  View all
                </button>
              </div>
              <div className="divide-y divide-outline-variant">
                {liveAnnouncements.slice(0, 5).map((announcement, idx) => (
                  <button
                    key={announcement.title + idx}
                    onClick={() => navigate(`/announcements/${announcement.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`)}
                    className="flex w-full items-start gap-3 py-4 text-left hover:bg-surface-container-low/60 rounded-lg px-2 transition-all cursor-pointer group"
                  >
                    <Bell className="mt-1 h-4 w-4 shrink-0 text-astu-red group-hover:scale-110 transition-transform" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-astu-navy group-hover:text-astu-red transition-colors">{announcement.title}</span>
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
            {liveStories.slice(0, 3).map((story, idx) => (
              <article key={story.id || idx} className={`reveal reveal-delay-${(idx % 3) + 1} rounded-xl border border-outline-variant bg-white p-5 card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)] flex flex-col justify-between`}>
                <div>
                  {story.image && (
                    <img src={story.image} alt={story.name} className="h-40 w-full rounded-xl object-cover mb-3" onError={handleImageError} />
                  )}
                  <h4 className="font-semibold text-astu-navy">{story.name}</h4>
                  <p className="text-xs text-on-surface-variant">{story.role} {story.company && `· ${story.company}`}</p>
                  <p className="mt-2 text-sm text-on-surface-variant line-clamp-3">{story.text}</p>
                </div>
                <button
                  className="mt-4 text-xs font-semibold text-[#003580] hover:underline self-start cursor-pointer inline-flex items-center gap-1"
                  onClick={() => navigate(`/stories/${story.id || story.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`)}
                >
                  Read Story <ArrowRight className="h-3 w-3" />
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
              {[...livePartners, ...livePartners].map((partner, idx) => {
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
            {liveFaq.map((item, idx) => (
              <details key={item.id || idx} className={`reveal reveal-delay-${(idx % 3) + 1} group rounded-xl border border-outline-variant bg-white overflow-hidden card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)]`}>
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

      {/* Notice Detail Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-outline-variant bg-white p-6 shadow-2xl">
            <button
              onClick={() => setSelectedNotice(null)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-astu-red/10 text-astu-red">
                <Bell className="h-5 w-5" />
              </span>
              <div>
                <span className="rounded-md bg-astu-red/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-astu-red">
                  {selectedNotice.type || 'Official Announcement'}
                </span>
                <p className="mt-0.5 text-xs text-on-surface-variant">{selectedNotice.date}</p>
              </div>
            </div>
            <h3 className="mt-4 text-xl font-bold text-astu-navy">{selectedNotice.title}</h3>
            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
              <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                {selectedNotice.excerpt || selectedNotice.description || selectedNotice.content || "Full official announcement details and documentation from ASTU-AMS Administration."}
              </p>
            </div>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedNotice(null)}
                className="rounded-lg border border-outline-variant bg-white px-4 py-2 text-xs font-semibold text-astu-navy hover:bg-surface-container-low"
              >
                Close Notice
              </button>
              <button
                onClick={() => {
                  setSelectedNotice(null);
                  navigate('/login');
                }}
                className="rounded-lg bg-astu-navy px-4 py-2 text-xs font-semibold text-white hover:brightness-110"
              >
                Access Portal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View All Notices Modal */}
      {showAllNotices && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-outline-variant bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-outline-variant pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-astu-navy/10 text-astu-navy">
                  <Bell className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-xl font-bold text-astu-navy">Official Notices & Announcements</h3>
                  <p className="text-xs text-on-surface-variant">All public university announcements and official directives.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAllNotices(false);
                  setNoticeSearch('');
                }}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={noticeSearch}
                onChange={(e) => setNoticeSearch(e.target.value)}
                placeholder="Search notices by keyword..."
                className="w-full rounded-lg border border-outline-variant bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-astu-navy outline-none focus:border-astu-navy focus:bg-white"
              />
            </div>

            <div className="mt-4 flex-1 overflow-y-auto divide-y divide-outline-variant pr-1">
              {liveAnnouncements
                .filter(n => !noticeSearch || n.title.toLowerCase().includes(noticeSearch.toLowerCase()) || (n.excerpt && n.excerpt.toLowerCase().includes(noticeSearch.toLowerCase())))
                .map((announcement, idx) => (
                  <button
                    key={announcement.title + idx}
                    onClick={() => {
                      setShowAllNotices(false);
                      setSelectedNotice(announcement);
                    }}
                    className="flex w-full items-start gap-3.5 py-3.5 px-2 text-left hover:bg-surface-container-low/80 rounded-xl transition-all cursor-pointer group"
                  >
                    <Bell className="mt-1 h-4 w-4 shrink-0 text-astu-red group-hover:scale-110 transition-transform" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="block text-sm font-semibold text-astu-navy group-hover:text-astu-red transition-colors">{announcement.title}</span>
                        <span className="shrink-0 text-[10px] font-bold text-slate-400">{announcement.date}</span>
                      </div>
                      <span className="mt-1 block text-xs text-on-surface-variant">{announcement.type}</span>
                      {announcement.excerpt && (
                        <p className="mt-1 text-xs text-slate-600 line-clamp-2">{announcement.excerpt}</p>
                      )}
                    </div>
                  </button>
                ))}
            </div>

            <div className="mt-4 border-t border-outline-variant pt-3 flex justify-end">
              <button
                onClick={() => {
                  setShowAllNotices(false);
                  setNoticeSearch('');
                }}
                className="rounded-lg bg-astu-navy px-5 py-2 text-xs font-semibold text-white hover:brightness-110"
              >
                Close List
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RSVP & Full Event Registration Modal */}
      {rsvpModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-md animate-fade-in" onClick={() => setRsvpModalItem(null)}>
          <div className="relative max-w-lg w-full rounded-2xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {!confirmedQrPass ? (
              <>
                <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                  <div>
                    <span className="rounded-md bg-astu-navy px-2.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">{rsvpModalItem.kind} Registration</span>
                    <h3 className="mt-1.5 text-lg font-bold text-astu-navy">{rsvpModalItem.title}</h3>
                  </div>
                  <button onClick={() => setRsvpModalItem(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="rounded-xl bg-slate-50 p-3.5 text-xs space-y-1 border border-slate-100">
                  <p className="text-slate-600"><span className="font-semibold text-slate-900">Scheduled Date:</span> {rsvpModalItem.date}</p>
                  {rsvpModalItem.location && <p className="text-slate-600"><span className="font-semibold text-slate-900">Venue / Location:</span> {rsvpModalItem.location}</p>}
                  <p className="text-[10px] text-emerald-600 font-medium pt-1">Free Admission • Instant Entry Ticket Code Issued Upon Submission</p>
                </div>

                <div className="space-y-3 pt-1">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-slate-700">Full Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={rsvpName}
                        onChange={(e) => setRsvpName(e.target.value)}
                        placeholder="e.g. Dr. Abebe Yosef"
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-astu-navy focus:ring-1 focus:ring-astu-navy"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700">Email Address <span className="text-red-500">*</span></label>
                      <input
                        type="email"
                        value={rsvpEmail}
                        onChange={(e) => setRsvpEmail(e.target.value)}
                        placeholder="e.g. abebe@astu.edu.et"
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-astu-navy focus:ring-1 focus:ring-astu-navy"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-slate-700">Phone Number</label>
                      <input
                        type="tel"
                        value={rsvpPhone}
                        onChange={(e) => setRsvpPhone(e.target.value)}
                        placeholder="e.g. +251 911 234 567"
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-astu-navy focus:ring-1 focus:ring-astu-navy"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700">Participant Status</label>
                      <select
                        value={rsvpRole}
                        onChange={(e) => setRsvpRole(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-astu-navy focus:ring-1 focus:ring-astu-navy bg-white"
                      >
                        <option value="Alumni">ASTU Alumni</option>
                        <option value="Student">Graduating Senior Student</option>
                        <option value="Faculty / Staff">Faculty / University Staff</option>
                        <option value="Employer Partner">Corporate Employer Partner</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700">Department / Organization</label>
                    <input
                      type="text"
                      value={rsvpAffiliation}
                      onChange={(e) => setRsvpAffiliation(e.target.value)}
                      placeholder="e.g. School of Electrical Engineering & Computing"
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-astu-navy focus:ring-1 focus:ring-astu-navy"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700">Special Accommodations / Dietary Notes (Optional)</label>
                    <input
                      type="text"
                      value={rsvpNotes}
                      onChange={(e) => setRsvpNotes(e.target.value)}
                      placeholder="e.g. Wheelchair access / Vegetarian meal"
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-astu-navy focus:ring-1 focus:ring-astu-navy"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button onClick={() => setRsvpModalItem(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                    Cancel
                  </button>
                  <button onClick={confirmRsvpRegistration} className="rounded-lg bg-[#003580] px-5 py-2 text-xs font-semibold text-white hover:brightness-110 shadow-md">
                    Complete & Confirm RSVP
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center space-y-4 py-2">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Registration Confirmed!</h3>
                  <p className="mt-1 text-xs text-slate-500">{rsvpModalItem.title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Participant: {rsvpName} ({rsvpEmail})</p>
                </div>

                <div className="mx-auto w-48 h-48 rounded-xl border-2 border-slate-200 p-3 bg-white flex items-center justify-center shadow-inner">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(confirmedQrPass)}`}
                    alt="Entry Ticket Code"
                    className="h-full w-full object-contain"
                  />
                </div>

                <p className="text-[11px] text-slate-400">Digital pass saved! Scan at event entrance for instant QR check-in.</p>

                <button
                  onClick={() => setRsvpModalItem(null)}
                  className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  Done & Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <ChatBot />
    </div>
  );
}
