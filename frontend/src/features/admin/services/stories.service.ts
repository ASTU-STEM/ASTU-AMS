import homepageCmsService from './homepageCms.service';
import contentService from './content.service';

export interface AlumniStory {
  id: string;
  name: string;
  role: string;
  company?: string;
  graduationYear?: string;
  department?: string;
  text: string;
  fullStory?: string;
  image?: string;
  featured?: boolean;
  publishedAt?: string;
  active?: boolean;
}

const normalizeStory = (raw: any, index = 0): AlumniStory => ({
  id: String(raw?.id || `story-${index}`),
  name: raw?.name || raw?.author || raw?.title || 'ASTU Alumni',
  role: raw?.role || 'ASTU Graduate',
  company: raw?.company || undefined,
  graduationYear: raw?.graduationYear || undefined,
  department: raw?.department || undefined,
  text: raw?.text || raw?.excerpt || raw?.description || '',
  fullStory: raw?.fullStory || raw?.body || raw?.excerpt || raw?.text || '',
  image: raw?.image || raw?.coverImage || raw?.photo || undefined,
  featured: raw?.featured !== false,
  publishedAt: raw?.publishedAt || raw?.updatedAt || raw?.date,
  active: raw?.active !== false,
});

const fromHomepageConfig = (): AlumniStory[] => {
  const config = homepageCmsService.getSettings();
  if (!config?.stories?.length) return [];
  return config.stories
    .filter((s: any) => s?.active !== false)
    .map((s: any, i: number) => normalizeStory(s, i));
};

const fromContentItems = (): AlumniStory[] => {
  const cmsItems = contentService.getItems();
  const storyCmsItems = cmsItems.filter(
    (i) =>
      i.status === 'Published' &&
      (i.tags?.includes('story') || i.tags?.includes('success-story'))
  );
  return storyCmsItems.map((item, idx) =>
    normalizeStory(
      {
        id: item.id,
        name: item.author || item.title,
        role: item.tags?.[1] || 'ASTU Graduate',
        text: item.excerpt || item.title,
        fullStory: item.excerpt || item.title,
        image: (item as any).coverImage || (item as any).image,
        featured: item.featured,
        publishedAt: item.publishedAt || item.updatedAt,
      },
      idx
    )
  );
};

export const storiesService = {
  /** Public stories: Homepage CMS first, then tagged content items. No hardcoded seed. */
  getStories(): AlumniStory[] {
    const fromHomepage = fromHomepageConfig();
    if (fromHomepage.length) return fromHomepage;

    const fromContent = fromContentItems();
    if (fromContent.length) return fromContent;

    return [];
  },

  getStoryByIdOrSlug(idOrSlug: string): AlumniStory | null {
    const stories = this.getStories();
    const needle = decodeURIComponent(idOrSlug).toLowerCase();
    const slugified = needle.replace(/[^a-z0-9]+/g, '-');

    return (
      stories.find((s) => s.id.toLowerCase() === needle) ||
      stories.find((s) => s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slugified) ||
      stories.find((s) => s.name.toLowerCase().includes(needle)) ||
      null
    );
  },

  /** Merge API homepage config stories without writing localStorage. */
  fromConfig(stories: any[] | undefined | null): AlumniStory[] {
    if (!Array.isArray(stories) || !stories.length) return [];
    return stories
      .filter((s) => s?.active !== false)
      .map((s, i) => normalizeStory(s, i));
  },
};

export default storiesService;
