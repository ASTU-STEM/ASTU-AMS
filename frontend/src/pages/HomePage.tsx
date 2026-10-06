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
import publicStatsService, { PublicStat } from "../features/public/services/publicStats.service";
import config from "../config";

const { mediaUrl } = config;
import footerCmsService, { FooterCmsConfig, defaultFooterConfig } from "../features/admin/services/footerCms.service";

const FALLBACK_IMAGE = "";

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

/**
 * Presentation for the server-computed impact figures. The server owns the
 * numbers; this map only supplies the label, icon and accent for each key.
 */
const STAT_PRESENTATION: Record<
  string,
  { label: string; Icon: React.ComponentType<{ className?: string }>; accent: string }
> = {
  alumni: {
    label: 'Active Alumni',
    Icon: Users,
    accent: 'text-astu-navy bg-astu-navy/10 dark:text-sky-400 dark:bg-sky-500/15',
  },
  employers: {
    label: 'Verified Employers',
    Icon: Building2,
    accent: 'text-astu-green bg-astu-green/10 dark:text-emerald-400 dark:bg-emerald-500/15',
  },
  jobs: {
    label: 'Open Roles',
    Icon: Briefcase,
    accent: 'text-astu-red bg-astu-red/10 dark:text-rose-400 dark:bg-rose-500/15',
  },
  departments: {
    label: 'Departments',
    Icon: Trophy,
    accent: 'text-amber-600 bg-amber-500/10 dark:text-amber-400 dark:bg-amber-500/15',
  },
};

const navSections = [
  { label: "Home", id: "home" },
  { label: "Impact Numbers", id: "impact-numbers" },
  { label: "How It Works", id: "how-it-works" },
  { label: "Impact", id: "impact" },
  { label: "Gallery", id: "gallery" },
  { label: "Campuses", id: "campuses" },
  { label: "Announcements", id: "announcements" },
  { label: "Community", id: "testimonials" },
  { label: "Events", id: "events" },
  { label: "Workshops", id: "workshops" },
  { label: "News", id: "news" },
  { label: "Success Stories", id: "success-stories" },
  { label: "FAQ", id: "faq" },
  { label: "Contact", id: "contact" }
];
/** Minimal empty fallbacks — real content/images come from Homepage CMS */
const emptyCampusLife: any[] = [];
const emptyCampuses: any[] = [];
const emptyFaq: any[] = [];
const emptyGallery: any[] = [];
const emptyPartners: any[] = [];
const emptyImpactStats: any[] = [];

const EmptySection = ({ message }: { message: string }) => (
  <div className="rounded-xl border border-dashed border-outline-variant dark:border-slate-600 bg-[var(--bg-card)] dark:bg-slate-800/40 px-6 py-10 text-center">
    <p className="text-sm text-on-surface-variant dark:text-slate-400">{message}</p>
  </div>
);

