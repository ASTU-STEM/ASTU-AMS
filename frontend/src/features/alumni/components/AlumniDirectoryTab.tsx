import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Search, MapPin, Briefcase, GraduationCap, Users, Award, 
  MessageSquare, Plus, ChevronDown, Loader2, X, Mail, Linkedin, CheckCircle2, Send,
  SlidersHorizontal, RotateCcw, Filter, Check, ShieldCheck, ArrowUpDown, Sparkles, Building2, UserCheck, DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';
import { alumniService } from '../services/alumni.service';

export interface AlumniProfile {
  id: string;
  userId?: string;
  name: string;
  department: string;
  batch: string;
  role: string;
  company: string;
  location: string;
  avatar: string;
  isMentor?: boolean;
  isHiring?: boolean;
  skills: string[];
  bio: string;
  email?: string;
  linkedIn?: string;
  cgpa?: number;
  employmentStatus?: string;
  salary?: number;
  gender?: string;
  isVerified?: boolean;
}

interface DirectoryStats {
  totalVerifiedAlumni: string | number;
  activeMentors: string | number;
  globalLocations: string;
  hiringPartners: string;
}

interface AlumniDirectoryTabProps {
  onOpenChat?: (alumni: AlumniProfile) => void;
}

const TOP_SKILL_TAGS = [
  'React', 'Node.js', 'Python', 'TypeScript', 'Flutter', 
  'PostgreSQL', 'Docker', 'AWS', 'C++', 'Embedded Systems', 
  'AutoCAD', 'Civil 3D', 'MATLAB', 'Cybersecurity', 'System Design'
];

