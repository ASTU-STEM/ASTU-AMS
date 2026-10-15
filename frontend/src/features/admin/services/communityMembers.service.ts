import axios from 'axios';

const STORAGE_KEY = 'astu_cms_community_members';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface CommunityMember {
  id: string;
  name: string;
  role: string;
  org: string;
  location: string;
  category: 'all' | 'executive' | 'academia' | 'engineering' | 'policy';
  degree: string;
  gradYear: string;
  image: string;
  bio: string;
  quote?: string;
  badge?: string;
  active?: boolean;
}

const defaultMembers: CommunityMember[] = [
  {
    id: 'cm-1',
    name: 'Samson Arega Bekele',
    role: 'Group Vice President Customer Experience',
    org: 'Ethiopian Airlines Group',
    location: 'Ethiopia / Global Network',
    category: 'executive',
    degree: 'B.A. in International Trade & Investment Management',
    gradYear: '2013',
    image: 'https://astualumni.astu.edu.et/media/communityProfile/Samson_Arega_Bekele.jpg',
    badge: 'Executive Leadership',
    quote: 'ASTU provided the global strategic mindset and discipline that propelled my executive journey in international commercial aviation.',
    bio: 'Executive leader overseeing end-to-end customer experience, hospitality, and global operational standards across Ethiopian Airlines\' international network spanning over 130 destinations on five continents. Holds BA, MA, M.S. and Honorary Doctor of Philosophy.',
    active: true,
  },
  {
    id: 'cm-2',
    name: 'Zenebe Mideksa Abebe',
    role: 'Supply Chain Specialist',
    org: 'The Boeing Company',
    location: 'United States / Aerospace',
    category: 'executive',
    degree: 'Procurement & Supply Chain Management',
    gradYear: '2010',
    image: 'https://astualumni.astu.edu.et/media/communityProfile/Zenebe_Mideksa_Abebe.png',
    badge: 'Aerospace Industry',
    quote: 'From Adama to Boeing\'s global aerospace supply chain, the analytical and technical training at ASTU opened international doors.',
    bio: 'Specialist at The Boeing Company supporting international airlines with high-reliability aerospace supply chain infrastructure, precision procurement, and fleet lifecycle logistics.',
    active: true,
  },
  {
    id: 'cm-3',
    name: 'Dr. Tadesse G. Wakjira',
    role: 'Adjunct Faculty & Research Scholar',
    org: 'Idaho State University',
    location: 'Idaho, USA',
    category: 'academia',
    degree: 'Distinguished Engineering Scholar',
    gradYear: 'Alumnus',
    image: 'https://astualumni.astu.edu.et/media/communityProfile/Tadesse.jpg',
    badge: 'Global Academia',
    quote: 'Advancing higher education and applied science globally while staying proudly engaged to mentor current ASTU students.',
    bio: 'Adjunct Faculty member at Idaho State University, driving cutting-edge engineering research and advancing bilateral academic collaboration between East African universities and US research institutions.',
    active: true,
  },
  {
    id: 'cm-4',
    name: 'Melaku Assefa (Eng.)',
    role: 'Global Operational Excellence Director',
    org: 'Stealth High-Tech Venture',
    location: 'Munich, Germany',
    category: 'executive',
    degree: 'Manufacturing Technology',
    gradYear: '1998',
    image: 'https://astualumni.astu.edu.et/media/communityProfile/MelakuAssefa.jpg',
    badge: 'Operational Excellence',
    quote: 'Manufacturing disciplines and laboratory rigor learned at ASTU continue to drive operational excellence in leading European technology companies.',
    bio: 'Directing operational systems, lean engineering architectures, and scalable precision manufacturing in multi-billion-dollar high-tech ventures across Germany and Europe.',
    active: true,
  },
  {
    id: 'cm-5',
    name: 'Aderajew Shumet Tamirat (PhD)',
    role: 'Senior Advisor to State Minister & Program Manager',
    org: 'Ministry of Finance & AFD',
    location: 'Addis Ababa, Ethiopia',
    category: 'policy',
    degree: 'Banking and Insurance',
    gradYear: '1998',
    image: 'https://astualumni.astu.edu.et/media/communityProfile/Aderajew_Shumet_Tamirat_PhD.jpg',
    badge: 'Public Governance',
    quote: 'ASTU graduates contribute substantially at every level of national economic policy, financial technology, and infrastructure modernization.',
    bio: 'Senior advisor providing high-level economic policy steering, sovereign financing coordination, and strategic program delivery across the Ministry of Finance and Agence Française de Développement.',
    active: true,
  },
  {
    id: 'cm-6',
    name: 'Dr. Tafesse Asrat Abera',
    role: 'Faculty Researcher • Gold Medalist',
    org: 'College of Electrical Engineering & Computing, ASTU',
    location: 'Adama, Ethiopia',
    category: 'academia',
    degree: 'Electrical Engineering • Gold Medalist of the Year',
    gradYear: '2001',
    image: 'https://astualumni.astu.edu.et/media/communityProfile/Dr._Tafesse_Asrat_Abera.png',
    badge: 'University Gold Medalist',
    quote: 'Returning to ASTU as a faculty researcher is a privilege—inspiring the next wave of innovators to solve Ethiopia\'s engineering challenges.',
    bio: 'Gold Medalist of the Year in Electrical Engineering (2001). Conducting high-impact research in telecommunications, signal processing, and computing architectures while guiding postgraduate scholars.',
    active: true,
  },
  {
    id: 'cm-7',
    name: 'Tibebu Tegegne Bekele',
    role: 'Deputy Team Leader',
    org: 'Niras International Consulting (KfW, MoLS)',
    location: 'Germany / Ethiopia',
    category: 'engineering',
    degree: 'Electrical & Electronic Technology (First Batch)',
    gradYear: '1997',
    image: 'https://astualumni.astu.edu.et/media/communityProfile/Tibebu_Tegegne_Bekele.jpg',
    badge: 'Pioneer (1st Batch)',
    quote: 'Being part of ASTU\'s historic first batch was an honor; today we lead international technical education and sustainable infrastructure programs.',
    bio: 'Technical team leader coordinating bilateral engineering capacity development, vocational modernization programs, and sustainable energy projects in partnership with KfW and international ministries.',
    active: true,
  },
  {
    id: 'cm-8',
    name: 'Abraham Nigussie Gari (Eng.)',
    role: 'General Manager',
    org: 'Samket Engineering and Construction PLC',
    location: 'Ethiopia',
    category: 'engineering',
    degree: 'Construction Technology',
    gradYear: '1997',
    image: 'https://astualumni.astu.edu.et/media/communityProfile/Abraham_Nigussie_Gari_Eng..jpg',
    badge: 'Civil Infrastructure',
    quote: 'Building vital civil and industrial infrastructure across the nation, driven by the engineering fundamentals built at ASTU.',
    bio: 'Leads Samket Engineering and Construction PLC, managing large-scale public infrastructure, industrial park construction, and commercial engineering developments nationwide.',
    active: true,
  },
  {
    id: 'cm-9',
    name: 'Eng. Assefa Dida',
    role: 'General Manager & Owner',
    org: 'Assefa Dida General and Water Work Contractor',
    location: 'Adama, Ethiopia',
    category: 'engineering',
    degree: 'BSc in Construction Technology',
    gradYear: '1999',
    image: 'https://astualumni.astu.edu.et/media/communityProfile/Eng._Assefa_Dida.png',
    badge: 'Water Work Engineering',
    quote: 'Sustainable water systems are the lifeblood of regional development. ASTU instilled the technical mastery to build resilient utilities.',
    bio: 'Founder and managing director delivering clean water supply infrastructure, deep well drilling, hydraulic pipelines, and civil utility construction throughout Ethiopia.',
    active: true,
  },
  {
    id: 'cm-10',
    name: 'Dr. Habtamu Beri',
    role: 'Faculty Member and Applied Researcher',
    org: 'Adama Science and Technology University',
    location: 'Adama, Ethiopia',
    category: 'academia',
    degree: 'Manufacturing Technology',
    gradYear: '1998',
    image: 'https://astualumni.astu.edu.et/media/communityProfile/HabtamuBeri.jpg',
    badge: 'Advanced Manufacturing',
    quote: 'Applied research in advanced materials and tooling directly empowers regional industrialization.',
    bio: 'Dedicated academic researcher specializing in computer-aided manufacturing, metallurgical analysis, and university-industry prototype incubation at ASTU specialized labs.',
    active: true,
  },
  {
    id: 'cm-11',
    name: 'Alemayehu Wakjira (PhD)',
    role: 'Faculty Member and Automotive Engineering Researcher',
    org: 'Adama Science and Technology University',
    location: 'Adama, Ethiopia',
    category: 'academia',
    degree: 'Automotive Technology (2005) & Automotive Eng (2010)',
    gradYear: '2005/2010',
    image: 'https://astualumni.astu.edu.et/media/communityProfile/alemayew.png',
    badge: 'Automotive Innovation',
    quote: 'From practical auto mechanics to advanced vehicular dynamics, ASTU continues to pioneer transportation technologies.',
    bio: 'Dual ASTU graduate (2005, 2010) and PhD holder advancing sustainable electric mobility, powertrain efficiency, and thermal engineering research.',
    active: true,
  },
  {
    id: 'cm-12',
    name: 'Mr. Niguse Assefa',
    role: 'Faculty Member and Lecturer',
    org: 'Adama Science and Technology University',
    location: 'Adama, Ethiopia',
    category: 'academia',
    degree: 'Construction Technology',
    gradYear: '2000',
    image: 'https://astualumni.astu.edu.et/media/communityProfile/NiguseAssefa.jpg',
    badge: 'Construction Education',
    quote: 'Teaching the next generation of construction engineers requires both academic rigor and practical field experience.',
    bio: 'Lecturer specializing in construction technology, structural engineering principles, and practical field applications for civil engineering students.',
    active: true,
  },
];

