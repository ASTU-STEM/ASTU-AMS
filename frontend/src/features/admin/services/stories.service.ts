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

const defaultStories: AlumniStory[] = [
  {
    id: 'story-yohannes',
    name: 'Yohannes Melese',
    role: 'Senior AI Engineer & Tech Lead',
    company: 'Gebeya Inc.',
    graduationYear: '2023',
    department: 'School of Electrical Engineering & Computing',
    text: 'Graduating as an ASTU Gold Medalist with a dual background in Software Engineering and Electronics, Yohannes now leads cross-border distributed ML infrastructure.',
    fullStory: `Yohannes Melese graduated from ASTU with a dual major in Electronics & Communication Engineering and Computer Science, achieving an outstanding CGPA of 3.98.\n\nDuring his time at ASTU, Yohannes spearheaded multiple robotics initiatives in the university's advanced laboratories and represented Ethiopia in regional technical hackathons.\n\nToday, Yohannes works as a Senior AI Engineer and Technical Lead at Gebeya Inc., architecting scalable distributed machine learning pipelines and mentoring ASTU final-year engineering students through the ASTU-AMS mentorship program.`,
    image: '/images/astusteam.jpg',
    featured: true,
    publishedAt: '2026-03-07',
    active: true,
  },
  {
    id: 'story-selamawit',
    name: 'Selamawit Bekele',
    role: 'Renewable Power Systems Director',
    company: 'Ethiopian Electric Power',
    graduationYear: '2020',
    department: 'Department of Electrical & Power Engineering',
    text: 'Spearheading national clean energy grid transitions. Her ASTU lab experiments laid the groundwork for large-scale solar and hydroelectric automation.',
    fullStory: `Selamawit Bekele graduated from ASTU in 2020 with honors in Electrical & Power Engineering.\n\nHer undergraduate research conducted in the ASTU high-voltage electrical laboratories explored smart grid distribution and fault prediction algorithms for regional transmission networks.\n\nShe currently directs renewable power system integration at Ethiopian Electric Power, overseeing automation for solar-hydro hybrid stations, and actively participates in ASTU alumni advisory boards to align university lab curricula with international clean energy standards.`,
    image: '/images/electriclabs.jpeg',
    featured: true,
    publishedAt: '2026-02-15',
    active: true,
  },
  {
    id: 'story-dawit',
    name: 'Dawit Alemayehu',
    role: 'Founder & CEO',
    company: 'AfroTech Innovations',
    graduationYear: '2021',
    department: 'Department of Mechanical & Vehicle Engineering',
    text: 'Building autonomous agritech robotics for Ethiopian farmers. Secured venture funding and employs 15 fellow ASTU graduates in Adama.',
    fullStory: `Dawit Alemayehu founded AfroTech Innovations after graduating from ASTU's Mechanical and Vehicle Engineering program in 2021.\n\nLeveraging ASTU's maker spaces and business incubation programs, Dawit designed cost-effective autonomous agricultural tilling and weeding robots suited for smallholder farms across East Africa.\n\nAfroTech has raised seed venture funding and established manufacturing workshops in Adama, employing over 15 fellow ASTU engineering and software graduates.`,
    image: '/images/arc.jpg',
    featured: true,
    publishedAt: '2026-01-20',
    active: true,
  },
];

export const storiesService = {
  /** Public stories: Homepage CMS first, then tagged content items, then fallback stories. */
  getStories(): AlumniStory[] {
    const fromHomepage = fromHomepageConfig();
    if (fromHomepage.length) return fromHomepage;

    const fromContent = fromContentItems();
    if (fromContent.length) return fromContent;

    return defaultStories;
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
