import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock,
  Edit3,
  Eye,
  FileText,
  Globe,
  GraduationCap,
  Handshake,
  HelpCircle,
  Image as ImageIcon,
  ImagePlus,
  Megaphone,
  Newspaper,
  PlayCircle,
  Plus,
  Quote,
  Save,
  ShieldCheck,
  Star,
  Heart,
  Trash2,
  Trophy,
  Upload,
  Users,
  X,
  Zap,
  MessageSquareText,
  Mail,
  Bell,
  UserRoundCheck,
  LineChart,
  LockKeyhole,
  FileCheck2,
  MapPin,
  Phone,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Search,
  Sparkles,
  Layers3,
  SlidersHorizontal,
  FolderOpen,
  Download,
  AlertCircle,
  Check,
  ArrowUp,
  ArrowDown,
  Monitor,
  Tablet,
  Smartphone,
  Maximize2,
  Minimize2,
  Columns,
  Layout,
} from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import AdminBadge from '../components/AdminBadge';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminModal from '../components/AdminModal';
import ImageUploader from '../components/ImageUploader';
import HomepageLivePreviewCanvas from '../components/HomepageLivePreviewCanvas';
import homepageCmsService, {
  HomepageCmsConfig,
  HeroSlide,
  ImpactStat,
  StakeholderPortal,
  CampusLifeCard,
  Campus,
  GalleryImage,
  VideoItem,
  EventItem,
  WorkshopItem,
  NewsItem,
  Announcement,
  SuccessStory,
  Partner,
  FeaturedEmployerItem,
  Testimonial,
  FaqItem,
  defaultSectionLinks,
  PartnersPageConfig,
  PartnerBenefit,
  defaultPartnersPageConfig,
} from '../services/homepageCms.service';
import { defaultDetailPages, DetailPageItem, DetailPageSection } from '../services/detailPages.data';
import { usePublicMetrics } from '../../../services/publicMetrics.service';
import { mediaUrl } from '../../../config';

/* ─── Category Types ─── */
type CmsCategory =
  | 'hero'
  | 'impact'
  | 'portals'
  | 'campus-life'
  | 'gallery'
  | 'events-news'
  | 'community'
  | 'partners-portal'
  | 'accreditation-faq'
  | 'giving-campaigns'
  | 'detail-pages'
  | 'footer-cta';

const CATEGORIES: { id: CmsCategory; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
  { id: 'hero', label: '1. Hero & Alert', icon: ImagePlus, desc: 'Welcome ticker, hero slides, badge & portal action buttons' },
  { id: 'impact', label: '2. Impact Headers', icon: BarChart3, desc: 'Section copy for Impact — live counters stay synced from AMS metrics' },
  { id: 'portals', label: '3. How It Works', icon: Users, desc: 'Journey steps shown in studio preview & stakeholder portal cards' },
  { id: 'campus-life', label: '4. Campus Life', icon: Star, desc: 'Campus highlights, labs bridge copy & facility cards' },
  { id: 'gallery', label: '5. Gallery & Video', icon: ImageIcon, desc: 'Campus Moments headers, photo grid & video gallery cards' },
  { id: 'events-news', label: '6. Events & Notices', icon: CalendarDays, desc: 'Alumni events, workshops, announcements & news headers' },
  { id: 'partners-portal', label: '7. Partners', icon: Briefcase, desc: 'Partner logos, featured employers & recruitment tracks' },
  { id: 'community', label: '8. Community & Stories', icon: MessageSquareText, desc: 'Community strip, alumni voices, success stories & testimonials' },
  { id: 'giving-campaigns', label: '9. Giving', icon: Heart, desc: 'Homepage giving header & research fund callouts' },
  { id: 'accreditation-faq', label: '10. FAQ', icon: ShieldCheck, desc: 'Homepage FAQ preview (3 items) + full /info/faq page — keep in sync' },
  { id: 'footer-cta', label: '11. CTA & Footer', icon: MapPin, desc: 'Community CTA buttons, office contacts & copyright' },
  { id: 'detail-pages', label: 'Sub-Pages', icon: FileText, desc: 'Overview, Contact Us and 22+ institutional pages linked from the homepage' },
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Users, Building2, LineChart, FileCheck2, MessageSquareText, Briefcase, LockKeyhole, Globe, BookOpen, Star, Handshake, ShieldCheck, Trophy, GraduationCap, Zap, Phone, Mail, MapPin, CalendarDays, Award: Trophy,
};

/* ─── Empty starters — post real CMS content, then test; never auto-fill demo rows ─── */
const initialHeroSlides: HeroSlide[] = [];
const initialImpactStats: ImpactStat[] = [];
const initialPortals: StakeholderPortal[] = [];
const initialCampusLife: CampusLifeCard[] = [];
const initialCampuses: Campus[] = [];
const initialGallery: GalleryImage[] = [];
const initialVideos: VideoItem[] = [];
const initialEvents: EventItem[] = [];
const initialWorkshops: WorkshopItem[] = [];
const initialNews: NewsItem[] = [];
const initialAnnouncements: Announcement[] = [];
const initialStories: SuccessStory[] = [];
const initialPartners: Partner[] = [];
const initialFeaturedEmployers: FeaturedEmployerItem[] = [];
const initialTestimonials: Testimonial[] = [];
const initialFaq: FaqItem[] = [];

