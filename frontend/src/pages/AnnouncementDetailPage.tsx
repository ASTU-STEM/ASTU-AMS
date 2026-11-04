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
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ChatBot from '../components/ChatBot';
import ShareModal, { ShareItem } from '../components/ShareModal';
import contentService from '../features/admin/services/content.service';
import { ContentCardItem } from '../features/admin/components/ContentCard';

export default function AnnouncementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<ContentCardItem | null>(null);
  const [related, setRelated] = useState<ContentCardItem[]>([]);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareItem, setShareItem] = useState<ShareItem | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (!id) return;

    const found = contentService.getItemByIdOrSlug(id);
    if (found) {
      setItem(found);
      const allItems = contentService.getItems();
      setRelated(
        allItems.filter(
          (i) => i.id !== found.id && i.status === 'Published'
        ).slice(0, 4)
      );
    } else {
      // Fallback object if item not found directly
      setItem({
        id: id,
        title: decodeURIComponent(id).replace(/-/g, ' '),
        type: 'announcement',
        status: 'Published',
        excerpt:
          'Official communication and institutional notice from Adama Science and Technology University administration.',
        author: 'Content Manager',
        updatedAt: 'Recently updated',
        publishedAt: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        views: 342,
        tags: ['announcement', 'astu', 'official'],
        pinned: true,
        featured: true,
        language: 'EN',
      });
      const allItems = contentService.getItems();
      setRelated(allItems.slice(0, 4));
    }
  }, [id]);

  const handleShare = () => {
    if (!item) return;
    setShareItem({
      id: item.id,
      title: item.title,
      subtitle: `${item.type || 'Official'} Notice · ASTU Directorate`,
      text: item.excerpt || item.title,
      url: `/announcements/${slugifiedId(item.title)}`,
      badge: item.type,
      type: 'announcement',
    });
    setShareOpen(true);
  };

  const slugifiedId = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  if (!item) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#003580] border-t-transparent"></div>
        <p className="mt-3 text-sm text-slate-600 font-medium">Loading announcement details...</p>
      </div>
    );
  }

  return (
    <div className="app-shell min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-200">
      <Navbar />

      {/* Header Breadcrumbs */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-colors">
        <div className="mx-auto max-w-[1240px] px-4 py-3.5 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
            <nav className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Link to="/" className="hover:text-[#003580] dark:hover:text-blue-300 transition-colors">
                Home
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              <Link to="/announcements" className="hover:text-[#003580] dark:hover:text-blue-300 transition-colors">
                Announcements
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-slate-900 dark:text-slate-100 truncate max-w-[240px] sm:max-w-xs">
                {item.title}
              </span>
            </nav>
            <button
              onClick={() => navigate('/announcements')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              All Notices
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="mx-auto max-w-[1240px] flex-1 px-4 py-8 sm:px-6 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Main Article Content */}
          <article className="space-y-6">
              {/* Notice Metadata Header Card */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm md:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-[#C8102E]/10 dark:bg-red-900/30 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#C8102E] dark:text-red-400">
                  <Bell className="h-3.5 w-3.5" />
                  {item.type.toUpperCase()}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Official ASTU Notice
                </span>
              </div>

              <h1 className="mt-4 text-2xl font-black text-[#003580] dark:text-blue-200 sm:text-3xl md:text-4xl leading-tight">
                {item.title}
              </h1>

              {/* Author & Timestamp Bar */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800 pt-4 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                    <User className="h-4 w-4 text-[#003580] dark:text-blue-400" />
                    <span>{item.author || 'ASTU Communication Office'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span>Published: {item.publishedAt || item.updatedAt}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Eye className="h-4 w-4 text-slate-400" />
                    <span>{item.views?.toLocaleString() || 120} views</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700 hover:border-blue-200 hover:text-blue-800 transition-colors"
                  title="Share notice via Telegram, LinkedIn, WhatsApp, or copy link"
                >
                  <Share2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  Share
                </button>
              </div>
            </div>

            {/* Announcement Article Details */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm md:p-8 space-y-6">
              <div className="rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 p-4 text-sm text-[#003580] dark:text-blue-300">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#003580] dark:text-blue-400" />
                  <div>
                    <p className="font-bold">Official ASTU Verified Notice</p>
                    <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                      This announcement was reviewed and published by the ASTU Directorate of Communication and Alumni Relations.
                    </p>
                  </div>
                </div>
              </div>

              <div className="prose max-w-none text-slate-700 dark:text-slate-300 leading-relaxed text-base space-y-4">
                <p className="text-lg font-medium text-slate-900 dark:text-slate-100 border-l-4 border-[#003580] dark:border-blue-400 pl-4 py-1 bg-slate-50 dark:bg-slate-800/60 rounded-r-lg">
                  {item.excerpt || item.title}
                </p>

                <p>
                  Adama Science and Technology University (ASTU) hereby releases this official notice for the information of alumni, students, partner employers, academic departments, and stakeholders.
                </p>

                <div className="my-6 rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50/70 dark:bg-slate-800/40">
                  <h3 className="text-sm font-bold text-[#003580] dark:text-blue-300 uppercase tracking-wider mb-2">Key Highlights & Instructions</h3>
                  <ul className="list-disc list-inside space-y-2 text-sm text-slate-700 dark:text-slate-300">
                    <li>Official verification status updated across all ASTU-AMS portals.</li>
                    <li>Registered alumni can access associated documents directly in their user dashboard.</li>
                    <li>For further inquiries, contact <a href="mailto:irccd@astu.edu.et" className="text-[#003580] dark:text-blue-400 font-semibold underline">irccd@astu.edu.et</a>.</li>
                  </ul>
                </div>

                <p>
                  We encourage all members of the ASTU alumni network to keep their profile information up-to-date and stay connected for continuous quality assurance and institutional development initiatives.
                </p>
              </div>

              {/* Tags Footer */}
              {item.tags && item.tags.length > 0 && (
                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-wrap items-center gap-2">
                  <Tag className="h-3.5 w-3.5 text-slate-400" />
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
              <button
                onClick={() => navigate('/announcements')}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to All Notices
              </button>

              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-2 rounded-lg bg-[#003580] px-5 py-2.5 text-xs font-bold text-white hover:brightness-110 shadow-sm transition-all"
              >
                Login to ASTU-AMS Portal
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </article>

          {/* Right Sidebar: Related Notices */}
          <aside className="space-y-6">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <h3 className="text-base font-bold text-[#003580] dark:text-blue-200 flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <Bell className="h-4 w-4 text-[#C8102E]" />
                Recent Official Notices
              </h3>

              <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
                {related.map((rel) => (
                  <Link
                    key={rel.id}
                    to={`/announcements/${slugifiedId(rel.title)}`}
                    className="group block py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 px-2 rounded-lg transition-colors"
                  >
                    <span className="block text-xs font-bold text-[#003580] dark:text-blue-300 group-hover:text-[#C8102E] dark:group-hover:text-blue-400 transition-colors">
                      {rel.title}
                    </span>
                    <span className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{rel.type}</span>
                      <span>{rel.publishedAt || rel.updatedAt}</span>
                    </span>
                  </Link>
                ))}
              </div>

              <button
                onClick={() => navigate('/announcements')}
                className="mt-4 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 text-center text-xs font-bold text-[#003580] dark:text-blue-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                View All {contentService.getItems().length} Notices
              </button>
            </div>

            {/* Support Widget */}
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-[#003580] to-[#002255] p-6 text-white shadow-sm">
              <FileText className="h-7 w-7 text-[#00A859]" />
              <h4 className="mt-3 text-lg font-bold">Have Questions?</h4>
              <p className="mt-1 text-xs text-slate-200 leading-relaxed">
                Contact the ASTU Alumni & Industry Liaison Office for official verification and portal assistance.
              </p>
              <button
                onClick={() => navigate('/support')}
                className="mt-4 w-full rounded-lg bg-[#00A859] py-2.5 text-xs font-bold text-white hover:brightness-110 transition-all"
              >
                Contact Support Office
              </button>
            </div>
          </aside>
        </div>
      </main>

      <ShareModal isOpen={shareOpen} onClose={() => setShareOpen(false)} item={shareItem} />
      <Footer />
      <ChatBot />
    </div>
  );
}