export default function HomePage() {
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("home");
  const [user, setUser] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [liveEvents, setLiveEvents] = useState<any[]>([]);
  const [liveWorkshops, setLiveWorkshops] = useState<any[]>([]);
  const [liveNews, setLiveNews] = useState<any[]>([]);
  const [liveAnnouncements, setLiveAnnouncements] = useState<any[]>([]);
  const [liveStories, setLiveStories] = useState<any[]>([]);
  const [liveSlides, setLiveSlides] = useState<any[]>(() => {
    const cmsConfig = homepageCmsService.getSettings();
    if (cmsConfig?.heroSlides?.length) {
      const active = cmsConfig.heroSlides.filter((s: any) => s.active);
      if (active.length) return active;
    }
    return [];
  });
  const [liveStats, setLiveStats] = useState<PublicStat[]>([]);
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
    return emptyCampusLife;
  });
  const [liveCampuses, setLiveCampuses] = useState<any[]>(() => {
    const config = homepageCmsService.getSettings();
    if (config?.campuses?.length) {
      const active = config.campuses.filter((c: any) => c.active);
      if (active.length) return active;
    }
    return emptyCampuses;
  });
  const [liveGallery, setLiveGallery] = useState<any[]>(() => {
    const config = homepageCmsService.getSettings();
    if (config?.gallery?.length) {
      const active = config.gallery.filter((g: any) => g.active);
      if (active.length) return active;
    }
    return emptyGallery;
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
    return emptyPartners;
  });
  const [liveFaq, setLiveFaq] = useState<any[]>(() => {
    const config = homepageCmsService.getSettings();
    if (config?.faq?.length) {
      const active = config.faq.filter((f: any) => f.active);
      if (active.length) return active;
    }
    return emptyFaq;
  });
  const [liveTestimonials, setLiveTestimonials] = useState<any[]>(() => {
    const config = homepageCmsService.getSettings();
    if (config?.testimonials?.length) {
      const active = config.testimonials.filter((t: any) => t.active !== false);
      if (active.length) return active;
    }
    return [];
  });
  const [mentorshipStats, setMentorshipStats] = useState<any>(() => {
    const config = homepageCmsService.getSettings();
    return config?.mentorshipStats?.enabled ? config.mentorshipStats : null;
  });
  const [welcomeMessage, setWelcomeMessage] = useState(() => {
    const config = homepageCmsService.getSettings();
    return config?.welcomeMessage || '';
  });
  const [tracerSpotlight, setTracerSpotlight] = useState<any>(() => {
    const config = homepageCmsService.getSettings();
    return config?.tracerSpotlight?.enabled ? config.tracerSpotlight : null;
  });
  const [employerFeedback, setEmployerFeedback] = useState<any>(() => {
    const config = homepageCmsService.getSettings();
    return config?.employerFeedback?.enabled ? config.employerFeedback : null;
  });
  const [impactSection, setImpactSection] = useState<any>(() => homepageCmsService.getSettings()?.impactSection || null);
  const [careerCta, setCareerCta] = useState<any>(() => homepageCmsService.getSettings()?.careerCta || null);
  const [bottomCta, setBottomCta] = useState<any>(() => homepageCmsService.getSettings()?.bottomCta || null);
  const [researchHighlights, setResearchHighlights] = useState<any>(() => homepageCmsService.getSettings()?.researchHighlights || null);
  const [footerConfig, setFooterConfig] = useState<FooterCmsConfig>(() => footerCmsService.getSettings());

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

  /** Prefer CMS gallery / campus / slide images over any bundled assets */
  const cmsFeatureImages = useMemo(() => {
    const fromGallery = liveGallery
      .map((g: any) => g.src || g.image || g.url)
      .filter(Boolean);
    const fromCampuses = liveCampuses.map((c: any) => c.image).filter(Boolean);
    const fromSlides = liveSlides.map((s: any) => s.image).filter(Boolean);
    const fromCampusLife = liveCampusLife.map((c: any) => c.image).filter(Boolean);
    const pool = [...fromGallery, ...fromCampuses, ...fromSlides, ...fromCampusLife];
    return {
      primary: impactSection?.image || pool[0] || FALLBACK_IMAGE,
      secondary: pool[1] || pool[0] || FALLBACK_IMAGE,
      tertiary: pool[2] || pool[0] || FALLBACK_IMAGE,
    };
  }, [liveGallery, liveCampuses, liveSlides, liveCampusLife, impactSection]);

  // Pair each server-reported figure with its presentation. Stats the server
  // omits (zero rows) or that we have no presentation for are dropped, so the
  // band and its nav entry disappear together when there is nothing real.
  const visibleStats = useMemo(
    () =>
      liveStats
        .map((stat) => ({ stat, presentation: STAT_PRESENTATION[stat.key] }))
        .filter((entry): entry is { stat: PublicStat; presentation: (typeof STAT_PRESENTATION)[string] } =>
          Boolean(entry.presentation)
        ),
    [liveStats]
  );

  const hasImpactNumbers = visibleStats.length > 0;

  // A slide published from the CMS may carry no `image`, and CMS authors write
  // `subtitle` where the template reads `tagline`. Normalising here means the
  // hero can never render <img src="undefined"> and the text cannot silently
  // disappear.
  const normalisedSlides = useMemo(
    () =>
      liveSlides.map((slide: any) => ({
        ...slide,
        image: mediaUrl(slide.image || slide.backgroundImage || slide.bgImage),
        tagline: slide.tagline || slide.subtitle || slide.kicker || '',
        description: slide.description || slide.body || slide.text || '',
      })),
    [liveSlides]
  );

  const displaySlides = useMemo(
    () =>
      normalisedSlides.length
        ? normalisedSlides
        : [
            {
              id: 'empty',
              image: FALLBACK_IMAGE,
              tagline: 'ASTU-AMS',
              title: 'Alumni Management System',
              description: welcomeMessage || 'Connecting ASTU graduates, employers, and academic departments in one verified network.',
            },
          ],
    [normalisedSlides, welcomeMessage]
  );

  const activeHero = displaySlides[currentSlide] || displaySlides[0];

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
    } catch (err) {
      // Previously the failure was swallowed by an empty catch, so a rejected
      // RSVP still confirmed the registration and claimed a ticket was emailed.
      console.error('RSVP failed:', err);
      toast.error('Registration could not be completed. Please try again.');
      return;
    }

    const updated = [...registeredTitles, rsvpModalItem.title];
    setRegisteredTitles(updated);
    localStorage.setItem('astu_user_registered_events', JSON.stringify(updated));

    toast.success(`Registration Confirmed for "${rsvpModalItem.title}"! Ticket emailed to ${rsvpEmail}.`);
    setConfirmedQrPass(`ASTU-PASS-${Date.now()}-${rsvpName.replace(/\s+/g, '-')}`);
  };

  // Impact numbers come straight from the database via /content/public-stats.
  // Kept separate from the CMS load because these are measured, not authored.
  useEffect(() => {
    let isMounted = true;
    publicStatsService.getStats().then((stats) => {
      if (isMounted) setLiveStats(stats);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    // Helper: apply a loaded CMS config object to all homepage state slices
    const applyCmsConfig = (cmsConfig: any) => {
      if (!cmsConfig || !isMounted) return;
      if (cmsConfig.heroSlides?.length) {
        const active = cmsConfig.heroSlides.filter((s: any) => s.active !== false);
        if (active.length) setLiveSlides(active);
      }
      // Impact stats are NOT CMS-driven — they are counted from real rows by
      // the server and fetched separately, so no assignment happens here.
      if (cmsConfig.portals?.length) {
        const active = cmsConfig.portals.filter((p: any) => p.active !== false);
        if (active.length) setLivePortals(active);
      }
      if (cmsConfig.campusLife?.length) {
        const active = cmsConfig.campusLife.filter((c: any) => c.active !== false);
        if (active.length) setLiveCampusLife(active);
      }
      if (cmsConfig.campuses?.length) {
        const active = cmsConfig.campuses.filter((c: any) => c.active !== false);
        if (active.length) setLiveCampuses(active);
      }
      if (cmsConfig.gallery?.length) {
        const active = cmsConfig.gallery.filter((g: any) => g.active !== false);
        if (active.length) setLiveGallery(active);
      }
      if (cmsConfig.videos?.length) {
        const active = cmsConfig.videos.filter((v: any) => v.active !== false);
        if (active.length) setLiveVideos(active);
      }
      if (cmsConfig.newsItems?.length) {
        const active = cmsConfig.newsItems.filter((n: any) => n.active !== false);
        if (active.length) setLiveNews(active);
      }
      if (cmsConfig.announcements?.length) {
        const active = cmsConfig.announcements.filter((a: any) => a.active !== false);
        if (active.length) setLiveAnnouncements(active);
      }
      if (cmsConfig.stories?.length) {
        const active = cmsConfig.stories.filter((s: any) => s.active !== false);
        if (active.length) setLiveStories(storiesService.fromConfig(active));
      }
      if (cmsConfig.partners?.length) {
        const active = cmsConfig.partners.filter((p: any) => p.active !== false);
        if (active.length) setLivePartners(active);
      }
      if (cmsConfig.faq?.length) {
        const active = cmsConfig.faq.filter((f: any) => f.active !== false);
        if (active.length) setLiveFaq(active);
      }
      if (cmsConfig.testimonials?.length) {
        const active = cmsConfig.testimonials.filter((t: any) => t.active !== false);
        if (active.length) setLiveTestimonials(active);
      }
      if (cmsConfig.events?.length) {
        const active = cmsConfig.events.filter((e: any) => e.active !== false);
        if (active.length) {
          setLiveEvents(active.map((e: any) => ({
            title: e.title,
            date: e.date,
            location: e.location || 'ASTU Main Campus',
            image: e.image || FALLBACK_IMAGE,
            id: e.id,
          })));
        }
      }
      if (cmsConfig.workshops?.length) {
        const active = cmsConfig.workshops.filter((w: any) => w.active !== false);
        if (active.length) {
          setLiveWorkshops(active.map((w: any) => ({
            title: w.title,
            date: w.date,
            seats: w.seats || 'Open Registration',
            focus: w.focus || w.category || 'Career Readiness',
            id: w.id,
          })));
        }
      }
      if (cmsConfig.mentorshipStats?.enabled) {
        setMentorshipStats(cmsConfig.mentorshipStats);
      } else if (cmsConfig.mentorshipStats) {
        setMentorshipStats(null);
      }
      if (typeof cmsConfig.welcomeMessage === 'string') {
        setWelcomeMessage(cmsConfig.welcomeMessage);
      }
      if (cmsConfig.tracerSpotlight?.enabled) {
        setTracerSpotlight(cmsConfig.tracerSpotlight);
      } else if (cmsConfig.tracerSpotlight) {
        setTracerSpotlight(null);
      }
      if (cmsConfig.employerFeedback?.enabled) {
        setEmployerFeedback(cmsConfig.employerFeedback);
      } else if (cmsConfig.employerFeedback) {
        setEmployerFeedback(null);
      }
      if (cmsConfig.impactSection) setImpactSection(cmsConfig.impactSection);
      if (cmsConfig.careerCta) setCareerCta(cmsConfig.careerCta);
      if (cmsConfig.bottomCta) setBottomCta(cmsConfig.bottomCta);
      if (cmsConfig.researchHighlights) setResearchHighlights(cmsConfig.researchHighlights);
      if (cmsConfig.footer) {
        setFooterConfig({ ...defaultFooterConfig, ...cmsConfig.footer });
      }
    };

    const syncContent = async () => {
      // 1. Apply localStorage snapshot immediately for instant render (no flash)
      const localConfig = homepageCmsService.getSettings();
      applyCmsConfig(localConfig);

      const publishedNews = contentService.getPublishedNews();
      if (publishedNews.length && isMounted) setLiveNews(publishedNews);
      const publishedAnnounce = contentService.getPublishedAnnouncements();
      if (publishedAnnounce.length && isMounted) setLiveAnnouncements(publishedAnnounce);
      // Stories: only fill from storiesService when homepage CMS has none yet
      const homepageStories = storiesService.fromConfig(localConfig?.stories);
      if (isMounted) {
        if (homepageStories.length) setLiveStories(homepageStories);
        else setLiveStories(storiesService.getStories());
      }

      // 2. Fetch live data from backend API — drives real CMS→Homepage integration
      try {
        const [apiConfig, apiItems, apiFooter] = await Promise.all([
          homepageCmsService.fetchFromApi(),
          contentService.fetchItemsFromApi(),
          footerCmsService.fetchFromApi(),
        ]);

        // Apply live API config (overrides localStorage snapshot)
        if (isMounted) {
          applyCmsConfig(apiConfig);
          if (apiFooter) setFooterConfig(apiFooter);
        }

        // Apply live content items (news, announcements).
        // An empty array is a valid answer meaning "nothing is published", so it
        // must clear the localStorage snapshot rather than leave it on screen.
        // Guarding on `apiItems.length` meant deleted content stayed visible.
        if (isMounted && Array.isArray(apiItems)) {
          const liveNews = apiItems
            .filter((i: any) => i.status === 'Published' && (i.type === 'post' || i.type === 'announcement'))
            .map((i: any) => ({ id: i.id, title: i.title, date: i.publishedAt || i.updatedAt, excerpt: i.excerpt }));
          setLiveNews(liveNews);

          const liveAnnounce = apiItems
            .filter((i: any) => i.status === 'Published')
            .map((i: any) => ({
              id: i.id,
              title: i.title,
              date: i.publishedAt || i.updatedAt || 'Just now',
              type: i.type === 'announcement' ? 'Official Announcement' : `${String(i.type).toUpperCase()} Announcement`,
              excerpt: i.excerpt,
            }));
          setLiveAnnouncements(liveAnnounce);
        }
      } catch {
        // Silently fall back to localStorage data already applied above
      }


      // Sync Events & Workshops from DB API
      try {
        const apiEvents = await eventsService.getAllEvents();
        let fetchedEvents: any[] = [];
        let fetchedWorkshops: any[] = [];

        if (apiEvents && apiEvents.length > 0) {
          fetchedEvents = apiEvents
            .filter((e) => e.type !== 'Workshop' && e.type !== 'WORKSHOP')
            .map((e) => ({
              id: e.id || e.slug,
              title: e.title,
              date: typeof e.date === 'string' ? e.date.split('T')[0] : new Date(e.date).toLocaleDateString(),
location: e.location || 'Location to be confirmed',
              image: e.image || e.coverImage || e.bannerUrl || FALLBACK_IMAGE,
            }));

          fetchedWorkshops = apiEvents
            .filter((e) => e.type === 'Workshop' || e.type === 'WORKSHOP')
            .map((e) => ({
              id: e.id || e.slug,
              title: e.title,
              date: typeof e.date === 'string' ? e.date.split('T')[0] : new Date(e.date).toLocaleDateString(),
              seats: e.capacity ? `${e.capacity} seats` : 'Open Registration',
              focus: e.category || e.tags?.[0] || 'General',
            }));
        }

        if (!fetchedEvents.length) {
          const stored = localStorage.getItem('astu_ams_cms_events_items');
          if (stored) {
            const parsed = JSON.parse(stored);
            fetchedEvents = parsed
              .filter((e: any) => e.kind === 'Event' && e.status === 'Open')
              .map((e: any) => ({
                id: e.id,
                title: e.title,
                date: e.date,
                location: e.location,
                image: e.image || FALLBACK_IMAGE,
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
                id: e.id,
                title: e.title,
                date: e.date,
                seats: e.rsvps != null ? `${e.rsvps} seats registered` : 'Open Registration',
                focus: e.category || 'Career Readiness',
              }));
          }
        }

        if (isMounted) {
          if (fetchedEvents.length) setLiveEvents(fetchedEvents);
          if (fetchedWorkshops.length) setLiveWorkshops(fetchedWorkshops);
        }
      } catch {
        // Keep CMS / empty state — do not inject demo events
      }
    };

    syncContent();
    window.addEventListener('astu-cms-content-changed', syncContent);
    window.addEventListener('astu-cms-events-changed', syncContent);
    window.addEventListener('astu-cms-homepage-updated', syncContent);
    const onFooterUpdated = () => setFooterConfig(footerCmsService.getSettings());
    window.addEventListener('astu-cms-footer-updated', onFooterUpdated);
    return () => {
      isMounted = false;
      window.removeEventListener('astu-cms-content-changed', syncContent);
      window.removeEventListener('astu-cms-events-changed', syncContent);
      window.removeEventListener('astu-cms-homepage-updated', syncContent);
      window.removeEventListener('astu-cms-footer-updated', onFooterUpdated);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % (displaySlides.length || 1));
    }, 6000);
    return () => clearInterval(timer);
  }, [displaySlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % (displaySlides.length || 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + (displaySlides.length || 1)) % (displaySlides.length || 1));
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

  // A hero image always comes from the backend. If that URL fails we remove the
  // <img> and let the section gradient stand in — never substitute a
  // fabricated local asset, and never re-point at a failing URL (onError loop).
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.style.display = 'none';
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
    <div className="app-shell min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors duration-200">
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
            {displaySlides.map((slide, idx) => (
              <div
                key={slide.id || idx}
                className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                  idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                {/* Background image, sourced from the backend CMS */}
                {slide.image && (
                  <img
                    alt={slide.title}
                    className="h-full w-full object-cover object-[center_30%]"
                    src={slide.image}
                    onError={handleImageError}
                  />
                )}
                {/* Gentle overlay for rich aesthetic with high photo transparency */}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,25,50,0.55),rgba(0,10,25,0.78))]" />
              </div>
            ))}
          </div>

          {/* Compact text - hero is immediately visible below navbar */}
          <div className="relative z-20 mx-auto flex h-full max-w-[1440px] items-center px-4 py-16 md:px-6 lg:py-20">
            <div className="max-w-2xl space-y-4">
              <span className="inline-block rounded-full bg-astu-red px-3 py-1 text-xs font-bold uppercase tracking-widest text-white shadow-lg animate-glow">
                {activeHero?.tagline}
              </span>
              <h1 className="text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl">
                {(activeHero?.title || '').includes(" to the ") ? (
                  <>
                    {activeHero?.title.split(" to the ")[0]}
                    <br />
                    to the <span className="text-astu-green">{activeHero?.title.split(" to the ")[1]}</span>
                  </>
                ) : (
                  activeHero?.title
                )}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-100 md:text-base">
                {activeHero?.description || welcomeMessage || 'Connecting ASTU graduates, employers, and academic departments through verified career and alumni services.'}
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
                className={`h-2.5 rounded-full transition-all duration-300 ${idx === currentSlide ? "w-6 bg-[#FFD700]" : "w-2.5 bg-white/40 hover:bg-[var(--bg-card)]"
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

        {visibleStats.length > 0 && (
          <section id="impact-numbers" className="relative z-20 mx-auto my-10 md:my-14 max-w-[1440px] px-4 md:px-8">
            <div className="relative overflow-hidden rounded-2xl bg-[var(--bg-card)] dark:bg-slate-900 border border-[var(--border-color)] dark:border-slate-800 shadow-[0_12px_40px_rgba(0,51,102,0.08)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-astu-navy via-astu-red to-astu-green" />
              <div
                className={`grid divide-y sm:divide-y-0 sm:divide-x divide-[var(--border-color)] dark:divide-slate-800 ${
                  visibleStats.length === 1
                    ? "grid-cols-1"
                    : visibleStats.length === 2
                    ? "grid-cols-1 sm:grid-cols-2"
                    : visibleStats.length === 3
                    ? "grid-cols-1 sm:grid-cols-3"
                    : visibleStats.length === 4
                    ? "grid-cols-2 lg:grid-cols-4"
                    : "grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
                }`}
              >
                {visibleStats.map(({ stat, presentation }, idx) => {
                  const { Icon } = presentation;
                  return (
                    <article
                      key={stat.key || idx}
                      className="group flex flex-col items-center gap-3.5 p-8 text-center transition-all duration-300 hover:bg-[var(--bg-page)] dark:hover:bg-slate-800/40"
                    >
                      <div className={`rounded-2xl p-3.5 ${presentation.accent} shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <h2 className="text-3xl lg:text-4xl font-extrabold text-astu-navy dark:text-white tracking-tight">
                        {stat.value.toLocaleString()}
                      </h2>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)] dark:text-slate-400">
                        {presentation.label}
                      </p>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        <section id="how-it-works" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="mb-12 text-center reveal">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-astu-red">Get Started</p>
            <h3 className="mt-2 text-2xl font-bold text-astu-navy dark:text-white md:text-3xl">How ASTU-AMS Works</h3>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-on-surface-variant dark:text-slate-400">
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
                    className={`reveal reveal-delay-${(idx % 4) + 1} group relative rounded-2xl border border-outline-variant dark:border-slate-700 bg-[var(--bg-card)] dark:bg-slate-800 p-6 shadow-[0_2px_8px_rgba(0,51,102,0.06)] dark:shadow-slate-900/40 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_24px_rgba(0,51,102,0.12)]`}
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

                    <h4 className="mb-2 text-lg font-bold text-astu-navy dark:text-white">
                      {item.title}
                    </h4>
                    <p className="text-sm leading-relaxed text-on-surface-variant dark:text-slate-400 line-clamp-3">
                      {descText}
                    </p>

                    {item.cta && (
                      <button
                        onClick={() => navigate(item.route || '/login')}
                        className="mt-3 text-xs font-semibold text-[#003580] dark:text-amber-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
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
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-astu-red">
              {impactSection?.eyebrow || 'Industry-Campus Bridge'}
            </p>
            <h3 className="mt-2 text-3xl font-bold animate-gradient-text dark:text-white">
              {impactSection?.title || welcomeMessage || 'ASTU Alumni Impact'}
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-on-surface-variant dark:text-slate-400">
              {impactSection?.description ||
                welcomeMessage ||
                'Graduate outcomes and employer feedback managed through the ASTU content system feed directly into curriculum updates.'}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              {liveStats.slice(0, 2).map((stat: any) => (
                <div key={stat.title || stat.label || stat.id}>
                  <p className="text-3xl font-bold text-astu-navy dark:text-amber-400">{stat.value}{stat.suffix || ''}</p>
                  <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant dark:text-slate-400">{stat.title || stat.label}</p>
                </div>
              ))}
            </div>
            <button
              className="mt-7 rounded-md bg-astu-navy px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110 hover:scale-105 transition-all btn-magnetic shadow-lg hover:shadow-xl"
              onClick={() => {
                const route = impactSection?.ctaRoute;
                if (route && route.startsWith('#')) {
                  document.getElementById(route.slice(1))?.scrollIntoView({ behavior: 'smooth' });
                } else if (route) {
                  navigate(route);
                } else {
                  document.getElementById('campus-life')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              {impactSection?.ctaLabel || 'Explore Campus Life'}
            </button>
          </article>

          <article className="reveal">
            <img
              alt={impactSection?.title || 'ASTU campus'}
              className="h-full min-h-[280px] w-full rounded-xl object-cover shadow-lg"
              src={cmsFeatureImages.primary}
              onError={handleImageError}
            />
          </article>
        </section>

        <section id="campus-life" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="mb-8 text-center reveal">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-astu-red">Explore Life At ASTU</p>
            <h3 className="mt-2 text-2xl font-bold text-astu-navy dark:text-white md:text-3xl">Campus Life, Facilities, Events, and Galleries</h3>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-on-surface-variant dark:text-slate-400">
              Discover events, facilities, campus activities, media galleries, and student services that define life at Adama Science and Technology University.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {liveCampusLife.length === 0 ? (
              <div className="md:col-span-3">
                <EmptySection message="Campus life highlights will appear here once published by the university content team." />
              </div>
            ) : (
              liveCampusLife.map((card, idx) => (
              <article key={card.id || card.title || idx} className={`reveal reveal-delay-${(idx % 3) + 1} overflow-hidden rounded-xl border border-outline-variant dark:border-slate-700 bg-[var(--bg-card)] dark:bg-slate-800 card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)] dark:shadow-slate-900/40`}>
                <img src={card.image || FALLBACK_IMAGE} alt={card.title} className="h-52 w-full object-cover transition-transform duration-700 hover:scale-105" onError={handleImageError} />
                <div className="p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-astu-red">{card.campus}</p>
                  <h4 className="mt-2 text-lg font-semibold text-astu-navy dark:text-white">{card.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-on-surface-variant dark:text-slate-400">{card.description}</p>
                  {card.action && (
                    <button className="mt-4 rounded-md border border-outline-variant dark:border-slate-600 px-3 py-2 text-xs font-semibold text-astu-navy dark:text-amber-400 hover:bg-surface-container-low dark:hover:bg-slate-700 btn-magnetic">
                      {card.action}
                    </button>
                  )}
                </div>
              </article>
              ))
            )}
          </div>
        </section>

        <section id="campuses" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="reveal mb-8 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-astu-red">Campuses</p>
              <h3 className="mt-2 text-2xl font-bold text-astu-navy dark:text-white md:text-3xl">Explore ASTU Spaces</h3>
            </div>
            <button className="rounded-md border border-outline-variant dark:border-slate-600 px-3 py-2 text-xs font-semibold text-astu-navy dark:text-amber-400 hover:bg-surface-container-low dark:hover:bg-slate-800">
              View all
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {liveCampuses.length === 0 ? (
              <div className="sm:col-span-2 lg:col-span-4">
                <EmptySection message="Campus profiles will appear here once published by the university content team." />
              </div>
            ) : (
              liveCampuses.map((campus, idx) => (
              <article key={campus.id || campus.name || idx} className={`reveal reveal-delay-${(idx % 4) + 1} overflow-hidden rounded-xl border border-outline-variant dark:border-slate-700 bg-[var(--bg-card)] dark:bg-slate-800 card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)] dark:shadow-slate-900/40`}>
                <img src={campus.image || FALLBACK_IMAGE} alt={campus.name} className="h-44 w-full object-cover transition-transform duration-700 hover:scale-105" onError={handleImageError} />
                <div className="p-4">
                  <h4 className="text-sm font-semibold text-astu-navy dark:text-white">{campus.name}</h4>
                  <p className="mt-2 text-xs leading-relaxed text-on-surface-variant dark:text-slate-400">{campus.description}</p>
                  <button className="mt-3 text-xs font-semibold text-astu-red hover:underline btn-magnetic">Explore</button>
                </div>
              </article>
              ))
            )}
          </div>
        </section>

        <section id="gallery" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="mb-10 text-center reveal">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-astu-red">Media</p>
            <h3 className="mt-2 text-2xl font-bold text-astu-navy dark:text-white md:text-3xl">Photo Gallery</h3>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-on-surface-variant dark:text-slate-400">
              Campus life, events, and institutional moments from Adama Science and Technology University.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {liveGallery.length === 0 ? (
              <div className="sm:col-span-2 md:col-span-3">
                <EmptySection message="Photo gallery items will appear here once published by the university content team." />
              </div>
            ) : (
              liveGallery.map((item, idx) => (
              <article key={item.id || item.title || idx} className={`reveal reveal-delay-${(idx % 3) + 1} overflow-hidden rounded-xl border border-outline-variant dark:border-slate-700 bg-[var(--bg-card)] dark:bg-slate-800 card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)] dark:shadow-slate-900/40`}>
                <img src={item.src || item.image || FALLBACK_IMAGE} alt={item.title} className="h-48 w-full object-cover transition-all duration-700 hover:scale-110 sm:h-56 md:h-64" onError={handleImageError} />
                <div className="p-3 md:p-4">
                  <h4 className="text-sm font-semibold text-astu-navy dark:text-white">{item.title}</h4>
                  {item.album && <p className="text-[10px] font-bold text-astu-red uppercase tracking-wider mt-1">{item.album}</p>}
                </div>
              </article>
              ))
            )}
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
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-astu-red">Media</p>
              <h3 className="mt-2 text-2xl font-bold text-astu-navy dark:text-white sm:text-3xl">Video Gallery</h3>
              <p className="mt-2 text-sm text-on-surface-variant dark:text-slate-400">Workshop recordings, graduation moments, and research showcases.</p>
            </div>
            <button className="rounded-md border border-outline-variant dark:border-slate-600 px-3 py-2 text-xs font-semibold text-astu-navy dark:text-amber-400 hover:bg-surface-container-low dark:hover:bg-slate-800">
              View Media Library
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {liveVideos.length === 0 ? (
              <div className="md:col-span-3">
                <EmptySection message="Video highlights will appear here once published by the university content team." />
              </div>
            ) : (
              liveVideos.map((video: any, idx: number) => (
                <article key={video.id || video.title || idx} className={`reveal reveal-delay-${(idx % 3) + 1} overflow-hidden rounded-xl border border-outline-variant dark:border-slate-700 bg-[var(--bg-card)] dark:bg-slate-800 card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)] dark:shadow-slate-900/40`}>
                  <div className="relative">
                    <img
                      src={video.thumbnail || video.image || video.cover || cmsFeatureImages.primary}
                      alt={video.title}
                      className="h-52 w-full object-cover"
                      onError={handleImageError}
                    />
                    <a
                      href={video.url || video.link || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute inset-0 flex items-center justify-center bg-slate-950/20 text-white"
                      aria-label={`Play ${video.title}`}
                    >
                      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all hover:scale-110 hover:bg-white/30">
                        <PlayCircle className="h-8 w-8" />
                      </span>
                    </a>
                  </div>
                  <div className="p-4">
                    <h4 className="text-sm font-semibold text-astu-navy dark:text-white">{video.title}</h4>
                    {video.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-on-surface-variant dark:text-slate-400">{video.description}</p>
                    )}
                  </div>
                </article>
              ))
            )}
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
              <h3 className="mt-4 text-3xl font-bold">
                {employerFeedback?.title || 'Data-Driven Accreditation & Excellence'}
              </h3>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-200">
                {employerFeedback?.description ||
                  'ASTU-AMS provides verified tracer data, employment analytics, and employer feedback required by accreditation agencies and university management.'}
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-white/20 bg-white/5 p-4">
                  <Globe className="mb-2 h-5 w-5 text-astu-green" />
                  <h4 className="text-sm font-semibold">
                    {employerFeedback?.companies != null ? `${employerFeedback.companies} Companies` : 'Global Accreditation'}
                  </h4>
                  <p className="mt-1 text-xs text-slate-300">
                    {employerFeedback?.submissions != null
                      ? `${employerFeedback.submissions} employer feedback submissions`
                      : 'Build transparent, audited institutional reports.'}
                  </p>
                </div>
                <div className="rounded-lg border border-white/20 bg-white/5 p-4">
                  <Handshake className="mb-2 h-5 w-5 text-astu-green" />
                  <h4 className="text-sm font-semibold">
                    {tracerSpotlight?.title || 'Market Alignment'}
                  </h4>
                  <p className="mt-1 text-xs text-slate-300">
                    {tracerSpotlight?.responseRate
                      ? `Tracer response rate: ${tracerSpotlight.responseRate}`
                      : 'Align curriculum with industry expectations.'}
                  </p>
                </div>
              </div>
              <button
                className="mt-6 rounded-md bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-astu-navy hover:bg-[var(--bg-page)]"
                onClick={() => navigate("/info/impact-numbers")}
              >
                View Impact Numbers
              </button>
            </article>

            <article className="reveal grid gap-2 sm:col-span-2 sm:grid-cols-2 md:col-span-1">
              <img
                alt="ASTU campus highlight"
                className="h-40 w-full rounded-xl border border-white/10 object-cover shadow-lg sm:h-48"
                src={cmsFeatureImages.primary}
                onError={handleImageError}
              />
              <img
                alt="ASTU facilities"
                className="h-40 w-full rounded-xl border border-white/10 object-cover shadow-lg sm:h-48"
                src={cmsFeatureImages.secondary}
                onError={handleImageError}
              />
            </article>
          </div>
        </section>

        <section id="events" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="reveal mb-8 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-astu-red">Events</p>
              <h3 className="mt-2 text-2xl font-bold text-astu-navy dark:text-white sm:text-3xl">Upcoming Alumni Events</h3>
              <p className="mt-2 text-sm text-on-surface-variant dark:text-slate-400">Networking, learning, and professional growth opportunities.</p>
            </div>
            <button
              className="rounded-md border border-outline-variant dark:border-slate-600 px-3 py-2 text-xs font-semibold text-astu-navy dark:text-amber-400 hover:bg-surface-container-low dark:hover:bg-slate-800"
              onClick={() => navigate("/login")}
            >
              See All Events
            </button>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {liveEvents.map((event, idx) => (
              <article key={event.title + idx} className={`reveal reveal-delay-${(idx % 2) + 1} overflow-hidden rounded-xl border border-outline-variant dark:border-slate-700 bg-[var(--bg-card)] dark:bg-slate-800 card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)] dark:shadow-slate-900/40`}>
                <img
                  alt={event.title}
                  className="h-48 w-full object-cover sm:h-52"
                  src={event.image}
                  onError={handleImageError}
                />
                <div className="p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-astu-red">Career Development</p>
                  <h4 className="mt-2 text-lg font-semibold text-astu-navy dark:text-white">{event.title}</h4>
                  <div className="mt-3 flex flex-col gap-2 text-xs text-on-surface-variant dark:text-slate-400 sm:flex-row sm:flex-wrap sm:gap-4">
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
                      className="rounded-md border border-outline-variant dark:border-slate-600 px-4 py-2 text-xs font-semibold text-astu-navy dark:text-amber-400 hover:bg-surface-container-low dark:hover:bg-slate-700"
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
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-astu-red">Workshops</p>
            <h3 className="mt-2 text-2xl font-bold text-astu-navy dark:text-white md:text-3xl">Upcoming Workshops</h3>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-on-surface-variant dark:text-slate-400">
              Practical training sessions with RSVP, attendance tracking, and certificates of participation.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {liveWorkshops.map((workshop, idx) => (
              <article key={workshop.title + idx} className={`reveal reveal-delay-${(idx % 3) + 1} rounded-xl border border-outline-variant dark:border-slate-700 bg-[var(--bg-card)] dark:bg-slate-800 p-5 card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)] dark:shadow-slate-900/40`}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-astu-red">{workshop.focus}</p>
                <h4 className="mt-2 text-lg font-semibold text-astu-navy dark:text-white">{workshop.title}</h4>
                <div className="mt-4 space-y-2 text-sm text-on-surface-variant dark:text-slate-400">
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

        <section id="news" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16 bg-[var(--bg-page)] dark:bg-slate-900/30">
          <div className="mb-10 text-center reveal">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-astu-red">News</p>
            <h3 className="mt-2 text-2xl font-bold text-astu-navy dark:text-white md:text-3xl">Latest News</h3>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-on-surface-variant dark:text-slate-400">
              University updates, academic notices, and alumni network news.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {liveNews.map((news, idx) => (
              <article key={idx} className={`reveal reveal-delay-${(idx % 3) + 1} rounded-xl border border-outline-variant dark:border-slate-700 bg-[var(--bg-card)] dark:bg-slate-800 p-5 card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)] dark:shadow-slate-900/40`}>
                <p className="text-xs text-astu-red font-semibold uppercase tracking-wider">Announcement</p>
                <h4 className="mt-1 text-base font-semibold text-astu-navy dark:text-white">{news.title}</h4>
                {news.excerpt && <p className="mt-1 text-xs text-[var(--text-secondary)] dark:text-slate-400 line-clamp-2">{news.excerpt}</p>}
                <p className="mt-2 text-xs text-on-surface-variant dark:text-slate-500">{news.date}</p>
                <button className="mt-3 text-xs font-medium text-astu-navy dark:text-amber-400 hover:underline" onClick={() => navigate(`/announcements/${news.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`)}>
                  Read More
                </button>
              </article>
            ))}
          </div>
        </section>

        <section id="announcements" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <article className="reveal rounded-xl border border-outline-variant dark:border-slate-700 bg-[var(--bg-card)] dark:bg-slate-800 p-5 card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)] dark:shadow-slate-900/40">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-astu-navy/10 dark:bg-astu-navy/30">
                    <img src="/images/announcementIcon.svg" alt="announcement" loading="lazy" width="100" height="100" className="h-7 w-7" />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-astu-red">Announcements</p>
                    <h3 className="text-2xl font-bold text-astu-navy dark:text-white md:text-3xl">Official Notices</h3>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/announcements')}
                  className="rounded-md border border-outline-variant dark:border-slate-600 px-3 py-2 text-xs font-semibold text-astu-navy dark:text-amber-400 hover:bg-surface-container-low dark:hover:bg-slate-700 transition-colors"
                >
                  View all
                </button>
              </div>
              <div className="divide-y divide-outline-variant dark:divide-slate-700">
                {liveAnnouncements.slice(0, 5).map((announcement, idx) => (
                  <button
                    key={announcement.title + idx}
                    onClick={() => navigate(`/announcements/${announcement.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`)}
                    className="flex w-full items-start gap-3 py-4 text-left hover:bg-surface-container-low/60 dark:hover:bg-slate-700/50 rounded-lg px-2 transition-all cursor-pointer group"
                  >
                    <Bell className="mt-1 h-4 w-4 shrink-0 text-astu-red group-hover:scale-110 transition-transform" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-astu-navy dark:text-white group-hover:text-astu-red dark:group-hover:text-amber-400 transition-colors">{announcement.title}</span>
                      <span className="mt-1 block text-xs text-on-surface-variant dark:text-slate-400">{announcement.type} · {announcement.date}</span>
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
                  // No announcement-subscription endpoint exists, so this used to
                  // claim success while discarding the address entirely.
                  toast.error('Announcement sign-up is not available yet. No email address was stored.');
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
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-astu-red">Success Stories</p>
            <h3 className="mt-2 text-2xl font-bold text-astu-navy dark:text-white md:text-3xl">Alumni Success Stories</h3>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-on-surface-variant dark:text-slate-400">
              Journeys of ASTU graduates building careers across industry, research, and entrepreneurship.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {liveStories.length === 0 ? (
              <div className="sm:col-span-2 lg:col-span-3">
                <EmptySection message="Alumni success stories will appear here once published by the university content team." />
              </div>
            ) : (
              liveStories.slice(0, 3).map((story, idx) => (
                <article
                  key={story.id || idx}
                  className={`reveal reveal-delay-${(idx % 3) + 1} rounded-xl border border-outline-variant dark:border-slate-700 bg-[var(--bg-card)] dark:bg-slate-800 p-5 card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)] dark:shadow-slate-900/40 flex flex-col justify-between`}
                >
                  <div>
                    {story.image ? (
                      <img
                        src={story.image}
                        alt=""
                        className="h-40 w-full rounded-xl object-cover mb-3 bg-[var(--bg-page)] dark:bg-slate-700"
                        onError={(e) => {
                          const img = e.currentTarget;
                          img.onerror = null;
                          img.style.display = 'none';
                        }}
                      />
                    ) : null}
                    <h4 className="font-semibold text-astu-navy dark:text-white">{story.name}</h4>
                    <p className="text-xs text-on-surface-variant dark:text-slate-400">
                      {[story.role, story.company].filter(Boolean).join(' · ')}
                    </p>
                    <p className="mt-2 text-sm text-on-surface-variant dark:text-slate-400 line-clamp-3">{story.text}</p>
                  </div>
                  <button
                    className="mt-4 text-xs font-semibold text-[#003580] dark:text-amber-400 hover:underline self-start cursor-pointer inline-flex items-center gap-1"
                    onClick={() =>
                      navigate(
                        `/stories/${story.id || String(story.name || '')
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')}`
                      )
                    }
                  >
                    Read Story <ArrowRight className="h-3 w-3" />
                  </button>
                </article>
              ))
            )}
          </div>
        </section>

        <section id="research" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <article className="reveal rounded-xl bg-astu-navy p-6 text-white">
              <Trophy className="h-8 w-8 text-astu-green" />
              <h3 className="mt-4 text-2xl font-bold md:text-3xl">
                {researchHighlights?.title || 'Research, Innovation & University Achievements'}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-slate-200">
                {researchHighlights?.description ||
                  'ASTU-AMS connects graduate research publications, startup showcases, employer collaborations, and department KPI evidence into one institutional analytics layer.'}
              </p>
              {mentorshipStats && (
                <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-2xl font-bold">{mentorshipStats.mentors}</p>
                    <p className="text-[10px] uppercase tracking-wider text-slate-300">Mentors</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{mentorshipStats.mentees}</p>
                    <p className="text-[10px] uppercase tracking-wider text-slate-300">Mentees</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{mentorshipStats.sessions}</p>
                    <p className="text-[10px] uppercase tracking-wider text-slate-300">Sessions</p>
                  </div>
                </div>
              )}
            </article>
            <div className="grid gap-4 sm:grid-cols-3">
              {(researchHighlights?.stats?.length ? researchHighlights.stats : []).map((item: any, idx: number) => {
                const Icon = typeof item.icon === 'function' ? item.icon : (iconMap[item.icon] || BookOpen);
                return (
                  <article key={item.label || idx} className={`reveal reveal-delay-${(idx % 3) + 1} rounded-xl border border-outline-variant dark:border-slate-700 bg-[var(--bg-card)] dark:bg-slate-800 p-5 card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)] dark:shadow-slate-900/40`}>
                    <Icon className="h-6 w-6 text-astu-navy dark:text-amber-400" />
                    <p className="mt-4 text-2xl font-bold text-astu-navy dark:text-white">{item.value || '—'}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-on-surface-variant dark:text-slate-400">{item.label}</p>
                  </article>
                );
              })}
              {!researchHighlights?.stats?.length && (
                <div className="sm:col-span-3">
                  <EmptySection message="Research highlights will appear here once published by the university content team." />
                </div>
              )}
            </div>
          </div>
        </section>

        <section id="partners" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16 overflow-hidden bg-gradient-to-b from-[#f8faff] dark:from-slate-900/50 to-white dark:to-slate-950 rounded-2xl my-8">
          <div className="mb-10 text-center reveal">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-astu-red">Partners</p>
            <h3 className="mt-2 text-2xl font-bold text-astu-navy dark:text-white md:text-3xl">Partner Organisations</h3>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-on-surface-variant dark:text-slate-400">Institutional partners supporting employability, accreditation feedback, internships, and research collaboration.</p>
          </div>
          <div className="relative">
            {livePartners.length === 0 ? (
              <EmptySection message="Partner organisations will appear here once published by the university content team." />
            ) : (
            <div className="flex gap-6 animate-scroll hover:[animation-play-state:paused]">
              {[...livePartners, ...livePartners].map((partner, idx) => {
                const LogoComponent = partnerLogos[partner.name];
                const logoUrl = partner.logo || partner.image || partner.logoUrl;
                return (
                  <div
                    key={`${partner.name}-${idx}`}
                    className="flex min-w-[180px] flex-col items-center gap-3 rounded-xl border border-outline-variant dark:border-slate-700 bg-[var(--bg-card)] dark:bg-slate-800 p-5 card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)] dark:shadow-slate-900/40"
                  >
                    {logoUrl ? (
                      <img src={logoUrl} alt={partner.name} className="h-14 w-14 object-contain" onError={handleImageError} />
                    ) : LogoComponent ? (
                      <LogoComponent />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-astu-navy text-white text-sm font-bold shadow-md">
                        {(partner.name || '??').slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span className="text-xs font-semibold text-astu-navy dark:text-white text-center leading-tight">{partner.name}</span>
                  </div>
                );
              })}
            </div>
            )}
          </div>
        </section>

        <section id="testimonials" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="mb-8 text-center reveal">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-astu-red">Community Voices</p>
            <h3 className="mt-2 text-2xl font-bold text-astu-navy dark:text-white md:text-3xl">What Our Community Says</h3>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-on-surface-variant dark:text-slate-400">
              Reflections from alumni, employers, and partners connected through the ASTU network.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {liveTestimonials.length === 0 ? (
              <div className="md:col-span-3">
                <EmptySection message="Community testimonials will appear here once published by the university content team." />
              </div>
            ) : (
              liveTestimonials.map((item: any, idx: number) => (
              <article key={item.id || item.by || idx} className={`reveal reveal-delay-${(idx % 3) + 1} rounded-xl border border-outline-variant dark:border-slate-700 bg-[var(--bg-card)] dark:bg-slate-800 p-5 card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)] dark:shadow-slate-900/40`}>
                <Quote className="h-6 w-6 text-astu-red" />
                <p className="mt-4 text-sm leading-relaxed text-on-surface-variant dark:text-slate-300">{item.quote}</p>
                <p className="mt-4 text-sm font-semibold text-astu-navy dark:text-white">{item.by}</p>
              </article>
              ))
            )}
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="mb-10 text-center reveal">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-astu-red">FAQ</p>
            <h3 className="mt-2 text-2xl font-bold text-astu-navy dark:text-white md:text-3xl">Frequently Asked Questions</h3>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-on-surface-variant dark:text-slate-400">
              Common questions about ASTU-AMS, tracer studies, and alumni services.
            </p>
          </div>
          <div className="mx-auto max-w-3xl space-y-3">
            {liveFaq.length === 0 ? (
              <EmptySection message="Frequently asked questions will appear here once published by the university content team." />
            ) : (
              liveFaq.map((item, idx) => (
              <details key={item.id || idx} className={`reveal reveal-delay-${(idx % 3) + 1} group rounded-xl border border-outline-variant dark:border-slate-700 bg-[var(--bg-card)] dark:bg-slate-800 overflow-hidden card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)] dark:shadow-slate-900/40`}>
                <summary className="flex cursor-pointer items-center justify-between gap-3 px-5 py-4 text-sm font-semibold text-astu-navy dark:text-white hover:bg-[var(--bg-page)] dark:hover:bg-slate-700/50 transition-colors [&::-webkit-details-marker]:hidden">
                  <span>{item.question}</span>
                  <HelpCircle className="h-5 w-5 shrink-0 text-astu-red transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <div className="border-t border-outline-variant dark:border-slate-700 px-5 py-4 text-sm leading-relaxed text-on-surface-variant dark:text-slate-400">
                  {item.answer}
                </div>
              </details>
              ))
            )}
          </div>
        </section>

        <section id="career-opportunities" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="reveal rounded-xl border border-outline-variant dark:border-slate-700 bg-[var(--bg-card)] dark:bg-slate-800 p-6 card-hover shadow-[0_4px_16px_rgba(0,51,102,0.08)] dark:shadow-slate-900/40">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-astu-red">
                  {careerCta?.eyebrow || 'Career Opportunities'}
                </p>
                <h3 className="mt-2 text-2xl font-bold text-astu-navy dark:text-white">
                  {careerCta?.title || 'Jobs, internships, AI matching, and candidate shortlisting'}
                </h3>
                <p className="mt-2 max-w-3xl text-sm text-on-surface-variant dark:text-slate-400">
                  {careerCta?.description ||
                    'Employers can post bulk jobs, manage talent pools, shortlist candidates, schedule interviews, and join job fairs.'}
                </p>
              </div>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-md bg-astu-red px-5 py-3 text-sm font-semibold text-white hover:brightness-110"
                onClick={() => navigate(careerCta?.route || '/employers')}
              >
                <UserRoundCheck className="h-4 w-4" />
                {careerCta?.buttonLabel || 'Explore Opportunities'}
              </button>
            </div>
          </div>
        </section>

        {tracerSpotlight && (
          <section id="tracer-spotlight" className="mx-auto max-w-[1440px] px-4 pb-12 md:px-8">
            <div className="reveal rounded-xl border border-astu-navy/20 dark:border-astu-navy/40 bg-gradient-to-r from-[#003580]/5 dark:from-astu-navy/20 to-white dark:to-slate-900 p-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-astu-red">Tracer Study</p>
                  <h3 className="mt-2 text-xl font-bold text-astu-navy dark:text-white">{tracerSpotlight.title}</h3>
                  <p className="mt-2 max-w-3xl text-sm text-on-surface-variant dark:text-slate-400">{tracerSpotlight.description}</p>
                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-on-surface-variant dark:text-slate-400">
                    {tracerSpotlight.targetBatch && <span>Batch: <strong className="dark:text-slate-200">{tracerSpotlight.targetBatch}</strong></span>}
                    {tracerSpotlight.responseRate && <span>Response rate: <strong className="dark:text-slate-200">{tracerSpotlight.responseRate}</strong></span>}
                    {tracerSpotlight.deadline && <span>Deadline: <strong className="dark:text-slate-200">{tracerSpotlight.deadline}</strong></span>}
                  </div>
                </div>
                <button
                  className="rounded-md bg-astu-navy px-5 py-3 text-sm font-semibold text-white hover:brightness-110"
                  onClick={() => navigate('/login')}
                >
                  Complete Tracer Survey
                </button>
              </div>
            </div>
          </section>
        )}

        <section id="cta" className="relative bg-gradient-to-r from-astu-navy via-primary-container to-slate-900 py-16 text-center overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-[20%] w-3 h-3 rounded-full bg-astu-green/20 animate-float" style={{ animationDelay: "0s" }} />
            <div className="absolute bottom-10 right-[30%] w-2 h-2 rounded-full bg-astu-red/20 animate-float" style={{ animationDelay: "1.5s" }} />
            <div className="absolute top-20 right-[15%] w-1.5 h-1.5 rounded-full bg-white/15 animate-float" style={{ animationDelay: "3s" }} />
          </div>
          <div className="max-w-[1440px] mx-auto px-4 reveal relative z-10">
            <h3 className="text-3xl font-bold text-white md:text-4xl">
              {bottomCta?.title || 'Ready to Join ASTU-AMS?'}
            </h3>
            <p className="mt-4 text-slate-200 max-w-2xl mx-auto">
              {bottomCta?.description ||
                'Connect with fellow alumni, discover career opportunities, and contribute to university excellence.'}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button
                className="px-6 py-3 bg-white text-astu-navy font-bold rounded-xl hover:bg-[var(--bg-page)] transition-all shadow-md hover:scale-105 btn-magnetic"
                onClick={() => navigate(bottomCta?.primaryRoute || '/login')}
              >
                {bottomCta?.primaryLabel || 'Alumni Portal'}
              </button>
              <button
                className="px-6 py-3 border border-white/30 text-white font-bold rounded-xl hover:bg-white/10 transition-all hover:scale-105 btn-magnetic"
                onClick={() => navigate(bottomCta?.secondaryRoute || '/login')}
              >
                {bottomCta?.secondaryLabel || 'Employer Portal'}
              </button>
            </div>
          </div>
        </section>


      </main>

      <footer id="contact" className="border-t-2 border-astu-green/30 bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 py-16 text-slate-300">
        <div className="mx-auto max-w-[1440px] px-4 md:px-8 space-y-12">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-10 border-b border-white/5">
            <div className="max-w-md">
              <h5 className="text-base font-bold text-white uppercase tracking-wider">
                {footerConfig.newsletterTitle || 'Stay Connected with ASTU'}
              </h5>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {footerConfig.newsletterSubtitle || 'Get updates on reunions, career expos, and employment reports.'}
              </p>
            </div>
            <form
                onSubmit={(e) => {
                  e.preventDefault();
                  // There is no newsletter endpoint, so this previously toasted
                  // "You are subscribed" without storing anything or telling the
                  // server. It now says plainly that no address was recorded.
                  toast.error('Newsletter sign-up is not available yet. No email address was stored.');
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

          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img
                  alt="ASTU Official Emblem"
                  className="h-12 w-12 object-contain scale-110 shrink-0"
                  src="/images/astu-seal-logo.png"
                />
                <div>
                  <h5 className="text-lg font-black text-white tracking-wider uppercase">ASTU-AMS</h5>
                  <p className="text-[10px] text-astu-green uppercase tracking-widest font-extrabold">Alumni Network</p>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-[var(--text-muted)]">
                {welcomeMessage ||
                  'Connecting graduates, corporate employers, and department heads in one unified ecosystem.'}
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {(footerConfig.socialLinks || []).map((social) => (
                  <a
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-white/10 hover:border-[#FFD700] px-3.5 py-2 text-[10px] font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    {social.platform}
                  </a>
                ))}
              </div>
            </div>

            {(footerConfig.sections || []).slice(0, 2).map((section) => (
              <div key={section.id}>
                <h6 className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#FFD700] border-b border-white/10 pb-2 mb-4">
                  {section.title}
                </h6>
                <ul className="space-y-3 text-xs text-[var(--text-muted)]">
                  {section.links.map((link) => (
                    <li key={link.id}>
                      {link.href.startsWith('http') || link.href.startsWith('#') ? (
                        <a
                          href={link.href}
                          className="flex items-center gap-1 transition-all duration-300 hover:text-white hover:translate-x-1 text-left"
                          {...(link.href.startsWith('http')
                            ? { target: '_blank', rel: 'noopener noreferrer' }
                            : {})}
                        >
                          {link.label}
                        </a>
                      ) : (
                        <button
                          type="button"
                          className="flex items-center gap-1 transition-all duration-300 hover:text-white hover:translate-x-1 text-left"
                          onClick={() => navigate(link.href)}
                        >
                          {link.label}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div>
              <h6 className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#FFD700] border-b border-white/10 pb-2 mb-4">
                Official Contact Details
              </h6>
              <ul className="space-y-3 text-xs text-[var(--text-muted)]">
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-astu-green mt-0.5 shrink-0" />
                  <span>{footerConfig.contactInfo?.address}</span>
                </li>
                {footerConfig.contactInfo?.poBox && (
                  <li className="flex items-start gap-2">
                    <Globe className="h-4 w-4 text-astu-green mt-0.5 shrink-0" />
                    <span>{footerConfig.contactInfo.poBox}</span>
                  </li>
                )}
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-astu-green shrink-0" />
                  <span>{footerConfig.contactInfo?.phone}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-astu-green shrink-0" />
                  <a
                    href={`mailto:${footerConfig.contactInfo?.email}`}
                    className="hover:text-white transition-colors"
                  >
                    {footerConfig.contactInfo?.email}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {(footerConfig.sections || []).length > 2 && (
            <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 border-t border-white/5 pt-8">
              {(footerConfig.sections || []).slice(2).map((section) => (
                <div key={section.id}>
                  <h6 className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#FFD700] border-b border-white/10 pb-2 mb-4">
                    {section.title}
                  </h6>
                  <ul className="space-y-3 text-xs text-[var(--text-muted)]">
                    {section.links.map((link) => (
                      <li key={link.id}>
                        {link.href.startsWith('http') || link.href.startsWith('#') ? (
                          <a href={link.href} className="transition-all duration-300 hover:text-white hover:translate-x-1 inline-block">
                            {link.label}
                          </a>
                        ) : (
                          <button
                            type="button"
                            className="transition-all duration-300 hover:text-white hover:translate-x-1 text-left"
                            onClick={() => navigate(link.href)}
                          >
                            {link.label}
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-white/5 pt-8 text-xs text-[var(--text-muted)] font-semibold">
            <div className="flex flex-wrap items-center gap-3">
              <p>{footerConfig.copyright}</p>
              {footerConfig.credit && (
                <>
                  <span>&bull;</span>
                  <p className="text-astu-green">{footerConfig.credit}</p>
                </>
              )}
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
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-outline-variant dark:border-slate-700 bg-[var(--bg-card)] dark:bg-slate-800 p-6 shadow-2xl">
            <button
              onClick={() => setSelectedNotice(null)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-page)] dark:hover:bg-slate-700 hover:text-[var(--text-secondary)] dark:hover:text-slate-200"
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
                <p className="mt-0.5 text-xs text-on-surface-variant dark:text-slate-400">{selectedNotice.date}</p>
              </div>
            </div>
            <h3 className="mt-4 text-xl font-bold text-astu-navy dark:text-white">{selectedNotice.title}</h3>
            <div className="mt-4 rounded-xl border border-[var(--border-color)] dark:border-slate-700 bg-[var(--bg-page)] dark:bg-slate-900/50 p-4">
              <p className="text-sm leading-relaxed text-[var(--text-secondary)] dark:text-slate-300 whitespace-pre-line">
                {selectedNotice.excerpt || selectedNotice.description || selectedNotice.content || "Full official announcement details and documentation from ASTU-AMS Administration."}
              </p>
            </div>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedNotice(null)}
                className="rounded-lg border border-outline-variant dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2 text-xs font-semibold text-astu-navy dark:text-amber-400 hover:bg-surface-container-low dark:hover:bg-slate-600"
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
          <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-outline-variant dark:border-slate-700 bg-[var(--bg-card)] dark:bg-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-outline-variant dark:border-slate-700 pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-astu-navy/10 dark:bg-astu-navy/30 text-astu-navy dark:text-amber-400">
                  <Bell className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-xl font-bold text-astu-navy dark:text-white">Official Notices & Announcements</h3>
                  <p className="text-xs text-on-surface-variant dark:text-slate-400">All public university announcements and official directives.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAllNotices(false);
                  setNoticeSearch('');
                }}
                className="rounded-full p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-page)] dark:hover:bg-slate-700 hover:text-[var(--text-secondary)] dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={noticeSearch}
                onChange={(e) => setNoticeSearch(e.target.value)}
                placeholder="Search notices by keyword..."
                className="w-full rounded-lg border border-outline-variant dark:border-slate-600 bg-[var(--bg-page)] dark:bg-slate-900 py-2.5 pl-9 pr-3 text-sm text-astu-navy dark:text-white outline-none focus:border-astu-navy dark:focus:border-amber-400 focus:bg-white dark:focus:bg-slate-800"
              />
            </div>

            <div className="mt-4 flex-1 overflow-y-auto divide-y divide-outline-variant dark:divide-slate-700 pr-1">
              {liveAnnouncements
                .filter(n => !noticeSearch || n.title.toLowerCase().includes(noticeSearch.toLowerCase()) || (n.excerpt && n.excerpt.toLowerCase().includes(noticeSearch.toLowerCase())))
                .map((announcement, idx) => (
                  <button
                    key={announcement.title + idx}
                    onClick={() => {
                      setShowAllNotices(false);
                      setSelectedNotice(announcement);
                    }}
                    className="flex w-full items-start gap-3.5 py-3.5 px-2 text-left hover:bg-surface-container-low/80 dark:hover:bg-slate-700/50 rounded-xl transition-all cursor-pointer group"
                  >
                    <Bell className="mt-1 h-4 w-4 shrink-0 text-astu-red group-hover:scale-110 transition-transform" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="block text-sm font-semibold text-astu-navy dark:text-white group-hover:text-astu-red dark:group-hover:text-amber-400 transition-colors">{announcement.title}</span>
                        <span className="shrink-0 text-[10px] font-bold text-[var(--text-muted)] dark:text-slate-500">{announcement.date}</span>
                      </div>
                      <span className="mt-1 block text-xs text-on-surface-variant dark:text-slate-400">{announcement.type}</span>
                      {announcement.excerpt && (
                        <p className="mt-1 text-xs text-[var(--text-secondary)] dark:text-slate-400 line-clamp-2">{announcement.excerpt}</p>
                      )}
                    </div>
                  </button>
                ))}
            </div>

            <div className="mt-4 border-t border-outline-variant dark:border-slate-700 pt-3 flex justify-end">
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
          <div className="relative max-w-lg w-full rounded-2xl bg-[var(--bg-card)] dark:bg-slate-800 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {!confirmedQrPass ? (
              <>
                <div className="flex items-center justify-between border-b dark:border-slate-700 pb-3 border-[var(--border-color)]">
                  <div>
                    <span className="rounded-md bg-astu-navy px-2.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">{rsvpModalItem.kind} Registration</span>
                    <h3 className="mt-1.5 text-lg font-bold text-astu-navy dark:text-white">{rsvpModalItem.title}</h3>
                  </div>
                  <button onClick={() => setRsvpModalItem(null)} className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-page)] dark:hover:bg-slate-700 hover:text-[var(--text-secondary)] dark:hover:text-slate-200">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="rounded-xl bg-[var(--bg-page)] dark:bg-slate-900/50 p-3.5 text-xs space-y-1 border border-[var(--border-color)] dark:border-slate-700">
                  <p className="text-[var(--text-secondary)] dark:text-slate-300"><span className="font-semibold text-[var(--text-primary)] dark:text-white">Scheduled Date:</span> {rsvpModalItem.date}</p>
                  {rsvpModalItem.location && <p className="text-[var(--text-secondary)] dark:text-slate-300"><span className="font-semibold text-[var(--text-primary)] dark:text-white">Venue / Location:</span> {rsvpModalItem.location}</p>}
                  <p className="text-[10px] text-[var(--text-muted)] dark:text-slate-400 font-medium pt-1">Free Admission • A registration reference is generated after you submit</p>
                </div>

                <div className="space-y-3 pt-1">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-[var(--text-secondary)] dark:text-slate-300">Full Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={rsvpName}
                        onChange={(e) => setRsvpName(e.target.value)}
                        placeholder="e.g. Dr. Abebe Yosef"
                        className="mt-1 w-full rounded-lg border border-[var(--border-color)] dark:border-slate-600 bg-[var(--bg-card)] dark:bg-slate-900 text-[var(--text-primary)] dark:text-white px-3.5 py-2 text-sm outline-none focus:border-astu-navy dark:focus:border-amber-400 focus:ring-1 focus:ring-astu-navy dark:focus:ring-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[var(--text-secondary)] dark:text-slate-300">Email Address <span className="text-red-500">*</span></label>
                      <input
                        type="email"
                        value={rsvpEmail}
                        onChange={(e) => setRsvpEmail(e.target.value)}
                        placeholder="e.g. abebe@astu.edu.et"
                        className="mt-1 w-full rounded-lg border border-[var(--border-color)] dark:border-slate-600 bg-[var(--bg-card)] dark:bg-slate-900 text-[var(--text-primary)] dark:text-white px-3.5 py-2 text-sm outline-none focus:border-astu-navy dark:focus:border-amber-400 focus:ring-1 focus:ring-astu-navy dark:focus:ring-amber-400"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-[var(--text-secondary)] dark:text-slate-300">Phone Number</label>
                      <input
                        type="tel"
                        value={rsvpPhone}
                        onChange={(e) => setRsvpPhone(e.target.value)}
                        placeholder="e.g. +251 911 234 567"
                        className="mt-1 w-full rounded-lg border border-[var(--border-color)] dark:border-slate-600 bg-[var(--bg-card)] dark:bg-slate-900 text-[var(--text-primary)] dark:text-white px-3.5 py-2 text-sm outline-none focus:border-astu-navy dark:focus:border-amber-400 focus:ring-1 focus:ring-astu-navy dark:focus:ring-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[var(--text-secondary)] dark:text-slate-300">Participant Status</label>
                      <select
                        value={rsvpRole}
                        onChange={(e) => setRsvpRole(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-[var(--border-color)] dark:border-slate-600 bg-[var(--bg-card)] dark:bg-slate-900 text-[var(--text-primary)] dark:text-white px-3.5 py-2 text-sm outline-none focus:border-astu-navy dark:focus:border-amber-400 focus:ring-1 focus:ring-astu-navy dark:focus:ring-amber-400"
                      >
                        <option value="Alumni">ASTU Alumni</option>
                        <option value="Student">Graduating Senior Student</option>
                        <option value="Faculty / Staff">Faculty / University Staff</option>
                        <option value="Employer Partner">Corporate Employer Partner</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[var(--text-secondary)] dark:text-slate-300">Department / Organization</label>
                    <input
                      type="text"
                      value={rsvpAffiliation}
                      onChange={(e) => setRsvpAffiliation(e.target.value)}
                      placeholder="e.g. School of Electrical Engineering & Computing"
                      className="mt-1 w-full rounded-lg border border-[var(--border-color)] dark:border-slate-600 bg-[var(--bg-card)] dark:bg-slate-900 text-[var(--text-primary)] dark:text-white px-3.5 py-2 text-sm outline-none focus:border-astu-navy dark:focus:border-amber-400 focus:ring-1 focus:ring-astu-navy dark:focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[var(--text-secondary)] dark:text-slate-300">Special Accommodations / Dietary Notes (Optional)</label>
                    <input
                      type="text"
                      value={rsvpNotes}
                      onChange={(e) => setRsvpNotes(e.target.value)}
                      placeholder="e.g. Wheelchair access / Vegetarian meal"
                      className="mt-1 w-full rounded-lg border border-[var(--border-color)] dark:border-slate-600 bg-[var(--bg-card)] dark:bg-slate-900 text-[var(--text-primary)] dark:text-white px-3.5 py-2 text-sm outline-none focus:border-astu-navy dark:focus:border-amber-400 focus:ring-1 focus:ring-astu-navy dark:focus:ring-amber-400"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border-color)] dark:border-slate-700">
                  <button onClick={() => setRsvpModalItem(null)} className="rounded-lg border border-[var(--border-color)] dark:border-slate-600 px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] dark:text-slate-300 hover:bg-[var(--bg-page)] dark:hover:bg-slate-700">
                    Cancel
                  </button>
                  <button onClick={confirmRsvpRegistration} className="rounded-lg bg-[#003580] px-5 py-2 text-xs font-semibold text-white hover:brightness-110 shadow-md">
                    Complete & Confirm RSVP
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center space-y-4 py-2">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)] dark:text-white">Registration Confirmed!</h3>
                  <p className="mt-1 text-xs text-[var(--text-muted)] dark:text-slate-400">{rsvpModalItem.title}</p>
                  <p className="text-[11px] text-[var(--text-muted)] dark:text-slate-500 mt-0.5">Participant: {rsvpName} ({rsvpEmail})</p>
                </div>

                <div className="mx-auto w-48 h-48 rounded-xl border-2 border-[var(--border-color)] dark:border-slate-600 p-3 bg-[var(--bg-card)] dark:bg-slate-100 flex items-center justify-center shadow-inner">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(confirmedQrPass)}`}
                    alt="Entry Ticket Code"
                    className="h-full w-full object-contain"
                  />
                </div>

                <p className="text-[11px] text-[var(--text-muted)] dark:text-slate-400">
                    Keep this reference for your records. Entry check-in is not yet
                    automated — nothing scans this code at the venue yet.
                  </p>

                <button
                  onClick={() => setRsvpModalItem(null)}
                  className="w-full rounded-xl bg-slate-900 dark:bg-slate-700 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 dark:hover:bg-slate-600"
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
