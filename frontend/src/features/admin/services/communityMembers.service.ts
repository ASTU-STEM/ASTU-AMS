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

export const communityMembersService = {
  getMembers(): CommunityMember[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      /* ignore */
    }
    return [];
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
    const token = localStorage.getItem('authToken') || localStorage.getItem('token') || localStorage.getItem('accessToken');
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

    const token = localStorage.getItem('authToken') || localStorage.getItem('token') || localStorage.getItem('accessToken');
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

    const token = localStorage.getItem('authToken') || localStorage.getItem('token') || localStorage.getItem('accessToken');
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
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        if (res.data.data.length > 0) {
          this.saveMembers(res.data.data);
          return res.data.data;
        }
        return [];
      }
    } catch {
      /* Fallback to local storage if offline */
    }
    const local = this.getMembers();
    return local.length > 0 ? local : [];
  },
};

export default communityMembersService;