export default function HomepageManagement({ initialCategory }: { initialCategory?: CmsCategory } = {}) {
  const [searchParams] = useSearchParams();
  const urlCategory = (searchParams.get('category') || searchParams.get('tab')) as CmsCategory;
  const urlPage = searchParams.get('page');

  const [activeCategory, setActiveCategory] = useState<CmsCategory>(
    initialCategory || urlCategory || (urlPage ? 'detail-pages' : 'hero')
  );
  const { metrics } = usePublicMetrics();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');
  const [studioMode, setStudioMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  /* ── 1. Hero & Top Banner ── */
  const [welcomeMessage, setWelcomeMessage] = useState('Welcome to the ASTU Alumni Management System — Connecting graduates, employers, and departments for longitudinal career tracking and institutional excellence.');
  const [welcomeEnabled, setWelcomeEnabled] = useState(true);
  const [heroBadge, setHeroBadge] = useState('ASTU Alumni Management System');
  const [heroButtons, setHeroButtons] = useState({
    primaryText: 'Alumni Portal',
    primaryLink: '/info/alumni-portal',
    secondaryText: 'Employer Partnership',
    secondaryLink: '/info/employer-portal',
  });
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(initialHeroSlides);

  /* ── 2. Impact & Key Numbers ── */
  const [impactHeaders, setImpactHeaders] = useState({
    eyebrow: 'ASTU IMPACT AT A GLANCE',
    title: 'Measurable Outcomes Connecting Academia to Industry',
    description: 'Empirical data tracking our graduates across global technology sectors and research hubs.',
  });
  const [impactStats, setImpactStats] = useState<ImpactStat[]>(initialImpactStats);

  /* ── 3. Portals & Ecosystem ── */
  const [portalsHeaders, setPortalsHeaders] = useState({
    eyebrow: 'Get Started',
    title: 'How ASTU-AMS Works',
    description: "From registration to real impact — here's how our platform empowers alumni, employers, and the university community in four simple steps.",
    ctaText: 'Get Started Today',
    ctaLink: '/login',
  });
  const [portals, setPortals] = useState<StakeholderPortal[]>(initialPortals);

  /* ── 4. Campus Life & Labs ── */
  const [campusLifeHeaders, setCampusLifeHeaders] = useState({
    eyebrow: 'Explore Life At ASTU',
    title: 'Campus Life & Facilities',
    description: 'Discover clubs, facilities, and daily campus culture at Adama Science and Technology University.',
  });
  const [campusLife, setCampusLife] = useState<CampusLifeCard[]>(initialCampusLife);
  const [campuses, setCampuses] = useState<Campus[]>(initialCampuses);
  const [gallery, setGallery] = useState<GalleryImage[]>(initialGallery);
  const [galleryHeaders, setGalleryHeaders] = useState({
    eyebrow: 'Campus Moments',
    title: 'Photo Gallery',
    subtitle: 'A curated look at graduation stages, research exhibitions, and campus life at ASTU.',
    buttonText: 'Explore Full Gallery',
    buttonLink: '/gallery',
  });
  const [videos, setVideos] = useState<VideoItem[]>(initialVideos);
  const [industryBridge, setIndustryBridge] = useState({
    enabled: true,
    eyebrow: 'Industry-Campus Bridge',
    title: 'Nurturing Innovation in Modern Laboratories',
    description: 'ASTU combines rigorous engineering education with practical lab training. Through ASTU-AMS, graduate outcomes and employer feedback feed directly into curriculum updates.',
    stat1Value: '12+',
    stat1Label: 'Research Centers',
    stat2Value: '80+',
    stat2Label: 'Industry Partners',
    buttonText: 'Explore Campus Life',
    buttonLink: '/info/campus-life',
    image: '/images/arc.jpg',
  });

  /* ── 5. Events & Notices ── */
  const [eventsHeaders, setEventsHeaders] = useState({
    eyebrow: 'Events & Workshops',
    title: 'Gatherings & Technical Training',
    description: 'Join campus career expos, technical workshops, and alumni reunions across ASTU.',
    viewAllText: 'See All Events',
    viewAllLink: '/events',
  });
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [workshops, setWorkshops] = useState<WorkshopItem[]>(initialWorkshops);
  const [announcementsHeaders, setAnnouncementsHeaders] = useState({
    eyebrow: 'Official Updates',
    title: 'News & Announcements',
    subscribeTitle: 'Subscribe to official updates',
    subscribeDesc: 'Receive announcements, events, partner calls, tracer survey reminders, and campus notices directly in your inbox.',
  });
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [newsHeaders, setNewsHeaders] = useState({
    eyebrow: 'Campus News',
    title: 'Latest ASTU Highlights',
    description: 'University notices, academic bulletins, and alumni community circulars.',
  });
  const [newsItems, setNewsItems] = useState<NewsItem[]>(initialNews);

  /* ── 6. Stories & Partners ── */
  const [storiesHeaders, setStoriesHeaders] = useState({
    eyebrow: 'Community Voices',
    title: 'Alumni & Partner Stories',
    description: 'Hear from our graduates making regional impact and enterprise employers building the future.',
  });
  const [stories, setStories] = useState<SuccessStory[]>(initialStories);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials);
  const [partnersHeaders, setPartnersHeaders] = useState({
    eyebrow: 'Our Partners',
    title: 'Partner Companies',
    description: 'Institutional partners supporting employability, internships, and research collaboration.',
  });
  const [partners, setPartners] = useState<Partner[]>(initialPartners);
  const [featuredEmployers, setFeaturedEmployers] = useState<FeaturedEmployerItem[]>(initialFeaturedEmployers);

  /* ── 8. Homepage Giving & Research Funds Section ── */
  const [givingSection, setGivingSection] = useState({
    title: 'Support Future Innovators & Campus Research',
    subtitle: 'Active campaigns organized by the ASTU Alumni & Advancement Office. 100% of your tax-deductible gift directly funds undergraduate scholarships, research labs, student welfare, and campus innovation.',
    buttonText: 'Explore All Causes',
  });

  /* ── 6.5. Homepage Community Section ── */
  const [liveCommunitySection, setLiveCommunitySection] = useState({
    eyebrow: 'ASTU Alumni Community',
    title: 'ASTU Alumni Community',
    subtitle: 'Connect your alumni network globally and help expand the community of Adama Science and Technology University graduates making a difference worldwide.',
    stats: [
      { value: '1,238+', label: 'Alumni Members' },
      { value: '5', label: 'Fields of Study' },
      { value: '500+', label: 'Global Partners' },
    ],
  });
  const [liveCommunityPosts, setLiveCommunityPosts] = useState<any[]>([
    {
      id: 'CP-1',
      name: 'Abebe Yosef',
      role: 'Software Engineer',
      text: 'I landed my new role after using ASTU-AMS job matching and mentorship support. Thank you ASTU community.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      active: true,
    },
    {
      id: 'CP-2',
      name: 'Bekele Kebede',
      role: 'Employer Partner',
      text: 'Hiring from ASTU-AMS has been efficient. We found strong engineering candidates with the right practical skills.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
      active: true,
    },
    {
      id: 'CP-3',
      name: 'Helina Sileshi',
      role: 'Mentor & Alumni',
      text: 'Proud to mentor ASTU students through the AMS platform. The next generation of innovators is ready!',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
      active: true,
    },
  ]);

  const updateCommunitySection = (updates: any) => {
    setLiveCommunitySection(prev => ({ ...prev, ...updates }));
    notifyChange();
  };

  const updateCommunitySectionStats = (index: number, updates: any) => {
    setLiveCommunitySection(prev => ({
      ...prev,
      stats: prev.stats.map((stat: any, i: number) => i === index ? { ...stat, ...updates } : stat),
    }));
    notifyChange();
  };

  /* ── 7. Accreditation & FAQ ── */
  const [accreditation, setAccreditation] = useState({
    eyebrow: 'Quality Assurance',
    title: 'Data-Driven Accreditation & Excellence',
    description: 'ASTU-AMS provides verified tracer data, employment analytics, and employer feedback required by accreditation agencies and university management.',
    point1Title: 'Global Accreditation',
    point1Desc: 'Build transparent, audited institutional reports meeting international standards.',
    point2Title: 'Market Alignment',
    point2Desc: 'Align engineering curricula with regional and global industry expectations.',
    buttonText: 'View Impact Numbers',
    buttonLink: '/info/impact-numbers',
    image1: '/images/arc.jpg',
    image2: '/images/electriclabs.jpeg',
  });
  const [faqHeaders, setFaqHeaders] = useState({
    eyebrow: 'FAQ',
    title: 'Frequently Asked Questions',
    description: 'Common questions about ASTU-AMS, tracer studies, and alumni services.',
  });
  const [faq, setFaq] = useState<FaqItem[]>(initialFaq);

  /* ── 8. Detail Pages (All 22 /info/:slug pages) ── */
  const [detailPages, setDetailPages] = useState<Record<string, DetailPageItem>>(defaultDetailPages);
  const [selectedDetailSlug, setSelectedDetailSlug] = useState<string>(urlPage || 'overview');

  useEffect(() => {
    const page = searchParams.get('page');
    if (page) {
      setSelectedDetailSlug(page);
      setActiveCategory('detail-pages');
    }
    const cat = (searchParams.get('category') || searchParams.get('tab')) as CmsCategory;
    if (cat) {
      setActiveCategory(cat);
    }
  }, [searchParams]);

  /* ── 8b. Partners & Employer Portal Page (/partners) ── */
  const [partnersPage, setPartnersPage] = useState<PartnersPageConfig>(defaultPartnersPageConfig);
  const updatePartnersPage = (updates: Partial<PartnersPageConfig>) => {
    notifyChange();
    setPartnersPage(prev => ({ ...prev, ...updates }));
  };

  /* ── 9. CTA & Footer Directory ── */
  const [ctaSection, setCtaSection] = useState({
    enabled: true,
    title: 'Ready to Join ASTU-AMS?',
    description: 'Connect with fellow alumni, discover career opportunities, and contribute to university excellence.',
    primaryCtaText: 'Alumni Portal',
    primaryCtaLink: '/login',
    secondaryCtaText: 'Employer Portal',
    secondaryCtaLink: '/login',
  });
  const [footer, setFooter] = useState({
    aboutText: 'Connecting graduates, corporate employers, and department heads in one unified ecosystem. Improving national quality audits and modernizing student career placements.',
    address: 'Adama Science and Technology University, Adama, Oromia, Ethiopia',
    poBox: 'P.O. Box 1888, Adama, Ethiopia',
    phone: '+251-221-110000',
    email: 'irccd@astu.edu.et',
    officeHours: 'Monday to Friday, 8:00 AM – 5:00 PM (EAT)',
    socialFacebook: 'https://facebook.com/adamaastu',
    socialTelegram: 'https://t.me/Adama_STU_Almuni',
    socialTwitter: '#',
    socialLinkedin: '#',
    copyrightText: 'Adama Science and Technology University. All rights reserved.',
  });

  /* ── 10. Section Links & Navigation ── */
  const [sectionLinks, setSectionLinks] = useState<typeof defaultSectionLinks>(defaultSectionLinks);
  const updateSectionLink = (key: keyof typeof defaultSectionLinks, value: string) => {
    notifyChange();
    setSectionLinks(prev => ({ ...prev, [key]: value }));
  };

  const [detailPageSearch, setDetailPageSearch] = useState('');
  const [detailPageCategory, setDetailPageCategory] = useState<'all' | 'portals' | 'impact' | 'campus' | 'community'>('all');

  const navigateToDetailPage = (url: string) => {
    const cleanUrl = (url || '').trim();
    if (cleanUrl.startsWith('/info/')) {
      const slug = cleanUrl.replace('/info/', '').split('/')[0].split('?')[0];
      if (slug) {
        setSelectedDetailSlug(slug);
        setActiveCategory('detail-pages');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const isInitialLoad = useRef(true);

  // ── Load from API & localStorage ──
  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsReloading(true);
    try {
      const liveConfig = await homepageCmsService.fetchFromApi();
      const cfg = liveConfig || homepageCmsService.getSettings();
      if (cfg) {
        if (cfg.welcomeMessage !== undefined) setWelcomeMessage(cfg.welcomeMessage);
        if (cfg.welcomeEnabled !== undefined) setWelcomeEnabled(cfg.welcomeEnabled);
        if (cfg.heroBadge) setHeroBadge(cfg.heroBadge);
        if (cfg.heroButtons) setHeroButtons(cfg.heroButtons);
        // An empty array is meaningful: it means every hero slide was
        // intentionally deleted. Do not replace it with the initial demo
        // slides during the next backend reload.
        if (Array.isArray(cfg.heroSlides)) setHeroSlides(cfg.heroSlides);
        if (cfg.impactHeaders) setImpactHeaders(cfg.impactHeaders);
        if (Array.isArray(cfg.impactStats)) setImpactStats(cfg.impactStats);
        if (cfg.portalsHeaders) setPortalsHeaders(cfg.portalsHeaders);
        if (Array.isArray(cfg.portals)) setPortals(cfg.portals);
        if (cfg.campusLifeHeaders) setCampusLifeHeaders(cfg.campusLifeHeaders);
        if (Array.isArray(cfg.campusLife)) setCampusLife(cfg.campusLife);
        if (Array.isArray(cfg.campuses)) setCampuses(cfg.campuses);
        if (Array.isArray(cfg.gallery)) setGallery(cfg.gallery);
        if (cfg.galleryHeaders) setGalleryHeaders(cfg.galleryHeaders);
        else if ((cfg as any).gallerySection) setGalleryHeaders((cfg as any).gallerySection);
        if (Array.isArray(cfg.videos)) setVideos(cfg.videos);
        if (cfg.industryBridge) setIndustryBridge(cfg.industryBridge);
        if (cfg.eventsHeaders) {
          const raw = cfg.eventsHeaders;
          const desc = String(raw.description || '').replace(/^Gatherings\s*(&|and)\s*training\s*·\s*/i, '').trim();
          const eyebrow = /calendar.*gatherings/i.test(String(raw.eyebrow || ''))
            ? 'Events & Workshops'
            : raw.eyebrow || 'Events & Workshops';
          setEventsHeaders({
            ...raw,
            eyebrow,
            title: raw.title || 'Gatherings & Technical Training',
            description: desc || 'Join campus career expos, technical workshops, and alumni reunions across ASTU.',
          });
        }
        if (Array.isArray(cfg.events)) setEvents(cfg.events);
        if (Array.isArray(cfg.workshops)) setWorkshops(cfg.workshops);
        if (cfg.announcementsHeaders) {
          const raw: any = cfg.announcementsHeaders;
          const desc = String(raw.description || raw.subscribeDesc || '').replace(/^Official\s*updates\s*·\s*/i, '').trim();
          setAnnouncementsHeaders({
            ...raw,
            eyebrow: raw.eyebrow || 'Official Updates',
            title: raw.title || 'News & Announcements',
            subscribeTitle: raw.subscribeTitle || 'Subscribe to official updates',
            subscribeDesc: desc || raw.subscribeDesc || 'Receive announcements, events, partner calls, tracer survey reminders, and campus notices directly in your inbox.',
          });
        }
        if (Array.isArray(cfg.announcements)) setAnnouncements(cfg.announcements);
        if (cfg.newsHeaders) {
          const raw: any = cfg.newsHeaders;
          setNewsHeaders({
            ...raw,
            eyebrow: raw.eyebrow || 'Campus News',
            title: raw.title || 'Latest ASTU Highlights',
            description: raw.description || 'University notices, academic bulletins, and alumni community circulars.',
          });
        }
        if (Array.isArray(cfg.newsItems)) setNewsItems(cfg.newsItems);
        if (cfg.storiesHeaders) setStoriesHeaders(cfg.storiesHeaders);
        if (Array.isArray(cfg.stories)) setStories(cfg.stories);
        if (Array.isArray(cfg.testimonials)) setTestimonials(cfg.testimonials);
        if (cfg.partnersHeaders) setPartnersHeaders(cfg.partnersHeaders);
        if (Array.isArray(cfg.partners)) setPartners(cfg.partners);
        if (Array.isArray(cfg.featuredEmployers)) setFeaturedEmployers(cfg.featuredEmployers);
        if (cfg.accreditation) setAccreditation(cfg.accreditation);
        if (cfg.faqHeaders) setFaqHeaders(cfg.faqHeaders);
        if (Array.isArray(cfg.faq)) setFaq(cfg.faq);
        if (cfg.ctaSection) setCtaSection(cfg.ctaSection);
        if (cfg.footer) setFooter(cfg.footer);
        if (cfg.sectionLinks) setSectionLinks(prev => ({ ...prev, ...cfg.sectionLinks }));
        if (cfg.detailPages && Object.keys(cfg.detailPages).length > 0) {
          setDetailPages({ ...defaultDetailPages, ...cfg.detailPages });
        }
        if (cfg.partnersPage) {
          setPartnersPage({ ...defaultPartnersPageConfig, ...cfg.partnersPage });
        }
        if (cfg.liveCommunitySection) setLiveCommunitySection(cfg.liveCommunitySection);
        if (Array.isArray(cfg.liveCommunityPosts)) setLiveCommunityPosts(cfg.liveCommunityPosts);
        if (cfg.givingSection) setGivingSection(cfg.givingSection);
      }
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setHasUnsavedChanges(false);
      if (isRefresh) toast.success('Homepage content reloaded from the server');
    } catch {
      if (isRefresh) toast.error('Could not reload homepage content');
    } finally {
      if (isRefresh) setIsReloading(false);
      setTimeout(() => {
        isInitialLoad.current = false;
      }, 200);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Mark unsaved changes when any state changes after initial load
  const notifyChange = () => {
    if (!isInitialLoad.current) {
      setHasUnsavedChanges(true);
    }
  };

  // Hero-slide actions are destructive or highly visible on the public site.
  // Persist each action as one small backend update instead of waiting for a
  // later page-wide save, which previously allowed a reload to restore a
  // deleted slide from the server's older configuration.
  const persistHeroSlides = useCallback(async (nextSlides: HeroSlide[], successMessage: string) => {
    setHeroSlides(nextSlides);
    notifyChange();
    setIsSaving(true);
    try {
      const saved = await homepageCmsService.saveSettings({ heroSlides: nextSlides });
      if (!saved) throw new Error('The server did not confirm the update.');
      setHasUnsavedChanges(false);
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      toast.success(successMessage);
    } catch {
      toast.error('The change is saved only in this browser. Please retry when the backend is available.');
    } finally {
      setIsSaving(false);
    }
  }, []);

  // ── Save to Backend ──
  const handleSaveAll = useCallback(async (showToast = true) => {
    setIsSaving(true);
    const payload: HomepageCmsConfig = {
      welcomeMessage,
      welcomeEnabled,
      heroBadge,
      heroButtons,
      heroSlides,
      impactHeaders,
      impactStats,
      portalsHeaders,
      portals,
      campusLifeHeaders,
      campusLife,
      campuses,
      gallery,
      galleryHeaders,
      gallerySection: galleryHeaders,
      videos,
      industryBridge,
      eventsHeaders,
      events,
      workshops,
      announcementsHeaders,
      announcements,
      newsHeaders,
      newsItems,
      storiesHeaders,
      stories,
      testimonials,
      partnersHeaders,
      partners,
      featuredEmployers,
      accreditation,
      faqHeaders,
      faq,
      ctaSection,
      // Keep community CTA in sync with the public homepage bottomCta shape
      bottomCta: {
        enabled: ctaSection.enabled,
        title: ctaSection.title,
        description: ctaSection.description,
        primaryLabel: ctaSection.primaryCtaText,
        primaryRoute: ctaSection.primaryCtaLink,
        secondaryLabel: ctaSection.secondaryCtaText,
        secondaryRoute: ctaSection.secondaryCtaLink,
      },
      givingSection,
      footer,
      sectionLinks,
      detailPages,
      partnersPage,
      liveCommunitySection,
      liveCommunityPosts,
      // Keep legacy keys synced for backward compatibility
      campusLifePage: detailPages['campus-life'],
      facilitiesPage: detailPages['facilities'],
      eventsPage: detailPages['events'],
      galleryPage: detailPages['gallery'],
    };

    try {
      const saved = await homepageCmsService.saveSettings(payload);
      if (!saved) throw new Error('The backend did not confirm the save.');
      setHasUnsavedChanges(false);
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      if (showToast) {
        toast.success('Homepage published — public site will show these updates');
      }
    } catch {
      toast.error('Publish failed. Changes stay in this browser until the server is available.');
    } finally {
      setIsSaving(false);
    }
  }, [
    welcomeMessage, welcomeEnabled, heroBadge, heroButtons, heroSlides,
    impactHeaders, impactStats, portalsHeaders, portals, campusLifeHeaders,
    campusLife, campuses, gallery, galleryHeaders, videos, industryBridge,
    eventsHeaders, events, workshops, announcementsHeaders, announcements,
    newsHeaders, newsItems, storiesHeaders, stories, testimonials,
    partnersHeaders, partners, featuredEmployers, accreditation, faqHeaders,
    faq, ctaSection, givingSection, footer, sectionLinks, detailPages, partnersPage,
    liveCommunitySection, liveCommunityPosts,
  ]);

  // Keyboard shortcut Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveAll(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSaveAll]);

  // Every CMS mutation is backend-first. Debounce text edits into one publish.
  // Keep handleSaveAll behind a ref so identity churn cannot retrigger a save loop.
  const handleSaveAllRef = useRef(handleSaveAll);
  handleSaveAllRef.current = handleSaveAll;
  useEffect(() => {
    if (!hasUnsavedChanges || isSaving || isInitialLoad.current) return;
    const timer = window.setTimeout(() => void handleSaveAllRef.current(false), 1200);
    return () => window.clearTimeout(timer);
  }, [hasUnsavedChanges, isSaving]);

  // Total active count across all sections
  const totalActiveItems = useMemo(() => {
    const s = heroSlides.filter(x => x.active).length;
    const st = impactStats.filter(x => x.active).length;
    const p = portals.filter(x => x.active).length;
    const c = campusLife.filter(x => x.active).length;
    const e = events.filter(x => x.active).length;
    const w = workshops.filter(x => x.active).length;
    const a = announcements.filter(x => x.active).length;
    const n = newsItems.filter(x => x.active).length;
    const stg = stories.filter(x => x.active).length;
    const pt = partners.filter(x => x.active).length;
    const f = faq.filter(x => x.active).length;
    return s + st + p + c + e + w + a + n + stg + pt + f;
  }, [heroSlides, impactStats, portals, campusLife, events, workshops, announcements, newsItems, stories, partners, faq]);

  // Current detail page being edited
  const currentDetailPage: DetailPageItem = useMemo(() => {
    return (
      detailPages[selectedDetailSlug] ||
      defaultDetailPages[selectedDetailSlug] || {
        slug: selectedDetailSlug,
        title: 'New Page',
        subtitle: '',
        image: '',
        sections: [],
      }
    );
  }, [detailPages, selectedDetailSlug]);

  const updateCurrentDetailPage = (updates: Partial<DetailPageItem>) => {
    notifyChange();
    setDetailPages(prev => ({
      ...prev,
      [selectedDetailSlug]: {
        ...currentDetailPage,
        ...updates,
      },
    }));
  };

  // Section modal helper
  const [modalState, setModalState] = useState<{
    open: boolean;
    title: string;
    itemType: string;
    itemData: any;
    onSave: (data: any) => void;
  }>({
    open: false,
    title: '',
    itemType: '',
    itemData: null,
    onSave: () => {},
  });

  const closeModal = () => {
    setModalState(p => ({ ...p, open: false, itemData: null }));
  };

  /* ──────────────────────────────────────────────────────────────────────────
     RENDER WORKSPACE BY CATEGORY
  ────────────────────────────────────────────────────────────────────────── */
  const renderCategoryContent = () => {
    switch (activeCategory) {
      /* ══════════════════════════════════════════════════════════════════════
         1. HERO & ANNOUNCEMENTS
      ══════════════════════════════════════════════════════════════════════ */
      case 'hero':
        return (
          <div className="space-y-6">
            {/* Top Alert Ticker */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-astu-navy/10 text-astu-navy dark:bg-sky-500/10 dark:text-sky-400 font-bold">
                      <Bell className="h-4 w-4" />
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Top Announcement Ticker Banner</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Appears as the notice bar at the very top of the public homepage.</p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={welcomeEnabled}
                      onChange={e => { setWelcomeEnabled(e.target.checked); notifyChange(); }}
                      className="h-4 w-4 rounded text-astu-navy focus:ring-astu-navy cursor-pointer"
                    />
                    <span>{welcomeEnabled ? 'Enabled on Live Site' : 'Hidden'}</span>
                  </label>
                </div>
              </div>
              {welcomeEnabled && (
                <div className="mb-3 overflow-hidden rounded-lg border border-astu-navy/20 bg-gradient-to-r from-astu-navy via-[#003f7d] to-astu-navy text-white">
                  <div className="flex items-center gap-2.5 px-3 py-2">
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-astu-red px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                      <Bell className="h-2.5 w-2.5" />
                      Notice
                    </span>
                    <p className="truncate text-[11px] font-medium text-white/95">
                      {welcomeMessage || 'Enter alert text below…'}
                    </p>
                  </div>
                </div>
              )}
              <textarea
                value={welcomeMessage}
                onChange={e => { setWelcomeMessage(e.target.value); notifyChange(); }}
                rows={2}
                placeholder="Enter alert text shown to all visitors on the homepage..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-3 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-astu-navy/20 focus:border-astu-navy resize-none"
              />
            </div>

            {/* Hero Badge & Action Buttons */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Hero Badge & Call-To-Action Buttons</h3>
                <p className="text-xs text-slate-500 mt-0.5">Fallback badge when a slide has no tagline, plus the two portal buttons under every slide headline on /.</p>
              </div>
              <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-950/95 p-3 dark:border-slate-700">
                <span className="inline-block rounded-full bg-astu-red px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                  {heroBadge || 'ASTU-AMS'}
                </span>
                <span className="inline-flex items-center gap-1 rounded-lg bg-astu-red px-2.5 py-1 text-[10px] font-bold text-white">
                  <Users className="h-3 w-3" />
                  {heroButtons.primaryText || 'Alumni Portal'}
                </span>
                <span className="inline-flex items-center gap-1 rounded-lg border border-white/30 bg-white/10 px-2.5 py-1 text-[10px] font-bold text-white">
                  {heroButtons.secondaryText || 'Employer Partnership'}
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Badge Eyebrow Text</label>
                  <input
                    type="text"
                    value={heroBadge}
                    onChange={e => { setHeroBadge(e.target.value); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-white"
                    placeholder="e.g. ASTU Alumni Management System"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Primary Button Label & Destination</label>
                  <div className="mt-1 flex gap-2">
                    <input
                      type="text"
                      value={heroButtons.primaryText}
                      onChange={e => { setHeroButtons({ ...heroButtons, primaryText: e.target.value }); notifyChange(); }}
                      className="w-1/2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs"
                      placeholder="Button text"
                    />
                    <input
                      type="text"
                      value={heroButtons.primaryLink}
                      onChange={e => { setHeroButtons({ ...heroButtons, primaryLink: e.target.value }); notifyChange(); }}
                      className="w-1/2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-mono"
                      placeholder="/info/alumni-portal"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Secondary Button Label & Destination</label>
                  <div className="mt-1 flex gap-2">
                    <input
                      type="text"
                      value={heroButtons.secondaryText}
                      onChange={e => { setHeroButtons({ ...heroButtons, secondaryText: e.target.value }); notifyChange(); }}
                      className="w-1/2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs"
                      placeholder="Button text"
                    />
                    <input
                      type="text"
                      value={heroButtons.secondaryLink}
                      onChange={e => { setHeroButtons({ ...heroButtons, secondaryLink: e.target.value }); notifyChange(); }}
                      className="w-1/2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-mono"
                      placeholder="/info/employer-portal"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Rotating Hero Carousel Slides */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Hero Carousel Slides ({heroSlides.length})</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Same full-bleed hero visitors see on the public homepage — photo, badge, headline, and CTAs.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setModalState({
                      open: true,
                      title: 'Add New Hero Carousel Slide',
                      itemType: 'hero-slide',
                      itemData: {
                        id: `HS-${Date.now()}`,
                        image: '/images/astu-building.jpg',
                        tagline: 'ASTU Innovation & Excellence',
                        title: 'Empowering the Next Generation of Engineers & Leaders',
                        description: 'Connecting university research, verified graduate outcomes, and premier industrial partnerships.',
                        active: true,
                      },
                      onSave: newItem => {
                        void persistHeroSlides([...heroSlides, newItem], 'Hero slide added and saved to backend');
                      },
                    });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-astu-navy text-white px-3 py-1.5 text-xs font-bold hover:brightness-110 cursor-pointer shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Slide
                </button>
              </div>

              <div className="space-y-4">
                {heroSlides.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center dark:border-slate-700 dark:bg-slate-800/40">
                    <ImagePlus className="mx-auto h-6 w-6 text-slate-400" />
                    <p className="mt-2 text-sm font-bold text-slate-700 dark:text-slate-200">No hero slides</p>
                    <p className="mt-1 text-xs text-slate-500">Use “Add Slide” to create the next published hero slide.</p>
                  </div>
                )}
                {heroSlides.map((slide, idx) => (
                  <div
                    key={slide.id || idx}
                    className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                  >
                    <div className="relative h-36 w-full overflow-hidden bg-slate-900">
                      <img
                        src={mediaUrl(slide.image)}
                        alt={slide.title}
                        className="h-full w-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).src = '/images/astu-building.jpg'; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/35 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-slate-950/20" />
                      <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        Slide #{idx + 1}
                      </span>
                      <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1.5">
                        <span className="inline-block rounded-full bg-astu-red px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                          {slide.tagline || heroBadge || 'ASTU-AMS'}
                        </span>
                        <h4 className="text-sm font-black text-white line-clamp-1 drop-shadow-sm">{slide.title || 'Untitled slide'}</h4>
                        <p className="text-[11px] text-white/85 line-clamp-1">{slide.description}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => {
                            if (idx === 0) return;
                            const next = [...heroSlides];
                            [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                            void persistHeroSlides(next, 'Hero slide order updated');
                          }}
                          className="rounded-md border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-700 cursor-pointer"
                          title="Move up"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === heroSlides.length - 1}
                          onClick={() => {
                            if (idx >= heroSlides.length - 1) return;
                            const next = [...heroSlides];
                            [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
                            void persistHeroSlides(next, 'Hero slide order updated');
                          }}
                          className="rounded-md border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-700 cursor-pointer"
                          title="Move down"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            void persistHeroSlides(
                              heroSlides.map((s, i) => i === idx ? { ...s, active: !s.active } : s),
                              slide.active ? 'Hero slide hidden on the public site' : 'Hero slide published on the public site'
                            );
                          }}
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold cursor-pointer transition-colors ${
                            slide.active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                          }`}
                        >
                          {slide.active ? 'Active on /' : 'Hidden'}
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setModalState({
                              open: true,
                              title: `Edit Hero Slide #${idx + 1}`,
                              itemType: 'hero-slide',
                              itemData: { ...slide },
                              onSave: updated => {
                                void persistHeroSlides(
                                  heroSlides.map((s, i) => i === idx ? { ...s, ...updated } : s),
                                  'Hero slide updated and saved to backend'
                                );
                              },
                            });
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-astu-navy px-2.5 py-1.5 text-[11px] font-bold text-white hover:brightness-110 cursor-pointer"
                        >
                          <Edit3 className="h-3 w-3" /> Edit Slide Details
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Delete this hero slide?')) {
                              void persistHeroSlides(
                                heroSlides.filter((_, i) => i !== idx),
                                'Hero slide deleted and saved to backend'
                              );
                            }
                          }}
                          className="inline-flex items-center gap-1 rounded-md border border-rose-200 px-2 py-1 text-[10px] font-bold text-rose-600 hover:bg-rose-50 dark:border-rose-900/70 dark:text-rose-400 dark:hover:bg-rose-950/30 cursor-pointer"
                          title="Delete Slide"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      /* ══════════════════════════════════════════════════════════════════════
         2. IMPACT & NUMBERS
      ══════════════════════════════════════════════════════════════════════ */
      case 'impact':
        return (
          <div className="space-y-6">
            {/* Impact Section Header */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Impact Section Header</h3>
                <p className="text-xs text-slate-500 mt-0.5">Control the headline and description text introducing the ASTU impact numbers.</p>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Eyebrow</label>
                  <input
                    type="text"
                    value={impactHeaders.eyebrow}
                    onChange={e => { setImpactHeaders({ ...impactHeaders, eyebrow: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-bold text-astu-red"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Main Title</label>
                  <input
                    type="text"
                    value={impactHeaders.title}
                    onChange={e => { setImpactHeaders({ ...impactHeaders, title: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Description</label>
                  <textarea
                    value={impactHeaders.description}
                    onChange={e => { setImpactHeaders({ ...impactHeaders, description: e.target.value }); notifyChange(); }}
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-700 dark:text-slate-300 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Metric Counter Cards */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Impact Statistic Counters ({impactStats.length})</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Counter cards displayed prominently below the hero banner.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setModalState({
                      open: true,
                      title: 'Add New Impact Stat Counter',
                      itemType: 'impact-stat',
                      itemData: {
                        id: `IS-${Date.now()}`,
                        label: 'New Impact Counter',
                        value: '100',
                        suffix: '+',
                        detail: 'Description detail text',
                        icon: 'BarChart3',
                        action: 'Explore',
                        target: '/info/overview',
                        active: true,
                      },
                      onSave: newItem => {
                        setImpactStats(prev => [...prev, newItem]);
                        notifyChange();
                        toast.success('Added new stat counter');
                      },
                    });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-astu-navy text-white px-3 py-1.5 text-xs font-bold hover:brightness-110 cursor-pointer shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Metric
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {impactStats.map((stat, idx) => {
                  const Icon = iconMap[stat.icon] || BarChart3;
                  return (
                    <div
                      key={stat.id || idx}
                      className="flex flex-col justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="p-2 rounded-lg bg-astu-navy/10 text-astu-navy dark:bg-sky-500/10 dark:text-sky-400">
                            <Icon className="h-4 w-4" />
                          </span>
                          <div>
                            <span className="text-lg font-bold text-astu-navy dark:text-white">
                              {stat.value}{stat.suffix}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setImpactStats(impactStats.map((s, i) => i === idx ? { ...s, active: !s.active } : s));
                              notifyChange();
                            }}
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold cursor-pointer ${
                              stat.active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            {stat.active ? 'Live' : 'Hidden'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Remove stat "${stat.label}"?`)) {
                                setImpactStats(impactStats.filter((_, i) => i !== idx));
                                notifyChange();
                                toast.success('Stat removed');
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                            title="Remove stat"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{stat.label}</p>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{stat.detail}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          <span className="truncate text-[10px] font-mono text-slate-400 max-w-[120px]" title={stat.target || ''}>
                            {stat.target || '/info/...'}
                          </span>
                          {stat.target?.startsWith('/info/') && (
                            <button
                              type="button"
                              onClick={() => navigateToDetailPage(stat.target)}
                              className="text-[10px] font-bold text-astu-navy dark:text-sky-400 hover:underline flex items-center gap-0.5 shrink-0 cursor-pointer"
                              title="Edit linked detail page content"
                            >
                              <Edit3 className="h-2.5 w-2.5" /> Edit Page Content
                            </button>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setModalState({
                              open: true,
                              title: `Edit Stat: ${stat.label}`,
                              itemType: 'impact-stat',
                              itemData: { ...stat },
                              onSave: updated => {
                                setImpactStats(impactStats.map((s, i) => i === idx ? { ...s, ...updated } : s));
                                notifyChange();
                                toast.success('Stat counter updated');
                              },
                            });
                          }}
                          className="text-xs font-bold text-astu-navy dark:text-sky-400 hover:underline cursor-pointer shrink-0"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      /* ══════════════════════════════════════════════════════════════════════
         3. STAKEHOLDER PORTALS & HOW IT WORKS
      ══════════════════════════════════════════════════════════════════════ */
      case 'portals':
        return (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">How It Works Section Header</h3>
                <p className="text-xs text-slate-500 mt-0.5">Eyebrow, title, and subtitle text introducing the platform ecosystem.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Eyebrow</label>
                  <input
                    type="text"
                    value={portalsHeaders.eyebrow}
                    onChange={e => { setPortalsHeaders({ ...portalsHeaders, eyebrow: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold text-astu-red"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Main Title</label>
                  <input
                    type="text"
                    value={portalsHeaders.title}
                    onChange={e => { setPortalsHeaders({ ...portalsHeaders, title: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Description Subtitle</label>
                  <textarea
                    value={portalsHeaders.description}
                    onChange={e => { setPortalsHeaders({ ...portalsHeaders, description: e.target.value }); notifyChange(); }}
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs text-slate-700 dark:text-slate-300 resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Bottom CTA Button Label</label>
                  <input
                    type="text"
                    value={portalsHeaders.ctaText}
                    onChange={e => { setPortalsHeaders({ ...portalsHeaders, ctaText: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Bottom CTA Route Link</label>
                  <input
                    type="text"
                    value={portalsHeaders.ctaLink}
                    onChange={e => { setPortalsHeaders({ ...portalsHeaders, ctaLink: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Stakeholder Cards */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Stakeholder Ecosystem Steps ({portals.length})</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Cards showing step-by-step role capabilities on the homepage.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setModalState({
                      open: true,
                      title: 'Add New Stakeholder Step Card',
                      itemType: 'portal',
                      itemData: {
                        id: `SP-${Date.now()}`,
                        title: 'Alumni Researchers',
                        icon: 'Zap',
                        pointsString: 'Collaborate with active faculties.\nCo-author accredited research papers.',
                        cta: 'Explore Research',
                        route: '/info/research',
                        active: true,
                      },
                      onSave: newItem => {
                        const newPoints = typeof newItem.pointsString === 'string'
                          ? newItem.pointsString.split('\n').filter(Boolean)
                          : newItem.points || [];
                        setPortals(prev => [...prev, { ...newItem, points: newPoints }]);
                        notifyChange();
                        toast.success('Added stakeholder card');
                      },
                    });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-astu-navy text-white px-3 py-1.5 text-xs font-bold hover:brightness-110 cursor-pointer shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Card
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                {portals.map((portal, idx) => {
                  const Icon = iconMap[portal.icon] || Users;
                  return (
                    <div
                      key={portal.id || idx}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="p-2 rounded-lg bg-astu-navy/10 text-astu-navy dark:bg-sky-500/10 dark:text-sky-400">
                            <Icon className="h-4 w-4" />
                          </span>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{portal.title}</h4>
                            <span className="text-[10px] text-slate-400">Step #{idx + 1}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setPortals(portals.map((p, i) => i === idx ? { ...p, active: !p.active } : p));
                              notifyChange();
                            }}
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold cursor-pointer ${
                              portal.active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            {portal.active ? 'Active' : 'Hidden'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Delete card "${portal.title}"?`)) {
                                setPortals(portals.filter((_, i) => i !== idx));
                                notifyChange();
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                        {portal.points && portal.points.map((pt, pIdx) => (
                          <p key={pIdx} className="line-clamp-1 flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-astu-green shrink-0" />
                            {pt}
                          </p>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          <span className="truncate text-[10px] font-mono text-slate-400 max-w-[120px]" title={portal.route || ''}>
                            {portal.route || '/info/...'}
                          </span>
                          {portal.route?.startsWith('/info/') && (
                            <button
                              type="button"
                              onClick={() => navigateToDetailPage(portal.route)}
                              className="text-[10px] font-bold text-astu-navy dark:text-sky-400 hover:underline flex items-center gap-0.5 shrink-0 cursor-pointer"
                              title="Edit linked detail page content"
                            >
                              <Edit3 className="h-2.5 w-2.5" /> Edit Page Content
                            </button>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setModalState({
                              open: true,
                              title: `Edit Portal: ${portal.title}`,
                              itemType: 'portal',
                              itemData: { ...portal, pointsString: (portal.points || []).join('\n') },
                              onSave: updated => {
                                const newPoints = typeof updated.pointsString === 'string'
                                  ? updated.pointsString.split('\n').filter(Boolean)
                                  : updated.points || [];
                                setPortals(portals.map((p, i) => i === idx ? { ...p, ...updated, points: newPoints } : p));
                                notifyChange();
                                toast.success('Portal updated');
                              },
                            });
                          }}
                          className="text-xs font-bold text-astu-navy dark:text-sky-400 hover:underline cursor-pointer shrink-0"
                        >
                          Edit Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      /* ══════════════════════════════════════════════════════════════════════
         4. CAMPUS LIFE & LABS
      ══════════════════════════════════════════════════════════════════════ */
      case 'campus-life':
        return (
          <div className="space-y-6">
            {/* Industry-Campus Bridge Banner */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Industry-Campus Bridge Spotlight</h3>
                  <p className="text-xs text-slate-500 mt-0.5">The prominent laboratory and research showcase banner on the homepage.</p>
                </div>
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={industryBridge.enabled !== false}
                    onChange={e => { setIndustryBridge({ ...industryBridge, enabled: e.target.checked }); notifyChange(); }}
                    className="h-4 w-4 rounded text-astu-navy cursor-pointer"
                  />
                  <span>{industryBridge.enabled !== false ? 'Enabled' : 'Hidden'}</span>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Eyebrow</label>
                  <input
                    type="text"
                    value={industryBridge.eyebrow}
                    onChange={e => { setIndustryBridge({ ...industryBridge, eyebrow: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold text-astu-red"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Headline</label>
                  <input
                    type="text"
                    value={industryBridge.title}
                    onChange={e => { setIndustryBridge({ ...industryBridge, title: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Description</label>
                  <textarea
                    value={industryBridge.description}
                    onChange={e => { setIndustryBridge({ ...industryBridge, description: e.target.value }); notifyChange(); }}
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Stat 1 (Value & Label)</label>
                  <div className="mt-1 flex gap-2">
                    <input
                      type="text"
                      value={industryBridge.stat1Value}
                      onChange={e => { setIndustryBridge({ ...industryBridge, stat1Value: e.target.value }); notifyChange(); }}
                      className="w-1/3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold"
                    />
                    <input
                      type="text"
                      value={industryBridge.stat1Label}
                      onChange={e => { setIndustryBridge({ ...industryBridge, stat1Label: e.target.value }); notifyChange(); }}
                      className="w-2/3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Stat 2 (Value & Label)</label>
                  <div className="mt-1 flex gap-2">
                    <input
                      type="text"
                      value={industryBridge.stat2Value}
                      onChange={e => { setIndustryBridge({ ...industryBridge, stat2Value: e.target.value }); notifyChange(); }}
                      className="w-1/3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold"
                    />
                    <input
                      type="text"
                      value={industryBridge.stat2Label}
                      onChange={e => { setIndustryBridge({ ...industryBridge, stat2Label: e.target.value }); notifyChange(); }}
                      className="w-2/3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Button Label & Link</label>
                  <div className="mt-1 flex gap-2">
                    <input
                      type="text"
                      value={industryBridge.buttonText}
                      onChange={e => { setIndustryBridge({ ...industryBridge, buttonText: e.target.value }); notifyChange(); }}
                      className="w-1/2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold"
                    />
                    <input
                      type="text"
                      value={industryBridge.buttonLink}
                      onChange={e => { setIndustryBridge({ ...industryBridge, buttonLink: e.target.value }); notifyChange(); }}
                      className="w-1/2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-mono"
                    />
                  </div>
                </div>
                <div>
                  <ImageUploader
                    label="Bridge Spotlight Photo"
                    value={industryBridge.image}
                    onChange={url => { setIndustryBridge({ ...industryBridge, image: url }); notifyChange(); }}
                  />
                </div>
              </div>
            </div>

            {/* Campus Life Highlight Cards */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Campus Life Cards ({campusLife.length})</h3>
                  <p className="text-xs text-slate-500 mt-0.5">The 3 feature cards displayed under Explore Life At ASTU.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setModalState({
                      open: true,
                      title: 'Add New Campus Life Card',
                      itemType: 'campus-card',
                      itemData: {
                        id: `CL-${Date.now()}`,
                        title: 'Student Innovation Hub',
                        campus: 'Maker Space',
                        description: 'Prototyping equipment, electronics workbenches, and coding labs.',
                        image: '/images/electriclabs.jpeg',
                        action: 'Discover Hub',
                        link: '/info/facilities',
                        active: true,
                      },
                      onSave: newItem => {
                        setCampusLife(prev => [...prev, newItem]);
                        notifyChange();
                        toast.success('Added campus card');
                      },
                    });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-astu-navy text-white px-3 py-1.5 text-xs font-bold hover:brightness-110 cursor-pointer shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Card
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                {campusLife.map((card, idx) => (
                  <div
                    key={card.id || idx}
                    className="flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 overflow-hidden"
                  >
                    <div className="h-28 w-full bg-slate-200 relative overflow-hidden">
                      <img
                        src={card.image}
                        alt={card.title}
                        className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).src = '/images/campus-2.jpeg'; }}
                      />
                      <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        {card.campus}
                      </span>
                    </div>

                    <div className="p-3.5 space-y-1.5 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{card.title}</h4>
                        <button
                          type="button"
                          onClick={() => {
                            setCampusLife(campusLife.map((c, i) => i === idx ? { ...c, active: !c.active } : c));
                            notifyChange();
                          }}
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold cursor-pointer ${
                            card.active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {card.active ? 'Active' : 'Hidden'}
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2">{card.description}</p>
                    </div>

                    <div className="p-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="truncate text-[10px] font-mono text-slate-400 max-w-[140px]" title={`${card.action} -> ${card.link}`}>
                        {card.action} → {card.link}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setModalState({
                              open: true,
                              title: `Edit Campus Card: ${card.title}`,
                              itemType: 'campus-card',
                              itemData: { ...card },
                              onSave: updated => {
                                setCampusLife(campusLife.map((c, i) => i === idx ? { ...c, ...updated } : c));
                                notifyChange();
                                toast.success('Campus card updated');
                              },
                            });
                          }}
                          className="font-bold text-astu-navy dark:text-sky-400 hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete campus card "${card.title}"?`)) {
                              setCampusLife(campusLife.filter((_, i) => i !== idx));
                              notifyChange();
                              toast.success('Card removed');
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                          title="Delete card"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      /* ══════════════════════════════════════════════════════════════════════
         5. CAMPUS MOMENTS (GALLERY)
      ══════════════════════════════════════════════════════════════════════ */
      case 'gallery':
        return (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Campus Gallery Section Headers</h3>
                <p className="text-xs text-slate-500 mt-0.5">Control the eyebrow, headline, description, and button for Campus Life & Moments.</p>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Eyebrow</label>
                  <input
                    type="text"
                    value={galleryHeaders.eyebrow}
                    onChange={e => { setGalleryHeaders({ ...galleryHeaders, eyebrow: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-bold text-rose-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Main Title</label>
                  <input
                    type="text"
                    value={galleryHeaders.title}
                    onChange={e => { setGalleryHeaders({ ...galleryHeaders, title: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Subtitle Description</label>
                  <textarea
                    value={galleryHeaders.subtitle}
                    onChange={e => { setGalleryHeaders({ ...galleryHeaders, subtitle: e.target.value }); notifyChange(); }}
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-700 dark:text-slate-300 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Button Text</label>
                    <input
                      type="text"
                      value={galleryHeaders.buttonText}
                      onChange={e => { setGalleryHeaders({ ...galleryHeaders, buttonText: e.target.value }); notifyChange(); }}
                      className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Button Link</label>
                    <input
                      type="text"
                      value={galleryHeaders.buttonLink}
                      onChange={e => { setGalleryHeaders({ ...galleryHeaders, buttonLink: e.target.value }); notifyChange(); }}
                      className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Campus Moments Photos ({gallery.length})</h3>
                  <p className="text-xs text-slate-500 mt-0.5">High-resolution photography displayed on the public homepage gallery.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setModalState({
                      open: true,
                      title: 'Add Campus Photo',
                      itemType: 'gallery',
                      itemData: {
                        id: `GI-${Date.now()}`,
                        title: 'New Campus Moment',
                        src: '/images/campus-2.jpeg',
                        active: true,
                      },
                      onSave: newItem => {
                        setGallery(prev => [...prev, newItem]);
                        notifyChange();
                        toast.success('Added gallery image');
                      },
                    });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-astu-navy text-white px-3 py-1.5 text-xs font-bold hover:brightness-110 cursor-pointer shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Photo
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {gallery.map((img, idx) => (
                  <div key={img.id || idx} className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/60 dark:bg-slate-800/40 p-2.5 flex items-center gap-3">
                    <img src={img.src} alt={img.title} className="h-14 w-14 rounded-lg object-cover shrink-0" onError={e => { (e.target as HTMLImageElement).src = '/images/campus-2.jpeg'; }} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{img.title}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setGallery(gallery.map((g, i) => i === idx ? { ...g, active: !g.active } : g));
                          notifyChange();
                        }}
                        className={`mt-1 rounded-full px-2 py-0.5 text-[9px] font-bold ${img.active !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'}`}
                      >
                        {img.active !== false ? 'Visible' : 'Hidden'}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setModalState({
                          open: true,
                          title: 'Edit Campus Photo',
                          itemType: 'gallery',
                          itemData: { ...img },
                          onSave: updated => {
                            setGallery(prev => prev.map((g, i) => (i === idx ? { ...g, ...updated } : g)));
                            notifyChange();
                            toast.success('Photo updated');
                          },
                        });
                      }}
                      className="p-1 text-slate-400 hover:text-astu-navy"
                      title="Edit photo"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete "${img.title}"?`)) {
                          setGallery(gallery.filter((_, i) => i !== idx));
                          notifyChange();
                          toast.success('Removed photo');
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Video Gallery ({videos.length})</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Cards shown in the public homepage Video Highlights section.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setModalState({
                      open: true,
                      title: 'Add Video Highlight',
                      itemType: 'video',
                      itemData: {
                        id: `VI-${Date.now()}`,
                        title: 'New Campus Highlight',
                        image: '/images/arc.jpg',
                        subtitle: 'Official recording from Adama Science and Technology University.',
                        link: '/info/video-gallery',
                        active: true,
                      },
                      onSave: newItem => {
                        setVideos(prev => [...prev, newItem]);
                        notifyChange();
                        toast.success('Video card added');
                      },
                    });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-astu-navy text-white px-3 py-1.5 text-xs font-bold hover:brightness-110 cursor-pointer shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Video
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {videos.map((video, idx) => (
                  <div
                    key={video.id || idx}
                    className="flex gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40"
                  >
                    <img
                      src={video.image}
                      alt={video.title}
                      className="w-24 h-20 rounded-lg object-cover bg-slate-200 shrink-0"
                      onError={e => { (e.target as HTMLImageElement).src = '/images/arc.jpg'; }}
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{video.title}</p>
                        <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-2">
                          {(video as any).subtitle || (video as any).description || video.link || 'Homepage video card'}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setVideos(videos.map((v, i) => (i === idx ? { ...v, active: !v.active } : v)));
                            notifyChange();
                          }}
                          className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${video.active !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'}`}
                        >
                          {video.active !== false ? 'Visible' : 'Hidden'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setModalState({
                              open: true,
                              title: 'Edit Video Highlight',
                              itemType: 'video',
                              itemData: { ...video },
                              onSave: updated => {
                                setVideos(prev => prev.map((v, i) => (i === idx ? { ...v, ...updated } : v)));
                                notifyChange();
                                toast.success('Video updated');
                              },
                            });
                          }}
                          className="text-[11px] font-bold text-astu-navy hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete video "${video.title}"?`)) {
                              setVideos(videos.filter((_, i) => i !== idx));
                              notifyChange();
                              toast.success('Video removed');
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {videos.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-6">No video cards yet. Add one to populate the homepage Video Gallery.</p>
                )}
              </div>
            </div>
          </div>
        );

      /* ══════════════════════════════════════════════════════════════════════
         6. EVENTS & NOTICES
      ══════════════════════════════════════════════════════════════════════ */
      case 'events-news':
        return (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">News & Announcements Headers</h3>
                <p className="text-xs text-slate-500 mt-0.5">Controls eyebrow, title, and description on the public homepage News section.</p>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Eyebrow</label>
                  <input
                    type="text"
                    value={newsHeaders.eyebrow}
                    onChange={e => { setNewsHeaders({ ...newsHeaders, eyebrow: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-bold text-rose-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Section Title</label>
                  <input
                    type="text"
                    value={newsHeaders.title}
                    onChange={e => { setNewsHeaders({ ...newsHeaders, title: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Description</label>
                  <textarea
                    value={newsHeaders.description || ''}
                    onChange={e => { setNewsHeaders({ ...newsHeaders, description: e.target.value }); notifyChange(); }}
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Events section headers */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Events & Workshops Headers</h3>
                <p className="text-xs text-slate-500 mt-0.5">Controls the public homepage Events section copy and View All link.</p>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Eyebrow</label>
                  <input
                    type="text"
                    value={eventsHeaders.eyebrow}
                    onChange={e => { setEventsHeaders({ ...eventsHeaders, eyebrow: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-bold text-rose-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Section Title</label>
                  <input
                    type="text"
                    value={eventsHeaders.title}
                    onChange={e => { setEventsHeaders({ ...eventsHeaders, title: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Description</label>
                  <textarea
                    value={eventsHeaders.description || ''}
                    onChange={e => { setEventsHeaders({ ...eventsHeaders, description: e.target.value }); notifyChange(); }}
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs"
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">View All Label</label>
                    <input
                      type="text"
                      value={eventsHeaders.viewAllText}
                      onChange={e => { setEventsHeaders({ ...eventsHeaders, viewAllText: e.target.value }); notifyChange(); }}
                      className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">View All Link</label>
                    <input
                      type="text"
                      value={eventsHeaders.viewAllLink}
                      onChange={e => { setEventsHeaders({ ...eventsHeaders, viewAllLink: e.target.value }); notifyChange(); }}
                      className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Upcoming Alumni Events ({events.length})</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Toggle Active / Hidden — only Active items publish to the live homepage.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setModalState({
                      open: true,
                      title: 'Add New Event',
                      itemType: 'event',
                      itemData: {
                        id: `EV-${Date.now()}`,
                        title: 'ASTU Engineering Expo 2026',
                        date: 'October 20, 2026',
                        location: 'ASTU Central Arc',
                        image: '/images/campus-2.jpeg',
                        active: true,
                      },
                      onSave: newItem => {
                        setEvents(prev => [...prev, newItem]);
                        notifyChange();
                        toast.success('Added event');
                      },
                    });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-astu-navy text-white px-3 py-1.5 text-xs font-bold hover:brightness-110 cursor-pointer shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Event
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {events.map((ev, idx) => (
                  <div
                    key={ev.id || idx}
                    className="flex gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40"
                  >
                    <img
                      src={ev.image}
                      alt={ev.title}
                      className="w-24 h-20 rounded-lg object-cover bg-slate-200 shrink-0"
                      onError={e => { (e.target as HTMLImageElement).src = '/images/campus-2.jpeg'; }}
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-astu-red uppercase">{ev.date}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setEvents(events.map((e, i) => i === idx ? { ...e, active: !e.active } : e));
                              notifyChange();
                            }}
                            className={`rounded-full px-2 py-0.2 text-[10px] font-bold cursor-pointer ${
                              ev.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            {ev.active ? 'Active' : 'Hidden'}
                          </button>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 mt-1">{ev.title}</h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{ev.location}</p>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setModalState({
                              open: true,
                              title: `Edit Event: ${ev.title}`,
                              itemType: 'event',
                              itemData: { ...ev },
                              onSave: updated => {
                                setEvents(events.map((e, i) => i === idx ? { ...e, ...updated } : e));
                                notifyChange();
                                toast.success('Event updated');
                              },
                            });
                          }}
                          className="text-xs font-bold text-astu-navy dark:text-sky-400 hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete event "${ev.title}"?`)) {
                              setEvents(events.filter((_, i) => i !== idx));
                              notifyChange();
                              toast.success('Event removed');
                            }
                          }}
                          className="text-slate-400 hover:text-rose-500 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Official Announcements */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Official Notices & Announcements ({announcements.length})</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Urgent notices displayed with the bell icon in the notices feed.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setModalState({
                      open: true,
                      title: 'Add New Official Notice',
                      itemType: 'announcement',
                      itemData: {
                        id: `AN-${Date.now()}`,
                        title: 'New Alumni Membership Registration Window Now Open',
                        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                        type: 'Alumni Announcement',
                        active: true,
                      },
                      onSave: newItem => {
                        setAnnouncements(prev => [...prev, newItem]);
                        notifyChange();
                        toast.success('Added notice');
                      },
                    });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-astu-navy text-white px-3 py-1.5 text-xs font-bold hover:brightness-110 cursor-pointer shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Notice
                </button>
              </div>

              <div className="space-y-2">
                {announcements.map((ann, idx) => (
                  <div
                    key={ann.id || idx}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <Bell className="h-4 w-4 text-astu-red shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{ann.title}</p>
                        <p className="text-[10px] text-slate-500">{ann.type} • {ann.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setAnnouncements(announcements.map((a, i) => i === idx ? { ...a, active: !a.active } : a));
                          notifyChange();
                        }}
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold cursor-pointer ${
                          ann.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {ann.active ? 'Active' : 'Hidden'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setModalState({
                            open: true,
                            title: 'Edit Announcement',
                            itemType: 'announcement',
                            itemData: { ...ann },
                            onSave: updated => {
                              setAnnouncements(announcements.map((a, i) => i === idx ? { ...a, ...updated } : a));
                              notifyChange();
                              toast.success('Announcement updated');
                            },
                          });
                        }}
                        className="text-xs font-bold text-astu-navy dark:text-sky-400 hover:underline cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete "${ann.title}"?`)) {
                            setAnnouncements(announcements.filter((_, i) => i !== idx));
                            notifyChange();
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      /* ══════════════════════════════════════════════════════════════════════
         6. STORIES & PARTNERS
      ══════════════════════════════════════════════════════════════════════ */
      case 'community':
        return (
          <div className="space-y-6">
            {/* Homepage Community Section Management */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Homepage Community Section</h3>
                <p className="text-xs text-slate-500 mt-0.5">Matches the dark community strip on the public homepage (headline, subtitle, voices & CTAs).</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Badge Label</label>
                  <input
                    type="text"
                    value={liveCommunitySection?.eyebrow || 'ASTU Alumni Community'}
                    onChange={e => updateCommunitySection({ eyebrow: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold text-emerald-700"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Main Headline</label>
                  <input
                    type="text"
                    value={liveCommunitySection?.title || 'ASTU Alumni Community'}
                    onChange={e => updateCommunitySection({ title: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Supporting Sentence</label>
                  <textarea
                    value={liveCommunitySection?.subtitle || 'Connect your alumni network globally and help expand the community of Adama Science and Technology University graduates making a difference worldwide.'}
                    onChange={e => updateCommunitySection({ subtitle: e.target.value })}
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs resize-none text-slate-700 dark:text-slate-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Stat 1: Alumni Members</label>
                  <input
                    type="text"
                    value={liveCommunitySection?.stats?.[0]?.value || '—'}
                    onChange={e => updateCommunitySectionStats(0, { value: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Stat 2: Fields of Study</label>
                  <input
                    type="text"
                    value={liveCommunitySection?.stats?.[1]?.value || '—'}
                    onChange={e => updateCommunitySectionStats(1, { value: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Stat 3: Global Partners</label>
                  <input
                    type="text"
                    value={liveCommunitySection?.stats?.[2]?.value || '—'}
                    onChange={e => updateCommunitySectionStats(2, { value: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Community Testimonials */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Community Testimonials ({liveCommunityPosts.length})</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Quotes and experiences featured in the community section.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setModalState({
                      open: true,
                      title: 'Add New Community Testimonial',
                      itemType: 'communityPost',
                      itemData: {
                        id: `CP-${Date.now()}`,
                        name: 'New Alumni Member',
                        role: 'Software Engineer & Alumnus',
                        text: 'Share your experience with the ASTU community.',
                        image: '/images/astu-seal-logo.png',
                        active: true,
                      },
                      onSave: newItem => {
                        setLiveCommunityPosts(prev => [...prev, newItem]);
                        notifyChange();
                        toast.success('Added testimonial');
                      },
                    });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-astu-navy text-white px-3 py-1.5 text-xs font-bold hover:brightness-110 cursor-pointer shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Testimonial
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                {liveCommunityPosts.map((post, idx) => (
                  <div
                    key={post.id || idx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <img
                          src={post.image}
                          alt={post.name}
                          className="h-10 w-10 rounded-full object-cover border border-slate-200"
                          onError={e => { (e.target as HTMLImageElement).src = '/images/astu-seal-logo.png'; }}
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{post.name}</p>
                          <p className="text-[10px] text-astu-green font-semibold">{post.role}</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic line-clamp-3">"{post.text}"</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setLiveCommunityPosts(liveCommunityPosts.map((p, i) => i === idx ? { ...p, active: !p.active } : p));
                          notifyChange();
                        }}
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold cursor-pointer ${
                          post.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {post.active ? 'Active' : 'Hidden'}
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setModalState({
                              open: true,
                              title: `Edit Testimonial: ${post.name}`,
                              itemType: 'communityPost',
                              itemData: { ...post },
                              onSave: updated => {
                                setLiveCommunityPosts(liveCommunityPosts.map((p, i) => i === idx ? { ...p, ...updated } : p));
                                notifyChange();
                                toast.success('Testimonial updated');
                              },
                            });
                          }}
                          className="font-bold text-astu-navy dark:text-sky-400 hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete testimonial by "${post.name}"?`)) {
                              setLiveCommunityPosts(liveCommunityPosts.filter((_, i) => i !== idx));
                              notifyChange();
                              toast.success('Testimonial removed');
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                          title="Delete testimonial"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alumni Success Stories */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Alumni & Partner Success Stories ({stories.length})</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Toggle Active / Hidden — only Active stories publish to the live homepage.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setModalState({
                      open: true,
                      title: 'Add New Success Story',
                      itemType: 'story',
                      itemData: {
                        id: `SS-${Date.now()}`,
                        name: 'Dr. Selamawit Desta',
                        role: 'AI Researcher & Alumna',
                        text: 'Mentoring young ASTU engineers through ASTU-AMS has been the most fulfilling experience of my professional year.',
                        image: '/images/arc.jpg',
                        active: true,
                      },
                      onSave: newItem => {
                        setStories(prev => [...prev, newItem]);
                        notifyChange();
                        toast.success('Added success story');
                      },
                    });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-astu-navy text-white px-3 py-1.5 text-xs font-bold hover:brightness-110 cursor-pointer shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Story
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                {stories.map((st, idx) => (
                  <div
                    key={st.id || idx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <img
                          src={st.image}
                          alt={st.name}
                          className="h-10 w-10 rounded-full object-cover border border-slate-200"
                          onError={e => { (e.target as HTMLImageElement).src = '/images/astu-seal-logo.png'; }}
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{st.name}</p>
                          <p className="text-[10px] text-astu-green font-semibold">{st.role}</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic line-clamp-3">“{st.text}”</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setStories(stories.map((s, i) => i === idx ? { ...s, active: !s.active } : s));
                          notifyChange();
                        }}
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold cursor-pointer ${
                          st.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {st.active ? 'Active' : 'Hidden'}
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setModalState({
                              open: true,
                              title: `Edit Story: ${st.name}`,
                              itemType: 'story',
                              itemData: { ...st },
                              onSave: updated => {
                                setStories(stories.map((s, i) => i === idx ? { ...s, ...updated } : s));
                                notifyChange();
                                toast.success('Story updated');
                              },
                            });
                          }}
                          className="font-bold text-astu-navy dark:text-sky-400 hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete story by "${st.name}"?`)) {
                              setStories(stories.filter((_, i) => i !== idx));
                              notifyChange();
                              toast.success('Story removed');
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                          title="Delete story"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Partner Logos */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Partner logos ({partners.length})</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Published partner logos appear as a still logo grid on the homepage.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setModalState({
                      open: true,
                      title: 'Add Partner Company & Logo',
                      itemType: 'partner',
                      itemData: {
                        id: `PT-${Date.now()}`,
                        name: '',
                        logo: '',
                        active: true,
                      },
                      onSave: (newItem) => {
                        if (newItem.name?.trim()) {
                          setPartners([...partners, { ...newItem, name: newItem.name.trim() }]);
                          notifyChange();
                          toast.success(`Added partner "${newItem.name.trim()}"`);
                        }
                      },
                    });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-astu-navy text-white px-3 py-1.5 text-xs font-bold hover:brightness-110 cursor-pointer shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Partner
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {partners.map((partner, idx) => (
                  <div
                    key={partner.id || idx}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs shadow-2xs"
                  >
                    {partner.logo ? (
                      <img
                        src={partner.logo}
                        alt={partner.name}
                        className="h-4 w-4 object-contain rounded shrink-0"
                        onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="h-4 w-4 rounded bg-[#003366] text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                        {partner.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span
                      className="font-semibold text-slate-800 dark:text-slate-200 cursor-pointer hover:underline"
                      title="Click to edit partner and logo"
                      onClick={() => {
                        setModalState({
                          open: true,
                          title: `Edit Partner — ${partner.name}`,
                          itemType: 'partner',
                          itemData: { ...partner },
                          onSave: (updated) => {
                            setPartners(partners.map((p, i) => i === idx ? updated : p));
                            notifyChange();
                            toast.success(`Updated "${updated.name}"`);
                          },
                        });
                      }}
                    >
                      {partner.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setPartners(partners.map((p, i) => i === idx ? { ...p, active: !p.active } : p));
                        notifyChange();
                      }}
                      className={`h-2 w-2 rounded-full cursor-pointer ${partner.active ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      title={partner.active ? 'Active' : 'Hidden'}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPartners(partners.filter((_, i) => i !== idx));
                        notifyChange();
                      }}
                      className="text-slate-400 hover:text-rose-500 ml-1 cursor-pointer"
                      title="Remove partner"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      /* ══════════════════════════════════════════════════════════════════════
         6b. PARTNERS & EMPLOYER PORTAL PAGE (/partners)
      ══════════════════════════════════════════════════════════════════════ */
      case 'partners-portal':
        return (
          <div className="space-y-6">
            {/* Header info bar */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 font-bold">
                      <Briefcase className="h-4 w-4" />
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Partners & Employer Portal Page Manager</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Manage every title, subtitle, CTA button, benefit card, feature list, and stat counter on <span className="font-mono text-red-600">/partners</span>.</p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="/partners"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>View /partners Live</span>
                  </a>
                </div>
              </div>

              {/* Hero Settings */}
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Hero Section</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Top Badge Pill</label>
                    <input
                      type="text"
                      value={partnersPage.heroBadge}
                      onChange={e => updatePartnersPage({ heroBadge: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Highlight Text (Accent Color)</label>
                    <input
                      type="text"
                      value={partnersPage.heroHighlight}
                      onChange={e => updatePartnersPage({ heroHighlight: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold text-amber-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Main Headline Title</label>
                    <input
                      type="text"
                      value={partnersPage.heroTitle}
                      onChange={e => updatePartnersPage({ heroTitle: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Hero Subtitle / Description</label>
                    <textarea
                      rows={2}
                      value={partnersPage.heroSubtitle}
                      onChange={e => updatePartnersPage({ heroSubtitle: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Primary CTA Button Label</label>
                    <input
                      type="text"
                      value={partnersPage.heroPrimaryCtaText}
                      onChange={e => updatePartnersPage({ heroPrimaryCtaText: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Primary CTA Target Route</label>
                    <input
                      type="text"
                      value={partnersPage.heroPrimaryCtaLink}
                      onChange={e => updatePartnersPage({ heroPrimaryCtaLink: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Secondary CTA Button Label</label>
                    <input
                      type="text"
                      value={partnersPage.heroSecondaryCtaText}
                      onChange={e => updatePartnersPage({ heroSecondaryCtaText: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Secondary CTA Target Route</label>
                    <input
                      type="text"
                      value={partnersPage.heroSecondaryCtaLink}
                      onChange={e => updatePartnersPage({ heroSecondaryCtaLink: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Stat Counters Editor */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Partner Impact Counters (Stats Strip)</h3>
                <p className="text-xs text-slate-500 mt-0.5">The 4 prominent metric cards displayed right beneath the hero banner.</p>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                {(partnersPage.stats || []).map((st, idx) => (
                  <div key={st.id || idx} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Stat #{idx + 1}</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Number / Value</label>
                        <input
                          type="text"
                          value={st.value}
                          onChange={e => {
                            const updated = partnersPage.stats.map((s, i) => i === idx ? { ...s, value: e.target.value } : s);
                            updatePartnersPage({ stats: updated });
                          }}
                          className="mt-1 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5 text-xs font-black text-astu-navy dark:text-sky-400"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Label</label>
                        <input
                          type="text"
                          value={st.label}
                          onChange={e => {
                            const updated = partnersPage.stats.map((s, i) => i === idx ? { ...s, label: e.target.value } : s);
                            updatePartnersPage({ stats: updated });
                          }}
                          className="mt-1 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5 text-xs font-bold"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits Cards Section */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Why Partner with ASTU Benefits Grid ({(partnersPage.benefits || []).length})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">The 6 key value cards presenting mutual benefits to prospective employers.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setModalState({
                      open: true,
                      title: 'Add New Partner Benefit Card',
                      itemType: 'benefit',
                      itemData: {
                        id: `B-${Date.now()}`,
                        icon: 'Building2',
                        title: 'New Benefit Card',
                        description: 'Describe the concrete value provided to partner organizations.',
                        active: true,
                      },
                      onSave: newItem => {
                        updatePartnersPage({ benefits: [...(partnersPage.benefits || []), newItem] });
                        notifyChange();
                        toast.success('Added benefit card');
                      },
                    });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-astu-navy text-white px-3 py-1.5 text-xs font-bold hover:brightness-110 cursor-pointer shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Benefit
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 mb-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Section Eyebrow</label>
                  <input
                    type="text"
                    value={partnersPage.benefitsEyebrow || ''}
                    onChange={e => updatePartnersPage({ benefitsEyebrow: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold text-astu-navy dark:text-sky-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Section Title</label>
                  <input
                    type="text"
                    value={partnersPage.benefitsTitle}
                    onChange={e => updatePartnersPage({ benefitsTitle: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Section Subtitle</label>
                  <input
                    type="text"
                    value={partnersPage.benefitsSubtitle}
                    onChange={e => updatePartnersPage({ benefitsSubtitle: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                {(partnersPage.benefits || []).map((ben, idx) => (
                  <div
                    key={ben.id || idx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Card #{idx + 1}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              const updated = partnersPage.benefits.map((b, i) => i === idx ? { ...b, active: !b.active } : b);
                              updatePartnersPage({ benefits: updated });
                            }}
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold cursor-pointer ${
                              ben.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            {ben.active ? 'Active' : 'Hidden'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Delete card "${ben.title}"?`)) {
                                const updated = partnersPage.benefits.filter((_, i) => i !== idx);
                                updatePartnersPage({ benefits: updated });
                                toast.success('Benefit removed');
                              }
                            }}
                            className="text-slate-400 hover:text-rose-500 p-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Card Title</label>
                        <input
                          type="text"
                          value={ben.title}
                          onChange={e => {
                            const updated = partnersPage.benefits.map((b, i) => i === idx ? { ...b, title: e.target.value } : b);
                            updatePartnersPage({ benefits: updated });
                          }}
                          className="mt-0.5 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Description</label>
                        <textarea
                          rows={2}
                          value={ben.description}
                          onChange={e => {
                            const updated = partnersPage.benefits.map((b, i) => i === idx ? { ...b, description: e.target.value } : b);
                            updatePartnersPage({ benefits: updated });
                          }}
                          className="mt-0.5 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5 text-xs resize-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Checklist & CTA Card Section */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Feature Checklist & Registration Box</h3>
                <p className="text-xs text-slate-500 mt-0.5">The dual-column section containing the partner perks checklist and the high-conversion gradient registration card.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 mb-6">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Features Section Title</label>
                  <input
                    type="text"
                    value={partnersPage.featuresTitle}
                    onChange={e => updatePartnersPage({ featuresTitle: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Features Subtitle</label>
                  <input
                    type="text"
                    value={partnersPage.featuresSubtitle}
                    onChange={e => updatePartnersPage({ featuresSubtitle: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs"
                  />
                </div>
              </div>

              {/* Checklist items */}
              <div className="mb-6 space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Checklist Points ({(partnersPage.features || []).length})</label>
                {(partnersPage.features || []).map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <input
                      type="text"
                      value={feat}
                      onChange={e => {
                        const updated = partnersPage.features.map((f, i) => i === idx ? e.target.value : f);
                        updatePartnersPage({ features: updated });
                      }}
                      className="flex-1 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1.5 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = partnersPage.features.filter((_, i) => i !== idx);
                        updatePartnersPage({ features: updated });
                      }}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    updatePartnersPage({ features: [...(partnersPage.features || []), 'New verified partnership feature point'] });
                  }}
                  className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-astu-navy dark:text-sky-400 hover:underline cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Add checklist point
                </button>
              </div>

              {/* Registration Card details */}
              <div className="p-4 rounded-xl border border-red-100 dark:border-red-950 bg-red-50/40 dark:bg-red-950/20 space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-red-600">Right Side CTA Card</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Card Headline</label>
                    <input
                      type="text"
                      value={partnersPage.ctaCardTitle}
                      onChange={e => updatePartnersPage({ ctaCardTitle: e.target.value })}
                      className="mt-1 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Card Button Label</label>
                    <input
                      type="text"
                      value={partnersPage.ctaCardButtonText}
                      onChange={e => updatePartnersPage({ ctaCardButtonText: e.target.value })}
                      className="mt-1 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5 text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Card Description</label>
                    <input
                      type="text"
                      value={partnersPage.ctaCardDescription}
                      onChange={e => updatePartnersPage({ ctaCardDescription: e.target.value })}
                      className="mt-1 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Full-Width CTA Banner */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Bottom Full-Width CTA Section</h3>
                <p className="text-xs text-slate-500 mt-0.5">The concluding banner inviting organizations to join ASTU\'s corporate employer network.</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Bottom Title</label>
                  <input
                    type="text"
                    value={partnersPage.bottomCtaTitle}
                    onChange={e => updatePartnersPage({ bottomCtaTitle: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Bottom Description</label>
                  <textarea
                    rows={2}
                    value={partnersPage.bottomCtaDescription}
                    onChange={e => updatePartnersPage({ bottomCtaDescription: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Button Label</label>
                  <input
                    type="text"
                    value={partnersPage.bottomCtaButtonText}
                    onChange={e => updatePartnersPage({ bottomCtaButtonText: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Button Target Route</label>
                  <input
                    type="text"
                    value={partnersPage.bottomCtaButtonLink}
                    onChange={e => updatePartnersPage({ bottomCtaButtonLink: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      /* ══════════════════════════════════════════════════════════════════════
         8. GIVING & RESEARCH FUNDS
      ══════════════════════════════════════════════════════════════════════ */
      case 'giving-campaigns':
        return (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Giving &amp; Research Campaigns Section</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Customize the section title and description displayed on the homepage above the active causes.</p>
                </div>
                <Link
                  to="/cms/donations"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold transition-all shadow-xs shrink-0"
                >
                  <Heart className="h-3.5 w-3.5 fill-[#FFCC00] text-[#FFCC00]" />
                  Open Donations Desk
                </Link>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Section Title</label>
                  <input
                    type="text"
                    value={givingSection.title}
                    onChange={e => { setGivingSection({ ...givingSection, title: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-astu-navy/20 focus:border-astu-navy"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Section Subtitle / Description</label>
                  <textarea
                    rows={3}
                    value={givingSection.subtitle}
                    onChange={e => { setGivingSection({ ...givingSection, subtitle: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-astu-navy/20 focus:border-astu-navy resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Action Button Text</label>
                  <input
                    type="text"
                    value={givingSection.buttonText}
                    onChange={e => { setGivingSection({ ...givingSection, buttonText: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full sm:w-1/2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-astu-navy/20 focus:border-astu-navy"
                  />
                </div>
              </div>
            </div>

            {/* Campaign Management Info Box */}
            <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 dark:bg-emerald-950/20 p-5 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <p className="font-bold text-slate-900 dark:text-white">Active Causes Database Synchronization</p>
                <p className="mt-1">
                  Individual fundraising campaigns (scholarship funds, AI lab gear, campus makerspace) are stored in the PostgreSQL database and managed live from the <strong>Donations &amp; Giving Desk</strong>. Any changes or new campaigns created there automatically sync to this homepage section.
                </p>
                <div className="mt-3">
                  <Link
                    to="/cms/donations"
                    className="inline-flex items-center gap-1.5 text-xs font-black text-[#003366] dark:text-sky-400 hover:underline"
                  >
                    Manage Campaigns, Goals &amp; Donors in Donations Desk &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );

      /* ══════════════════════════════════════════════════════════════════════
         9. ACCREDITATION & FAQ
      ══════════════════════════════════════════════════════════════════════ */
      case 'accreditation-faq':
        return (
          <div className="space-y-6">
            {/* Accreditation & QA Banner */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Quality Assurance & Accreditation Banner</h3>
                <p className="text-xs text-slate-500 mt-0.5">The gradient banner linking verified tracer data to national ETA accreditation requirements.</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Eyebrow</label>
                  <input
                    type="text"
                    value={accreditation.eyebrow}
                    onChange={e => { setAccreditation({ ...accreditation, eyebrow: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold text-astu-red"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Banner Title</label>
                  <input
                    type="text"
                    value={accreditation.title}
                    onChange={e => { setAccreditation({ ...accreditation, title: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Description</label>
                  <textarea
                    value={accreditation.description}
                    onChange={e => { setAccreditation({ ...accreditation, description: e.target.value }); notifyChange(); }}
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Callout Point 1 (Title & Text)</label>
                  <input
                    type="text"
                    value={accreditation.point1Title}
                    onChange={e => { setAccreditation({ ...accreditation, point1Title: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold"
                  />
                  <input
                    type="text"
                    value={accreditation.point1Desc}
                    onChange={e => { setAccreditation({ ...accreditation, point1Desc: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Callout Point 2 (Title & Text)</label>
                  <input
                    type="text"
                    value={accreditation.point2Title}
                    onChange={e => { setAccreditation({ ...accreditation, point2Title: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold"
                  />
                  <input
                    type="text"
                    value={accreditation.point2Desc}
                    onChange={e => { setAccreditation({ ...accreditation, point2Desc: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* FAQ Accordion Items */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Frequently Asked Questions ({faq.length})</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Manage the questions and answers shown in the interactive FAQ accordion.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setModalState({
                      open: true,
                      title: 'Add New FAQ Question',
                      itemType: 'faq',
                      itemData: {
                        id: `FQ-${Date.now()}`,
                        question: 'How do alumni verify degrees through ASTU-AMS?',
                        answer: 'Graduates can log into their alumni portal and click "Request Credential Validation", which sends an automated inquiry directly to the Registrar SIS.',
                        category: 'General',
                        active: true,
                      },
                      onSave: newItem => {
                        setFaq(prev => [...prev, newItem]);
                        notifyChange();
                        toast.success('Added FAQ question');
                      },
                    });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-astu-navy text-white px-3 py-1.5 text-xs font-bold hover:brightness-110 cursor-pointer shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Question
                </button>
              </div>

              <div className="space-y-3">
                {faq.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="h-4 w-4 text-astu-red shrink-0" />
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{item.question}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setFaq(faq.map((f, i) => i === idx ? { ...f, active: !f.active } : f));
                            notifyChange();
                          }}
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold cursor-pointer ${
                            item.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {item.active ? 'Active' : 'Hidden'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setModalState({
                              open: true,
                              title: 'Edit FAQ Item',
                              itemType: 'faq',
                              itemData: { ...item },
                              onSave: updated => {
                                setFaq(faq.map((f, i) => i === idx ? { ...f, ...updated } : f));
                                notifyChange();
                                toast.success('FAQ updated');
                              },
                            });
                          }}
                          className="text-xs font-bold text-astu-navy dark:text-sky-400 hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Delete this question?')) {
                              setFaq(faq.filter((_, i) => i !== idx));
                              notifyChange();
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 pl-6">{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      /* ══════════════════════════════════════════════════════════════════════
         8. DETAIL PAGES MANAGER (ALL 22 /info/:slug PAGES)
      ══════════════════════════════════════════════════════════════════════ */
      case 'detail-pages': {
        const slugCategories: Record<string, string[]> = {
          portals: ['alumni-portal', 'employer-portal', 'department-portal', 'registrar-portal'],
          impact: ['overview', 'impact-numbers', 'accreditation', 'achievements'],
          campus: ['campus-life', 'facilities', 'events', 'gallery', 'video-gallery'],
          community: ['featured-employers', 'mentorship', 'community-feed'],
        };

        const allSlugs = Object.keys(detailPages);
        const filteredSlugs = allSlugs.filter(slug => {
          const page = detailPages[slug];
          const query = detailPageSearch.toLowerCase().trim();
          const matchesSearch = !query ||
            slug.toLowerCase().includes(query) ||
            (page?.title && page.title.toLowerCase().includes(query));
          
          if (!matchesSearch) return false;
          if (detailPageCategory === 'all') return true;
          return (slugCategories[detailPageCategory] || []).includes(slug);
        });

        return (
          <div className="space-y-6">
            {/* Page Selector & Summary Card */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-astu-navy/10 text-astu-navy dark:bg-sky-500/10 dark:text-sky-400 font-bold">
                      <FileText className="h-4 w-4" />
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Institutional Detail Pages Editor</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Every text, section heading, and cover photo on all 22+ /info/... detail pages comes directly from here.</p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`/info/${selectedDetailSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>View /info/{selectedDetailSlug}</span>
                  </a>
                </div>
              </div>

              {/* Category Pills & Search */}
              <div className="mb-4 space-y-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Filter:</span>
                  {[
                    { id: 'all', label: `All Pages (${allSlugs.length})`, icon: Layers3 },
                    { id: 'portals', label: 'Portals (4)', icon: Building2 },
                    { id: 'impact', label: 'Impact & QA (4)', icon: LineChart },
                    { id: 'campus', label: 'Campus Life (5)', icon: GraduationCap },
                    { id: 'community', label: 'Community (3)', icon: Handshake },
                  ].map(cat => {
                    const CatIcon = cat.icon;
                    return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setDetailPageCategory(cat.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        detailPageCategory === cat.id
                          ? 'bg-astu-navy text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span className="inline-flex items-center gap-1"><CatIcon className="h-3.5 w-3.5" /> {cat.label}</span>
                    </button>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search pages by title or slug (e.g. alumni-portal, events, impact)..."
                      value={detailPageSearch}
                      onChange={e => setDetailPageSearch(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-8 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400"
                    />
                  </div>
                  {detailPageSearch && (
                    <button
                      type="button"
                      onClick={() => setDetailPageSearch('')}
                      className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Quick Selection Chip Bar */}
                <div className="flex flex-wrap gap-1.5 pt-1 max-h-28 overflow-y-auto">
                  {filteredSlugs.map(slug => {
                    const isSelected = selectedDetailSlug === slug;
                    const page = detailPages[slug];
                    return (
                      <button
                        key={slug}
                        type="button"
                        onClick={() => setSelectedDetailSlug(slug)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                          isSelected
                            ? 'border-astu-navy bg-astu-navy/10 text-astu-navy dark:border-sky-500 dark:bg-sky-500/10 dark:text-sky-400 font-bold'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        <span>{page?.title || slug}</span>
                        <span className="text-[10px] opacity-60 font-mono">/info/{slug}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selector Dropdown / Search */}
              <div className="grid gap-4 sm:grid-cols-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="sm:col-span-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Active Detail Page</label>
                  <select
                    value={selectedDetailSlug}
                    onChange={e => setSelectedDetailSlug(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-bold text-astu-navy dark:text-sky-400 cursor-pointer focus:outline-none focus:ring-2 focus:ring-astu-navy/20"
                  >
                    {allSlugs.map(slug => (
                      <option key={slug} value={slug}>
                        {detailPages[slug]?.title || slug} (/info/{slug})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Page Headline Title</label>
                  <input
                    type="text"
                    value={currentDetailPage.title}
                    onChange={e => updateCurrentDetailPage({ title: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Category Tag / Eyebrow</label>
                  <input
                    type="text"
                    placeholder="ASTU Institutional Resource"
                    value={currentDetailPage.badge || ''}
                    onChange={e => updateCurrentDetailPage({ badge: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Page Subtitle / Mission Statement</label>
                  <textarea
                    value={currentDetailPage.subtitle}
                    onChange={e => updateCurrentDetailPage({ subtitle: e.target.value })}
                    rows={2}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-700 dark:text-slate-300 resize-none"
                  />
                </div>
                <div className="sm:col-span-3">
                  <ImageUploader
                    label="Page Hero Cover Banner Image"
                    value={currentDetailPage.image}
                    onChange={url => updateCurrentDetailPage({ image: url })}
                  />
                </div>
              </div>
            </div>

            {/* Sections of this Detail Page */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Content Sections for &ldquo;{currentDetailPage.title}&rdquo; ({(currentDetailPage.sections || []).length})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Every text, heading, section image, and link is completely manageable and customizable here.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newSection: DetailPageSection = {
                      id: `SEC-${Date.now()}`,
                      heading: 'New Information Section',
                      body: 'Provide clear, factual ASTU institutional information for this topic.',
                      badge: 'Section Highlight',
                      active: true,
                    };
                    const updated = [...(currentDetailPage.sections || []), newSection];
                    updateCurrentDetailPage({ sections: updated });
                    toast.success('Section added to page');
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-astu-navy text-white px-3 py-1.5 text-xs font-bold hover:brightness-110 cursor-pointer shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Section
                </button>
              </div>

              <div className="space-y-4">
                {(currentDetailPage.sections || []).map((sec, sIdx) => (
                  <div
                    key={sec.id || sIdx}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-3.5 transition-all hover:border-[#003580]/30 shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-700/60 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-astu-navy text-white text-[10px] font-bold">
                          {sIdx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {sec.heading || `Section #${sIdx + 1}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Move Up */}
                        <button
                          type="button"
                          disabled={sIdx === 0}
                          onClick={() => {
                            const sections = [...currentDetailPage.sections];
                            const [item] = sections.splice(sIdx, 1);
                            sections.splice(sIdx - 1, 0, item);
                            updateCurrentDetailPage({ sections });
                          }}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          title="Move section up"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>

                        {/* Move Down */}
                        <button
                          type="button"
                          disabled={sIdx === currentDetailPage.sections.length - 1}
                          onClick={() => {
                            const sections = [...currentDetailPage.sections];
                            const [item] = sections.splice(sIdx, 1);
                            sections.splice(sIdx + 1, 0, item);
                            updateCurrentDetailPage({ sections });
                          }}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          title="Move section down"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>

                        {/* Active toggle */}
                        <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 cursor-pointer ml-1">
                          <input
                            type="checkbox"
                            checked={sec.active !== false}
                            onChange={e => {
                              const updated = currentDetailPage.sections.map((s, i) => i === sIdx ? { ...s, active: e.target.checked } : s);
                              updateCurrentDetailPage({ sections: updated });
                            }}
                            className="rounded text-astu-navy"
                          />
                          <span>Active</span>
                        </label>

                        {/* Delete Section */}
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Remove section "${sec.heading}"?`)) {
                              const updated = currentDetailPage.sections.filter((_, i) => i !== sIdx);
                              updateCurrentDetailPage({ sections: updated });
                              toast.success('Section removed');
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer ml-1"
                          title="Delete Section"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Section Heading</label>
                        <input
                          type="text"
                          value={sec.heading}
                          onChange={e => {
                            const updated = currentDetailPage.sections.map((s, i) => i === sIdx ? { ...s, heading: e.target.value } : s);
                            updateCurrentDetailPage({ sections: updated });
                          }}
                          className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs font-bold text-slate-900 dark:text-white"
                        />
                      </div>
                      <div className="sm:col-span-1">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Section Tag / Badge</label>
                        <input
                          type="text"
                          placeholder="e.g. Core Pillar, Key Module"
                          value={sec.badge || ''}
                          onChange={e => {
                            const updated = currentDetailPage.sections.map((s, i) => i === sIdx ? { ...s, badge: e.target.value } : s);
                            updateCurrentDetailPage({ sections: updated });
                          }}
                          className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs font-semibold text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Paragraph Content & Details</label>
                      <textarea
                        value={sec.body}
                        onChange={e => {
                          const updated = currentDetailPage.sections.map((s, i) => i === sIdx ? { ...s, body: e.target.value } : s);
                          updateCurrentDetailPage({ sections: updated });
                        }}
                        rows={3}
                        className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs text-slate-700 dark:text-slate-300 resize-none leading-relaxed"
                      />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3 pt-1">
                      <div className="sm:col-span-1">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Section Image URL (Optional)</label>
                        <input
                          type="text"
                          placeholder="https://... or /images/..."
                          value={sec.image || ''}
                          onChange={e => {
                            const updated = currentDetailPage.sections.map((s, i) => i === sIdx ? { ...s, image: e.target.value } : s);
                            updateCurrentDetailPage({ sections: updated });
                          }}
                          className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs text-slate-700 dark:text-slate-300 font-mono"
                        />
                        {sec.image && (
                          <div className="mt-1.5 flex items-center gap-2">
                            <img src={sec.image} alt="Preview" className="h-8 w-12 rounded object-cover border border-slate-200" />
                            <span className="text-[10px] text-emerald-600 font-semibold">Image attached</span>
                          </div>
                        )}
                      </div>

                      <div className="sm:col-span-1">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Action Button Label (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. Learn More, Open Portal"
                          value={sec.linkText || ''}
                          onChange={e => {
                            const updated = currentDetailPage.sections.map((s, i) => i === sIdx ? { ...s, linkText: e.target.value } : s);
                            updateCurrentDetailPage({ sections: updated });
                          }}
                          className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs text-slate-700 dark:text-slate-300"
                        />
                      </div>

                      <div className="sm:col-span-1">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Action Button URL (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. /login or /info/overview"
                          value={sec.linkUrl || ''}
                          onChange={e => {
                            const updated = currentDetailPage.sections.map((s, i) => i === sIdx ? { ...s, linkUrl: e.target.value } : s);
                            updateCurrentDetailPage({ sections: updated });
                          }}
                          className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs text-slate-700 dark:text-slate-300 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      /* ══════════════════════════════════════════════════════════════════════
         9. CTA & FOOTER DIRECTORY
      ══════════════════════════════════════════════════════════════════════ */
      case 'footer-cta':
        return (
          <div className="space-y-6">
            {/* Bottom CTA Banner */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Bottom Call-To-Action Banner</h3>
                  <p className="text-xs text-slate-500 mt-0.5">The gradient banner right above the footer inviting alumni and employers to join.</p>
                </div>
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ctaSection.enabled !== false}
                    onChange={e => { setCtaSection({ ...ctaSection, enabled: e.target.checked }); notifyChange(); }}
                    className="h-4 w-4 rounded text-astu-navy cursor-pointer"
                  />
                  <span>{ctaSection.enabled !== false ? 'Enabled' : 'Hidden'}</span>
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">CTA Headline</label>
                  <input
                    type="text"
                    value={ctaSection.title}
                    onChange={e => { setCtaSection({ ...ctaSection, title: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">CTA Subtitle</label>
                  <input
                    type="text"
                    value={ctaSection.description}
                    onChange={e => { setCtaSection({ ...ctaSection, description: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Button 1 (Text & Link)</label>
                  <div className="mt-1 flex gap-2">
                    <input
                      type="text"
                      value={ctaSection.primaryCtaText}
                      onChange={e => { setCtaSection({ ...ctaSection, primaryCtaText: e.target.value }); notifyChange(); }}
                      className="w-1/2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold"
                    />
                    <input
                      type="text"
                      value={ctaSection.primaryCtaLink}
                      onChange={e => { setCtaSection({ ...ctaSection, primaryCtaLink: e.target.value }); notifyChange(); }}
                      className="w-1/2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Button 2 (Text & Link)</label>
                  <div className="mt-1 flex gap-2">
                    <input
                      type="text"
                      value={ctaSection.secondaryCtaText}
                      onChange={e => { setCtaSection({ ...ctaSection, secondaryCtaText: e.target.value }); notifyChange(); }}
                      className="w-1/2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold"
                    />
                    <input
                      type="text"
                      value={ctaSection.secondaryCtaLink}
                      onChange={e => { setCtaSection({ ...ctaSection, secondaryCtaLink: e.target.value }); notifyChange(); }}
                      className="w-1/2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Information Directory */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Official Footer Information</h3>
                <p className="text-xs text-slate-500 mt-0.5">Contact coordinates, office hours, and copyright details rendered across all public pages.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">About ASTU-AMS Statement</label>
                  <textarea
                    value={footer.aboutText}
                    onChange={e => { setFooter({ ...footer, aboutText: e.target.value }); notifyChange(); }}
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Campus Physical Address</label>
                  <input
                    type="text"
                    value={footer.address}
                    onChange={e => { setFooter({ ...footer, address: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Postal Box</label>
                  <input
                    type="text"
                    value={footer.poBox}
                    onChange={e => { setFooter({ ...footer, poBox: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Official Phone Support</label>
                  <input
                    type="text"
                    value={footer.phone}
                    onChange={e => { setFooter({ ...footer, phone: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Official Email</label>
                  <input
                    type="email"
                    value={footer.email}
                    onChange={e => { setFooter({ ...footer, email: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Working Office Hours</label>
                  <input
                    type="text"
                    value={footer.officeHours}
                    onChange={e => { setFooter({ ...footer, officeHours: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Copyright Line</label>
                  <input
                    type="text"
                    value={footer.copyrightText}
                    onChange={e => { setFooter({ ...footer, copyrightText: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Facebook URL</label>
                  <input
                    type="text"
                    value={footer.socialFacebook}
                    onChange={e => { setFooter({ ...footer, socialFacebook: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Telegram URL</label>
                  <input
                    type="text"
                    value={footer.socialTelegram}
                    onChange={e => { setFooter({ ...footer, socialTelegram: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* ── Links & Navigation Manager ── */}
            <div className="rounded-2xl border border-violet-200 dark:border-violet-800/40 bg-white dark:bg-slate-900 p-6 shadow-xs">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600">
                <ExternalLink className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Links &amp; Navigation Manager</h3>
                <p className="text-xs text-slate-500 mt-0.5">Edit every hyperlink button text and destination URL on the homepage — no hardcoded links anywhere.</p>
              </div>
            </div>

            <div className="space-y-0 divide-y divide-slate-100 dark:divide-slate-800">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-violet-600 pb-2 pt-1"><Megaphone className="h-3.5 w-3.5" /> Announcement Ticker</p>
              <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr_1fr] gap-3 items-center py-3">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Ticker "Details" Link<span className="block text-[10px] font-normal text-slate-400">Small link at end of top bar</span></p>
                <div><label className="text-[10px] text-slate-400 font-semibold uppercase">Button Text</label><input type="text" value={sectionLinks.tickerLinkText} onChange={e => updateSectionLink('tickerLinkText', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs" /></div>
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold uppercase">Destination URL</label>
                  <input type="text" value={sectionLinks.tickerLinkTarget} onChange={e => updateSectionLink('tickerLinkTarget', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-mono" />
                  {sectionLinks.tickerLinkTarget?.startsWith('/info/') && (
                    <button type="button" onClick={() => navigateToDetailPage(sectionLinks.tickerLinkTarget)} className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-astu-navy dark:text-sky-400 hover:underline">
                      <Edit3 className="h-3 w-3" /> Edit this page's content in Detail Pages Manager →
                    </button>
                  )}
                </div>
              </div>

              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-blue-600 pb-2 pt-4"><Layers3 className="h-3.5 w-3.5" /> Portals / How It Works</p>
              <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr_1fr] gap-3 items-center py-3">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Get Started Button<span className="block text-[10px] font-normal text-slate-400">Big CTA below the 4-step section</span></p>
                <div><label className="text-[10px] text-slate-400 font-semibold uppercase">Button Text</label><input type="text" value={sectionLinks.portalsGetStartedText} onChange={e => updateSectionLink('portalsGetStartedText', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs" /></div>
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold uppercase">Destination URL</label>
                  <input type="text" value={sectionLinks.portalsGetStartedLink} onChange={e => updateSectionLink('portalsGetStartedLink', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-mono" />
                  {sectionLinks.portalsGetStartedLink?.startsWith('/info/') && (
                    <button type="button" onClick={() => navigateToDetailPage(sectionLinks.portalsGetStartedLink)} className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-astu-navy dark:text-sky-400 hover:underline">
                      <Edit3 className="h-3 w-3" /> Edit this page's content in Detail Pages Manager →
                    </button>
                  )}
                </div>
              </div>

              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-green-600 pb-2 pt-4"><CalendarDays className="h-3.5 w-3.5" /> Events Section</p>
              {([
                { label: '"See All Events" Button', note: 'Header button linking to all events', textKey: 'eventsViewAllText', urlKey: 'eventsViewAllLink' },
                { label: 'Event Card Register Button', note: 'Text on the Register button on each event card', textKey: 'eventsCardRegisterText', urlKey: 'eventsCardDetailsLink' },
                { label: 'Event Card Details Button', note: 'Text & link for the Details button', textKey: 'eventsCardDetailsText', urlKey: 'eventsCardDetailsLink' },
              ] as { label: string; note: string; textKey: keyof typeof defaultSectionLinks; urlKey: keyof typeof defaultSectionLinks }[]).map(row => (
                <div key={row.textKey} className="grid grid-cols-1 sm:grid-cols-[180px_1fr_1fr] gap-3 items-center py-3">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{row.label}<span className="block text-[10px] font-normal text-slate-400">{row.note}</span></p>
                  <div><label className="text-[10px] text-slate-400 font-semibold uppercase">Button Text</label><input type="text" value={sectionLinks[row.textKey]} onChange={e => updateSectionLink(row.textKey, e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs" /></div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-semibold uppercase">Destination URL</label>
                    <input type="text" value={sectionLinks[row.urlKey]} onChange={e => updateSectionLink(row.urlKey, e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-mono" />
                    {sectionLinks[row.urlKey]?.startsWith('/info/') && (
                      <button type="button" onClick={() => navigateToDetailPage(sectionLinks[row.urlKey])} className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-astu-navy dark:text-sky-400 hover:underline">
                        <Edit3 className="h-3 w-3" /> Edit this page's content in Detail Pages Manager →
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-red-600 pb-2 pt-4"><Bell className="h-3.5 w-3.5" /> Announcements Section</p>
              <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr_1fr] gap-3 items-center py-3">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">"View All" Button<span className="block text-[10px] font-normal text-slate-400">Button in the announcements card header</span></p>
                <div><label className="text-[10px] text-slate-400 font-semibold uppercase">Button Text</label><input type="text" value={sectionLinks.announcementsViewAllText} onChange={e => updateSectionLink('announcementsViewAllText', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs" /></div>
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold uppercase">Destination URL</label>
                  <input type="text" value={sectionLinks.announcementsViewAllLink} onChange={e => updateSectionLink('announcementsViewAllLink', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-mono" />
                  {sectionLinks.announcementsViewAllLink?.startsWith('/info/') && (
                    <button type="button" onClick={() => navigateToDetailPage(sectionLinks.announcementsViewAllLink)} className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-astu-navy dark:text-sky-400 hover:underline">
                      <Edit3 className="h-3 w-3" /> Edit this page's content in Detail Pages Manager →
                    </button>
                  )}
                </div>
              </div>

              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 pb-2 pt-4"><Building2 className="h-3.5 w-3.5" /> Footer — Resources &amp; Portals Column</p>
              {([
                { label: 'Career Portal Link', note: '1st item in Resources column', textKey: 'footerCareerPortalText', urlKey: 'footerCareerPortalLink' },
                { label: 'Tracer Survey Hub', note: '2nd item in Resources column', textKey: 'footerTracerHubText', urlKey: 'footerTracerHubLink' },
                { label: 'Mentorship Link', note: '3rd item in Resources column', textKey: 'footerMentorshipText', urlKey: 'footerMentorshipLink' },
                { label: 'Student Portal', note: '4th item — use full https:// for external URLs', textKey: 'footerStudentPortalText', urlKey: 'footerStudentPortalLink' },
              ] as { label: string; note: string; textKey: keyof typeof defaultSectionLinks; urlKey: keyof typeof defaultSectionLinks }[]).map(row => (
                <div key={row.textKey} className="grid grid-cols-1 sm:grid-cols-[180px_1fr_1fr] gap-3 items-center py-3">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{row.label}<span className="block text-[10px] font-normal text-slate-400">{row.note}</span></p>
                  <div><label className="text-[10px] text-slate-400 font-semibold uppercase">Link Text</label><input type="text" value={sectionLinks[row.textKey]} onChange={e => updateSectionLink(row.textKey, e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs" /></div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-semibold uppercase">Destination URL</label>
                    <input type="text" value={sectionLinks[row.urlKey]} onChange={e => updateSectionLink(row.urlKey, e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-mono" />
                    {sectionLinks[row.urlKey]?.startsWith('/info/') && (
                      <button type="button" onClick={() => navigateToDetailPage(sectionLinks[row.urlKey])} className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-astu-navy dark:text-sky-400 hover:underline">
                        <Edit3 className="h-3 w-3" /> Edit this page's content in Detail Pages Manager →
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 pb-2 pt-4"><ShieldCheck className="h-3.5 w-3.5" /> Footer — Accreditation Support Column</p>
              {([
                { label: 'Quality Assurance Link', note: '1st item in Accreditation column', textKey: 'footerQualityAssuranceText', urlKey: 'footerQualityAssuranceLink' },
                { label: 'Accreditation Outcomes', note: '2nd item in Accreditation column', textKey: 'footerAccreditationOutcomesText', urlKey: 'footerAccreditationOutcomesLink' },
                { label: 'Institutional Research', note: '3rd item in Accreditation column', textKey: 'footerInstitutionalResearchText', urlKey: 'footerInstitutionalResearchLink' },
              ] as { label: string; note: string; textKey: keyof typeof defaultSectionLinks; urlKey: keyof typeof defaultSectionLinks }[]).map(row => (
                <div key={row.textKey} className="grid grid-cols-1 sm:grid-cols-[180px_1fr_1fr] gap-3 items-center py-3">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{row.label}<span className="block text-[10px] font-normal text-slate-400">{row.note}</span></p>
                  <div><label className="text-[10px] text-slate-400 font-semibold uppercase">Link Text</label><input type="text" value={sectionLinks[row.textKey]} onChange={e => updateSectionLink(row.textKey, e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs" /></div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-semibold uppercase">Destination URL</label>
                    <input type="text" value={sectionLinks[row.urlKey]} onChange={e => updateSectionLink(row.urlKey, e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-mono" />
                    {sectionLinks[row.urlKey]?.startsWith('/info/') && (
                      <button type="button" onClick={() => navigateToDetailPage(sectionLinks[row.urlKey])} className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-astu-navy dark:text-sky-400 hover:underline">
                        <Edit3 className="h-3 w-3" /> Edit this page's content in Detail Pages Manager →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        );

      default:
        return null;
    }
  };

  /* ──────────────────────────────────────────────────────────────────────────
     UNIVERSAL MODAL FORM HANDLER
  ────────────────────────────────────────────────────────────────────────── */
  const renderModalForm = () => {
    if (!modalState.itemData) return null;
    const { itemType, itemData } = modalState;

    if (itemType === 'hero-slide') {
      const previewImage = mediaUrl(itemData.image || '/images/astu-building.jpg') || '/images/astu-building.jpg';
      const previewTagline = itemData.tagline || heroBadge || 'ASTU-AMS';
      const previewTitle = itemData.title || 'Alumni Management System';
      const previewDesc =
        itemData.description ||
        welcomeMessage ||
        'Connecting ASTU graduates, employers, and academic departments through verified career and alumni services.';
      return (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="rounded-xl border border-sky-200/80 bg-sky-50/70 px-3 py-2 dark:border-sky-900/50 dark:bg-sky-950/30">
              <p className="text-[11px] font-semibold text-sky-900 dark:text-sky-200">
                Edits mirror the public homepage hero on <span className="font-mono">/</span> — badge, headline, description, and photo.
              </p>
            </div>
            <ImageUploader
              label="Slide Background Image"
              value={itemData.image || ''}
              onChange={url => setModalState(p => ({ ...p, itemData: { ...p.itemData, image: url } }))}
              album="Hero Banners"
            />
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tagline Eyebrow (red badge)</label>
              <input
                type="text"
                value={itemData.tagline || ''}
                onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, tagline: e.target.value } }))}
                placeholder={heroBadge || 'e.g. ASTU Innovation & Excellence'}
                className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-bold text-astu-red"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Slide Main Headline</label>
              <input
                type="text"
                value={itemData.title || ''}
                onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, title: e.target.value } }))}
                className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-sm font-bold text-slate-900 dark:text-white"
              />
              <p className="mt-1 text-[10px] text-slate-400">Tip: include “ to the ” to highlight the second half in green on the homepage.</p>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Slide Paragraph Description</label>
              <textarea
                value={itemData.description || ''}
                onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, description: e.target.value } }))}
                rows={4}
                className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-700 dark:text-slate-200 resize-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Live homepage preview</p>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
                Matches /
              </span>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-lg min-h-[280px] sm:min-h-[320px]">
              <img
                src={previewImage}
                alt={previewTitle}
                className="absolute inset-0 h-full w-full object-cover object-center"
                onError={e => { (e.target as HTMLImageElement).src = '/images/astu-building.jpg'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-slate-950/25" />
              <div className="relative z-10 flex h-full min-h-[280px] sm:min-h-[320px] items-center px-5 py-8 sm:px-6">
                <div className="max-w-md space-y-3">
                  <span className="inline-block rounded-full bg-astu-red px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-md">
                    {previewTagline}
                  </span>
                  <h3 className="text-xl font-black leading-tight tracking-tight text-white sm:text-2xl">
                    {previewTitle.includes(' to the ') ? (
                      <>
                        {previewTitle.split(' to the ')[0]}
                        <br />
                        to the <span className="text-astu-green">{previewTitle.split(' to the ')[1]}</span>
                      </>
                    ) : (
                      previewTitle
                    )}
                  </h3>
                  <p className="text-xs leading-relaxed text-white/90 line-clamp-3">{previewDesc}</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-astu-red px-3 py-1.5 text-[11px] font-bold text-white">
                      <Users className="h-3 w-3" />
                      {heroButtons.primaryText || 'Alumni Portal'}
                      <ArrowRight className="h-3 w-3" />
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/40 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur-sm">
                      {heroButtons.secondaryText || 'Employer Partnership'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-slate-500">
              Portal buttons come from Hero Badge &amp; CTA settings and appear on every slide.
            </p>
          </div>
        </div>
      );
    }

    if (itemType === 'impact-stat') {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700">Numeric Value</label>
              <input
                type="text"
                value={itemData.value || ''}
                onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, value: e.target.value } }))}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-bold"
                placeholder="e.g. 1,238 or 87"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700">Suffix Symbol</label>
              <input
                type="text"
                value={itemData.suffix || ''}
                onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, suffix: e.target.value } }))}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-bold"
                placeholder="e.g. + or %"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700">Metric Label</label>
            <input
              type="text"
              value={itemData.label || ''}
              onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, label: e.target.value } }))}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-bold"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700">Detail Note</label>
            <input
              type="text"
              value={itemData.detail || ''}
              onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, detail: e.target.value } }))}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700">Target Route Link</label>
            <input
              type="text"
              value={itemData.target || ''}
              onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, target: e.target.value } }))}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-mono"
            />
          </div>
        </div>
      );
    }

    if (itemType === 'portal') {
      return (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700">Card Title</label>
            <input
              type="text"
              value={itemData.title || ''}
              onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, title: e.target.value } }))}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-bold"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700">Bullet Points (one per line)</label>
            <textarea
              value={itemData.pointsString || ''}
              onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, pointsString: e.target.value } }))}
              rows={4}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700">CTA Button Text</label>
              <input
                type="text"
                value={itemData.cta || ''}
                onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, cta: e.target.value } }))}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700">Target Route</label>
              <input
                type="text"
                value={itemData.route || ''}
                onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, route: e.target.value } }))}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-mono"
              />
            </div>
          </div>
        </div>
      );
    }

    if (itemType === 'campus-card') {
      return (
        <div className="space-y-4">
          <ImageUploader
            label="Card Photo"
            value={itemData.image || ''}
            onChange={url => setModalState(p => ({ ...p, itemData: { ...p.itemData, image: url } }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700">Campus Location Badge</label>
              <input
                type="text"
                value={itemData.campus || ''}
                onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, campus: e.target.value } }))}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-bold text-astu-red"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700">Title</label>
              <input
                type="text"
                value={itemData.title || ''}
                onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, title: e.target.value } }))}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-bold"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700">Description</label>
            <textarea
              value={itemData.description || ''}
              onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, description: e.target.value } }))}
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700">Button Text</label>
              <input
                type="text"
                value={itemData.action || ''}
                onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, action: e.target.value } }))}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700">Destination Route Link</label>
              <input
                type="text"
                value={itemData.link || ''}
                onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, link: e.target.value } }))}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-mono"
              />
            </div>
          </div>
        </div>
      );
    }

    if (itemType === 'event') {
      return (
        <div className="space-y-4">
          <ImageUploader
            label="Event Cover Image"
            value={itemData.image || ''}
            onChange={url => setModalState(p => ({ ...p, itemData: { ...p.itemData, image: url } }))}
          />
          <div>
            <label className="text-xs font-bold text-slate-700">Event Title</label>
            <input
              type="text"
              value={itemData.title || ''}
              onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, title: e.target.value } }))}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-bold"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700">Date Display Text</label>
              <input
                type="text"
                value={itemData.date || ''}
                onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, date: e.target.value } }))}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700">Location / Venue</label>
              <input
                type="text"
                value={itemData.location || ''}
                onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, location: e.target.value } }))}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs"
              />
            </div>
          </div>
        </div>
      );
    }

    if (itemType === 'announcement') {
      return (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700">Notice Title</label>
            <input
              type="text"
              value={itemData.title || ''}
              onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, title: e.target.value } }))}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-bold"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700">Date</label>
              <input
                type="text"
                value={itemData.date || ''}
                onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, date: e.target.value } }))}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700">Category / Type</label>
              <input
                type="text"
                value={itemData.type || ''}
                onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, type: e.target.value } }))}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs"
              />
            </div>
          </div>
        </div>
      );
    }

    if (itemType === 'story' || itemType === 'communityPost') {
      return (
        <div className="space-y-4">
          <ImageUploader
            label="Alumnus / Partner Photo"
            value={itemData.image || ''}
            onChange={url => setModalState(p => ({ ...p, itemData: { ...p.itemData, image: url } }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700">Full Name</label>
              <input
                type="text"
                value={itemData.name || ''}
                onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, name: e.target.value } }))}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700">Designation / Role</label>
              <input
                type="text"
                value={itemData.role || ''}
                onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, role: e.target.value } }))}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-bold text-astu-green"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700">Quote / Success Testimonial</label>
            <textarea
              value={itemData.text || ''}
              onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, text: e.target.value } }))}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs resize-none"
            />
          </div>
        </div>
      );
    }

    if (itemType === 'faq') {
      return (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700">Question</label>
            <input
              type="text"
              value={itemData.question || ''}
              onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, question: e.target.value } }))}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-bold"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700">Answer</label>
            <textarea
              value={itemData.answer || ''}
              onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, answer: e.target.value } }))}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs resize-none"
            />
          </div>
        </div>
      );
    }

    if (itemType === 'benefit') {
      return (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700">Benefit Card Title</label>
            <input
              type="text"
              value={itemData.title || ''}
              onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, title: e.target.value } }))}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-bold"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700">Description</label>
            <textarea
              value={itemData.description || ''}
              onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, description: e.target.value } }))}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs resize-none"
            />
          </div>
        </div>
      );
    }

    if (itemType === 'gallery') {
      return (
        <div className="space-y-4">
          <ImageUploader
            label="Campus Photo"
            value={itemData.src || ''}
            onChange={url => setModalState(p => ({ ...p, itemData: { ...p.itemData, src: url } }))}
            album="Campus Gallery"
          />
          <div>
            <label className="text-xs font-bold text-slate-700">Photo Title</label>
            <input
              type="text"
              value={itemData.title || ''}
              onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, title: e.target.value } }))}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-xs font-bold"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700">Album / Tag</label>
            <input
              type="text"
              value={itemData.album || itemData.tag || ''}
              onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, album: e.target.value, tag: e.target.value } }))}
              placeholder="e.g. Graduation Gallery"
              className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-xs"
            />
          </div>
        </div>
      );
    }

    if (itemType === 'video') {
      return (
        <div className="space-y-4">
          <ImageUploader
            label="Video Thumbnail"
            value={itemData.image || ''}
            onChange={url => setModalState(p => ({ ...p, itemData: { ...p.itemData, image: url } }))}
            album="Video Gallery"
          />
          <div>
            <label className="text-xs font-bold text-slate-700">Video Title</label>
            <input
              type="text"
              value={itemData.title || ''}
              onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, title: e.target.value } }))}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-xs font-bold"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700">Subtitle</label>
            <textarea
              value={itemData.subtitle || itemData.description || ''}
              onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, subtitle: e.target.value, description: e.target.value } }))}
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-xs resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700">Watch Link / URL</label>
              <input
                type="text"
                value={itemData.link || ''}
                onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, link: e.target.value } }))}
                placeholder="/info/video-gallery or https://..."
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700">Duration Label</label>
              <input
                type="text"
                value={itemData.duration || ''}
                onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, duration: e.target.value } }))}
                placeholder="e.g. 3:42"
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs"
              />
            </div>
          </div>
        </div>
      );
    }

    if (itemType === 'partner') {
      return (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Partner / Company Name *</label>
            <input
              type="text"
              required
              value={itemData.name || ''}
              onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, name: e.target.value } }))}
              placeholder="e.g. Ethiopian Airlines Group"
              className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-bold text-slate-900 dark:text-white"
            />
          </div>

          <ImageUploader
            label="Upload Partner Logo Image"
            value={itemData.logo || ''}
            onChange={url => setModalState(p => ({ ...p, itemData: { ...p.itemData, logo: url } }))}
          />

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Or Enter Logo Image URL / Path</label>
            <input
              type="text"
              value={itemData.logo || ''}
              onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, logo: e.target.value } }))}
              placeholder="e.g. /images/partners/ethiopian-airlines.svg or https://..."
              className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1 pt-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Quick Presets:</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { name: 'Ethiopian Airlines', path: '/images/partners/ethiopian-airlines.svg' },
                { name: 'Ethio Telecom', path: '/images/partners/ethio-telecom.png' },
                { name: 'Safaricom', path: '/images/partners/safaricom.png' },
                { name: 'Huawei', path: '/images/partners/huawei.svg' },
                { name: 'CBE', path: '/images/partners/cbe.png' },
                { name: 'INSA', path: '/images/partners/insa.png' },
              ].map(preset => (
                <button
                  key={preset.path}
                  type="button"
                  onClick={() => setModalState(p => ({
                    ...p,
                    itemData: {
                      ...p.itemData,
                      logo: preset.path,
                      name: p.itemData.name || preset.name,
                    },
                  }))}
                  className="px-2 py-1 text-[11px] rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  /* ──────────────────────────────────────────────────────────────────────────
     MAIN COMPONENT RETURN
  ────────────────────────────────────────────────────────────────────────── */
  const studioStats = useMemo(() => [
    {
      title: 'Live Sections',
      value: String(CATEGORIES.filter((c) => c.id !== 'detail-pages').length),
      icon: Layers3,
      tone: 'blue' as const,
      description: 'Homepage sections in this workspace',
    },
    {
      title: 'Published Items',
      value: String(totalActiveItems),
      icon: CheckCircle2,
      tone: 'green' as const,
      trend: 'Visible on /',
      trendDirection: 'up' as const,
    },
    {
      title: 'Gallery Media',
      value: String(gallery.filter((g) => g.active !== false).length + videos.filter((v) => v.active !== false).length),
      icon: ImageIcon,
      tone: 'amber' as const,
      description: 'Active photos & video cards',
    },
    {
      title: 'Sync Status',
      value: hasUnsavedChanges ? 'Pending' : 'Synced',
      icon: hasUnsavedChanges ? AlertCircle : Globe,
      tone: hasUnsavedChanges ? ('amber' as const) : ('purple' as const),
      description: `Last publish ${lastSyncTime}`,
    },
  ], [totalActiveItems, gallery, videos, hasUnsavedChanges, lastSyncTime]);

  return (
    <div className="space-y-6">
      {/* ── Top Header & Actions ── */}
      <AdminPageHeader
        title="Pages & Homepage CMS"
        subtitle="Edit the public homepage and linked institutional pages. Changes publish to the live site and match what visitors see on /."
        breadcrumbs={[{ label: 'Content Management' }, { label: 'Pages & Homepage CMS' }]}
        lastSynced={lastSyncTime}
        stats={studioStats}
        statsCols={4}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {hasUnsavedChanges && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/40 px-2.5 py-1 text-xs font-bold animate-pulse">
                <AlertCircle className="h-3.5 w-3.5" />
                Publishing…
              </span>
            )}

            <button
              type="button"
              onClick={() => loadData(true)}
              disabled={isReloading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white px-3 py-2 text-xs font-semibold backdrop-blur-sm border border-white/20 transition-all cursor-pointer disabled:opacity-50"
              title="Discard local edits and reload published homepage content"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isReloading ? 'animate-spin' : ''}`} />
              <span>Reload from Server</span>
            </button>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white px-3 py-2 text-xs font-semibold backdrop-blur-sm border border-white/20 transition-all cursor-pointer"
            >
              <Globe className="h-3.5 w-3.5 text-[#FFCC00]" />
              <span>View Homepage</span>
              <ExternalLink className="h-3 w-3 opacity-75" />
            </a>

            <button
              type="button"
              onClick={() => handleSaveAll(true)}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-lg bg-[#FFCC00] hover:bg-[#FFD633] text-[#003366] px-4 py-2 text-xs font-bold transition-all shadow-md hover:scale-102 cursor-pointer disabled:opacity-50"
            >
              <Save className={`h-4 w-4 ${isSaving ? 'animate-spin' : ''}`} />
              <span>{isSaving ? 'Publishing…' : 'Publish Homepage'}</span>
            </button>
          </div>
        }
      />

      {/* ── Studio Control Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-2xl shadow-xs">
        {/* Left: sync badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${hasUnsavedChanges || isSaving ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
              {isSaving ? 'Publishing…' : hasUnsavedChanges ? 'Autosaving…' : 'Matched to homepage'}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">Last publish: {lastSyncTime}</span>
          <span className="text-[11px] text-slate-400 hidden md:inline">· {totalActiveItems} live items · editing {CATEGORIES.find((c) => c.id === activeCategory)?.label}</span>
        </div>

        {/* Center: viewport switcher */}
        <div className="hidden sm:flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-1">
          {([['desktop', Monitor, 'Desktop'], ['tablet', Tablet, 'Tablet'], ['mobile', Smartphone, 'Mobile']] as const).map(([view, Icon, label]) => (
            <button
              key={view}
              type="button"
              onClick={() => setDeviceView(view)}
              title={label}
              className={`rounded-lg p-1.5 transition-all cursor-pointer ${
                deviceView === view ? 'bg-[#003366] text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>

        {/* Right: action buttons */}
        <div className="flex items-center gap-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Eye className="h-3.5 w-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Open Homepage</span>
            <ExternalLink className="h-3 w-3 opacity-60" />
          </a>
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={isReloading}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50"
            title="Reload published content from the server"
          >
            <RefreshCw className={`h-4 w-4 ${isReloading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => handleSaveAll(true)}
            disabled={isSaving}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm transition-all cursor-pointer disabled:opacity-50 ${
              hasUnsavedChanges ? 'bg-rose-600 hover:bg-rose-500 ring-2 ring-rose-400/40' : 'bg-[#003366] hover:bg-[#002244] dark:bg-sky-600'
            }`}
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isSaving ? 'Publishing…' : hasUnsavedChanges ? 'Publish Now' : 'Published'}</span>
          </button>
        </div>
      </div>

      {/* ── SPLIT STUDIO CONTAINER: SIDEBAR ON LEFT, LIVE PREVIEW ON RIGHT ── */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* ── LEFT PANE: HOMEPAGE SECTION MAP + EDITOR ── */}
        <div className="w-full lg:w-[520px] shrink-0 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm flex flex-col overflow-hidden sticky top-4">
          <div className="border-b border-slate-200 bg-slate-50/90 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-800/70">
            <div className="flex items-center justify-between gap-2 mb-2 px-0.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Homepage sections</p>
              <span className="text-[10px] font-semibold text-slate-400">{CATEGORIES.length} areas · synced to /</span>
            </div>
            <div className="grid grid-cols-2 gap-1 max-h-[168px] overflow-y-auto pr-0.5 scrollbar-thin">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    title={cat.desc}
                    className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-[11px] font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#003366] text-white shadow-sm dark:bg-sky-600'
                        : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Section Info Banner */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-50 to-white dark:from-sky-950/30 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800">
            <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#003366] dark:text-sky-300">{CATEGORIES.find(c => c.id === activeCategory)?.label}</p>
              <p className="text-[10px] text-slate-500 truncate">{CATEGORIES.find(c => c.id === activeCategory)?.desc}</p>
            </div>
          </div>

          {/* Sidebar Body Content with Scroll */}
          <div className="overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-340px)]">
            {renderCategoryContent()}
          </div>

          {/* Sidebar Footer Quick Action */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 select-none">
            <p className="text-[10px] text-slate-400 flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[9px] font-mono text-slate-600 dark:text-slate-300">Ctrl+S</kbd>
              to save changes
            </p>
            <button
              type="button"
              onClick={() => handleSaveAll(true)}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#003366] hover:bg-[#002244] text-white px-3 py-1.5 text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{isSaving ? 'Publishing…' : 'Publish Section'}</span>
            </button>
          </div>
        </div>

        {/* ── RIGHT PANE: LIVE PREVIEW CANVAS ── */}
        <div className="flex-1 min-w-0 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden shadow-sm flex flex-col">
          {/* Live Preview Header Bar — mirrors public homepage chrome */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-4 py-2.5 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/80">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                  Live homepage canvas
                </p>
                <p className="text-[10px] font-medium text-slate-500 truncate">
                  Same layout visitors see on{' '}
                  <span className="font-mono text-astu-navy dark:text-sky-400">
                    {activeCategory === 'detail-pages' ? `/info/${selectedDetailSlug}` : '/'}
                  </span>
                  {activeCategory !== 'detail-pages' && (
                    <> · editing {CATEGORIES.find((c) => c.id === activeCategory)?.label}</>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800 p-0.5">
                {([['desktop', Monitor, 'Desktop'], ['tablet', Tablet, 'Tablet'], ['mobile', Smartphone, 'Mobile']] as const).map(([view, Icon, label]) => (
                  <button
                    key={view}
                    type="button"
                    onClick={() => setDeviceView(view)}
                    title={label}
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold transition-all cursor-pointer ${
                      deviceView === view
                        ? 'bg-[#003366] text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="hidden md:inline capitalize">{view}</span>
                  </button>
                ))}
              </div>
              <span className="hidden lg:inline-flex items-center gap-1 rounded-full border border-emerald-200/80 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
                <Globe className="h-3 w-3" />
                Synced to /
              </span>
              <a
                href={activeCategory === 'detail-pages' ? `/info/${selectedDetailSlug}` : '/'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <ExternalLink className="h-3 w-3" />
                Open live
              </a>
            </div>
          </div>

          {/* Canvas Wrapper */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-[radial-gradient(ellipse_at_top,_#e8eef5_0%,_#f1f5f9_45%,_#e2e8f0_100%)] dark:bg-[radial-gradient(ellipse_at_top,_#0f172a_0%,_#020617_60%,_#020617_100%)]">
            <HomepageLivePreviewCanvas
              deviceView={deviceView}
              activeSection={activeCategory}
              welcomeMessage={welcomeMessage}
              welcomeEnabled={welcomeEnabled}
              heroBadge={heroBadge}
              heroButtons={heroButtons}
              heroSlides={heroSlides}
              impactHeaders={impactHeaders}
              impactStats={impactStats}
              portalsHeaders={portalsHeaders}
              portals={portals}
              campusLifeHeaders={campusLifeHeaders}
              campusLife={campusLife}
              campuses={campuses}
              industryBridge={industryBridge}
              gallery={gallery}
              galleryHeaders={galleryHeaders}
              videos={videos}
              eventsHeaders={eventsHeaders}
              events={events}
              workshops={workshops}
              announcementsHeaders={announcementsHeaders}
              announcements={announcements}
              newsItems={newsItems}
              partnersHeaders={partnersHeaders}
              partners={partners}
              featuredEmployers={featuredEmployers}
              communitySection={liveCommunitySection}
              communityPosts={liveCommunityPosts}
              givingSection={givingSection}
              accreditation={accreditation}
              faqHeaders={{
                eyebrow: faqHeaders.eyebrow,
                title: faqHeaders.title,
                subtitle: faqHeaders.description,
                description: faqHeaders.description,
              }}
              faq={faq}
              ctaSection={{
                enabled: ctaSection.enabled,
                title: ctaSection.title,
                subtitle: ctaSection.description,
                primaryText: ctaSection.primaryCtaText,
                primaryLink: ctaSection.primaryCtaLink,
                secondaryText: ctaSection.secondaryCtaText,
                secondaryLink: ctaSection.secondaryCtaLink,
              }}
              footer={{
                address: footer.address,
                phone: footer.phone,
                email: footer.email,
                poBox: footer.poBox,
                copyright: footer.copyrightText,
              }}
              detailPages={detailPages}
              selectedDetailSlug={selectedDetailSlug}
              onSectionClick={(secId) => {
                if (secId) setActiveCategory(secId as CmsCategory);
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Edit Item Modal ── */}
      <AdminModal
        open={modalState.open}
        title={modalState.title}
        onClose={closeModal}
        size={modalState.itemType === 'hero-slide' ? 'xl' : 'lg'}
      >
        <div className="p-1 space-y-4">
          {renderModalForm()}

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (modalState.onSave && modalState.itemData) {
                  modalState.onSave(modalState.itemData);
                  closeModal();
                }
              }}
              className="rounded-lg bg-astu-navy px-5 py-2 text-xs font-bold text-white hover:brightness-110 cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
