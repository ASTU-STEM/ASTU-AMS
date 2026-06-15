/**
 * useHomepageContent — Integration-ready hook for HomepageManagement
 *
 * Loads all 15 homepage section arrays from cmsService and provides
 * a unified save function for each section.
 */
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  HomepageData,
  HeroSlide,
  ImpactStat,
  StakeholderPortal,
  CampusLifeCard,
  Campus,
  GalleryImage,
  VideoItem,
  HomepageEvent,
  Workshop,
  NewsItem,
  HomepageAnnouncement,
  SuccessStory,
  Partner,
  Testimonial,
  FaqSection,
  fetchHomepageContent,
  saveHomepageSection,
} from '../services/cmsService';

export function useHomepageContent() {
  const [data, setData] = useState<HomepageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await fetchHomepageContent();
      setData(result);
    } catch (err) {
      setError('Failed to load homepage content.');
      console.error('[useHomepageContent] fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Generic section updater — updates local state immediately (optimistic)
  const updateSection = useCallback(<K extends keyof HomepageData>(
    section: K,
    value: HomepageData[K],
  ) => {
    setData(prev => prev ? { ...prev, [section]: value } : prev);
  }, []);

  // Save a specific section to the backend
  const saveSection = useCallback(async <K extends keyof HomepageData>(
    section: K,
    value?: HomepageData[K],
  ) => {
    if (!data) return;
    const valueToSave = value ?? data[section];
    try {
      setIsSaving(true);
      await saveHomepageSection(section, valueToSave);
      toast.success('Section saved');
    } catch (err) {
      toast.error('Failed to save section');
      console.error('[useHomepageContent] save error:', err);
    } finally {
      setIsSaving(false);
    }
  }, [data]);

  // Convenience section setters
  const setHeroSlides = useCallback((val: HeroSlide[] | ((p: HeroSlide[]) => HeroSlide[])) => {
    setData(prev => {
      if (!prev) return prev;
      const next = typeof val === 'function' ? val(prev.heroSlides) : val;
      return { ...prev, heroSlides: next };
    });
  }, []);

  const setImpactStats = useCallback((val: ImpactStat[] | ((p: ImpactStat[]) => ImpactStat[])) => {
    setData(prev => {
      if (!prev) return prev;
      const next = typeof val === 'function' ? val(prev.impactStats) : val;
      return { ...prev, impactStats: next };
    });
  }, []);

  const setPortals = useCallback((val: StakeholderPortal[] | ((p: StakeholderPortal[]) => StakeholderPortal[])) => {
    setData(prev => {
      if (!prev) return prev;
      const next = typeof val === 'function' ? val(prev.portals) : val;
      return { ...prev, portals: next };
    });
  }, []);

  const setCampusLife = useCallback((val: CampusLifeCard[] | ((p: CampusLifeCard[]) => CampusLifeCard[])) => {
    setData(prev => {
      if (!prev) return prev;
      const next = typeof val === 'function' ? val(prev.campusLife) : val;
      return { ...prev, campusLife: next };
    });
  }, []);

  const setCampuses = useCallback((val: Campus[] | ((p: Campus[]) => Campus[])) => {
    setData(prev => {
      if (!prev) return prev;
      const next = typeof val === 'function' ? val(prev.campuses) : val;
      return { ...prev, campuses: next };
    });
  }, []);

  const setGallery = useCallback((val: GalleryImage[] | ((p: GalleryImage[]) => GalleryImage[])) => {
    setData(prev => {
      if (!prev) return prev;
      const next = typeof val === 'function' ? val(prev.gallery) : val;
      return { ...prev, gallery: next };
    });
  }, []);

  const setVideos = useCallback((val: VideoItem[] | ((p: VideoItem[]) => VideoItem[])) => {
    setData(prev => {
      if (!prev) return prev;
      const next = typeof val === 'function' ? val(prev.videos) : val;
      return { ...prev, videos: next };
    });
  }, []);

  const setEvents = useCallback((val: HomepageEvent[] | ((p: HomepageEvent[]) => HomepageEvent[])) => {
    setData(prev => {
      if (!prev) return prev;
      const next = typeof val === 'function' ? val(prev.events) : val;
      return { ...prev, events: next };
    });
  }, []);

  const setWorkshops = useCallback((val: Workshop[] | ((p: Workshop[]) => Workshop[])) => {
    setData(prev => {
      if (!prev) return prev;
      const next = typeof val === 'function' ? val(prev.workshops) : val;
      return { ...prev, workshops: next };
    });
  }, []);

  const setNewsItems = useCallback((val: NewsItem[] | ((p: NewsItem[]) => NewsItem[])) => {
    setData(prev => {
      if (!prev) return prev;
      const next = typeof val === 'function' ? val(prev.newsItems) : val;
      return { ...prev, newsItems: next };
    });
  }, []);

  const setAnnouncements = useCallback((val: HomepageAnnouncement[] | ((p: HomepageAnnouncement[]) => HomepageAnnouncement[])) => {
    setData(prev => {
      if (!prev) return prev;
      const next = typeof val === 'function' ? val(prev.announcements) : val;
      return { ...prev, announcements: next };
    });
  }, []);

  const setStories = useCallback((val: SuccessStory[] | ((p: SuccessStory[]) => SuccessStory[])) => {
    setData(prev => {
      if (!prev) return prev;
      const next = typeof val === 'function' ? val(prev.stories) : val;
      return { ...prev, stories: next };
    });
  }, []);

  const setPartners = useCallback((val: Partner[] | ((p: Partner[]) => Partner[])) => {
    setData(prev => {
      if (!prev) return prev;
      const next = typeof val === 'function' ? val(prev.partners) : val;
      return { ...prev, partners: next };
    });
  }, []);

  const setTestimonials = useCallback((val: Testimonial[] | ((p: Testimonial[]) => Testimonial[])) => {
    setData(prev => {
      if (!prev) return prev;
      const next = typeof val === 'function' ? val(prev.testimonials) : val;
      return { ...prev, testimonials: next };
    });
  }, []);

  const setFaq = useCallback((val: FaqSection[] | ((p: FaqSection[]) => FaqSection[])) => {
    setData(prev => {
      if (!prev) return prev;
      const next = typeof val === 'function' ? val(prev.faq) : val;
      return { ...prev, faq: next };
    });
  }, []);

  const setWelcomeMessage = useCallback((msg: string) => {
    setData(prev => prev ? { ...prev, welcomeMessage: msg } : prev);
  }, []);

  return {
    data,
    isLoading,
    error,
    isSaving,
    refetch: load,
    updateSection,
    saveSection,
    // Section setters
    setHeroSlides,
    setImpactStats,
    setPortals,
    setCampusLife,
    setCampuses,
    setGallery,
    setVideos,
    setEvents,
    setWorkshops,
    setNewsItems,
    setAnnouncements,
    setStories,
    setPartners,
    setTestimonials,
    setFaq,
    setWelcomeMessage,
  };
}
