import React from 'react';
import {
  ArrowRight,
  Bell,
  Briefcase,
  ClipboardList,
  FileText,
  History,
  MessageSquare,
  Megaphone,
  Calendar,
  Search,
  SearchX,
  ShieldCheck,
  X,
  type LucideIcon,
} from 'lucide-react';

export type ActivityType = 'job' | 'survey' | 'document' | 'message' | 'event' | 'verification' | 'broadcast' | 'alert';

export interface ActivityEntry {
  id: number;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  unread?: boolean;
}

interface ActivityTimelineProps {
  activities: ActivityEntry[];
  darkMode?: boolean;
  onViewAll?: () => void;
  maxItems?: number;
}

const TYPE_META: Record<ActivityType, { icon: LucideIcon; colorLight: string; colorDark: string }> = {
  job:          { icon: Briefcase,     colorLight: 'bg-blue-100 text-blue-700',    colorDark: 'bg-blue-900/40 text-blue-300' },
  survey:       { icon: ClipboardList, colorLight: 'bg-amber-100 text-amber-700',  colorDark: 'bg-amber-900/40 text-amber-300' },
  document:     { icon: FileText,      colorLight: 'bg-purple-100 text-purple-700',colorDark: 'bg-purple-900/40 text-purple-300' },
  message:      { icon: MessageSquare, colorLight: 'bg-teal-100 text-teal-700',    colorDark: 'bg-teal-900/40 text-teal-300' },
  event:        { icon: Calendar,      colorLight: 'bg-rose-100 text-rose-700',    colorDark: 'bg-rose-900/40 text-rose-300' },
  verification: { icon: ShieldCheck,   colorLight: 'bg-green-100 text-green-700',  colorDark: 'bg-green-900/40 text-green-300' },
  broadcast:    { icon: Megaphone,     colorLight: 'bg-orange-100 text-orange-700',colorDark: 'bg-orange-900/40 text-orange-300' },
  alert:        { icon: Bell,          colorLight: 'bg-red-100 text-red-700',      colorDark: 'bg-red-900/40 text-red-300' },
};

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  activities,
  darkMode = false,
  onViewAll,
  maxItems = 5,
}) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeType, setActiveType] = React.useState<string>('ALL');

  const visible = activities.slice(0, maxItems);

  const handleViewAllClick = () => {
    setIsModalOpen(true);
    if (onViewAll) onViewAll();
  };

  const filteredModalActivities = React.useMemo(() => {
    return activities.filter((act) => {
      const matchesSearch = !searchQuery ||
        `${act.title} ${act.description} ${act.timestamp}`.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = activeType === 'ALL' || act.type === activeType;
      return matchesSearch && matchesType;
    });
  }, [activities, searchQuery, activeType]);

  const card = `rounded-3xl border p-6 transition-all duration-300 ${
    darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200/60 shadow-sm'
  }`;

  return (
    <>
      <div className={card}>
        <div className="mb-5 flex items-center justify-between gap-3">
          <h4 className={`flex items-center gap-2 text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <History className="h-4 w-4 shrink-0 text-astu-navy" />
            Activity Timeline
            {activities.length > 0 && (
              <span className="rounded-full bg-[var(--bg-page)] px-2 py-0.5 text-[10px] font-bold text-[var(--text-secondary)]">
                {activities.length}
              </span>
            )}
          </h4>
          <button
            type="button"
            onClick={handleViewAllClick}
            className="inline-flex items-center gap-0.5 text-[11px] font-bold text-astu-navy transition-all hover:underline"
          >
            View All <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="relative space-y-4 pl-5">
          <div className={`absolute bottom-0 left-[7px] top-0 w-[2px] ${darkMode ? 'bg-slate-800' : 'bg-gray-100'}`} />

          {visible.map((activity) => {
            const meta = TYPE_META[activity.type] || TYPE_META.alert;
            const Icon = meta.icon;
            const iconBg = darkMode ? meta.colorDark : meta.colorLight;
            return (
              <div key={activity.id} className="relative flex gap-3">
                <div className={`z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full shadow-sm ${iconBg}`}>
                  <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                </div>

                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className={`text-[12px] font-bold leading-snug ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {activity.title}
                        {activity.unread && (
                          <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-astu-red align-middle" />
                        )}
                      </p>
                      <p className={`mt-0.5 text-[11px] leading-normal ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                        {activity.description}
                      </p>
                    </div>
                    <span className={`shrink-0 whitespace-nowrap text-[10px] font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {activity.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {activities.length === 0 && (
            <p className={`py-6 text-center text-xs italic ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>
              No recent activity yet.
            </p>
          )}
        </div>

        {activities.length > maxItems && (
          <button
            type="button"
            onClick={handleViewAllClick}
            className="mt-4 flex w-full items-center justify-center gap-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] py-2.5 text-center text-xs font-bold text-astu-navy transition-all hover:bg-astu-navy/5"
          >
            <span>View All ({activities.length}) Activities</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {isModalOpen && (
        <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-page)] p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2.5">
                <span className="rounded-xl bg-astu-navy/10 p-2 text-astu-navy">
                  <History className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-[var(--text-primary)] dark:text-white">System Activity Audit Log</h3>
                  <p className="text-xs text-[var(--text-muted)] dark:text-slate-400">Complete historical timeline of verifications, document requests & system actions</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-page)] hover:text-[var(--text-secondary)] dark:hover:bg-slate-800"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 border-b border-[var(--border-color)] p-4 dark:border-slate-800">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search activity..."
                  className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-astu-navy focus:ring-2 focus:ring-astu-navy/10 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['ALL', ...Object.keys(TYPE_META)].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setActiveType(type)}
                    className={`rounded-full px-3 py-1 text-[11px] font-bold capitalize transition-colors ${
                      activeType === type
                        ? 'bg-astu-navy text-white'
                        : 'bg-[var(--bg-page)] text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {type === 'ALL' ? 'All' : type}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {filteredModalActivities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-[var(--text-muted)]">
                  <SearchX className="mb-2 h-10 w-10 text-slate-300" />
                  <p className="text-sm font-medium">No matching activity found</p>
                </div>
              ) : (
                filteredModalActivities.map((activity) => {
                  const meta = TYPE_META[activity.type] || TYPE_META.alert;
                  const Icon = meta.icon;
                  const iconBg = darkMode ? meta.colorDark : meta.colorLight;
                  return (
                    <div
                      key={activity.id}
                      className={`flex gap-3 rounded-2xl border p-3.5 ${
                        darkMode ? 'border-slate-800 bg-slate-800/40' : 'border-slate-100 bg-slate-50/80'
                      }`}
                    >
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
                        <Icon className="h-4 w-4" strokeWidth={2} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                            {activity.title}
                            {activity.unread && (
                              <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-astu-red align-middle" />
                            )}
                          </p>
                          <span className="shrink-0 text-[10px] font-semibold text-[var(--text-muted)]">{activity.timestamp}</span>
                        </div>
                        <p className={`mt-0.5 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {activity.description}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ActivityTimeline;
