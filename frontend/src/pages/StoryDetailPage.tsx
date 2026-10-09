import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Quote,
  Share2,
  Sparkles,
  UserCheck,
  Mail,
  ExternalLink,
  ShieldCheck,
  BookOpen,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import storiesService, { AlumniStory } from '../features/admin/services/stories.service';

export default function StoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [story, setStory] = useState<AlumniStory | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (!id) return;

    const loadStory = () => {
      const found = storiesService.getStoryByIdOrSlug(id);
      setStory(found);
    };

    loadStory();

    const handleStoriesUpdate = () => {
      loadStory();
    };

    window.addEventListener('astu-cms-stories-changed', handleStoriesUpdate);
    return () => {
      window.removeEventListener('astu-cms-stories-changed', handleStoriesUpdate);
    };
  }, [id]);

  const allStories = storiesService.getStories();
  const relatedStories = allStories.filter((s) => s.id !== story?.id).slice(0, 4);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('Story link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } else {
      toast.success('Story link ready to share');
    }
  };

  if (!story) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-800">
        <Navbar />
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-[#003580] shadow-sm">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Success Story Not Found</h2>
          <p className="mt-2 max-w-md text-xs text-slate-500">
            The requested alumni success story may have been updated or moved in the CMS.
          </p>
          <button
            onClick={() => navigate('/info/alumni-stories')}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#003580] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:brightness-110"
          >
            <ArrowLeft className="h-4 w-4" /> View All Alumni Stories
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc] font-sans text-slate-800">
      <Navbar />

      {/* Top Header Breadcrumb Navigation */}
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link to="/" className="transition-colors hover:text-[#003580]">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <Link to="/info/alumni-stories" className="transition-colors hover:text-[#003580]">
              Alumni Success Stories
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="max-w-[200px] truncate text-slate-900 sm:max-w-md">
              {story.name}
            </span>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/info/alumni-stories')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-50"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-[#003580]" />
              All Stories
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-50"
            >
              <Share2 className="h-3.5 w-3.5 text-slate-500" />
              {copied ? 'Copied!' : 'Share'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="mx-auto max-w-[1240px] flex-1 px-4 py-8 sm:px-6 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* Main Story Narrative */}
          <article className="space-y-6">
            {/* Hero Profile Card */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
              <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                {story.image ? (
                  <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border-2 border-slate-100 shadow-md">
                    <img
                      src={story.image}
                      alt={story.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/astu-building.jpg';
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-[#003580]/10 text-2xl font-black text-[#003580] shadow-sm">
                    {story.name.slice(0, 2).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      ASTU Verified Alumnus
                    </span>
                    {story.featured && (
                      <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                        Featured Impact
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                    {story.name}
                  </h1>
                  <p className="mt-1 text-sm font-semibold text-[#003580]">
                    {story.role}
                  </p>
                  {story.company && (
                    <p className="text-xs text-slate-500">{story.company}</p>
                  )}
                </div>
              </div>

              {/* Quick Specs Bar */}
              <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5 text-xs sm:grid-cols-3">
                <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 p-3">
                  <GraduationCap className="h-5 w-5 shrink-0 text-[#003580]" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Graduation Batch
                    </p>
                    <p className="truncate font-bold text-slate-800">
                      {story.graduationYear || 'Verified Batch'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 p-3">
                  <BookOpen className="h-5 w-5 shrink-0 text-emerald-600" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Department
                    </p>
                    <p className="truncate font-bold text-slate-800">
                      {story.department || 'Applied Engineering'}
                    </p>
                  </div>
                </div>

                <div className="col-span-2 flex items-center gap-2.5 rounded-xl bg-slate-50 p-3 sm:col-span-1">
                  <Calendar className="h-5 w-5 shrink-0 text-purple-600" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Story Published
                    </p>
                    <p className="truncate font-bold text-slate-800">
                      {story.publishedAt || 'Recently Verified'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Inspiring Pull-Quote Card */}
            {story.text && (
              <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-r from-blue-50/80 via-white to-blue-50/40 p-6 sm:p-7 shadow-2xs">
                <div className="flex items-start gap-3">
                  <Quote className="h-7 w-7 shrink-0 text-[#003580] opacity-80" />
                  <div>
                    <p className="text-base font-semibold italic leading-relaxed text-slate-800 sm:text-lg">
                      “{story.text}”
                    </p>
                    <p className="mt-3 text-xs font-bold text-[#003580]">
                      — {story.name}, {story.company || 'ASTU Alumnus'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Full Narrative Article */}
            <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                <Briefcase className="h-5 w-5 text-[#003580]" />
                Career Journey & Contributions
              </h2>

              <div className="space-y-4 text-sm sm:text-base leading-relaxed text-slate-700">
                {(story.fullStory || story.text)
                  .split('\n\n')
                  .map((paragraph, index) => (
                    <p key={index} className="leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
              </div>

              {/* Key Impact Highlights */}
              <div className="mt-6 border-t border-slate-100 pt-5">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Graduate Impact Pillars
                </h3>
                <div className="grid gap-3 sm:grid-cols-3 text-xs">
                  <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 space-y-1">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <p className="font-bold text-slate-800">Applied Engineering</p>
                    <p className="text-[11px] text-slate-500">
                      Pioneering regional technological deployments and industry solutions.
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 space-y-1">
                    <Users className="h-4 w-4 text-[#003580]" />
                    <p className="font-bold text-slate-800">Student Mentorship</p>
                    <p className="text-[11px] text-slate-500">
                      Active mentor conducting code reviews and thesis guidance via AMS.
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 space-y-1">
                    <Award className="h-4 w-4 text-amber-600" />
                    <p className="font-bold text-slate-800">Global Standing</p>
                    <p className="text-[11px] text-slate-500">
                      Representing Ethiopian technological excellence on international platforms.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions Card */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <button
                onClick={() => navigate('/info/alumni-stories')}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4 text-[#003580]" />
                All Success Stories
              </button>

              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-2 rounded-lg bg-[#003580] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:brightness-110"
              >
                Connect on ASTU-AMS
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </article>

          {/* Right Sidebar */}
          <aside className="space-y-6">
            {/* More Inspiring Alumni Stories */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
              <h3 className="flex items-center gap-2 border-b border-slate-100 pb-3 text-sm font-bold text-slate-900">
                <Sparkles className="h-4 w-4 text-amber-500" />
                More Alumni Spotlights
              </h3>

              <div className="mt-4 divide-y divide-slate-100">
                {relatedStories.map((rel) => (
                  <Link
                    key={rel.id}
                    to={`/stories/${rel.id}`}
                    className="group flex items-center gap-3 py-3 transition-colors hover:bg-slate-50/80 px-2 rounded-lg"
                  >
                    {rel.image ? (
                      <img
                        src={rel.image}
                        alt={rel.name}
                        className="h-10 w-10 shrink-0 rounded-xl object-cover border border-slate-100"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/astu-building.jpg';
                        }}
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#003580]/10 text-xs font-bold text-[#003580]">
                        {rel.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-[#003580] group-hover:underline">
                        {rel.name}
                      </p>
                      <p className="truncate text-[11px] text-slate-400">
                        {rel.role}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              <button
                onClick={() => navigate('/info/alumni-stories')}
                className="mt-4 w-full rounded-xl border border-slate-200 py-2.5 text-center text-xs font-bold text-[#003580] transition-colors hover:bg-slate-50"
              >
                Explore All Stories
              </button>
            </div>

            {/* Share Your Story Callout Box */}
            <div className="rounded-2xl border border-[#002b66] bg-gradient-to-br from-[#003580] to-[#001d4a] p-6 text-white shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm text-amber-400">
                <Award className="h-5 w-5" />
              </div>
              <h4 className="mt-4 text-base font-bold text-white">Share Your Story</h4>
              <p className="mt-1.5 text-xs leading-relaxed text-blue-100">
                Are you an ASTU graduate with an achievement, startup milestone, or patent to share? Reach out to the Alumni Relations Directorate.
              </p>
              <a
                href="mailto:irccd@astu.edu.et?subject=ASTU%20Alumni%20Success%20Story%20Submission"
                className="mt-5 block w-full rounded-xl bg-emerald-600 py-2.5 text-center text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-500"
              >
                Submit Milestone via Email
              </a>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
