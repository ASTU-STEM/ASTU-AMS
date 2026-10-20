import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  Calendar,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Globe,
  Share2,
  ShieldCheck,
  Tag,
  User,
  CheckCircle2,
  Bookmark,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import contentService from '../features/admin/services/content.service';
import { ContentCardItem } from '../features/admin/components/ContentCard';

export default function AnnouncementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<ContentCardItem | null>(null);
  const [related, setRelated] = useState<ContentCardItem[]>([]);
  const [copied, setCopied] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (!id) return;

    const loadItem = () => {
      const found = contentService.getItemByIdOrSlug(id);
      if (found) {
        setNotFound(false);
        setItem(found);
        const allItems = contentService.getItems();
        setRelated(
          allItems
            .filter((i) => i.id !== found.id && i.status === 'Published')
            .slice(0, 5)
        );
      } else {
        // Do not fabricate a notice for an unknown slug — that made any deep
        // link render a fake article with invented dates and view counts.
        setItem(null);
        setRelated([]);
        setNotFound(true);
      }
    };

    loadItem();

    const handleCmsUpdate = () => {
      loadItem();
    };

    window.addEventListener('astu-cms-content-changed', handleCmsUpdate);
    return () => {
      window.removeEventListener('astu-cms-content-changed', handleCmsUpdate);
    };
  }, [id]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('Notice link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } else {
      toast.success('Notice ready to share');
    }
  };

  if (notFound) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f8fafc] font-sans text-slate-800">
        <Navbar />
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-[#003580]">
            <FileText className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Notice not found</h1>
          <p className="mt-2 max-w-md text-sm text-slate-600">
            This announcement may have been unpublished or removed. Browse the notice board for the latest updates.
          </p>
          <button
            onClick={() => navigate('/announcements')}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#003580] px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110"
          >
            <ArrowLeft className="h-4 w-4" /> Back to announcements
          </button>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#003580] border-t-transparent"></div>
        <p className="mt-3 text-xs font-semibold text-slate-600">Loading announcement details...</p>
      </div>
    );
  }

  const slugifiedId = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  // Estimate reading time
  const wordCount = ((item.content || '') + ' ' + (item.excerpt || '')).split(/\s+/).length;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 180));

  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc] font-sans text-slate-800">
      <Navbar />

      {/* Header Breadcrumbs Bar */}
      <div className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link to="/" className="transition-colors hover:text-[#003580]">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <Link to="/announcements" className="transition-colors hover:text-[#003580]">
              Announcements
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="max-w-[200px] truncate text-slate-900 sm:max-w-md">
              {item.title}
            </span>
          </nav>

          <button
            onClick={() => navigate('/announcements')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-50"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-[#003580]" />
            All Notices
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <main className="mx-auto max-w-[1240px] flex-1 px-4 py-8 sm:px-6 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* Main Article Column */}
          <article className="space-y-6">
            {/* Notice Header Hero Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-rose-700 border border-rose-200/60">
                  <Bell className="h-3 w-3" />
                  {(item.category || item.type).toUpperCase()}
                </span>
                {item.priorityBadge && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 border border-amber-200/60">
                    ⚡ {item.priorityBadge}
                  </span>
                )}
                {item.targetAudience && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700 border border-indigo-200/60">
                    👥 {item.targetAudience}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200/60">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  Official ASTU Notice
                </span>
              </div>

              <h1 className="mt-4 text-2xl font-black tracking-tight text-[#002b66] sm:text-3xl lg:text-4xl leading-[1.2]">
                {item.title}
              </h1>

              {/* Author & Timestamp Bar */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                    <User className="h-4 w-4 text-[#003580]" />
                    <span>{item.author || 'Content Manager'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span>Published: {item.publishedAt || item.updatedAt}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Eye className="h-4 w-4 text-slate-400" />
                    <span>{(item.views || 1240).toLocaleString()} views</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{readTimeMinutes} min read</span>
                  </div>
                </div>

                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50"
                  title="Share announcement link"
                >
                  <Share2 className="h-3.5 w-3.5 text-slate-500" />
                  {copied ? 'Copied!' : 'Share'}
                </button>
              </div>
            </div>

            {/* Optional High-Resolution Featured Image */}
            {item.image && (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-sm">
                <img
                  src={item.image}
                  alt={item.title}
                  className="max-h-[460px] w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/astu-building.jpg';
                  }}
                />
              </div>
            )}

            {/* Notice Body & Typography Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8 space-y-6">
              {/* Verified Authority Banner */}
              <div className="rounded-xl border border-blue-200/70 bg-blue-50/60 p-4 text-sm text-[#003580]">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#003580]" />
                  <div>
                    <p className="font-bold text-[#003580]">Official ASTU Verified Notice</p>
                    <p className="mt-0.5 text-xs text-slate-600">
                      This notice is published and verified by the {item.author || 'Content Manager'}.
                    </p>
                  </div>
                </div>
              </div>

              {/* Lead Summary Callout (Matching Screenshot 1) */}
              {item.excerpt && (
                <div className="rounded-r-xl border-l-4 border-[#003580] bg-slate-50/80 p-4 pl-5">
                  <p className="text-base font-semibold leading-relaxed text-slate-900 sm:text-lg">
                    {item.excerpt}
                  </p>
                </div>
              )}

              {/* Body Content with Professional Reading Typography */}
              <div className="space-y-4 text-sm sm:text-base leading-relaxed text-slate-700">
                {item.content ? (
                  item.content.split('\n\n').map((paragraph, idx) => {
                    if (paragraph.startsWith('•') || paragraph.includes('\n•')) {
                      const bullets = paragraph.split('\n').filter((b) => b.trim());
                      return (
                        <ul key={idx} className="space-y-2 py-2">
                          {bullets.map((b, bIdx) => (
                            <li key={bIdx} className="flex items-start gap-2.5 text-slate-700">
                              <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
                              <span>{b.replace(/^[•\-*]\s*/, '')}</span>
                            </li>
                          ))}
                        </ul>
                      );
                    }
                    return (
                      <p key={idx} className="leading-relaxed">
                        {paragraph}
                      </p>
                    );
                  })
                ) : (
                  <p>
                    Adama Science and Technology University (ASTU) hereby releases this official notice for the information of alumni, students, partner employers, academic departments, and stakeholders.
                  </p>
                )}
              </div>

              {/* Tags Section */}
              {item.tags && item.tags.length > 0 && (
                <div className="border-t border-slate-100 pt-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Tag className="h-3.5 w-3.5 text-slate-400" />
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions Card */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <button
                onClick={() => navigate('/announcements')}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-all"
              >
                <ArrowLeft className="h-4 w-4 text-[#003580]" />
                Back to All Notices
              </button>

              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-2 rounded-lg bg-[#003580] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:brightness-110 transition-all"
              >
                Login to ASTU-AMS Portal
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </article>

          {/* Right Sidebar */}
          <aside className="space-y-6">
            {/* Recent Official Notices (Matching Screenshot 1) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
              <h3 className="flex items-center gap-2 border-b border-slate-100 pb-3 text-sm font-bold text-slate-900">
                <Bell className="h-4 w-4 text-rose-600" />
                Recent Official Notices
              </h3>

              <div className="mt-4 divide-y divide-slate-100">
                {related.map((rel) => (
                  <Link
                    key={rel.id}
                    to={`/announcements/${slugifiedId(rel.title)}`}
                    className="group block py-3.5 transition-colors hover:bg-slate-50/80 px-2 rounded-lg"
                  >
                    <span className="block text-xs font-bold text-[#003580] group-hover:text-rose-700 transition-colors line-clamp-2">
                      {rel.title}
                    </span>
                    <span className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-medium text-slate-500">{rel.type}</span>
                      <span>{rel.publishedAt || rel.updatedAt}</span>
                    </span>
                  </Link>
                ))}
              </div>

              <button
                onClick={() => navigate('/announcements')}
                className="mt-4 w-full rounded-xl border border-slate-200 py-2.5 text-center text-xs font-bold text-[#003580] hover:bg-slate-50 transition-colors"
              >
                View All {contentService.getItems().length} Notices
              </button>
            </div>

            {/* Support Office Card (Matching Screenshot 1) */}
            <div className="rounded-2xl border border-[#002b66] bg-gradient-to-br from-[#003580] to-[#001d4a] p-6 text-white shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm text-emerald-400">
                <FileText className="h-5 w-5" />
              </div>
              <h4 className="mt-4 text-base font-bold text-white">Have Questions?</h4>
              <p className="mt-1.5 text-xs leading-relaxed text-blue-100">
                Contact the ASTU Alumni & Industry Liaison Office for official verification and portal assistance.
              </p>
              <button
                onClick={() => navigate('/support')}
                className="mt-5 w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-500"
              >
                Contact Support Office
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
