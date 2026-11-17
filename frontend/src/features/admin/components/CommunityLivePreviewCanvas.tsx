import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  Users,
  Search,
  Building2,
  GraduationCap,
  Briefcase,
  Award,
  ArrowRight,
  Share2,
  Calendar,
  Sparkles,
  ChevronRight,
  Mail,
  UserPlus,
  BookOpen,
  Filter,
  CheckCircle2,
  MapPin,
  Shield,
  Edit3,
} from 'lucide-react';
import { CommunityMember } from '../services/communityMembers.service';

const CATEGORIES = [
  { id: 'all', label: 'All Community Leaders', icon: Globe },
  { id: 'executive', label: 'Global Industry', icon: Building2 },
  { id: 'policy', label: 'Public Policy', icon: Briefcase },
  { id: 'academia', label: 'Academia', icon: GraduationCap },
  { id: 'engineering', label: 'Infrastructure', icon: Award },
];

const pillarIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Users,
  BookOpen,
  Sparkles,
  Shield,
  Award,
  Briefcase,
  GraduationCap,
  Calendar,
};

interface CommunityLivePreviewCanvasProps {
  communityPageHero: {
    title: string;
    subtitle: string;
    stats: Array<{ label: string; value: string; sub: string }>;
  };
  regionalChapters: Array<{
    name: string;
    hub: string;
    members: string;
    focus: string;
    contact: string;
  }>;
  eventBanner: {
    badge: string;
    title: string;
    description: string;
    features: string[];
    primaryButtonText: string;
    primaryButtonLink: string;
    secondaryButtonText: string;
    secondaryButtonLink: string;
  };
  communityPillars: Array<{
    icon: string;
    title: string;
    desc: string;
    action: string;
    link: string;
  }>;
  membersList: CommunityMember[];
  deviceView?: 'desktop' | 'tablet' | 'mobile';
  activeTab?: string;
  detailPage?: {
    title: string;
    subtitle: string;
    sections: Array<{ heading: string; body: string }>;
  };
}

