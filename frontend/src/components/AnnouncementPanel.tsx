import React, { useEffect, useState } from "react";
import { Bell, X, CalendarDays, FileText, User } from "lucide-react";

const announcements = [
  {
    id: 1,
    title: "Tracer Study 2026 response window is open",
    date: "May 31, 2026",
    type: "Alumni Announcement",
    priority: "high",
  },
  {
    id: 2,
    title: "Call for employer partners: campus recruitment week",
    date: "May 28, 2026",
    type: "Employer Announcement",
    priority: "medium",
  },
  {
    id: 3,
    title: "Graduate verification batch import schedule",
    date: "May 25, 2026",
    type: "Registrar Notice",
    priority: "low",
  },
  {
    id: 4,
    title: "Workshop registration: AI for Engineering Research",
    date: "May 21, 2026",
    type: "Public Announcement",
    priority: "medium",
  },
  {
    id: 5,
    title: "Emergency contact and campus service directory updated",
    date: "May 18, 2026",
    type: "Internal Notice",
    priority: "low",
  },
];

interface AnnouncementPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AnnouncementPanel({ isOpen, onClose }: AnnouncementPanelProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div
        className={`absolute top-16 right-4 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-outline-variant dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl transition-all duration-300 ${
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        onMouseEnter={(e) => e.stopPropagation()}
      >
        <div className="border-b border-outline-variant dark:border-slate-800 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-astu-red" />
              <h3 className="text-lg font-bold text-astu-navy dark:text-white">Announcements</h3>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-on-surface-variant dark:text-slate-400 hover:bg-surface-container-low dark:hover:bg-slate-800 transition-colors"
              aria-label="Close announcements"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1 text-xs text-on-surface-variant dark:text-slate-400">
            {announcements.length} recent announcements
          </p>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {announcements.map((ann) => (
            <button
              key={ann.id}
              className="flex w-full items-start gap-3 border-b border-outline-variant dark:border-slate-800/80 last:border-b-0 p-3 text-left hover:bg-surface-container-low/50 dark:hover:bg-slate-800/60 transition-colors"
            >
              <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${
                ann.priority === "high" ? "bg-astu-red" : 
                ann.priority === "medium" ? "bg-astu-green" : "bg-astu-navy/50 dark:bg-blue-400/50"
              }`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-astu-navy dark:text-slate-200">{ann.title}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-on-surface-variant dark:text-slate-400">
                  <span>{ann.type}</span>
                  <span>•</span>
                  <CalendarDays className="h-3 w-3" />
                  <span>{ann.date}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="border-t border-outline-variant dark:border-slate-800 p-3">
          <button
            onClick={() => {
              onClose();
              window.location.href = "/info/announcements";
            }}
            className="text-xs font-semibold text-astu-navy dark:text-blue-400 hover:underline"
          >
            View all announcements →
          </button>
        </div>
      </div>
    </div>
  );
}