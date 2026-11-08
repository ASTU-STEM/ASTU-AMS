import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe,
  Users,
  Search,
  Building2,
  GraduationCap,
  Briefcase,
  MapPin,
  Award,
  ArrowRight,
  Share2,
  CheckCircle2,
  Calendar,
  Sparkles,
  ChevronRight,
  Mail,
  UserPlus,
  BookOpen,
  Filter,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import communityMembersService, { CommunityMember } from '../features/admin/services/communityMembers.service';
import homepageCmsService from '../features/admin/services/homepageCms.service';
import { usePublicMetrics } from '../services/publicMetrics.service';

const CATEGORIES = [
  { id: 'all', label: 'All Community Leaders', icon: Globe },
  { id: 'executive', label: 'Global Industry & Aerospace', icon: Building2 },
  { id: 'policy', label: 'Public Policy & Finance', icon: Briefcase },
  { id: 'academia', label: 'Academia & Research', icon: GraduationCap },
  { id: 'engineering', label: 'Infrastructure & Contractors', icon: Award },
];

const DEFAULT_REGIONAL_CHAPTERS = [
  {
    name: 'Central Ethiopia & Addis Ababa Chapter',
    hub: 'Addis Ababa',
    members: '640+ Verified Alumni',
    focus: 'Aviation, Telecommunications, Financial Technology, and Federal Infrastructure Ministries.',
    contact: 'irccd@astu.edu.et',
  },
  {
    name: 'Main Campus & Rift Valley Hub',
    hub: 'Adama',
    members: '320+ Verified Alumni',
    focus: 'Research Incubators, Precision Manufacturing, Applied Automotive Engineering & Water Works.',
    contact: 'alumni@astu.edu.et',
  },
  {
    name: 'North America Chapter',
    hub: 'United States & Canada',
    members: '160+ Verified Alumni',
    focus: 'Aerospace Engineering (Boeing), Cloud Architecture, and North American University Academic Chairs.',
    contact: 'alumni-na@astu.edu.et',
  },
  {
    name: 'European Union Chapter',
    hub: 'Germany, UK & Scandinavia',
    members: '110+ Verified Alumni',
    focus: 'DAAD Research Fellowships, Industrial Operations Engineering, and Multilateral Technical Consulting.',
    contact: 'alumni-eu@astu.edu.et',
  },
];

const DEFAULT_COMMUNITY_PILLARS = [
  {
    icon: 'Users',
    title: 'Alumni Mentorship',
    desc: 'Mentor graduating seniors in portfolio and CV reviews, mock technical interviews, and navigating the labor market transition before annual Job Expo.',
    action: 'Join Mentorship Roster',
    link: '/info/mentorship',
  },
  {
    icon: 'BookOpen',
    title: 'Curriculum Advisory',
    desc: 'Participate in employer tracer studies and industry feedback panels that update engineering and technology curricula with modern workplace tooling.',
    action: 'Learn More',
    link: '/info/overview',
  },
  {
    icon: 'Sparkles',
    title: 'Endowment & Innovation',
    desc: 'Sponsor student capstone graduation projects, prototyping laboratories, and entrepreneurship seed grants at the ASTU Incubation Arc.',
    action: 'Support Innovation',
    link: '/info/innovation',
  },
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Users,
  BookOpen,
  Sparkles,
};

function isRealMember(m: any): boolean {
  if (!m || typeof m !== 'object') return false;
  const name = (m.name || '').trim();
  if (!name || name.length < 3) return false;
  if (/^(ghjk|asdf|test|qwerty|123|abc|xyz|sample)/i.test(name)) return false;
  if (!m.role && !m.org) return false;
  return true;
}

