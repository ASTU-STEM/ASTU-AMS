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
  UserCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import ChatBot from '../components/ChatBot';
import storiesService, { AlumniStory } from '../features/admin/services/stories.service';

export default function StoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [story, setStory] = useState<AlumniStory | null>(null);

  useEffect(() => {
    if (id) {
      const found = storiesService.getStoryByIdOrSlug(id);
      setStory(found);
      window.scrollTo(0, 0);
    }
  }, [id]);

  const allStories = storiesService.getStories();
  const relatedStories = allStories.filter((s) => s.id !== story?.id).slice(0, 3);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Story link copied to clipboard!');
    }
  };

  if (!story) {
    return (
      <div className="app-shell min-h-screen bg-[var(--bg-page)] font-sans text-[var(--text-primary)] dark:text-slate-100 flex flex-col transition-colors duration-200">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="h-16 w-16 rounded-full bg-[var(--bg-page)] dark:bg-slate-800 flex items-center justify-center text-[var(--text-muted)] dark:text-slate-400 mb-4">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] dark:text-white">Success Story Not Found</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)] dark:text-slate-400 max-w-md">
            The requested alumni success story may have been updated or moved.
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#003580] px-5 py-2.5 text-xs font-bold text-white hover:brightness-110 shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell min-h-screen bg-[var(--bg-page)] font-sans text-[var(--text-primary)] dark:text-slate-100 flex flex-col transition-colors duration-200">
      <Navbar />

      {/* Header Breadcrumb */}
      <div className="bg-[#003580] text-white py-8 px-4 sm:px-6">
        <div className="mx-auto max-w-[1240px]">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-200 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 mb-2">
            <Link to="/" className="hover:underline">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span>Alumni Success Stories</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[#FFD700] font-semibold">{story.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">{story.name}</h1>
          <p className="mt-1 text-sm text-slate-200 font-medium">
            {story.role} {story.company && `at ${story.company}`}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 mx-auto max-w-[1240px] w-full px-4 sm:px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* Main Story Column */}
          <main className="space-y-8">
            {/* Story Card Header */}
            {/* Story Card Header */}
            <div className="rounded-2xl border border-[var(--border-color)] dark:border-slate-800 bg-[var(--bg-card)] dark:bg-slate-900 p-6 sm:p-8 shadow-sm transition-colors">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {story.image ? (
                  <img
                    src={story.image}
                    alt={story.name}
                    className="h-28 w-28 rounded-2xl object-cover shadow-md shrink-0 border-2 border-[var(--border-color)] dark:border-slate-700"
                  />
                ) : (
                  <div className="h-28 w-28 rounded-2xl bg-[#003580]/10 dark:bg-blue-900/30 flex items-center justify-center text-[#003580] dark:text-blue-300 font-bold text-2xl shrink-0">
                    {story.name.slice(0, 2).toUpperCase()}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      <UserCheck className="h-3.5 w-3.5" /> ASTU Verified Graduate
                    </span>
                    {story.featured && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        <Award className="h-3.5 w-3.5 text-amber-500" /> Featured Story
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl font-bold text-[var(--text-primary)] dark:text-white">{story.name}</h2>
                  <p className="text-sm font-semibold text-[#003580] dark:text-blue-400 mt-0.5">{story.role}</p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-xs font-medium text-[var(--text-muted)] dark:text-slate-400 border-t border-[var(--border-color)] dark:border-slate-800 pt-3">
                    {story.company && (
                      <span className="flex items-center gap-1.5">
                        <Building2 className="h-4 w-4 text-[var(--text-muted)]" /> {story.company}
                      </span>
                    )}
                    {story.graduationYear && (
                      <span className="flex items-center gap-1.5">
                        <GraduationCap className="h-4 w-4 text-[var(--text-muted)]" /> {story.graduationYear}
                      </span>
                    )}
                    {story.publishedAt && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-[var(--text-muted)]" /> Published {story.publishedAt}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleShare}
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-color)] dark:border-slate-700 bg-[var(--bg-page)] dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] dark:text-slate-200  dark:hover:bg-slate-700 transition-colors"
                  title="Share Story"
                >
                  <Share2 className="h-4 w-4" /> Share
                </button>
              </div>
            </div>

            {/* Impact Quote Box */}
            <div className="relative rounded-2xl bg-gradient-to-r from-[#003580]/5 to-[#003580]/10 dark:from-blue-950/40 dark:to-blue-900/20 border border-[#003580]/20 dark:border-blue-800/40 p-6 sm:p-8">
              <Quote className="absolute right-6 top-6 h-12 w-12 text-[#003580]/15 dark:text-blue-400/10" />
              <p className="text-base sm:text-lg font-semibold text-[var(--text-primary)] dark:text-slate-100 leading-relaxed relative z-10 italic">
                "{story.text}"
              </p>
              <p className="mt-3 text-xs font-bold uppercase tracking-wider text-[#003580] dark:text-blue-400">
                — {story.name}, {story.role}
              </p>
            </div>

            {/* Full Story Content */}
            <article className="rounded-2xl border border-[var(--border-color)] dark:border-slate-800 bg-[var(--bg-card)] dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-4 transition-colors">
              <h3 className="text-lg font-bold text-[var(--text-primary)] dark:text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-[#003580] dark:text-blue-400" /> Full Story & Career Journey
              </h3>

              <div className="text-sm text-[var(--text-secondary)] dark:text-slate-300 leading-relaxed whitespace-pre-line space-y-4">
                {story.fullStory || story.text}
              </div>
            </article>
          </main>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Graduate Highlights */}
            <div className="rounded-2xl border border-[var(--border-color)] dark:border-slate-800 bg-[var(--bg-card)] dark:bg-slate-900 p-6 shadow-sm transition-colors">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] dark:text-slate-400 mb-4">
                Graduate Profile
              </h4>
              <div className="space-y-3.5 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-[var(--border-color)] dark:border-slate-800">
                  <span className="text-[var(--text-muted)] dark:text-slate-400 font-medium">Institution</span>
                  <span className="font-bold text-[var(--text-primary)] dark:text-slate-100">ASTU</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[var(--border-color)] dark:border-slate-800">
                  <span className="text-[var(--text-muted)] dark:text-slate-400 font-medium">Department</span>
                  <span className="font-bold text-[var(--text-primary)] dark:text-slate-100">{story.department || 'Engineering'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[var(--border-color)] dark:border-slate-800">
                  <span className="text-[var(--text-muted)] dark:text-slate-400 font-medium">Current Status</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">Verified Alumni</span>
                </div>
              </div>
            </div>

            {/* More Alumni Success Stories */}
            <div className="rounded-2xl border border-[var(--border-color)] dark:border-slate-800 bg-[var(--bg-card)] dark:bg-slate-900 p-6 shadow-sm transition-colors">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] dark:text-slate-400 mb-4">
                More Success Stories
              </h4>
              <div className="space-y-4">
                {relatedStories.map((rel) => (
                  <Link
                    key={rel.id}
                    to={`/stories/${rel.id}`}
                    className="group block rounded-xl border border-[var(--border-color)] dark:border-slate-800 bg-[var(--bg-page)] dark:bg-slate-800/40 p-3 transition-all  dark:hover:bg-slate-850"
                  >
                    <h5 className="text-xs font-bold text-[var(--text-primary)] dark:text-slate-100 group-hover:text-[#003580] dark:group-hover:text-blue-400 transition-colors">
                      {rel.name}
                    </h5>
                    <p className="text-[11px] text-[var(--text-muted)] dark:text-slate-400 font-medium mt-0.5">{rel.role}</p>
                    <p className="text-[11px] text-[var(--text-secondary)] dark:text-slate-300 line-clamp-2 mt-1">{rel.text}</p>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <ChatBot />
    </div>
  );
}
