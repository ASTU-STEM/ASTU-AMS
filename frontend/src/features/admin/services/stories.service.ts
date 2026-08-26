import contentService from './content.service';
import { ContentCardItem } from '../components/ContentCard';

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

const initialStories: AlumniStory[] = [
  {
    id: 'S-001',
    name: 'Abebe Yosef',
    role: 'Software Engineer',
    company: 'Safaricom Ethiopia',
    graduationYear: 'Class of 2022',
    department: 'Software Engineering',
    text: 'I landed my new role after using ASTU-AMS job matching and mentorship support. Thank you ASTU community.',
    fullStory: `My journey at Adama Science and Technology University (ASTU) laid the foundation for everything I have achieved in tech today. 

During my senior year in Software Engineering, I focused on distributed cloud architectures and scalable web platforms. Through the ASTU Alumni Management System (AMS), I connected with senior alumni working at leading telecom and fintech firms across East Africa.

Their mentorship helped me refine my portfolio, prepare for technical interviews, and apply for competitive engineering roles. Shortly after graduation, I was offered a position as a Software Engineer at Safaricom Ethiopia. I encourage every current student and fellow graduate to stay active in the ASTU network—the connections you make here will shape your career!`,
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    featured: true,
    publishedAt: 'May 15, 2026',
  },
  {
    id: 'S-002',
    name: 'Bekele Kebede',
    role: 'Engineering Director & Employer Partner',
    company: 'GreenGrid Labs',
    graduationYear: 'Class of 2018',
    department: 'Electrical & Computer Engineering',
    text: 'Hiring from ASTU-AMS has been efficient. We found strong engineering candidates with the right practical skills.',
    fullStory: `As a graduate of ASTU’s Electrical Engineering department, I co-founded GreenGrid Labs to deliver clean, renewable energy solutions to industrial campuses across Ethiopia. 

When our company expanded rapidly in 2025, we partnered directly with ASTU-AMS to source talented engineering graduates. The quality of practical preparation and problem-solving skills displayed by ASTU graduates is unmatched. 

Today, over 40% of our core technical team graduated from ASTU. Staying connected through the alumni portal allows us to give back through campus recruitment, guest lectures, and student research sponsorships.`,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    featured: true,
    publishedAt: 'Jun 1, 2026',
  },
  {
    id: 'S-003',
    name: 'Helina Sileshi',
    role: 'AI Researcher & Mentor',
    company: 'ASTU AI Research Center',
    graduationYear: 'Class of 2020',
    department: 'Computer Science',
    text: 'Proud to mentor ASTU students through the AMS platform. The next generation of innovators is ready!',
    fullStory: `Mentorship is at the heart of academic and professional excellence. After completing my Master's degree in Machine Learning, I returned to ASTU to lead applied research programs at the newly launched AI Research Center.

Through the ASTU-AMS mentorship framework, I guide final-year engineering students through research publication, algorithm design, and career pathing. 

Seeing our mentees publish in international journals and land roles at global technology organizations is immensely rewarding. The ASTU alumni network is proof of what we can achieve when generations of graduates support one another.`,
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    featured: true,
    publishedAt: 'Jun 10, 2026',
  },
];

export const storiesService = {
  getStories(): AlumniStory[] {
    const cmsItems = contentService.getItems();
    const storyCmsItems = cmsItems.filter(
      (i) => i.tags?.includes('story') || i.tags?.includes('success-story')
    );

    if (storyCmsItems.length > 0) {
      return storyCmsItems.map((item) => ({
        id: item.id,
        name: item.author || item.title,
        role: item.tags?.[1] || 'ASTU Graduate',
        company: 'ASTU Alumni Partner',
        graduationYear: 'Verified Graduate',
        department: 'Engineering & Science',
        text: item.excerpt || item.title,
        fullStory: item.excerpt || item.title,
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
        featured: item.featured,
        publishedAt: item.publishedAt || item.updatedAt,
      }));
    }

    return initialStories;
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
};

export default storiesService;