export default function CommunityLivePreviewCanvas({
  communityPageHero,
  regionalChapters,
  eventBanner,
  communityPillars,
  membersList,
  deviceView = 'desktop',
  activeTab,
  detailPage,
}: CommunityLivePreviewCanvasProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to active section when admin clicks sidebar tabs
  useEffect(() => {
    if (!activeTab || !containerRef.current) return;
    const targetEl = containerRef.current.querySelector(`#preview-section-${activeTab}`);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeTab]);

  const filteredMembers = membersList.filter((m) => {
    if (m.active === false) return false;
    const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;
    const query = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !query ||
      m.name.toLowerCase().includes(query) ||
      m.org.toLowerCase().includes(query) ||
      m.role.toLowerCase().includes(query) ||
      (m.degree && m.degree.toLowerCase().includes(query));
    return matchesCategory && matchesQuery;
  });

  const containerWidthClass =
    deviceView === 'mobile'
      ? 'max-w-[390px]'
      : deviceView === 'tablet'
      ? 'max-w-[768px]'
      : 'w-full max-w-[1280px]';

  function SectionIndicator({ id, title }: { id: string; title: string }) {
    if (activeTab !== id) return null;
    return (
      <div className="absolute top-2 right-2 z-30 flex items-center gap-1.5 rounded-full bg-amber-400 text-slate-950 px-3 py-1 text-[10px] font-black shadow-lg animate-pulse pointer-events-none border border-amber-500">
        <Edit3 className="h-3 w-3" />
        <span>Currently Editing: {title}</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`mx-auto transition-all duration-300 shadow-2xl rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 font-sans ${containerWidthClass}`}
    >
      {/* ── TOP PREVIEW HEADER BAR ── */}
      <div className="bg-slate-900 text-slate-300 px-4 py-2.5 flex items-center justify-between text-xs border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
          </div>
          <span className="font-mono text-[11px] text-slate-400 ml-2">https://astu.edu.et/community</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-700/60">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>Real-time Live Sync</span>
        </div>
      </div>

      {/* ── SIMULATED PUBLIC NAVBAR ── */}
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/images/astu-seal-logo.png" alt="ASTU Logo" className="h-7 w-7 object-contain" />
          <div>
            <div className="font-black text-xs text-[#003366] dark:text-sky-300">ASTU ALUMNI COMMUNITY</div>
            <div className="text-[9px] text-slate-400">Adama Science and Technology University</div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <span>Home</span>
          <span className="text-[#003366] font-bold dark:text-sky-400 underline decoration-2">Community</span>
          <span>Directory</span>
          <span>Events</span>
          <button className="px-3 py-1 rounded-xl bg-[#003366] text-white text-[11px] font-bold shadow-xs">
            Join Network
          </button>
        </div>
      </nav>

      {/* ── 1. HERO SECTION ── */}
      <section id="preview-section-community-page" className="relative overflow-hidden bg-gradient-to-br from-astu-navy via-[#003366] to-[#001f3f] text-white p-6 md:p-10">
        <SectionIndicator id="community-page" title="Hero & Key Stats" />

        {/* Mesh Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-amber-500/20 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-4">
            <span>Home</span>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span className="text-emerald-400 font-bold">Alumni Community</span>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-300 backdrop-blur-md">
            <Globe className="h-3.5 w-3.5 text-emerald-400" /> ASTU Global Alumni Network
          </span>

          <h1 className="mt-3 text-2xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
            {communityPageHero.title || 'Your Networks Around the World'}
          </h1>
          <p className="mt-3 text-xs md:text-sm text-slate-200 leading-relaxed max-w-2xl">
            {communityPageHero.subtitle || 'With establishment spanning nearly three decades, ASTU boasts alumni excelling globally.'}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-md flex items-center gap-1.5">
              <UserPlus className="h-4 w-4" /> Explore Community Roster
            </button>
            <button className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-emerald-400" /> View Regional Hubs
            </button>
          </div>

          {/* Key Stats Bar */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-white/15">
            {communityPageHero.stats?.map((stat, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15">
                <div className="text-lg md:text-xl font-black text-amber-400">{stat.value}</div>
                <div className="text-xs font-bold text-white">{stat.label}</div>
                <div className="text-[10px] text-slate-300">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. FEATURED ALUMNI LEADERS ROSTER ── */}
      <section id="preview-section-members" className="relative p-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <SectionIndicator id="members" title="Alumni Roster" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-base md:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-[#003366] dark:text-sky-400" />
              <span>Featured Alumni Leaders</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Pioneers representing ASTU in global enterprise & governance</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search leaders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-56 pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-5">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  active
                    ? 'bg-[#003366] text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Roster Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredMembers.length === 0 ? (
            <div className="col-span-full py-10 text-center text-slate-400 text-xs">
              No community members found.
            </div>
          ) : (
            filteredMembers.map((member) => (
              <div
                key={member.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 hover:border-slate-300 transition-all flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-start gap-3">
                    <img
                      src={member.image || '/images/default-avatar.png'}
                      alt={member.name}
                      className="h-12 w-12 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{member.name}</h3>
                      <p className="text-[11px] font-semibold text-[#003366] dark:text-sky-400 line-clamp-1">{member.role}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">{member.org}</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-3 line-clamp-2 italic bg-white dark:bg-slate-900/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                    "{member.quote || member.bio}"
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                  <span>{member.degree} ({member.gradYear})</span>
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {member.location}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ── 3. REGIONAL CHAPTERS ── */}
      <section id="preview-section-regional-chapters" className="relative p-6 bg-gradient-to-br from-astu-navy via-[#003366] to-[#001f3f] text-white border-b border-white/10 overflow-hidden">
        <SectionIndicator id="regional-chapters" title="Regional Chapters" />

        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Globe className="h-5 w-5 text-astu-green" />
              <span>Regional Alumni Chapters</span>
            </h2>
            <p className="text-xs text-slate-200">Global hubs bridging graduates across continents</p>
          </div>
          <span className="text-xs font-bold text-astu-green bg-white/10 px-3 py-1 rounded-full border border-white/20">
            {regionalChapters.length} Active Hubs
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {regionalChapters.map((ch, idx) => (
            <div key={idx} className="p-4 rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md shadow-xs space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="text-xs font-bold text-white">{ch.name}</h3>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-astu-green/20 text-emerald-300 border border-astu-green/30">
                  {ch.members}
                </span>
              </div>
              <div className="text-[11px] text-slate-300 flex items-center gap-1 font-medium">
                <MapPin className="h-3.5 w-3.5 text-astu-green shrink-0" />
                <span>Hub: <strong className="text-white">{ch.hub}</strong></span>
              </div>
              <p className="text-[11px] text-slate-200 line-clamp-2">{ch.focus}</p>
              <div className="text-[10px] text-slate-300 font-mono pt-2 border-t border-white/10">
                Contact: {ch.contact}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. FLAGSHIP HOMECOMING EVENT BANNER ── */}
      <section id="preview-section-event-banner" className="relative p-6 md:p-8 bg-gradient-to-r from-astu-navy via-[#003366] to-[#004080] text-white overflow-hidden">
        <SectionIndicator id="event-banner" title="Event Banner" />

        <div className="relative z-10">
          <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-extrabold uppercase tracking-wider mb-2 border border-amber-500/40">
            {eventBanner.badge || 'Flagship Event'}
          </span>
          <h2 className="text-xl md:text-2xl font-black text-white">{eventBanner.title}</h2>
          <p className="text-xs md:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">{eventBanner.description}</p>

          <div className="flex flex-wrap gap-2 mt-4">
            {eventBanner.features?.map((feat, idx) => (
              <span key={idx} className="text-[11px] font-semibold bg-white/10 px-3 py-1 rounded-xl flex items-center gap-1.5 border border-white/10">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> {feat}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3 mt-5">
            <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-md">
              {eventBanner.primaryButtonText || 'Register Now'}
            </button>
            <button className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20">
              {eventBanner.secondaryButtonText || 'View Schedule'}
            </button>
          </div>
        </div>
      </section>

      {/* ── 5. COMMUNITY PILLARS ── */}
      <section id="preview-section-pillars" className="relative p-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <SectionIndicator id="pillars" title="Community Pillars" />

        <h2 className="text-base font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-[#003366] dark:text-sky-400" />
          <span>Community Pillars</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {communityPillars.map((p, idx) => {
            const IconComp = pillarIcons[p.icon] || Sparkles;
            return (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950 text-[#003366] dark:text-sky-300 w-fit mb-3">
                    <IconComp className="h-5 w-5" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">{p.title}</h3>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1.5 line-clamp-3 leading-relaxed">{p.desc}</p>
                </div>
                <div className="mt-4 pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] font-bold text-[#003366] dark:text-sky-400 flex items-center gap-1">
                  <span>{p.action}</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 6. DETAIL PAGE / GOVERNANCE SECTIONS ── */}
      {detailPage && (
        <section id="preview-section-detail-page" className="relative p-6 bg-slate-50 dark:bg-slate-950">
          <SectionIndicator id="detail-page" title="Info & Governance" />

          <h2 className="text-base font-black text-slate-900 dark:text-white mb-2">{detailPage.title || 'Community Information & Governance'}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{detailPage.subtitle}</p>

          <div className="space-y-3">
            {detailPage.sections?.map((sec, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <h3 className="text-xs font-bold text-[#003366] dark:text-sky-300">{sec.heading}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{sec.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Simulated Footer */}
      <footer className="bg-slate-900 text-slate-400 p-6 text-[11px] border-t border-slate-800 text-center">
        <p>© 2026 Adama Science and Technology University (ASTU). All rights reserved.</p>
      </footer>
    </div>
  );
}