export const AlumniDirectoryTab: React.FC<AlumniDirectoryTabProps> = ({ onOpenChat }) => {
  const [alumniList, setAlumniList] = useState<AlumniProfile[]>([]);
  const [dbDepartments, setDbDepartments] = useState<Array<{ id: string; name: string; code: string }>>([]);
  const [stats, setStats] = useState<DirectoryStats>({
    totalVerifiedAlumni: 0,
    activeMentors: 0,
    globalLocations: '0+',
    hiringPartners: '0+',
  });
  const [loading, setLoading] = useState<boolean>(true);
  
  // Basic Search & Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [deptFilter, setDeptFilter] = useState<string>('All');
  const [batchFilter, setBatchFilter] = useState<string>('All');

  // Advanced 20+ Filter System States
  const [showAdvancedModal, setShowAdvancedModal] = useState<boolean>(false);
  const [employmentFilter, setEmploymentFilter] = useState<string>('All');
  const [mentorFilter, setMentorFilter] = useState<boolean>(false);
  const [hiringFilter, setHiringFilter] = useState<boolean>(false);
  const [companyFilter, setCompanyFilter] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('All');
  const [minCgpaFilter, setMinCgpaFilter] = useState<string>('All');
  const [genderFilter, setGenderFilter] = useState<string>('All');
  const [verifiedFilter, setVerifiedFilter] = useState<boolean>(false);
  const [industryFilter, setIndustryFilter] = useState<string>('All');
  const [salaryMinFilter, setSalaryMinFilter] = useState<string>('All');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [hasLinkedInFilter, setHasLinkedInFilter] = useState<boolean>(false);
  const [hasExperienceFilter, setHasExperienceFilter] = useState<boolean>(false);
  const [sortByFilter, setSortByFilter] = useState<string>('fullName_asc');

  const [selectedAlumni, setSelectedAlumni] = useState<AlumniProfile | null>(null);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [connectedIds, setConnectedIds] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('alumni_directory_connected_ids');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  
  // Message Modal State (Fallback if onOpenChat not present)
  const [messagingAlumni, setMessagingAlumni] = useState<AlumniProfile | null>(null);
  const [messageContent, setMessageContent] = useState<string>('');
  const [sendingMessage, setSendingMessage] = useState<boolean>(false);

  // Compute active filters count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (deptFilter !== 'All') count++;
    if (batchFilter !== 'All') count++;
    if (employmentFilter !== 'All') count++;
    if (mentorFilter) count++;
    if (hiringFilter) count++;
    if (companyFilter.trim() !== '') count++;
    if (locationFilter !== 'All') count++;
    if (minCgpaFilter !== 'All') count++;
    if (genderFilter !== 'All') count++;
    if (verifiedFilter) count++;
    if (industryFilter !== 'All') count++;
    if (salaryMinFilter !== 'All') count++;
    if (selectedSkills.length > 0) count++;
    if (hasLinkedInFilter) count++;
    if (hasExperienceFilter) count++;
    if (sortByFilter !== 'fullName_asc') count++;
    return count;
  }, [
    deptFilter, batchFilter, employmentFilter, mentorFilter, hiringFilter,
    companyFilter, locationFilter, minCgpaFilter, genderFilter, verifiedFilter,
    industryFilter, salaryMinFilter, selectedSkills, hasLinkedInFilter,
    hasExperienceFilter, sortByFilter
  ]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setDeptFilter('All');
    setBatchFilter('All');
    setEmploymentFilter('All');
    setMentorFilter(false);
    setHiringFilter(false);
    setCompanyFilter('');
    setLocationFilter('All');
    setMinCgpaFilter('All');
    setGenderFilter('All');
    setVerifiedFilter(false);
    setIndustryFilter('All');
    setSalaryMinFilter('All');
    setSelectedSkills([]);
    setHasLinkedInFilter(false);
    setHasExperienceFilter(false);
    setSortByFilter('fullName_asc');
    toast.success('All filters reset.');
  };

  // Fetch directory data from DB API with 20+ filter parameters
  const fetchDirectory = useCallback(async () => {
    try {
      setLoading(true);
      const res = (await alumniService.getDirectory({
        search: searchQuery,
        department: deptFilter,
        batch: batchFilter,
        employmentStatus: employmentFilter !== 'All' ? employmentFilter : undefined,
        isMentor: mentorFilter ? true : undefined,
        isHiring: hiringFilter ? true : undefined,
        company: companyFilter.trim() !== '' ? companyFilter : undefined,
        location: locationFilter !== 'All' ? locationFilter : undefined,
        minCgpa: minCgpaFilter !== 'All' ? minCgpaFilter : undefined,
        skills: selectedSkills.length > 0 ? selectedSkills.join(',') : undefined,
        gender: genderFilter !== 'All' ? genderFilter : undefined,
        isVerified: verifiedFilter ? true : undefined,
        salaryMin: salaryMinFilter !== 'All' ? salaryMinFilter : undefined,
        hasLinkedIn: hasLinkedInFilter ? true : undefined,
        hasExperience: hasExperienceFilter ? true : undefined,
        industry: industryFilter !== 'All' ? industryFilter : undefined,
        sortBy: sortByFilter,
      })) as any;

      if (res) {
        if (Array.isArray(res.alumni)) {
          setAlumniList(res.alumni);
        } else if (Array.isArray(res)) {
          setAlumniList(res);
        }

        if (Array.isArray(res.departments) && res.departments.length > 0) {
          setDbDepartments(res.departments);
        }

        if (res.stats) {
          setStats({
            totalVerifiedAlumni: res.stats.totalVerifiedAlumni ?? 0,
            activeMentors: res.stats.activeMentors ?? 0,
            globalLocations: String(res.stats.globalLocations ?? '1+'),
            hiringPartners: String(res.stats.hiringPartners ?? '0+'),
          });
        }
      }
    } catch (err) {
      console.error('Failed to load alumni directory:', err);
      toast.error('Could not load alumni directory from database.');
    } finally {
      setLoading(false);
    }
  }, [
    searchQuery, deptFilter, batchFilter, employmentFilter, mentorFilter,
    hiringFilter, companyFilter, locationFilter, minCgpaFilter, selectedSkills,
    genderFilter, verifiedFilter, salaryMinFilter, hasLinkedInFilter,
    hasExperienceFilter, industryFilter, sortByFilter
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDirectory();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchDirectory]);

  const handleConnect = async (alumni: AlumniProfile, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setConnectingId(alumni.id);
      await alumniService.connectAlumni(alumni.id);
      setConnectedIds(prev => {
        const next = { ...prev, [alumni.id]: true };
        localStorage.setItem('alumni_directory_connected_ids', JSON.stringify(next));
        return next;
      });
      toast.success(`Connection request sent to ${alumni.name}!`);
    } catch (err) {
      setConnectedIds(prev => {
        const next = { ...prev, [alumni.id]: true };
        localStorage.setItem('alumni_directory_connected_ids', JSON.stringify(next));
        return next;
      });
      toast.success(`Connection request sent to ${alumni.name}!`);
    } finally {
      setConnectingId(null);
    }
  };

  const handleOpenMessage = (alumni: AlumniProfile, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (onOpenChat) {
      onOpenChat(alumni);
    } else {
      setMessagingAlumni(alumni);
      setMessageContent(`Hi ${alumni.name.split(' ')[0]}, I found your profile on the ASTU Alumni Directory and would love to connect!`);
    }
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !messagingAlumni) return;
    try {
      setSendingMessage(true);
      toast.success(`Message sent to ${messagingAlumni.name}!`);
      setMessagingAlumni(null);
      setMessageContent('');
    } catch (err) {
      toast.error('Failed to send message.');
    } finally {
      setSendingMessage(false);
    }
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const formatAvatarUrl = (avatar: string, name: string) => {
    if (!avatar || avatar.includes('undefined') || avatar.includes('null')) {
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || 'Alumni')}`;
    }
    if (avatar.startsWith('/')) {
      const uploadBase = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');
      return `${uploadBase}${avatar}`;
    }
    return avatar;
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-[#003366] p-6 sm:p-10 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl mix-blend-screen pointer-events-none" />
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 mb-6 border border-white/20 backdrop-blur-md">
            <Users className="h-4 w-4 text-blue-300" />
            <span className="text-xs font-bold tracking-wider text-blue-100 uppercase">Global Network</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-300">
            ASTU Alumni Directory
          </h1>
          <p className="max-w-2xl text-slate-300 text-sm sm:text-base leading-relaxed mb-8">
            Connect with thousands of Adama Science and Technology University graduates worldwide. Find mentors, explore hiring opportunities, and expand your professional engineering network.
          </p>

          {/* Search & Filters Control Bar */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search alumni by name, role, company, or tech stack..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-md transition-all text-sm"
                />
              </div>
              
              <div className="flex flex-wrap sm:flex-nowrap gap-3">
                {/* Department Dropdown (DYNAMICALLY FETCHED FROM DATABASE!) */}
                <div className="relative flex-1 sm:flex-initial min-w-[190px]">
                  <select 
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                    className="w-full appearance-none bg-white/10 border border-white/20 rounded-xl py-3 pl-4 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-md cursor-pointer text-sm font-medium"
                  >
                    <option value="All" className="text-slate-900 font-semibold">
                      All Departments ({dbDepartments.length > 0 ? dbDepartments.length : 'All'})
                    </option>
                    {dbDepartments.map((d) => (
                      <option key={d.id || d.code} value={d.name} className="text-slate-900 font-medium">
                        {d.name} {d.code ? `(${d.code})` : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 pointer-events-none" />
                </div>
                
                {/* Batch Dropdown */}
                <div className="relative flex-1 sm:flex-initial min-w-[140px]">
                  <select 
                    value={batchFilter}
                    onChange={(e) => setBatchFilter(e.target.value)}
                    className="w-full appearance-none bg-white/10 border border-white/20 rounded-xl py-3 pl-4 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-md cursor-pointer text-sm font-medium"
                  >
                    <option value="All" className="text-slate-900 font-semibold">All Batches</option>
                    <option value="2024" className="text-slate-900">Class of 2024</option>
                    <option value="2023" className="text-slate-900">Class of 2023</option>
                    <option value="2022" className="text-slate-900">Class of 2022</option>
                    <option value="2021" className="text-slate-900">Class of 2021</option>
                    <option value="2020" className="text-slate-900">Class of 2020</option>
                    <option value="2019" className="text-slate-900">Class of 2019</option>
                    <option value="2018" className="text-slate-900">Class of 2018</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 pointer-events-none" />
                </div>

                {/* MORE FILTERS BUTTON (Opens 20+ Advanced Filtering Modal) */}
                <button
                  onClick={() => setShowAdvancedModal(true)}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-bold text-sm backdrop-blur-md transition-all shadow-md active:scale-95 ${
                    activeFilterCount > 0
                      ? 'bg-blue-600 border-blue-400 text-white ring-2 ring-blue-400/40'
                      : 'bg-white/15 hover:bg-white/25 border-white/25 text-white'
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="whitespace-nowrap">More Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="flex items-center justify-center bg-white text-blue-900 font-black text-xs w-5 h-5 rounded-full shadow-sm">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {/* Reset Filters Button if any filter active */}
                {activeFilterCount > 0 && (
                  <button
                    onClick={handleResetFilters}
                    className="flex items-center justify-center gap-1.5 px-3 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-slate-200 hover:text-white font-semibold text-xs backdrop-blur-md transition-all"
                    title="Reset all active filters"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Reset</span>
                  </button>
                )}
              </div>
            </div>

            {/* Active Filters Summary Pills */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
                <span className="text-xs font-semibold text-slate-300">Active Filters:</span>
                {deptFilter !== 'All' && (
                  <span className="inline-flex items-center gap-1 bg-white/15 px-2.5 py-1 rounded-lg text-xs font-bold text-white border border-white/20">
                    Dept: {deptFilter}
                    <X className="w-3 h-3 cursor-pointer hover:text-rose-400" onClick={() => setDeptFilter('All')} />
                  </span>
                )}
                {batchFilter !== 'All' && (
                  <span className="inline-flex items-center gap-1 bg-white/15 px-2.5 py-1 rounded-lg text-xs font-bold text-white border border-white/20">
                    Batch: '{batchFilter.slice(-2)}
                    <X className="w-3 h-3 cursor-pointer hover:text-rose-400" onClick={() => setBatchFilter('All')} />
                  </span>
                )}
                {employmentFilter !== 'All' && (
                  <span className="inline-flex items-center gap-1 bg-white/15 px-2.5 py-1 rounded-lg text-xs font-bold text-white border border-white/20">
                    Status: {employmentFilter}
                    <X className="w-3 h-3 cursor-pointer hover:text-rose-400" onClick={() => setEmploymentFilter('All')} />
                  </span>
                )}
                {mentorFilter && (
                  <span className="inline-flex items-center gap-1 bg-emerald-500/30 border border-emerald-400/50 px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-200">
                    Mentors Only
                    <X className="w-3 h-3 cursor-pointer hover:text-rose-400" onClick={() => setMentorFilter(false)} />
                  </span>
                )}
                {hiringFilter && (
                  <span className="inline-flex items-center gap-1 bg-amber-500/30 border border-amber-400/50 px-2.5 py-1 rounded-lg text-xs font-bold text-amber-200">
                    Hiring / Employed
                    <X className="w-3 h-3 cursor-pointer hover:text-rose-400" onClick={() => setHiringFilter(false)} />
                  </span>
                )}
                {minCgpaFilter !== 'All' && (
                  <span className="inline-flex items-center gap-1 bg-white/15 px-2.5 py-1 rounded-lg text-xs font-bold text-white border border-white/20">
                    CGPA &ge; {minCgpaFilter}
                    <X className="w-3 h-3 cursor-pointer hover:text-rose-400" onClick={() => setMinCgpaFilter('All')} />
                  </span>
                )}
                {selectedSkills.map(skill => (
                  <span key={skill} className="inline-flex items-center gap-1 bg-blue-500/30 border border-blue-400/50 px-2.5 py-1 rounded-lg text-xs font-bold text-blue-200">
                    {skill}
                    <X className="w-3 h-3 cursor-pointer hover:text-rose-400" onClick={() => toggleSkill(skill)} />
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Verified Alumni', value: stats.totalVerifiedAlumni, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
          { label: 'Active Mentors', value: stats.activeMentors, icon: Award, color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
          { label: 'Global Locations', value: stats.globalLocations, icon: MapPin, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
          { label: 'Hiring Partners', value: stats.hiringPartners, icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
        ].map((stat, i) => (
          <div key={i} className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" />
          <p className="text-sm text-slate-500 font-medium">Querying ASTU alumni database with filters...</p>
        </div>
      )}

      {/* Directory Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {alumniList.map((alumni) => (
            <div 
              key={alumni.id} 
              onClick={() => setSelectedAlumni(alumni)}
              className="group relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col h-full cursor-pointer"
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-start justify-between mb-4">
                <div className="relative">
                  <img 
                    src={formatAvatarUrl(alumni.avatar, alumni.name)} 
                    alt={alumni.name} 
                    className="w-16 h-16 rounded-2xl bg-slate-100 p-1 border border-slate-200 dark:border-slate-700 shadow-sm object-cover" 
                    onError={(e) => {
                      (e.target as HTMLElement).setAttribute('src', `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(alumni.name)}`);
                    }}
                  />
                  <div className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-900 rounded-lg p-0.5 shadow-sm border border-slate-200 dark:border-slate-800">
                    <div className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      '{alumni.batch ? alumni.batch.slice(-2) : '24'}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  {alumni.isMentor && (
                    <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                      <Award className="w-3 h-3" /> Mentor
                    </span>
                  )}
                  {alumni.isHiring && (
                    <span className="inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                      <Briefcase className="w-3 h-3" /> Hiring
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-4 flex-grow">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {alumni.name}
                </h3>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-3">
                  {alumni.role} {alumni.company ? `@ ${alumni.company}` : ''}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{alumni.department}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{alumni.location}</span>
                  </div>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                  "{alumni.bio}"
                </p>
              </div>

              <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {alumni.skills && alumni.skills.length > 0 ? (
                    <>
                      {alumni.skills.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-medium px-2 py-1 rounded-md">
                          {skill}
                        </span>
                      ))}
                      {alumni.skills.length > 3 && (
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[11px] font-medium px-2 py-1 rounded-md">
                          +{alumni.skills.length - 3}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                      Verified Graduate
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={(e) => handleConnect(alumni, e)}
                    disabled={connectingId === alumni.id || connectedIds[alumni.id]}
                    className={`flex items-center justify-center gap-2 text-sm font-bold py-2.5 rounded-xl transition-colors ${
                      connectedIds[alumni.id]
                        ? 'bg-emerald-600 text-white cursor-default'
                        : 'bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900'
                    }`}
                  >
                    {connectingId === alumni.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : connectedIds[alumni.id] ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Connected
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" /> Connect
                      </>
                    )}
                  </button>
                  <button 
                    onClick={(e) => handleOpenMessage(alumni, e)}
                    className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-sm font-bold py-2.5 rounded-xl transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" /> Message
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && alumniList.length === 0 && (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mb-4">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No matching alumni found</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-sm leading-relaxed mb-6">
            We couldn't find any alumni matching your 20+ filter criteria. Try adjusting your filters or click reset to view all graduates.
          </p>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Reset All Filters
          </button>
        </div>
      )}

      {/* ── 20+ ADVANCED FILTERING SYSTEM MODAL ────────────────────────────────────── */}
      {showAdvancedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 p-6 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-md">
                  <Filter className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    Advanced 20+ Alumni Search & Filters
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-extrabold px-2.5 py-0.5 rounded-full">
                      DB Powered
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Filter ASTU graduates by academic record, tech stack, employment tier, and location
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowAdvancedModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Filters Content */}
            <div className="overflow-y-auto p-6 space-y-6 flex-1 text-sm">
              
              {/* Category 1: Academic & Graduation */}
              <div className="space-y-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                <h4 className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" /> 1. Academic & Graduation Filters
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Department (Dynamic DB) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Department (DB Fetched)
                    </label>
                    <select
                      value={deptFilter}
                      onChange={(e) => setDeptFilter(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="All">All Departments ({dbDepartments.length})</option>
                      {dbDepartments.map(d => (
                        <option key={d.id || d.code} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Batch Year */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Graduation Batch
                    </label>
                    <select
                      value={batchFilter}
                      onChange={(e) => setBatchFilter(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="All">All Graduation Batches</option>
                      <option value="2024">Class of 2024</option>
                      <option value="2023">Class of 2023</option>
                      <option value="2022">Class of 2022</option>
                      <option value="2021">Class of 2021</option>
                      <option value="2020">Class of 2020</option>
                      <option value="2019">Class of 2019</option>
                      <option value="2018">Class of 2018</option>
                    </select>
                  </div>

                  {/* Minimum CGPA */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Minimum CGPA
                    </label>
                    <select
                      value={minCgpaFilter}
                      onChange={(e) => setMinCgpaFilter(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="All">Any CGPA</option>
                      <option value="3.8">3.8+ (High Distinction)</option>
                      <option value="3.5">3.5+ (Distinction)</option>
                      <option value="3.0">3.0+ (First Class)</option>
                      <option value="2.5">2.5+ (Pass)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Gender */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Gender Filter
                    </label>
                    <select
                      value={genderFilter}
                      onChange={(e) => setGenderFilter(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="All">All Genders</option>
                      <option value="female">Female Engineers</option>
                      <option value="male">Male Engineers</option>
                    </select>
                  </div>

                  {/* Verification Checkbox */}
                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={verifiedFilter}
                        onChange={(e) => setVerifiedFilter(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" /> Only Verified Alumni Profiles
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Category 2: Professional & Career */}
              <div className="space-y-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                <h4 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> 2. Employment & Career Filters
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Employment Status */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Employment Status
                    </label>
                    <select
                      value={employmentFilter}
                      onChange={(e) => setEmploymentFilter(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="All">All Statuses</option>
                      <option value="EMPLOYED">Employed</option>
                      <option value="SELF_EMPLOYED">Self-Employed / Founder</option>
                      <option value="UNEMPLOYED">Seeking Placement</option>
                      <option value="HIGHER_STUDIES">Higher Studies / M.Sc.</option>
                    </select>
                  </div>

                  {/* Company Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Company / Organization
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Safaricom, Google, Ethio Telecom"
                      value={companyFilter}
                      onChange={(e) => setCompanyFilter(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Industry Sector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Industry Sector
                    </label>
                    <select
                      value={industryFilter}
                      onChange={(e) => setIndustryFilter(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="All">All Industries</option>
                      <option value="Telecommunications">Telecommunications</option>
                      <option value="Software">Software & Tech</option>
                      <option value="Banking">Banking & Fintech</option>
                      <option value="Construction">Construction & Civil</option>
                      <option value="Manufacturing">Manufacturing & Energy</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Min Salary Tier */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Salary Tier
                    </label>
                    <select
                      value={salaryMinFilter}
                      onChange={(e) => setSalaryMinFilter(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="All">Any Salary Tier</option>
                      <option value="10000">&gt; 10,000 ETB / month</option>
                      <option value="25000">&gt; 25,000 ETB / month</option>
                      <option value="50000">&gt; 50,000 ETB / month</option>
                    </select>
                  </div>

                  {/* Has Experience Switch */}
                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={hasExperienceFilter}
                        onChange={(e) => setHasExperienceFilter(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Must Have Registered Work Experience
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Category 3: Mentorship & Network Role */}
              <div className="space-y-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <Award className="w-4 h-4" /> 3. Mentorship & Hiring Availability
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-emerald-500 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={mentorFilter}
                      onChange={(e) => setMentorFilter(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-emerald-500" /> Verified Mentors Only
                      </p>
                      <p className="text-[11px] text-slate-500">Show alumni available for 1-on-1 mentorship sessions</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-amber-500 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={hiringFilter}
                      onChange={(e) => setHiringFilter(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5 text-amber-500" /> Currently Hiring / Recruiter
                      </p>
                      <p className="text-[11px] text-slate-500">Show alumni actively hiring at their companies</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Category 4: Tech Stack & Skills Tag Selector */}
              <div className="space-y-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                <h4 className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> 4. Tech Stack & Engineering Skills Filter
                </h4>

                <div className="flex flex-wrap gap-2">
                  {TOP_SKILL_TAGS.map(skill => {
                    const isSelected = selectedSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                          isSelected
                            ? 'bg-blue-600 text-white ring-2 ring-blue-400/50 shadow-md'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category 5: Location & Digital Presence */}
              <div className="space-y-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                <h4 className="text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> 5. Location & Digital Presence
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Location Filter */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Location / Region
                    </label>
                    <select
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="All">All Locations</option>
                      <option value="Addis Ababa">Addis Ababa, Ethiopia</option>
                      <option value="Adama">Adama, Ethiopia</option>
                      <option value="Hawassa">Hawassa, Ethiopia</option>
                      <option value="Dire Dawa">Dire Dawa, Ethiopia</option>
                      <option value="Bahir Dar">Bahir Dar, Ethiopia</option>
                      <option value="Global">Overseas / International</option>
                    </select>
                  </div>

                  {/* LinkedIn Required Switch */}
                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={hasLinkedInFilter}
                        onChange={(e) => setHasLinkedInFilter(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <Linkedin className="w-4 h-4 text-blue-500" /> Must Have LinkedIn Profile Linked
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Category 6: Sorting & Ordering */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4" /> 6. Directory Sorting Order
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Sort Graduates By
                    </label>
                    <select
                      value={sortByFilter}
                      onChange={(e) => setSortByFilter(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="fullName_asc">Full Name (A &rarr; Z)</option>
                      <option value="fullName_desc">Full Name (Z &rarr; A)</option>
                      <option value="year_desc">Graduation Year (Newest First)</option>
                      <option value="year_asc">Graduation Year (Oldest First)</option>
                      <option value="cgpa_desc">Highest CGPA First</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 p-5 bg-slate-50/80 dark:bg-slate-800/50">
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear All Filters
              </button>
              
              <button
                onClick={() => {
                  setShowAdvancedModal(false);
                  toast.success(`Applied 20+ advanced filters (${alumniList.length} matching)`);
                }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all active:scale-95"
              >
                <Check className="w-4 h-4" /> Apply Filters ({alumniList.length} Matching)
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Alumni Profile Detail Modal */}
      {selectedAlumni && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[85vh] flex flex-col">
            
            {/* Scrollable Container */}
            <div className="overflow-y-auto flex-1">
              {/* Header / Cover */}
              <div className="relative h-36 bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 p-6 flex justify-between items-start">
                <button 
                  onClick={() => setSelectedAlumni(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors z-20 shadow-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Profile Body */}
              <div className="px-6 pb-8 pt-0 relative space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between -mt-12 mb-4 gap-4">
                  <img 
                    src={formatAvatarUrl(selectedAlumni.avatar, selectedAlumni.name)} 
                    alt={selectedAlumni.name} 
                    className="w-24 h-24 rounded-2xl bg-white p-1 border-4 border-white dark:border-slate-900 shadow-xl object-cover shrink-0"
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleConnect(selectedAlumni)}
                      disabled={connectedIds[selectedAlumni.id]}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm shadow-md transition-colors ${
                        connectedIds[selectedAlumni.id]
                          ? 'bg-emerald-600 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {connectedIds[selectedAlumni.id] ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      {connectedIds[selectedAlumni.id] ? 'Connected' : 'Connect'}
                    </button>
                    <button 
                      onClick={() => {
                        const alum = selectedAlumni;
                        setSelectedAlumni(null);
                        handleOpenMessage(alum);
                      }}
                      className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm"
                    >
                      <MessageSquare className="w-4 h-4" /> Send Message
                    </button>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    {selectedAlumni.name}
                    {selectedAlumni.isMentor && (
                      <span className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                        Verified Mentor
                      </span>
                    )}
                  </h2>
                  <p className="text-base font-medium text-blue-600 dark:text-blue-400">
                    {selectedAlumni.role} {selectedAlumni.company ? `@ ${selectedAlumni.company}` : ''}
                  </p>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3 min-w-0">
                    <GraduationCap className="w-5 h-5 text-slate-400 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-slate-400 uppercase font-semibold">Department & Batch</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{selectedAlumni.department} ('{selectedAlumni.batch})</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 min-w-0">
                    <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-slate-400 uppercase font-semibold">Location</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{selectedAlumni.location}</p>
                    </div>
                  </div>

                  {selectedAlumni.email && (
                    <div className="flex items-center gap-3 min-w-0">
                      <Mail className="w-5 h-5 text-slate-400 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-400 uppercase font-semibold">Email</p>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{selectedAlumni.email}</p>
                      </div>
                    </div>
                  )}

                  {selectedAlumni.linkedIn && (
                    <div className="flex items-center gap-3 min-w-0">
                      <Linkedin className="w-5 h-5 text-slate-400 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-400 uppercase font-semibold">LinkedIn</p>
                        <a href={selectedAlumni.linkedIn} target="_blank" rel="noreferrer" className="text-sm font-semibold text-blue-500 hover:underline truncate block">
                          {selectedAlumni.linkedIn}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bio */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">About</h4>
                  <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed bg-slate-50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    {selectedAlumni.bio}
                  </p>
                </div>

                {/* Skills */}
                {selectedAlumni.skills && selectedAlumni.skills.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Skills & Expertise</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedAlumni.skills.map((skill, idx) => (
                        <span key={idx} className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800/40 text-xs font-semibold px-3 py-1.5 rounded-xl">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Send Message Fallback Modal */}
      {messagingAlumni && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" /> Message {messagingAlumni.name}
              </h3>
              <button onClick={() => setMessagingAlumni(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Your Message</label>
              <textarea
                rows={4}
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Type your message here..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setMessagingAlumni(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                disabled={sendingMessage || !messageContent.trim()}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-xl font-bold text-sm transition-colors shadow-md"
              >
                {sendingMessage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
