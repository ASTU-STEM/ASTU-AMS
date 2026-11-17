import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  ShieldCheck,
  FileText,
  Building2,
  Bell,
  ArrowRight,
} from 'lucide-react';
import approvalService, { WorkflowItem } from '../features/admin/services/approval.service';

interface DashboardBroadcastHeroProps {
  actorRole?: 'ALUMNI' | 'EMPLOYER' | 'DEPARTMENT_HEAD' | 'REGISTRAR' | 'ADMIN' | string;
  className?: string;
}

export const DashboardBroadcastHero: React.FC<DashboardBroadcastHeroProps> = ({
  actorRole = 'ALL',
  className = '',
}) => {
  const [broadcasts, setBroadcasts] = useState<WorkflowItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalItem, setModalItem] = useState<WorkflowItem | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [rsvpDone, setRsvpDone] = useState<Record<string, boolean>>({});

  const refreshBroadcasts = () => {
    const published = approvalService.getPublishedBroadcasts();
    setBroadcasts(published);
  };

  useEffect(() => {
    refreshBroadcasts();

    const handleUpdate = () => refreshBroadcasts();
    window.addEventListener('astu-cms-approval-changed', handleUpdate);
    window.addEventListener('astu-broadcast-announcement-updated', handleUpdate);

    return () => {
      window.removeEventListener('astu-cms-approval-changed', handleUpdate);
      window.removeEventListener('astu-broadcast-announcement-updated', handleUpdate);
    };
  }, []);

  if (isDismissed || broadcasts.length === 0) {
    return null;
  }

  const activeItem = broadcasts[currentIndex % broadcasts.length];
  if (!activeItem) return null;

  const isEvent = activeItem.type.toLowerCase().includes('event') || activeItem.type.toLowerCase().includes('fair');
  const hasMultiple = broadcasts.length > 1;

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % broadcasts.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + broadcasts.length) % broadcasts.length);
  };

  const handleRsvp = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setRsvpDone((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <>
      {/* Smart, Compact Text Notification Strip (Non-Card Design) */}
      <div
        className={`relative flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl border border-blue-200/80 dark:border-blue-900/60 bg-blue-50/70 dark:bg-slate-900/80 backdrop-blur-sm text-slate-800 dark:text-slate-200 text-xs shadow-2xs transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-800 ${className}`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Animated Pulsing Dot & Icon */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>

            {isEvent ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">
                <Calendar className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400" />
                Event
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-[#003366]/10 text-[#003366] dark:bg-sky-950/60 dark:text-sky-300 border border-[#003366]/20 dark:border-sky-800/80">
                <Megaphone className="h-2.5 w-2.5 text-[#003366] dark:text-sky-400" />
                Notice
              </span>
            )}
          </div>

          {/* Text Notification Content */}
          <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
            <span className="font-extrabold text-slate-900 dark:text-white shrink-0">
              {activeItem.title}
            </span>

            <span className="text-slate-400 dark:text-slate-500 hidden sm:inline">•</span>

            <span className="text-slate-600 dark:text-slate-300 truncate hidden sm:inline">
              {activeItem.excerpt || activeItem.content}
            </span>

            {activeItem.eventDate && (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] shrink-0 hidden md:inline-flex items-center gap-1">
                ({activeItem.eventDate})
              </span>
            )}
          </div>

          {/* Action Link Button */}
          <button
            type="button"
            onClick={() => setModalItem(activeItem)}
            className="inline-flex items-center gap-1 font-bold text-[#003366] dark:text-sky-400 hover:text-blue-700 dark:hover:text-sky-300 hover:underline shrink-0 whitespace-nowrap ml-1 cursor-pointer transition-colors"
          >
            <span>Read details</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Carousel Switcher & Dismiss Controls */}
        <div className="flex items-center gap-1.5 shrink-0 pl-1 border-l border-blue-200/60 dark:border-slate-800">
          {hasMultiple && (
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={handlePrev}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                title="Previous announcement"
              >
                <ChevronLeft className="h-3 w-3" />
              </button>
              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 px-0.5">
                {currentIndex + 1}/{broadcasts.length}
              </span>
              <button
                type="button"
                onClick={handleNext}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                title="Next announcement"
              >
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title="Dismiss notice"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Full Bulletin Details Modal (shown when clicking 'Read details') */}
      {modalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 md:p-8 space-y-5 text-slate-900 dark:text-white">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#003366]/10 dark:bg-sky-500/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#003366] dark:text-sky-300">
                    {modalItem.type}
                  </span>
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    Verified Broadcast
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {modalItem.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setModalItem(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Origin & Approver Meta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Origin Department:</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{modalItem.department || 'Office of the Registrar'}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Published / Approved By:</span>
                <p className="font-bold text-emerald-600 dark:text-emerald-400">{modalItem.approvedByOfficer || 'Alumni Relations Officer'}</p>
              </div>
              {modalItem.eventDate && (
                <div>
                  <span className="text-slate-400 font-medium">Date & Schedule:</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{modalItem.eventDate}</p>
                </div>
              )}
              {modalItem.eventLocation && (
                <div>
                  <span className="text-slate-400 font-medium">Location / Venue:</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{modalItem.eventLocation}</p>
                </div>
              )}
            </div>

            {/* Body Content */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Official Bulletin Directive
              </h4>
              <div className="prose dark:prose-invert max-w-none text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50/50 dark:bg-slate-800/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                {modalItem.content || modalItem.excerpt}
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400">
                Authorized for university-wide cross-portal dissemination.
              </span>
              <div className="flex items-center gap-2">
                {isEvent && !rsvpDone[modalItem.id] && (
                  <button
                    type="button"
                    onClick={(e) => {
                      handleRsvp(e, modalItem.id);
                      setModalItem(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-md hover:opacity-90"
                  >
                    Confirm Attendance
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setModalItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardBroadcastHero;
