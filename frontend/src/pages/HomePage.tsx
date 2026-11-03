import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ChatBot from "../components/ChatBot";
import TelebirrDonationModal from "../components/TelebirrDonationModal";
import eventsService from "../features/admin/services/events.service";
import contentService from "../features/admin/services/content.service";
import storiesService from "../features/admin/services/stories.service";
import homepageCmsService, {
  Partner,
} from "../features/admin/services/homepageCms.service";
import publicStatsService, {
  PublicStat,
} from "../features/public/services/publicStats.service";
import config from "../config";
import HeroCarousel from "../features/public/components/home/HeroCarousel";
import ImpactCounters from "../features/public/components/home/ImpactCounters";
import HowItWorksSection from "../features/public/components/home/HowItWorksSection";
import NewsSection from "../features/public/components/home/NewsSection";
import EventsSection, {
  HomeEventItem,
} from "../features/public/components/home/EventsSection";
import StoriesSection from "../features/public/components/home/StoriesSection";
import GivingSection from "../features/public/components/home/GivingSection";
import PartnersStrip from "../features/public/components/home/PartnersStrip";
import GallerySection from "../features/public/components/home/GallerySection";
import FaqSection from "../features/public/components/home/FaqSection";
import JoinCtaSection from "../features/public/components/home/JoinCtaSection";
import {
  DEFAULT_HERO_IMAGE,
  FALLBACK_IMAGE,
} from "../features/public/components/home/homeShared";

const { mediaUrl } = config;

