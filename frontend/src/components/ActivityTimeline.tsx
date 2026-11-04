import React from 'react';

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

const TYPE_META: Record<ActivityType, { icon: string; colorLight: string; colorDark: string }> = {
  job:          { icon: 'work',            colorLight: 'bg-blue-100 text-blue-700',    colorDark: 'bg-blue-900/40 text-blue-300' },
  survey:       { icon: 'assignment',      colorLight: 'bg-amber-100 text-amber-700',  colorDark: 'bg-amber-900/40 text-amber-300' },
  document:     { icon: 'description',     colorLight: 'bg-purple-100 text-purple-700',colorDark: 'bg-purple-900/40 text-purple-300' },
  message:      { icon: 'forum',           colorLight: 'bg-teal-100 text-teal-700',    colorDark: 'bg-teal-900/40 text-teal-300' },
  event:        { icon: 'event',           colorLight: 'bg-rose-100 text-rose-700',    colorDark: 'bg-rose-900/40 text-rose-300' },
  verification: { icon: 'verified_user',   colorLight: 'bg-green-100 text-green-700',  colorDark: 'bg-green-900/40 text-green-300' },
  broadcast:    { icon: 'campaign',        colorLight: 'bg-orange-100 text-orange-700',colorDark: 'bg-orange-900/40 text-orange-300' },
  alert:        { icon: 'notifications',   colorLight: 'bg-red-100 text-red-700',      colorDark: 'bg-red-900/40 text-red-300' },
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
        <div className="flex items-center justify-between mb-5">
          <h4 className={`text-sm font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <span className="material-symbols-outlined text-base text-astu-navy">timeline</span>
            Activity Timeline
            {activities.length > 0 && (
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                {activities.length}
              </span>
            )}
          </h4>
          <button
            onClick={handleViewAllClick}
            className="text-[11px] text-astu-navy font-bold hover:underline flex items-center gap-0.5 transition-all"
          >
            View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

        <div className="relative pl-5 space-y-4">
          {/* vertical line */}
          <div className={`absolute left-[7px] top-0 bottom-0 w-[2px] ${darkMode ? 'bg-slate-800' : 'bg-gray-100'}`} />

          {visible.map((activity) => {
            const meta = TYPE_META[activity.type] || TYPE_META.alert;
            const iconBg = darkMode ? meta.colorDark : meta.colorLight;
            return (
              <div key={activity.id} className="relative flex gap-3">
                {/* dot + icon */}
                <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[13px] shadow-sm z-10 ${iconBg}`}>
                  <span className="material-symbols-outlined text-sm">{meta.icon}</span>
                </div>

                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={`text-[12px] font-bold leading-snug ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {activity.title}
                        {activity.unread && (
                          <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-astu-red align-middle" />
                        )}
                      </p>
                      <p className={`text-[11px] mt-0.5 leading-normal ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                        {activity.description}
                      </p>
                    </div>
                    <span className={`shrink-0 text-[10px] font-semibold whitespace-nowrap ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                      {activity.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {activities.length === 0 && (
            <p className={`text-xs italic text-center py-6 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>
              No recent activity yet.
            </p>
          )}
        </div>

        {activities.length > maxItems && (
          <button
            onClick={handleViewAllClick}
            className="w-full mt-4 py-2.5 text-center text-xs font-bold text-astu-navy hover:bg-astu-navy/5 bg-slate-50 rounded-xl transition-all border border-slate-200/60 flex items-center justify-center gap-1"
          >
            <span>View All ({activities.length}) Activities</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        )}
      </div>

      {/* Full Activity Audit Trail Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-astu-navy p-2 bg-astu-navy/10 rounded-xl text-xl">history</span>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">System Activity Audit Log</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Complete historical timeline of verifications, document requests & system actions</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Filters Toolbar */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900">
              <div className="relative w-full sm:w-64">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-sm">search</span>
                <input
                  type="text"
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-astu-navy text-slate-800 dark:text-white w-full"
                />
              </div>
              <div className="flex flex-wrap gap-1.5 text-xs w-full sm:w-auto">
                {['ALL', 'verification', 'document', 'broadcast'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveType(t)}
                    className={`px-3 py-1.5 rounded-xl font-bold uppercase text-[10px] transition-all ${
                      activeType === t
                        ? 'bg-astu-navy text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {t === 'ALL' ? 'All Logs' : t}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Scrollable Activity List */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="relative pl-6 space-y-5">
                <div className="absolute left-[7px] top-0 bottom-0 w-[2px] bg-slate-200 dark:bg-slate-800" />

                {filteredModalActivities.map((act) => {
                  const meta = TYPE_META[act.type] || TYPE_META.alert;
                  return (
                    <div key={act.id} className="relative flex gap-3 group">
                      <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[13px] shadow-xs z-10 ${meta.colorLight}`}>
                        <span className="material-symbols-outlined text-sm">{meta.icon}</span>
                      </div>
                      <div className="flex-1 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">
                              {act.title}
                              {act.unread && <span className="ml-2 inline-block w-2 h-2 rounded-full bg-astu-red align-middle" />}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{act.description}</p>
                          </div>
                          <span className="text-[10px] font-semibold text-slate-400 whitespace-nowrap bg-white dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-800">
                            {act.timestamp}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredModalActivities.length === 0 && (
                  <div className="py-12 text-center">
                    <span className="material-symbols-outlined text-4xl text-slate-300">search_off</span>
                    <p className="mt-2 text-xs font-semibold text-slate-500">No activity logs match your search.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex justify-between items-center text-xs text-slate-500">
              <span>Total Activity Logs: {activities.length}</span>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold rounded-xl transition-all"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ActivityTimeline;
