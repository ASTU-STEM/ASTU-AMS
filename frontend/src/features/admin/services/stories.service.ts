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

const STORAGE_KEY = 'astu_alumni_custom_stories';

export const initialStories: AlumniStory[] = [
  {
    id: 'S-001',
    name: 'Dr. Ruth Alemu',
    role: 'AI Research Scientist, Addis Ababa',
    company: 'ASTU AI Research Center & Regional Labs',
    graduationYear: 'Class of 2018',
    department: 'Computer Science & Engineering',
    text: "After graduating from ASTU's Computer Science program, Ruth joined a leading AI research lab and has published 18 applied machine learning papers. She actively mentors current ASTU scholars through the AMS portal.",
    fullStory: `My journey at Adama Science and Technology University (ASTU) laid the foundation for everything I have achieved in computer science and artificial intelligence today.

During my studies at ASTU, the rigorous engineering coursework and hands-on laboratory experiences enabled me to develop strong competencies in machine learning, high-performance computing, and distributed architectures. Today, as an AI Research Scientist, I have contributed to 18 published research papers addressing practical agricultural yield prediction, healthcare diagnostics, and low-resource Natural Language Processing challenges across East Africa.

Through the ASTU Alumni Management System (AMS), I regularly mentor graduating engineering scholars, conduct architecture reviews, and provide research publication guidance. ASTU's commitment to applied science empowers us to solve our region's most pressing technological problems with indigenous innovation.`,
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    featured: true,
    publishedAt: 'Oct 6, 2026',
  },
  {
    id: 'S-002',
    name: 'Yonas Bekele',
    role: 'Founder & CEO, GreenGrid Labs',
    company: 'GreenGrid Labs Ethiopia',
    graduationYear: 'Class of 2016',
    department: 'Electrical & Power Engineering',
    text: "Inspired by ASTU's renewable energy laboratories, Yonas launched GreenGrid Labs — now delivering clean, decentralized energy infrastructure to over 12 industrial parks in East Africa, employing over 200 skilled engineers.",
    fullStory: `As a graduate of ASTU's Electrical Engineering department, the practical problem-solving mindset cultivated at ASTU inspired me to launch GreenGrid Labs. Our mission is to accelerate the transition to sustainable clean energy for Ethiopian manufacturing hubs and industrial parks.

Over the past eight years, GreenGrid Labs has deployed solar-hybrid microgrids across 12 major industrial facilities, generating 48MW of reliable power, creating 200+ direct engineering jobs, and mentoring hundreds of university interns.

Our ongoing partnership with the ASTU Alumni Management System enables us to recruit top graduating engineering talent each semester. The depth of practical preparation ASTU students receive in power systems and industrial automation makes them immediately productive in modern infrastructure engineering.`,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    featured: true,
    publishedAt: 'Oct 5, 2026',
  },
  {
    id: 'S-003',
    name: 'Kalkidan Tadesse',
    role: 'Cloud Platform Lead, Ethio Telecom',
    company: 'Ethio Telecom Enterprise Cloud',
    graduationYear: 'Class of 2019',
    department: 'Software Engineering',
    text: "Kalkidan credits ASTU's hands-on laboratory curriculum for her rapid career trajectory. She now spearheads enterprise cloud migration projects across regional public and private entities.",
    fullStory: `Transitioning from classroom to large-scale telecommunications infrastructure was seamless thanks to the practical training at ASTU. During my software engineering capstone, we built scalable web microservices and telemetry systems that closely mirrored real enterprise architectures.

Now leading cloud migration projects at Ethio Telecom, I rely daily on the analytical rigor, distributed systems fundamentals, and collaborative resilience instilled during my years in Adama.

Through the ASTU Alumni Management System, I take immense pride in reviewing portfolios for graduating female engineers, conducting resume clinics, and hosting DevOps bootcamps to prepare our juniors for globally recognized technical certifications.`,
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    featured: true,
    publishedAt: 'Oct 4, 2026',
  },
  {
    id: 'S-004',
    name: 'Yohannes Melese',
    role: 'International Technology Delegate & Systems Researcher',
    company: 'ASTU Advanced Innovation Directorate',
    graduationYear: 'Class of 2024',
    department: 'Dual Major: Electronics & Computing',
    text: 'Gold medalist and dual major graduate with a 3.98 CGPA and 47 A+ grades, pioneering regional embedded systems and AI hardware research.',
    fullStory: `Graduating from Adama Science and Technology University with a dual major in Electronics & Communication Engineering and Computer Science & Engineering was a profound test of discipline and ambition.

Over my five years at ASTU, the guidance of visionary faculty members, access to advanced prototyping laboratories, and collaborative study groups pushed me to achieve a 3.98 CGPA with 47 A+ grades. Beyond academics, representing ASTU at international technology symposiums opened doors to cutting-edge research in embedded hardware and automated signal processing.

“My ultimate mission is to build sovereign technology solutions that power Ethiopian industries and foster a vibrant ecosystem for future generations of engineering leaders.”`,
    image: '/images/electriclabs.jpeg',
    featured: true,
    publishedAt: 'Mar 7, 2025',
  },
  {
    id: 'S-005',
    name: 'Samson Arega Bekele',
    role: 'Group Vice President Customer Experience',
    company: 'Ethiopian Airlines Group',
    graduationYear: 'Class of 2004',
    department: 'Engineering & Technology Management',
    text: 'Executive aviation leader managing customer operations, digital transformation, and international passenger experience across 130+ global destinations.',
    fullStory: `Leading global airline operations requires deep systems engineering thinking combined with relentless execution. My foundational engineering training at ASTU provided the analytical framework to diagnose complex operational workflows and drive digital transformation.

At Ethiopian Airlines Group, our team oversees end-to-end customer touchpoints across five continents. We actively collaborate with ASTU to sponsor aerospace engineering internships and tracer studies, proving that African universities produce world-class leadership.`,
    image: '/images/campus-2.jpeg',
    featured: true,
    publishedAt: 'Oct 1, 2026',
  },
  {
    id: 'S-006',
    name: 'Zenebe Mideksa Abebe',
    role: 'Global Supply Chain Specialist',
    company: 'The Boeing Company',
    graduationYear: 'Class of 2012',
    department: 'Mechanical & Manufacturing Engineering',
    text: 'Managing global aerospace manufacturing logistics and supplier quality compliance for commercial aircraft programs in North America.',
    fullStory: `From mechanical design workshops in Adama to global aerospace supply chains in Seattle, the fundamentals of precision manufacturing learned at ASTU continue to guide my work.

Managing international suppliers for commercial aircraft programs requires high standards of quality assurance and cross-functional leadership. ASTU instills in its students a culture of excellence that commands respect in international aerospace industries.`,
    image: '/images/arc.jpg',
    featured: false,
    publishedAt: 'Sep 24, 2026',
  },
];