/** Slim live-data landing page — sections render only CMS/API content. */
export default function HomePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [liveSlides, setLiveSlides] = useState<any[]>([]);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [liveHeroBadge, setLiveHeroBadge] = useState("ASTU Alumni Management System");
  const [liveHeroButtons, setLiveHeroButtons] = useState<any>({
    primaryText: "Alumni Portal",
    primaryLink: "/register",
    secondaryText: "Employer Partnership",
    secondaryLink: "/employers",
  });
  const [liveImpactHeaders, setLiveImpactHeaders] = useState<any>(null);
  const [livePortalsHeaders, setLivePortalsHeaders] = useState<any>(null);
  const [livePortals, setLivePortals] = useState<any[]>([]);
  const [liveEventsHeaders, setLiveEventsHeaders] = useState<any>(null);
  const [liveNewsHeaders, setLiveNewsHeaders] = useState<any>(null);
  const [livePartnersHeaders, setLivePartnersHeaders] = useState<any>(null);
  const [liveFaqHeaders, setLiveFaqHeaders] = useState<any>(null);
  const [liveGalleryHeaders, setLiveGalleryHeaders] = useState<any>(null);
  const [liveStoriesHeaders, setLiveStoriesHeaders] = useState<any>(null);
  const [liveGivingSection, setLiveGivingSection] = useState<any>(null);
  const [liveCtaSection, setLiveCtaSection] = useState<any>(null);

  const [liveStats, setLiveStats] = useState<PublicStat[]>([]);
  const [liveNews, setLiveNews] = useState<any[]>([]);
  const [liveEvents, setLiveEvents] = useState<HomeEventItem[]>([]);
  const [liveStories, setLiveStories] = useState<any[]>([]);
  const [donationCampaigns, setDonationCampaigns] = useState<any[]>([]);
  const [livePartners, setLivePartners] = useState<Partner[]>([]);
  const [partnersLoading, setPartnersLoading] = useState(true);
  const [liveGallery, setLiveGallery] = useState<any[]>([]);
  const [liveFaq, setLiveFaq] = useState<any[]>([]);
  const [sectionFlags, setSectionFlags] = useState<Record<string, boolean>>({
    impact: true,
    portals: true,
    news: true,
    events: true,
    stories: true,
    giving: true,
    partners: true,
    gallery: true,
    faq: true,
    cta: true,
  });

  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [selectedDonationCampaign, setSelectedDonationCampaign] = useState<any | null>(null);

  const displaySlides = useMemo(() => {
    const normalised = (liveSlides || [])
      .filter((s: any) => s && s.active !== false)
      .map((slide: any) => ({
        ...slide,
        image:
          mediaUrl(slide.image || slide.backgroundImage || slide.bgImage) ||
          DEFAULT_HERO_IMAGE,
        tagline: slide.tagline || slide.subtitle || slide.kicker || "",
        description: slide.description || slide.body || slide.text || "",
      }));

    if (normalised.length) return normalised;
    return [
      {
        id: "brand-hero",
        image: DEFAULT_HERO_IMAGE,
        tagline: "ASTU-AMS",
        title: "Alumni Management System",
        description: welcomeMessage || "",
      },
    ];
  }, [liveSlides, welcomeMessage]);

  const activeSlideIndex = Math.min(currentSlide, Math.max(displaySlides.length - 1, 0));
  const activeHero = displaySlides[activeSlideIndex];

  const orderedDonationCampaigns = useMemo(
    () =>
      [...donationCampaigns]
        .filter((c: any) => {
          const status = String(c.status || "ACTIVE").toUpperCase();
          return status === "ACTIVE" || status === "OPEN";
        })
        .sort((a: any, b: any) => Number(Boolean(b.featured)) - Number(Boolean(a.featured))),
    [donationCampaigns]
  );

  const mergedNews = useMemo(() => {
    const seen = new Set<string>();
    return liveNews.filter((item) => {
      const key = String(item.id || item.title || "");
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [liveNews]);

  useEffect(() => {
    const checkUserSession = () => {
      try {
        const storedUser = localStorage.getItem("user");
        setUser(storedUser ? JSON.parse(storedUser) : null);
      } catch {
        setUser(null);
      }
    };
    checkUserSession();
    window.addEventListener("storage", checkUserSession);
    return () => window.removeEventListener("storage", checkUserSession);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      setScrollProgress(total > 0 ? (doc.scrollTop / total) * 100 : 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const scrollTo = searchParams.get("scrollTo");
    if (!scrollTo) return;
    const timer = window.setTimeout(() => {
      document.getElementById(scrollTo)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchParams]);

  useEffect(() => {
    if (displaySlides.length <= 1) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % displaySlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [displaySlides.length]);

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
    let refreshTimer: number | undefined;

    const loadPartners = async () => {
      setPartnersLoading(true);
      try {
        const partners = await homepageCmsService.fetchPublishedPartners();
        if (!isMounted) return;
        if (partners.length) {
          setLivePartners(partners);
          return;
        }
        // Keep CMS featured employers when the dedicated partners list is empty.
        const cfg = homepageCmsService.getSettings();
        const featured = Array.isArray(cfg?.featuredEmployers)
          ? cfg.featuredEmployers
              .filter((e: any) => e && e.active !== false && e.name)
              .map(
                (e: any): Partner => ({
                  id: String(e.id || e.name),
                  name: String(e.name),
                  logo: e.logo || "",
                  industry: e.area || e.industry || "",
                  description: e.openings || e.description || "",
                  active: true,
                })
              )
          : [];
        if (featured.length) setLivePartners(featured);
      } catch {
        /* retain whatever CMS sync already applied */
      } finally {
        if (isMounted) setPartnersLoading(false);
      }
    };

    const queueRefresh = () => {
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => void loadPartners(), 400);
    };

    void loadPartners();
    window.addEventListener("astu-cms-homepage-updated", queueRefresh);
    window.addEventListener("focus", queueRefresh);
    return () => {
      isMounted = false;
      window.clearTimeout(refreshTimer);
      window.removeEventListener("astu-cms-homepage-updated", queueRefresh);
      window.removeEventListener("focus", queueRefresh);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const applyCmsConfig = (cmsConfig: any) => {
      if (!cmsConfig || !isMounted) return;

      if (Array.isArray(cmsConfig.heroSlides)) {
        setLiveSlides(cmsConfig.heroSlides.filter((s: any) => s.active !== false));
      }
      if (typeof cmsConfig.welcomeMessage === "string") setWelcomeMessage(cmsConfig.welcomeMessage);
      if (cmsConfig.heroBadge) setLiveHeroBadge(cmsConfig.heroBadge);
      if (cmsConfig.heroButtons) {
        setLiveHeroButtons({
          primaryText: cmsConfig.heroButtons.primaryText || "Alumni Portal",
          primaryLink: normalizePublicPath(cmsConfig.heroButtons.primaryLink, "/register"),
          secondaryText: cmsConfig.heroButtons.secondaryText || "Employer Partnership",
          secondaryLink: normalizePublicPath(cmsConfig.heroButtons.secondaryLink, "/employers"),
        });
      }
      if (cmsConfig.impactHeaders) setLiveImpactHeaders(cmsConfig.impactHeaders);
      if (cmsConfig.portalsHeaders) setLivePortalsHeaders(cmsConfig.portalsHeaders);
      if (Array.isArray(cmsConfig.portals)) {
        setLivePortals(
          cmsConfig.portals
            .filter((p: any) => p && p.active !== false && p.title)
            .map((p: any) => ({
              ...p,
              route: normalizePublicPath(p.route, "/register"),
            }))
        );
      }
      if (cmsConfig.eventsHeaders) setLiveEventsHeaders(cmsConfig.eventsHeaders);
      if (cmsConfig.newsHeaders || cmsConfig.announcementsHeaders) {
        setLiveNewsHeaders(cmsConfig.newsHeaders || cmsConfig.announcementsHeaders);
      }
      if (cmsConfig.partnersHeaders) setLivePartnersHeaders(cmsConfig.partnersHeaders);
      if (cmsConfig.faqHeaders) setLiveFaqHeaders(cmsConfig.faqHeaders);
      if (cmsConfig.galleryHeaders || cmsConfig.gallerySection) {
        setLiveGalleryHeaders(cmsConfig.galleryHeaders || cmsConfig.gallerySection);
      }
      if (cmsConfig.storiesHeaders) setLiveStoriesHeaders(cmsConfig.storiesHeaders);
      if (cmsConfig.givingSection) setLiveGivingSection(cmsConfig.givingSection);
      if (cmsConfig.ctaSection) {
        setLiveCtaSection({
          ...cmsConfig.ctaSection,
          enabled: cmsConfig.ctaSection.enabled !== false,
          primaryCtaText: cmsConfig.ctaSection.primaryCtaText || "Alumni Portal",
          secondaryCtaText: cmsConfig.ctaSection.secondaryCtaText || "Employer Partnership",
          primaryCtaLink: normalizePublicPath(cmsConfig.ctaSection.primaryCtaLink, "/register"),
          secondaryCtaLink: normalizePublicPath(
            cmsConfig.ctaSection.secondaryCtaLink,
            "/employers"
          ),
        });
      }

      // Section-level visibility: enabled flags + empty Active lists hide sections.
      setSectionFlags({
        impact: cmsConfig.impactSection?.enabled !== false,
        portals: Array.isArray(cmsConfig.portals)
          ? cmsConfig.portals.some((p: any) => p && p.active !== false)
          : true,
        news: true,
        events: true,
        stories: true,
        giving: true,
        partners: true,
        gallery: Array.isArray(cmsConfig.gallery)
          ? cmsConfig.gallery.some((g: any) => g && g.active !== false)
          : true,
        faq: Array.isArray(cmsConfig.faq)
          ? cmsConfig.faq.some((f: any) => f && f.active !== false)
          : true,
        cta: cmsConfig.ctaSection?.enabled !== false,
      });

      if (Array.isArray(cmsConfig.gallery)) {
        setLiveGallery(cmsConfig.gallery.filter((g: any) => g.active !== false));
      }
      if (Array.isArray(cmsConfig.faq)) {
        setLiveFaq(cmsConfig.faq.filter((f: any) => f.active !== false));
      }
      if (Array.isArray(cmsConfig.stories)) {
        const mapped = storiesService.fromConfig(cmsConfig.stories).map((s) => ({
          id: s.id,
          name: s.name,
          role: s.role,
          company: s.company,
          quote: s.text,
          text: s.text,
          image: s.image,
          graduationYear: s.graduationYear,
        }));
        setLiveStories(mapped);
      }

      // CMS Active news/announcements surface immediately; Hidden stay off the homepage.
      const cmsNews = mapCmsNews(cmsConfig);
      if (cmsNews.length) setLiveNews((prev) => mergeById(cmsNews, prev));

      // CMS Active events/workshops surface immediately alongside API events.
      const cmsEvents = mapCmsEvents(cmsConfig);
      if (cmsEvents.length) setLiveEvents((prev) => mergeEventsById(cmsEvents, prev));

      // Partners strip: prefer published partners; fall back to CMS featured employers.
      const activePartners = Array.isArray(cmsConfig.partners)
        ? cmsConfig.partners.filter((p: any) => p && p.active !== false && p.name)
        : [];
      if (activePartners.length) {
        setLivePartners(activePartners);
      } else if (Array.isArray(cmsConfig.featuredEmployers)) {
        const featured = cmsConfig.featuredEmployers
          .filter((e: any) => e && e.active !== false && e.name)
          .map(
            (e: any): Partner => ({
              id: String(e.id || e.name),
              name: String(e.name),
              logo: e.logo || "",
              industry: e.area || e.industry || "",
              description: e.openings || e.description || "",
              active: true,
            })
          );
        if (featured.length) setLivePartners(featured);
      }
    };

    const syncContent = async () => {
      const localCms = homepageCmsService.getSettings();
      applyCmsConfig(localCms);

      const publishedNews = contentService.getPublishedNews();
      if (publishedNews.length && isMounted) {
        const hidden = hiddenCmsIds(localCms, "news");
        setLiveNews(
          mergeById(
            mapCmsNews(localCms),
            publishedNews
              .filter((n) => !hidden.has(String(n.id)))
              .map((n) => ({ ...n, type: "announcement" }))
          )
        );
      }

      try {
        const [apiConfig, apiItems] = await Promise.all([
          homepageCmsService.fetchFromApi(),
          contentService.fetchItemsFromApi(),
        ]);
        if (!isMounted) return;
        applyCmsConfig(apiConfig);

        const hiddenNews = hiddenCmsIds(apiConfig || localCms, "news");
        const apiNews = Array.isArray(apiItems)
          ? apiItems
              .filter((i: any) => {
                const status = String(i.status || "").toUpperCase();
                const type = String(i.type || "").toLowerCase();
                return (
                  status === "PUBLISHED" &&
                  (type === "post" || type === "announcement" || type === "news" || !type) &&
                  !hiddenNews.has(String(i.id))
                );
              })
              .map((i: any) => ({
                id: i.id,
                title: i.title,
                date: i.publishedAt || i.updatedAt,
                excerpt: i.excerpt,
                type: String(i.type || "announcement"),
              }))
          : [];
        setLiveNews(mergeById(mapCmsNews(apiConfig || localCms), apiNews));
      } catch {
        // Keep local snapshot already applied.
      }

      try {
        const apiEvents = await eventsService.getAllEvents();
        if (!isMounted) return;
        const cmsForEvents = homepageCmsService.getSettings();
        const hiddenEvents = hiddenCmsIds(cmsForEvents, "events");
        const mapped: HomeEventItem[] = (apiEvents || [])
          .filter((e: any) => !hiddenEvents.has(String(e.id || e.slug)))
          .map((e: any) => ({
            id: String(e.id || e.slug),
            title: e.title,
            date:
              typeof e.date === "string"
                ? e.date.split("T")[0]
                : new Date(e.date).toLocaleDateString(),
            location: e.location || "Location to be confirmed",
            image: e.image || e.coverImage || e.bannerUrl || FALLBACK_IMAGE,
            kind: e.type === "Workshop" || e.type === "WORKSHOP" ? "Workshop" : "Event",
          }));
        setLiveEvents(mergeEventsById(mapCmsEvents(cmsForEvents), mapped));
      } catch {
        const cmsOnly = mapCmsEvents(homepageCmsService.getSettings());
        if (isMounted) setLiveEvents(cmsOnly);
      }

      try {
        const campaigns = await contentService.getPublicDonationCampaigns({ status: "ACTIVE" });
        if (isMounted) setDonationCampaigns(Array.isArray(campaigns) ? campaigns : []);
      } catch {
        if (isMounted) setDonationCampaigns([]);
      }
    };

    syncContent();
    const events = [
      "astu-cms-content-changed",
      "astu-cms-events-changed",
      "astu-cms-donations-changed",
      "astu-cms-homepage-updated",
      "astu-cms-gallery-changed",
    ];
    events.forEach((evt) => window.addEventListener(evt, syncContent));
    return () => {
      isMounted = false;
      events.forEach((evt) => window.removeEventListener(evt, syncContent));
    };
  }, []);

  const handleHeroImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;
    if (image.src.includes("fallback")) return;
    image.src = DEFAULT_HERO_IMAGE;
  };

  const openDonate = (campaign: any) => {
    setSelectedDonationCampaign(campaign);
    setDonationModalOpen(true);
  };

  return (
    <div className="app-shell min-h-screen bg-[var(--bg-page)] text-slate-900 dark:text-slate-100">
      <div
        className="fixed left-0 top-0 z-[70] h-[3px] bg-astu-red transition-[width] duration-150"
        style={{ width: `${scrollProgress}%` }}
        aria-hidden="true"
      />
      <Navbar />

      <main id="home" className="flex w-full flex-col relative">
        <HeroCarousel
          displaySlides={displaySlides}
          activeSlideIndex={activeSlideIndex}
          activeHero={activeHero}
          liveHeroBadge={liveHeroBadge}
          welcomeMessage={welcomeMessage}
          liveHeroButtons={liveHeroButtons}
          onNavigate={navigate}
          onPrevSlide={() =>
            setCurrentSlide((prev) => (prev - 1 + displaySlides.length) % displaySlides.length)
          }
          onNextSlide={() => setCurrentSlide((prev) => (prev + 1) % displaySlides.length)}
          onSelectSlide={setCurrentSlide}
          onHeroImageError={handleHeroImageError}
        />

        {sectionFlags.impact ? (
          <ImpactCounters stats={liveStats} headers={liveImpactHeaders} />
        ) : null}
        {sectionFlags.portals ? (
          <HowItWorksSection
            headers={livePortalsHeaders}
            portals={livePortals}
            onNavigate={navigate}
          />
        ) : null}
        {sectionFlags.news ? (
          <NewsSection items={mergedNews} headers={liveNewsHeaders} onNavigate={navigate} />
        ) : null}
        {sectionFlags.events ? (
          <EventsSection items={liveEvents} headers={liveEventsHeaders} onNavigate={navigate} />
        ) : null}
        {sectionFlags.stories ? (
          <StoriesSection
            stories={liveStories}
            headers={liveStoriesHeaders}
            onNavigate={navigate}
          />
        ) : null}
        {sectionFlags.giving ? (
          <GivingSection
            campaigns={orderedDonationCampaigns}
            headers={liveGivingSection}
            onNavigate={navigate}
            onDonate={openDonate}
          />
        ) : null}
        {sectionFlags.partners ? (
          <PartnersStrip
            partners={livePartners}
            loading={partnersLoading}
            headers={livePartnersHeaders}
            onNavigate={navigate}
          />
        ) : null}
        {sectionFlags.gallery ? (
          <GallerySection
            images={liveGallery}
            headers={liveGalleryHeaders}
            onNavigate={navigate}
          />
        ) : null}
        {sectionFlags.faq ? (
          <FaqSection items={liveFaq} headers={liveFaqHeaders} onNavigate={navigate} />
        ) : null}
        {sectionFlags.cta ? (
          <JoinCtaSection userName={user?.name} cta={liveCtaSection} onNavigate={navigate} />
        ) : null}
      </main>

      <Footer />
      <ChatBot />

      {donationModalOpen && selectedDonationCampaign ? (
        <TelebirrDonationModal
          isOpen={donationModalOpen}
          onClose={() => {
            setDonationModalOpen(false);
            setSelectedDonationCampaign(null);
          }}
          campaign={selectedDonationCampaign}
        />
      ) : null}
    </div>
  );
}

/** Map outdated CMS deep links to working public routes. */
function normalizePublicPath(raw: string | undefined, fallback: string) {
  const value = String(raw || "").trim();
  if (!value) return fallback;

  const map: Record<string, string> = {
    "/info/alumni-portal": "/register",
    "/info/employer-portal": "/employers",
    "/info/department-portal": "/login",
    "/info/registrar-portal": "/login",
    "/info/featured-employers": "/partners",
    "/info/community-feed": "/community",
    "/info/impact-numbers": "/about",
    "/alumni": "/alumni/dashboard",
    "/employer": "/employer/dashboard",
    "/registrar": "/registrar/dashboard",
    "/admin": "/admin/dashboard",
    "/cms": "/cms/dashboard",
  };

  if (map[value]) return map[value];
  if (value.startsWith("/info/") && value.includes("employer")) return "/employers";
  if (value.startsWith("/info/") && value.includes("alumni")) return "/register";
  if (value.startsWith("/info/") && value.includes("department")) return "/login";
  if (value.startsWith("/info/") && value.includes("registrar")) return "/login";
  return value;
}

/** Active CMS announcements + newsItems for the public news strip. */
function mapCmsNews(cmsConfig: any) {
  if (!cmsConfig) return [] as any[];
  const announcements = Array.isArray(cmsConfig.announcements) ? cmsConfig.announcements : [];
  const newsItems = Array.isArray(cmsConfig.newsItems) ? cmsConfig.newsItems : [];
  return [
    ...announcements
      .filter((a: any) => a && a.active !== false && a.title)
      .map((a: any) => ({
        id: String(a.id || a.title),
        title: a.title,
        date: a.date,
        excerpt: a.excerpt || a.description || "",
        type: a.type || "announcement",
      })),
    ...newsItems
      .filter((n: any) => n && n.active !== false && n.title)
      .map((n: any) => ({
        id: String(n.id || n.title),
        title: n.title,
        date: n.date,
        excerpt: n.excerpt || "",
        type: "news",
      })),
  ];
}

/** Active CMS events + workshops for the public events strip. */
function mapCmsEvents(cmsConfig: any): HomeEventItem[] {
  if (!cmsConfig) return [];
  const events = Array.isArray(cmsConfig.events) ? cmsConfig.events : [];
  const workshops = Array.isArray(cmsConfig.workshops) ? cmsConfig.workshops : [];
  return [
    ...events
      .filter((e: any) => e && e.active !== false && e.title)
      .map((e: any) => ({
        id: String(e.id || e.title),
        title: e.title,
        date: String(e.date || ""),
        location: e.location || "Location to be confirmed",
        image: e.image || FALLBACK_IMAGE,
        kind: e.kind || "Event",
      })),
    ...workshops
      .filter((w: any) => w && w.active !== false && w.title)
      .map((w: any) => ({
        id: String(w.id || w.title),
        title: w.title,
        date: String(w.date || ""),
        location: w.location || w.seats || "Location to be confirmed",
        image: w.image || FALLBACK_IMAGE,
        kind: w.kind || "Workshop",
      })),
  ];
}

/** IDs explicitly marked Hidden in CMS so API duplicates stay off the homepage. */
function hiddenCmsIds(cmsConfig: any, kind: "news" | "events"): Set<string> {
  const ids = new Set<string>();
  if (!cmsConfig) return ids;
  if (kind === "news") {
    for (const list of [cmsConfig.announcements, cmsConfig.newsItems]) {
      if (!Array.isArray(list)) continue;
      for (const item of list) {
        if (item && item.active === false && (item.id || item.title)) {
          ids.add(String(item.id || item.title));
        }
      }
    }
  } else {
    for (const list of [cmsConfig.events, cmsConfig.workshops]) {
      if (!Array.isArray(list)) continue;
      for (const item of list) {
        if (item && item.active === false && (item.id || item.title)) {
          ids.add(String(item.id || item.title));
        }
      }
    }
  }
  return ids;
}

function mergeById<T extends { id?: string; title?: string }>(primary: T[], secondary: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of [...primary, ...secondary]) {
    const key = String(item.id || item.title || "");
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function mergeEventsById(primary: HomeEventItem[], secondary: HomeEventItem[]): HomeEventItem[] {
  return mergeById(primary, secondary);
}
