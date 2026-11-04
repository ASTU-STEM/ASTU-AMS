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
}

/** Bumped to drop legacy fabricated story snapshots. */
const STORAGE_KEY = 'astu_alumni_custom_stories_v2';

/** No fabricated alumni stories — CMS/community members only. */
export const initialStories: AlumniStory[] = [];

export const storiesService = {
  /**
   * Normalise CMS-authored success stories (which use a looser field set than
   * the dashboard editor) into the Dashboard `AlumniStory` shape. Returns an
   * empty array when the CMS has no stories, so callers can fall back cleanly.
   */
  fromConfig(stories?: any[] | null): AlumniStory[] {
    if (!Array.isArray(stories)) return [];
    return stories
      .filter((s) => s && s.active !== false && (s.name || s.title || s.author))
      .map((s: any, idx: number) => ({
        id: String(s.id ?? `S-cms-${idx + 1}`),
        name: s.name || s.author || s.title,
        role: s.role || s.position || s.subtitle || '',
        company: s.company,
        graduationYear: s.graduationYear || s.classOf || s.year,
        department: s.department,
        text: s.text || s.quote || s.excerpt || s.summary || '',
        fullStory: s.fullStory || s.content || s.body || s.text || s.quote || '',
        image: s.image || s.photo || s.imageUrl || '',
        featured: s.featured ?? s.active ?? true,
        publishedAt: s.publishedAt || s.date,
      }));
  },

  getStories(): AlumniStory[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const sampleIds = new Set(['S-001', 'S-002', 'S-003', 'S-004', 'S-005', 'S-006']);
          const cleaned = parsed.filter(
            (p: any) => p && !sampleIds.has(String(p.id || ''))
          );
          if (cleaned.length !== parsed.length) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
          }
          return cleaned;
        }
      }
    } catch {
      /* ignore */
    }
    return [];
  },

  saveStories(stories: AlumniStory[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
    window.dispatchEvent(new Event('astu-cms-stories-changed'));
  },

  addStory(story: Omit<AlumniStory, 'id'>): AlumniStory {
    const id = `S-${Date.now().toString().slice(-4)}`;
    const newStory: AlumniStory = {
      ...story,
      id,
      publishedAt:
        story.publishedAt ||
        new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      featured: story.featured ?? true,
    };

    const current = this.getStories();
    current.unshift(newStory);
    this.saveStories(current);

    // Also add to contentService so feeds sync
    contentService.addItem({
      title: `${newStory.name} — ${newStory.role}`,
      type: 'post',
      status: 'Published',
      excerpt: newStory.text,
      content: newStory.fullStory || newStory.text,
      image: newStory.image || '',
      author: newStory.name,
      tags: ['story', 'success-story', (newStory.department || 'Engineering').toLowerCase().replace(/\s+/g, '-')],
      featured: newStory.featured,
      publishedAt: newStory.publishedAt,
    });

    return newStory;
  },

  updateStory(id: string, updates: Partial<AlumniStory>): AlumniStory | null {
    const stories = this.getStories();
    const index = stories.findIndex((s) => s.id === id);
    if (index === -1) return null;

    stories[index] = { ...stories[index], ...updates };
    this.saveStories(stories);
    return stories[index];
  },

  deleteStory(id: string): boolean {
    const stories = this.getStories();
    const filtered = stories.filter((s) => s.id !== id);
    if (filtered.length === stories.length) return false;

    this.saveStories(filtered);
    return true;
  },

  toggleFeatured(id: string): boolean {
    const stories = this.getStories();
    const target = stories.find((s) => s.id === id);
    if (!target) return false;
    const nextState = !target.featured;

    target.featured = nextState;
    this.saveStories(stories);
    return nextState;
  },

  getStoryByIdOrSlug(idOrSlug: string): AlumniStory | null {
    const stories = this.getStories();
    const needle = decodeURIComponent(idOrSlug).toLowerCase();
    const slugified = needle.replace(/[^a-z0-9]+/g, '-');

    // 1. Try exact ID or slug match in current stories
    let found =
      stories.find((s) => s.id.toLowerCase() === needle) ||
      stories.find((s) => s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slugified) ||
      stories.find((s) => s.name.toLowerCase().includes(needle));

    if (found) return found;

    // 2. Try numeric ID match (e.g. AS-2 -> S-002, or SS-1 -> S-001)
    const numMatch = needle.match(/\d+/);
    if (numMatch) {
      const num = parseInt(numMatch[0], 10);
      const targetId = `s-00${num}`;
      found =
        stories.find((s) => s.id.toLowerCase() === targetId) ||
        stories[num - 1] ||
        null;
    }

    return found || null;
  },
};

export default storiesService;