export default function AlumniCommunityPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalMember, setActiveModalMember] = useState<CommunityMember | null>(null);

  const [communityMembers, setCommunityMembers] = useState<CommunityMember[]>(() => {
    const raw = communityMembersService.getMembers().filter((m) => m.active !== false && isRealMember(m));
    return raw;
  });

  const { metrics } = usePublicMetrics();

  // Consistent stats across the entire site
  const dynamicHeroStats = useMemo(() => [
    {
      label: 'Registered Alumni',
      value: metrics.registeredAlumniFormatted || '1,238+',
      sub: 'Globally Verified',
    },
    {
      label: 'Fields of Study',
      value: '5 Fields of Study',
      sub: 'Engineering & Applied Sciences',
    },
    {
      label: 'Partner Employers',
      value: `${metrics.corporatePartnersFormatted || '500+'} Partner Employers`,
      sub: 'Industry & Research Collaborators',
    },
    {
      label: 'Years of Excellence',
      value: '33+ Years',
      sub: 'Established in 1993',
    },
  ], [metrics]);

  // Synchronized state with live CMS fallback
  const [communityPageHero, setCommunityPageHero] = useState({
    title: 'Your Network Around the World',
    subtitle:
      'With a legacy spanning over three decades since 1993, Adama Science and Technology University connects graduates leading in global aviation, high-tech enterprises, sovereign public policy, academic research chairs, and civil infrastructure worldwide.',
  });

  const [regionalChapters, setRegionalChapters] = useState(DEFAULT_REGIONAL_CHAPTERS);

  // Future flagship event: April 24–25, 2027 (Upcoming relative to Nov 8, 2026)
  const [eventBanner, setEventBanner] = useState({
    badge: 'Upcoming Flagship Event',
    title: 'ASTU Alumni Global Homecoming & Tech Summit 2027',
    date: 'April 24–25, 2027',
    location: 'ASTU Main Campus • Adama, Ethiopia',
    description:
      'Celebrating over three decades of ASTU engineering and scientific heritage! A landmark homecoming bringing together graduates, university leadership, academic researchers, and enterprise partners for two days of keynote panels, technical exhibits, and career networking.',
    features: [
      '1,500+ Expected Delegates & Alumni',
      'Industry Innovation & Career Expo',
      'Applied Research & Startup Incubation Showcase',
    ],
    primaryButtonText: 'Register for Homecoming',
    primaryButtonLink: '/register',
    secondaryButtonText: 'View Summit Schedule',
    secondaryButtonLink: '/events',
  });

  const [communityPillars, setCommunityPillars] = useState(DEFAULT_COMMUNITY_PILLARS);

  useEffect(() => {
    const handleSync = () => {
      const updated = communityMembersService.getMembers().filter((m) => m.active !== false && isRealMember(m));
      setCommunityMembers(updated);
    };

    const handleCmsSync = () => {
      const config = homepageCmsService.getSettings();
      if (config?.communityPageHero?.subtitle) {
        setCommunityPageHero({
          title: 'Your Network Around the World',
          subtitle: config.communityPageHero.subtitle.replace(/nearly three decades/gi, 'over three decades'),
        });
      }
      if (Array.isArray(config?.regionalChapters) && config.regionalChapters.length) {
        setRegionalChapters(config.regionalChapters);
      }
      if (Array.isArray(config?.communityPillars) && config.communityPillars.length) {
        setCommunityPillars(config.communityPillars);
      }
    };

    window.addEventListener('astu-cms-community-members-changed', handleSync);
    window.addEventListener('astu-cms-homepage-changed', handleCmsSync);
    return () => {
      window.removeEventListener('astu-cms-community-members-changed', handleSync);
      window.removeEventListener('astu-cms-homepage-changed', handleCmsSync);
    };
  }, []);

  const filteredMembers = useMemo(() => {
    return communityMembers.filter((m) => {
      if (!isRealMember(m)) return false;
      const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !query ||
        m.name.toLowerCase().includes(query) ||
        (m.org && m.org.toLowerCase().includes(query)) ||
        (m.role && m.role.toLowerCase().includes(query)) ||
        (m.degree && m.degree.toLowerCase().includes(query)) ||
        (m.location && m.location.toLowerCase().includes(query));
      return matchesCategory && matchesQuery;
    });
  }, [communityMembers, selectedCategory, searchQuery]);

  const handleCopyShare = (member: CommunityMember) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${member.name} — ${member.role} at ${member.org} (ASTU Alumni Community)`);
      toast.success(`Copied profile highlight for ${member.name}`);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-[#1A2433] flex flex-col antialiased">
      <Navbar />

      {/* ── 1. HERO SECTION (Dark Navy Band) ── */}
      <section
        className="relative overflow-hidden py-16 md:py-[104px] text-white dark-band-grid"
        style={{
          backgroundColor: '#14304D',
          backgroundImage: 'radial-gradient(rgba(169, 196, 224, 0.13) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        {/* Decorative outlined circular accents in top-right */}
        <div aria-hidden="true" className="absolute -top-16 -right-16 w-96 h-96 pointer-events-none opacity-40">
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full border border-white/20" />
          <div className="absolute -top-10 -right-10 w-96 h-96 rounded-full border border-white/15" />
        </div>

        <div className="relative z-10 mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-6">
            <button
              onClick={() => navigate('/')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Home
            </button>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span className="text-blue-200">Alumni Community</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-md bg-white/10 border border-white/20 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-blue-200">
                <Globe className="h-3.5 w-3.5 text-blue-200" /> ASTU Global Alumni Network
              </span>
              <h1 className="mt-4 font-fraunces text-3xl sm:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.015em] leading-[1.15]">
                {communityPageHero.title}
              </h1>
              <p className="mt-4 text-[17px] text-slate-200 leading-relaxed max-w-2xl">
                {communityPageHero.subtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => navigate('/register')}
                className="h-12 px-7 rounded-md bg-[#C8102E] hover:bg-[#A60D26] text-white font-semibold text-sm transition-colors shadow-sm inline-flex items-center gap-2 cursor-pointer"
              >
                <UserPlus className="h-4 w-4" /> Join ASTU Network
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById('community-directory');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="h-12 px-7 rounded-md border border-white/40 text-white hover:bg-white/10 font-semibold text-sm transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <Users className="h-4 w-4" /> Explore Directory
              </button>
            </div>
          </div>

          {/* Metrics Banner */}
          <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {dynamicHeroStats.map((stat, i) => (
              <div
                key={i}
                className="card-soft rounded-xl border border-white/15 bg-white/5 backdrop-blur-md p-5 text-center"
              >
                <p className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-white leading-tight">{stat.value}</p>
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-blue-200 mt-2">{stat.label}</p>
                <p className="text-xs text-slate-300 mt-1">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. SEARCH & ALUMNI ROSTER DIRECTORY (White Background) ── */}
      <section id="community-directory" className="py-16 md:py-[104px] bg-white">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          {/* Section Heading */}
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#C8102E]">
              DISTINGUISHED ALUMNI ROSTER
            </p>
            <h2 className="mt-2 font-fraunces text-3xl sm:text-4xl lg:text-[48px] font-bold text-[#14304D] tracking-[-0.015em] leading-tight">
              Alumni Leaders Shaping Global Progress
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-[17px] text-slate-600 leading-relaxed">
              Curated profiles of Adama Science and Technology University graduates making significant contributions in industry, research, and public leadership.
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4 mb-10">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search alumni by name, role, organization (e.g. Boeing, Ethiopian Airlines), or degree..."
                  className="w-full h-12 rounded-lg border border-slate-200 bg-slate-50/70 pl-12 pr-10 text-sm text-[#14304D] outline-none focus:border-[#14304D] focus:bg-white focus:ring-1 focus:ring-[#14304D] transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 bg-slate-200 rounded-full h-5 w-5 flex items-center justify-center cursor-pointer"
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 shrink-0">
                <Filter className="h-4 w-4 text-slate-500" />
                <span>Showing {filteredMembers.length} of {communityMembers.length} Leaders</span>
              </div>
            </div>

            {/* Category Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${isActive
                        ? 'bg-[#14304D] text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                  >
                    <Icon className="h-4 w-4" />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Directory Grid */}
          {communityMembers.length < 6 ? (
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-12 text-center max-w-lg mx-auto">
              <Users className="h-12 w-12 text-[#14304D] mx-auto mb-3 opacity-60" />
              <h3 className="text-lg font-bold text-[#14304D]">Directory Under Curation</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                The ASTU Alumni Leaders Directory is currently being verified and updated with distinguished graduates across industry, academia, and civil infrastructure.
              </p>
              <button
                onClick={() => navigate('/register')}
                className="mt-5 h-11 px-6 rounded-md bg-[#C8102E] hover:bg-[#A60D26] text-white font-semibold text-sm transition-colors cursor-pointer"
              >
                Join the Directory Roster
              </button>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-12 text-center max-w-md mx-auto">
              <Users className="h-12 w-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#14304D]">No alumni matched your search</h3>
              <p className="mt-1 text-sm text-slate-500">Try adjusting your search terms or selecting another category filter.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-4 h-10 px-5 rounded-md bg-[#14304D] text-white font-semibold text-xs hover:bg-[#1f4870] transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredMembers.map((member) => (
                <article
                  key={member.id}
                  className="card-soft relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200/80 bg-white p-5 transition-all"
                >
                  <div>
                    {/* Top Row: Badge & Share */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-[#14304D]">
                        {member.badge || `Class of ${member.gradYear}`}
                      </span>
                      <button
                        onClick={() => handleCopyShare(member)}
                        title="Share profile highlight"
                        className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Member Profile Photo & Info */}
                    <div className="flex items-start gap-3.5 mb-3">
                      <div className="relative shrink-0">
                        <img
                          src={member.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                          alt={member.name}
                          className="h-16 w-16 rounded-xl object-cover border border-slate-200 shadow-sm"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
                          }}
                        />
                        <span
                          className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#1E7B3A] text-white ring-2 ring-white"
                          title="Verified Alumni"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-bold text-[#14304D] line-clamp-1">
                          {member.name}
                        </h3>
                        <p className="text-xs sm:text-sm font-semibold text-[#C8102E] line-clamp-1 mt-0.5">
                          {member.role}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1 line-clamp-1">
                          <Building2 className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                          <span className="truncate">{member.org}</span>
                        </div>
                      </div>
                    </div>

                    {/* Degree and Location Info */}
                    <div className="rounded-lg bg-slate-50 p-3 mb-3 border border-slate-100">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#14304D]">
                        <GraduationCap className="h-3.5 w-3.5 text-[#14304D] shrink-0" />
                        <span className="truncate">{member.degree}</span>
                      </div>
                      {member.location && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                          <span className="truncate">{member.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Bio Snippet */}
                    <p className="text-xs sm:text-sm leading-relaxed text-slate-600 line-clamp-3 mb-4">
                      {member.quote ? `"${member.quote}"` : member.bio}
                    </p>
                  </div>

                  {/* Card Action */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => setActiveModalMember(member)}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-[#14304D] hover:text-[#C8102E] transition-colors cursor-pointer group/btn"
                    >
                      View Biography <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                    <span className="text-xs font-semibold text-slate-500">Class of {member.gradYear}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── 3. REGIONAL CHAPTERS & GLOBAL REACH (Light Gray Background) ── */}
      <section className="py-16 md:py-[104px] bg-[#F5F7FA] border-t border-slate-200/80">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#C8102E]">
              REGIONAL PRESENCE
            </p>
            <h2 className="mt-2 font-fraunces text-3xl sm:text-4xl lg:text-[48px] font-bold text-[#14304D] tracking-[-0.015em] leading-tight">
              ASTU Alumni Chapters Worldwide
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-[17px] text-slate-600 leading-relaxed">
              Connect with fellow alumni in your region for networking meetups, local chapter initiatives, and professional mentorship.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {regionalChapters.map((chap) => (
              <div
                key={chap.name}
                className="card-soft rounded-xl border border-slate-200/80 bg-white p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="rounded-md bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs font-semibold text-[#14304D]">
                      {chap.members}
                    </span>
                    <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-[#14304D]">
                      <MapPin className="h-4 w-4 text-[#14304D]" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-[#14304D] leading-snug">{chap.name}</h3>
                  <p className="text-sm text-slate-600 mt-1.5">
                    Regional Hub: <span className="font-semibold text-slate-800">{chap.hub}</span>
                  </p>
                  <p className="text-sm text-slate-600 mt-4 leading-relaxed border-t border-slate-100 pt-3">
                    {chap.focus}
                  </p>
                </div>
                <a
                  href={`mailto:${chap.contact}`}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#14304D] hover:text-[#C8102E] transition-colors cursor-pointer"
                >
                  <Mail className="h-4 w-4" /> Contact Chapter Lead
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. FLAGSHIP EVENT / HOMECOMING (White Background) ── */}
      <section className="py-16 md:py-[104px] bg-white border-t border-slate-200/80">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <div className="card-soft rounded-2xl border border-slate-200/80 border-t-4 border-[#C8102E] bg-white p-8 md:p-12">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-md bg-red-50 border border-red-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-[#C8102E]">
                  <Calendar className="h-3.5 w-3.5 text-[#C8102E]" /> {eventBanner.badge}
                </span>
                <h2 className="mt-3 font-fraunces text-2xl sm:text-3xl lg:text-[36px] font-bold text-[#14304D] tracking-[-0.015em] leading-tight">
                  {eventBanner.title}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-[#C8102E]" /> {eventBanner.date}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-[#14304D]" /> {eventBanner.location}
                  </span>
                </div>
                <p className="mt-4 text-[17px] text-slate-600 leading-relaxed">
                  {eventBanner.description}
                </p>
                <div className="mt-6 flex flex-wrap gap-4">
                  {eventBanner.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <CheckCircle2 className="h-4 w-4 text-[#C8102E] shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 w-full lg:w-auto">
                <button
                  onClick={() => navigate(eventBanner.primaryButtonLink)}
                  className="h-12 px-8 rounded-md bg-[#C8102E] hover:bg-[#A60D26] text-white font-semibold text-sm transition-colors shadow-sm text-center cursor-pointer inline-flex items-center justify-center"
                >
                  {eventBanner.primaryButtonText}
                </button>
                <button
                  onClick={() => navigate(eventBanner.secondaryButtonLink)}
                  className="h-12 px-8 rounded-md border border-slate-300 text-[#14304D] hover:bg-slate-50 font-semibold text-sm transition-colors text-center cursor-pointer inline-flex items-center justify-center"
                >
                  {eventBanner.secondaryButtonText}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. WAYS TO ENGAGE WITH YOUR ALMA MATER (Light Gray Background) ── */}
      <section className="py-16 md:py-[104px] bg-[#F5F7FA] border-t border-slate-200/80">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#C8102E]">
              ALUMNI ENGAGEMENT
            </p>
            <h2 className="mt-2 font-fraunces text-3xl sm:text-4xl lg:text-[48px] font-bold text-[#14304D] tracking-[-0.015em] leading-tight">
              Ways to Engage With Your Alma Mater
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-[17px] text-slate-600 leading-relaxed">
              Strengthening collaboration between ASTU graduates, current students, corporate employers, and faculty departments.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {communityPillars.map((pillar) => {
              const Icon = typeof pillar.icon === 'string' ? (iconMap[pillar.icon] || Users) : pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="card-soft rounded-xl border border-slate-200/80 bg-white p-7 flex flex-col justify-between"
                >
                  <div>
                    <div className="h-12 w-12 rounded-lg bg-[#14304D]/5 text-[#14304D] flex items-center justify-center mb-5">
                      <Icon className="h-6 w-6 text-[#14304D]" />
                    </div>
                    <h3 className="text-xl font-bold text-[#14304D]">{pillar.title}</h3>
                    <p className="text-sm text-slate-600 mt-2.5 leading-relaxed">{pillar.desc}</p>
                  </div>
                  <button
                    onClick={() => navigate(pillar.link)}
                    className="mt-6 h-12 px-6 rounded-md border border-slate-300 text-[#14304D] hover:border-[#C8102E] hover:text-[#C8102E] hover:bg-white text-sm font-semibold transition-colors inline-flex items-center justify-between cursor-pointer"
                  >
                    <span>{pillar.action}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Individual Biography Modal ── */}
      {activeModalMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setActiveModalMember(null)}
        >
          <div
            className="relative max-w-lg w-full rounded-2xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b pb-4 border-slate-100">
              <div className="flex items-center gap-3">
                <img
                  src={activeModalMember.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                  alt={activeModalMember.name}
                  className="h-16 w-16 rounded-xl object-cover border border-slate-200 shadow-sm"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
                  }}
                />
                <div>
                  <h3 className="text-lg font-bold text-[#14304D]">{activeModalMember.name}</h3>
                  <p className="text-xs sm:text-sm font-semibold text-[#C8102E]">{activeModalMember.role}</p>
                  <p className="text-xs sm:text-sm text-slate-600">{activeModalMember.org}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModalMember(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Degree & Specialization:</span>
                  <span className="font-semibold text-slate-800 text-right">{activeModalMember.degree}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Graduation Milestone:</span>
                  <span className="font-semibold text-slate-800">Class of {activeModalMember.gradYear}</span>
                </div>
                {activeModalMember.location && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Location / Base:</span>
                    <span className="font-semibold text-slate-800">{activeModalMember.location}</span>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-bold text-[#14304D] text-sm mb-1">Career & Impact Overview</h4>
                <p className="text-slate-600 leading-relaxed">{activeModalMember.bio}</p>
              </div>

              {activeModalMember.quote && (
                <div className="border-l-4 border-[#C8102E] bg-red-50/50 p-3.5 rounded-r-lg italic text-slate-700">
                  "{activeModalMember.quote}"
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={() => handleCopyShare(activeModalMember)}
                className="h-11 px-5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-sm inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Share2 className="h-4 w-4" /> Share Profile
              </button>
              <button
                onClick={() => {
                  setActiveModalMember(null);
                  navigate('/register');
                }}
                className="h-11 px-6 rounded-md bg-[#C8102E] hover:bg-[#A60D26] text-white font-semibold text-sm transition-colors cursor-pointer"
              >
                Connect on AMS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