export const communityMembersService = {
  getMembers(): CommunityMember[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      /* ignore */
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultMembers));
    return defaultMembers;
  },

  saveMembers(members: CommunityMember[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
    window.dispatchEvent(new Event('astu-cms-community-members-changed'));
  },

  addMember(member: Omit<CommunityMember, 'id'>): CommunityMember {
    const members = this.getMembers();
    const newMember: CommunityMember = {
      ...member,
      id: `cm-${String(Date.now()).slice(-4)}`,
      active: member.active !== false,
    };
    const updated = [newMember, ...members];
    this.saveMembers(updated);

    // Sync with backend DB API
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    axios
      .post(`${API_URL}/community-members`, newMember, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .catch((err) => console.warn('Failed to sync community member creation with DB:', err));

    return newMember;
  },

  updateMember(id: string, updates: Partial<CommunityMember>): CommunityMember | null {
    const members = this.getMembers();
    const index = members.findIndex((m) => m.id === id);
    if (index === -1) return null;

    members[index] = { ...members[index], ...updates };
    this.saveMembers(members);

    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    axios
      .put(`${API_URL}/community-members/${id}`, updates, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .catch((err) => console.warn('Failed to sync community member update with DB:', err));

    return members[index];
  },

  deleteMember(id: string): boolean {
    const members = this.getMembers();
    const filtered = members.filter((m) => m.id !== id);
    if (filtered.length === members.length) return false;

    this.saveMembers(filtered);

    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    axios
      .delete(`${API_URL}/community-members/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .catch((err) => console.warn('Failed to sync community member deletion with DB:', err));

    return true;
  },

  async fetchMembersFromApi(): Promise<CommunityMember[]> {
    try {
      const res = await axios.get(`${API_URL}/community-members`);
      if (res.data && res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        return res.data.data;
      }
    } catch {
      /* Fallback to local storage if offline */
    }
    return this.getMembers();
  },
};

export default communityMembersService;