export const storiesService = {
  /**
   * Normalise CMS-authored success stories (which use a looser field set than
   * the dashboard editor) into the Dashboard `AlumniStory` shape. Returns an
   * empty array when the CMS has no stories, so callers can fall back cleanly.
   */
  fromConfig(stories?: any[] | null): AlumniStory[] {
    if (!Array.isArray(stories)) return [];
    return stories
      .filter((s) => s && (s.name || s.title || s.author))
      .map((s: any, idx: number) => ({
        id: String(s.id ?? `S-cms-${idx + 1}`),
        name: s.name || s.author || s.title,
        role: s.role || s.position || s.subtitle || '',
        company: s.company,
        graduationYear: s.graduationYear || s.classOf || s.year,
        department: s.department,
        text: s.text || s.excerpt || s.summary || '',
        fullStory: s.fullStory || s.content || s.body || s.text || '',
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
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasYohannes = parsed.some((p: any) => p.name?.includes('Yohannes') || p.id === 'S-004');
          if (!hasYohannes) {
            const merged = [initialStories[3], ...parsed];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
            return merged;
          }
          return parsed;
        }
      }
    } catch {
      /* ignore */
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialStories));
    return initialStories;
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

    if (found) return found;

    // 3. Fallback to initialStories
    return (
      initialStories.find((s) => s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slugified) ||
      initialStories.find((s) => s.name.toLowerCase().includes(needle)) ||
      null
    );
  },
};

export default storiesService;
