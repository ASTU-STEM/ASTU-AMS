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
  maxItems = 6,
}) => {
  const visible = activities.slice(0, maxItems);

  const card = `rounded-3xl border p-6 transition-all duration-300 ${
    darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200/60 shadow-sm'
  }`;

  return (
    <div className={card}>
      <div className="flex items-center justify-between mb-5">
        <h4 className={`text-sm font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          <span className="material-symbols-outlined text-base text-astu-navy">timeline</span>
          Activity Timeline
        </h4>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-[11px] text-astu-navy font-bold hover:underline flex items-center gap-0.5"
          >
            View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        )}
      </div>

      <div className="relative pl-5 space-y-5">
        {/* vertical line */}
        <div className={`absolute left-[7px] top-0 bottom-0 w-[2px] ${darkMode ? 'bg-slate-800' : 'bg-gray-100'}`} />

        {visible.map((activity) => {
          const meta = TYPE_META[activity.type];
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
    </div>
  );
};

export default ActivityTimeline;
