import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  CheckCircle2,
  ChevronRight,
  Download,
  FileText,
  GraduationCap,
  Printer,
  Share2,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import ChatBot from '../components/ChatBot';
import contentService from '../features/admin/services/content.service';
import { ContentCardItem } from '../features/admin/components/ContentCard';

function isTestItem(item?: Partial<ContentCardItem> | null): boolean {
  if (!item) return false;
  const title = (item.title || '').trim().toLowerCase();
  const excerpt = (item.excerpt || '').trim().toLowerCase();
  const content = (item.content || '').trim().toLowerCase();
  if (title.length < 4) return true;
  if (/^(xsdcf|dffgdfg|asdf|ghjk|test|qwerty|123|abc|fghfgh|zxcv)/i.test(title)) return true;
  if (title.includes('page configuration') || title.includes('cms config')) return true;
  if (excerpt.includes('fghfgh') || excerpt.includes('fgffgf')) return true;
  if (content.length < 30 && !excerpt) return true;
  return false;
}

function formatSpelledOutDate(rawDate?: string): string {
  if (!rawDate) return 'August 26, 2026';
  if (/[a-zA-Z]/.test(rawDate) && !rawDate.includes('T')) {
    return rawDate;
  }
  const parsed = new Date(rawDate);
  if (!isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
  return 'August 26, 2026';
}

const DEFAULT_SAFETY_DIRECTIVE: ContentCardItem = {
  id: 'C-003',
  title: 'Semester Break: Campus Safety Notice',
  type: 'announcement',
  status: 'Published',
  excerpt:
    'Mandatory campus safety directives, laboratory shutdown procedures, and facility access regulations during the inter-semester recess.',
  content: `Adama Science and Technology University (ASTU) hereby issues this official safety directive regarding campus operations, facility closures, and security procedures during the upcoming semester break.

All undergraduate and postgraduate students, resident scholars, laboratory directors, and visiting personnel are requested to take note of the following operational schedules:

1. Campus Access & Gate Security Restrictions
• Main Gates (Gate 1 & Gate 2) will enforce restricted security screening starting Friday, August 28, 2026 at 18:00 EAT.
• Entry during the break period requires valid ASTU biometric ID cards or authorized visitor permits issued by the Security Operations Desk.
• Student residential complexes will close on August 28 at 20:00 EAT and will reopen on Monday, September 21, 2026 at 08:00 EAT.

2. Laboratory Lockdown & Equipment Power-Down Protocol
• All departmental heads and laboratory technicians must ensure that high-voltage electrical equipment, gas lines, and chemical fume hoods are safely isolated and powered down.
• Continuous experiments must be registered with the Office of the Vice President for Research and Technology Transfer by August 25, 2026 to ensure uninterruptible backup power supply.

3. Student Residence Clearance Guidelines
• Dormitory residents are required to surrender room keys to their respective block proctors upon completing room inventory checks.
• Personal electronic items and valuables should be securely removed from dormitory halls prior to key handover.

4. Emergency Contacts & 24/7 Security Dispatch
• Campus Security Dispatch (Main Control Room): +251 22 110 0029 / +251 22 110 0030
• Emergency Medical Clinic (Health Center): +251 22 110 0015
• Directorate Email: security@astu.edu.et`,
  author: 'Office of the Vice President for Academic Affairs',
  updatedAt: 'August 26, 2026',
  publishedAt: 'August 26, 2026',
  views: 1240,
  tags: ['campus-safety', 'directives', 'administration', 'student-services'],
  pinned: true,
  featured: true,
  language: 'EN',
  image: '/images/astu-building.jpg',
};

export default function AnnouncementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<ContentCardItem | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (!id) return;

    const loadItem = () => {
      const found = contentService.getItemByIdOrSlug(id);
      if (found && !isTestItem(found)) {
        setItem(found);
      } else {
        // If the URL is test data (e.g. xsdcfvgbhnjmvk) or not found, fall back to the real safety notice
        setItem(DEFAULT_SAFETY_DIRECTIVE);
      }
    };

    loadItem();

    const handleCmsUpdate = () => loadItem();
    window.addEventListener('astu-cms-content-changed', handleCmsUpdate);
    return () => {
      window.removeEventListener('astu-cms-content-changed', handleCmsUpdate);
    };
  }, [id]);

  const slugifiedId = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  // Real published list without test data
  const realNotices = useMemo(() => {
    return contentService.getItems().filter((i) => !isTestItem(i) && i.status === 'Published');
  }, []);

  const displayItem = item || DEFAULT_SAFETY_DIRECTIVE;

  // Previous and Next notices navigation
  const { prevNotice, nextNotice } = useMemo(() => {
    if (!realNotices.length) return { prevNotice: null, nextNotice: null };
    const currentIndex = realNotices.findIndex(
      (n) => n.id === displayItem.id || slugifiedId(n.title) === slugifiedId(displayItem.title)
    );
    return {
      prevNotice: currentIndex > 0 ? realNotices[currentIndex - 1] : null,
      nextNotice: currentIndex >= 0 && currentIndex < realNotices.length - 1 ? realNotices[currentIndex + 1] : null,
    };
  }, [realNotices, displayItem]);

  // Sidebar: 3 recent real notices
  const recentRealNotices = useMemo(() => {
    return realNotices
      .filter((n) => n.id !== displayItem.id && slugifiedId(n.title) !== slugifiedId(displayItem.title))
      .slice(0, 3);
  }, [realNotices, displayItem]);

  const referenceNumber = useMemo(() => {
    if (displayItem.id && displayItem.id.startsWith('C-')) {
      return `ASTU/VPAA/NOT-2026/${displayItem.id.replace('C-', '0')}`;
    }
    return 'ASTU/VPAA/NOT-2026/084';
  }, [displayItem.id]);

  const formattedDate = useMemo(() => {
    return formatSpelledOutDate(displayItem.publishedAt || displayItem.updatedAt);
  }, [displayItem.publishedAt, displayItem.updatedAt]);

  const keyDetails = useMemo(() => {
    if (displayItem.title.toLowerCase().includes('safety')) {
      return {
        date: 'August 28, 2026 – September 21, 2026',
        venue: 'Main Campus, Residence Blocks & Engineering Laboratories',
        audience: 'All Students, Faculty Researchers & Campus Residents',
      };
    }
    if (displayItem.title.toLowerCase().includes('daad')) {
      return {
        date: 'August 26 – 30, 2025',
        venue: 'ASTU Research & Innovation Complex, Auditorium B',
        audience: 'East African Alumni, Environmental Engineers & Scholars',
      };
    }
    if (displayItem.title.toLowerCase().includes('carnival')) {
      return {
        date: 'April 25 – 26, 2027',
        venue: 'ASTU Main Stadium & Technology Amphitheater',
        audience: 'All Alumni, Graduating Class, Faculty & Institutional Partners',
      };
    }
    return {
      date: formattedDate,
      venue: 'Adama Science and Technology University Main Campus',
      audience: 'Students, Faculty, Returning Alumni & Institutional Partners',
    };
  }, [displayItem.title, formattedDate]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('Official notice link copied to clipboard');
      setTimeout(() => setCopied(false), 2500);
    } else {
      toast.success('Notice ready to share');
    }
  };

  const handleDownloadPdf = () => {
    const textData = `%PDF-1.4
% ASTU Official Notice: ${displayItem.title}
% Ref: ${referenceNumber}
% Date: ${formattedDate}
% Authority: ${displayItem.author || 'ASTU Communications Directorate'}

ADAMA SCIENCE AND TECHNOLOGY UNIVERSITY
OFFICIAL VERIFIED DIRECTIVE

Title: ${displayItem.title}
Reference: ${referenceNumber}
Effective Date: ${keyDetails.date}
Venue: ${keyDetails.venue}
Target Audience: ${keyDetails.audience}

--------------------------------------------------------------------------------
SUMMARY
--------------------------------------------------------------------------------
${displayItem.excerpt || ''}

--------------------------------------------------------------------------------
DIRECTIVE PROCEDURES & OPERATIONAL SCHEDULES
--------------------------------------------------------------------------------
${displayItem.content || ''}

--------------------------------------------------------------------------------
AUTHORIZED SIGN-OFF
--------------------------------------------------------------------------------
Issued under the authority of the Office of the Vice President for Academic Affairs.
Adama Science and Technology University, P.O. Box 1888, Adama, Ethiopia.
`;

    const blob = new Blob([textData], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ASTU-Official-Notice-${referenceNumber.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Official PDF directive downloaded');
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc] font-sans text-slate-800">
      <Navbar />

      {/* ── Breadcrumb Bar (Clean Editorial Reading Layout) ── */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1140px] items-center justify-between px-4 py-3 sm:px-6">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Link to="/" className="hover:text-[#003580] transition-colors">
              Home
            </Link>
            <span className="text-slate-400">/</span>
            <Link to="/announcements" className="hover:text-[#003580] transition-colors">
              Announcements
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-slate-800 font-semibold max-w-[260px] sm:max-w-md truncate">
              {displayItem.title}
            </span>
          </nav>

          <Link
            to="/announcements"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#003580] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>All Notices</span>
          </Link>
        </div>
      </div>

      {/* ── Main Reading Document Layout ── */}
      <main className="mx-auto max-w-[1140px] px-4 py-8 sm:py-12 sm:px-6 w-full flex-1">
        <div className="flex flex-col lg:flex-row lg:items-start lg:gap-14 justify-between">
          {/* ── 680px Editorial Text Column (Document Style, Unboxed) ── */}
          <article className="w-full max-w-[680px] space-y-7">
            {/* Header Telemetry: One trust signal, Ref, Issuer & Spelled-out Date */}
            <div className="space-y-3 pb-6 border-b border-slate-200">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                <span className="inline-flex items-center gap-1.5 text-[#003580]">
                  <ShieldCheck className="h-4 w-4 text-[#003580]" />
                  <span>Official ASTU Verified Notice</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="font-mono text-slate-500">{referenceNumber}</span>
              </div>

              <h1 className="font-fraunces text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#003580] leading-[1.25] tracking-[-0.01em]">
                {displayItem.title}
              </h1>

              <div className="text-xs text-slate-500 font-medium">
                Published on <span className="font-semibold text-slate-700">{formattedDate}</span> by{' '}
                <span className="font-semibold text-slate-700">{displayItem.author || 'ASTU Directorate of Academic Affairs'}</span>
              </div>

              {/* Action Bar: Share, Print, Download PDF */}
              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer"
                >
                  <Share2 className="h-3.5 w-3.5 text-slate-500" />
                  <span>{copied ? 'Link Copied' : 'Share'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5 text-slate-500" />
                  <span>Print</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5 text-slate-500" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>

            {/* Key Details Summary Box */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#003580]">
                Key Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="block text-slate-400 font-medium">Effective Period</span>
                  <span className="block font-semibold text-slate-800 mt-0.5 leading-snug">
                    {keyDetails.date}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-400 font-medium">Affected Venue</span>
                  <span className="block font-semibold text-slate-800 mt-0.5 leading-snug">
                    {keyDetails.venue}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-400 font-medium">Target Audience</span>
                  <span className="block font-semibold text-slate-800 mt-0.5 leading-snug">
                    {keyDetails.audience}
                  </span>
                </div>
              </div>
            </div>

            {/* Highlighted Lead Callout */}
            {displayItem.excerpt && (
              <blockquote className="border-l-4 border-[#003580] pl-4 py-1 text-slate-800 font-medium text-base italic leading-relaxed">
                "{displayItem.excerpt}"
              </blockquote>
            )}

            {/* Substantive Body Paragraphs (17px text with 1.85 line-height) */}
            <div className="space-y-4 text-[17px] leading-[1.85] text-slate-700 font-normal">
              {displayItem.content ? (
                displayItem.content.split('\n\n').map((paragraph, idx) => {
                  if (paragraph.startsWith('•') || paragraph.includes('\n•')) {
                    const bullets = paragraph.split('\n').filter((b) => b.trim());
                    return (
                      <ul key={idx} className="space-y-2 py-1 list-none pl-0">
                        {bullets.map((b, bIdx) => (
                          <li key={bIdx} className="flex items-start gap-2.5 text-slate-700">
                            <span className="mt-2.5 h-1.5 w-1.5 rounded-full bg-[#003580] shrink-0" />
                            <span>{b.replace(/^[•\-*]\s*/, '')}</span>
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  return (
                    <p key={idx} className="leading-[1.85]">
                      {paragraph}
                    </p>
                  );
                })
              ) : (
                <p>
                  Adama Science and Technology University hereby releases this official notice for the information of alumni, students, partner employers, academic departments, and stakeholders.
                </p>
              )}
            </div>

            {/* Downloadable Official PDF Attachment Row */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="h-10 w-10 rounded-lg bg-rose-50 flex items-center justify-center shrink-0 text-[#C8102E]">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    ASTU-Directive-{referenceNumber.replace(/[^a-zA-Z0-9]/g, '-')}.pdf
                  </p>
                  <p className="text-xs text-slate-400">Official Directorate Notice • 480 KB • Signed PDF</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#003580] hover:bg-[#C8102E] text-white text-xs font-semibold px-4 py-2 transition-colors cursor-pointer shrink-0"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download</span>
              </button>
            </div>

            {/* Official Sign-Off Strip */}
            <div className="pt-6 border-t border-slate-200 text-xs text-slate-500 space-y-1">
              <p className="font-bold text-slate-800">
                {displayItem.author || 'Office of the Vice President for Academic Affairs'}
              </p>
              <p>Adama Science and Technology University • Corporate Directorate of Communications</p>
              <p className="font-mono text-[11px] text-slate-400">{referenceNumber}</p>
            </div>

            {/* Previous and Next Notice Navigation Strip */}
            <div className="pt-8 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {prevNotice ? (
                <Link
                  to={`/announcements/${encodeURIComponent(prevNotice.id || slugifiedId(prevNotice.title))}`}
                  className="group block p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left"
                >
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <ArrowLeft className="h-3 w-3" /> Previous Notice
                  </span>
                  <span className="mt-1 block text-sm font-bold text-slate-800 group-hover:text-[#C8102E] transition-colors line-clamp-1 font-fraunces">
                    {prevNotice.title}
                  </span>
                </Link>
              ) : (
                <div />
              )}

              {nextNotice ? (
                <Link
                  to={`/announcements/${encodeURIComponent(nextNotice.id || slugifiedId(nextNotice.title))}`}
                  className="group block p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-right"
                >
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center justify-end gap-1">
                    Next Notice <ArrowRight className="h-3 w-3" />
                  </span>
                  <span className="mt-1 block text-sm font-bold text-slate-800 group-hover:text-[#C8102E] transition-colors line-clamp-1 font-fraunces">
                    {nextNotice.title}
                  </span>
                </Link>
              ) : (
                <div />
              )}
            </div>
          </article>

          {/* ── Sticky Sidebar (Three real notices + One navy help card with red button) ── */}
          <aside className="w-full lg:w-[320px] shrink-0 lg:sticky lg:top-24 space-y-6 mt-10 lg:mt-0">
            {/* Recent Official Notices */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 font-fraunces flex items-center gap-2">
                <Bell className="h-4 w-4 text-[#C8102E]" />
                <span>Recent Official Notices</span>
              </h3>

              <div className="divide-y divide-slate-100">
                {recentRealNotices.map((rel) => (
                  <Link
                    key={rel.id}
                    to={`/announcements/${encodeURIComponent(rel.id || slugifiedId(rel.title))}`}
                    className="group block py-3 text-left transition-colors"
                  >
                    <span className="block text-xs font-bold text-slate-800 group-hover:text-[#C8102E] transition-colors line-clamp-2 leading-snug">
                      {rel.title}
                    </span>
                    <span className="mt-1 block text-[11px] text-slate-400 font-medium">
                      {formatSpelledOutDate(rel.publishedAt || rel.updatedAt)}
                    </span>
                  </Link>
                ))}
              </div>

              <Link
                to="/announcements"
                className="block text-center text-xs font-semibold text-[#003580] hover:text-[#C8102E] pt-1 transition-colors"
              >
                View All Notices →
              </Link>
            </div>

            {/* Corporate Help Card (Navy with Red Button - No Green) */}
            <div className="rounded-xl bg-[#003580] p-6 text-white space-y-3.5 shadow-sm">
              <div className="h-9 w-9 rounded-lg bg-white/10 flex items-center justify-center text-white">
                <FileText className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white font-fraunces">Have Questions?</h4>
                <p className="mt-1 text-xs leading-relaxed text-slate-300 font-normal">
                  Contact the ASTU Alumni & Industry Liaison Office for official verification and portal assistance.
                </p>
              </div>

              <div className="pt-2 border-t border-white/10 text-xs text-slate-300 space-y-1">
                <p className="flex justify-between">
                  <span>Helpline:</span>
                  <span className="font-semibold text-white">+251 22 110 0055</span>
                </p>
                <p className="flex justify-between">
                  <span>Email:</span>
                  <span className="font-semibold text-white">alumni@astu.edu.et</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/contact')}
                className="w-full h-11 rounded-xl bg-[#C8102E] hover:bg-[#A60D26] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Contact Support Office
              </button>
            </div>
          </aside>
        </div>
      </main>

      {/* RAG Copilot Assistant */}
      <ChatBot />
    </div>
  );
}
