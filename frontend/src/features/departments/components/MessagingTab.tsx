import React from 'react';
import { MessageSquare, UserRound } from 'lucide-react';
import { TelegramChat } from '../../../components/TelegramChat';

interface MessagingTabProps {
  darkMode?: boolean;
  initialTarget?: {
    id?: string;
    userId?: string;
    name?: string;
    email?: string;
    avatar?: string;
    role?: string;
    roleLabel?: string;
    department?: string;
  } | null;
}

/**
 * Department messaging surface — embeds the shared ASTU messenger
 * in clean mode so it fits the production department shell.
 */
export const MessagingTab: React.FC<MessagingTabProps> = ({ darkMode = false, initialTarget = null }) => {
  const targetName = initialTarget?.name?.trim();

  return (
    <div
      className={`flex h-[calc(100dvh-7.5rem)] min-h-[520px] flex-col overflow-hidden rounded-[10px] border shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${
        darkMode ? 'border-slate-800 bg-slate-900' : 'border-gray-200/60 bg-white'
      }`}
    >
      <div
        className={`flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3 ${
          darkMode ? 'border-slate-800 bg-slate-950/60' : 'border-slate-100 bg-slate-50/80'
        }`}
      >
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
              darkMode ? 'bg-[#003580]/30 text-blue-200' : 'bg-[#003580]/10 text-[#003580]'
            }`}
          >
            <MessageSquare className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className={`truncate text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              {targetName ? `Messaging · ${targetName}` : 'Department Messages'}
            </p>
            <p className={`truncate text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {targetName
                ? `Conversation with ${initialTarget?.roleLabel || initialTarget?.role || 'alumni'}${
                    initialTarget?.department ? ` · ${initialTarget.department}` : ''
                  }`
                : 'Direct messages with alumni and department staff'}
            </p>
          </div>
        </div>
        {targetName && (
          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              darkMode ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-600 ring-1 ring-slate-200'
            }`}
          >
            <UserRound className="h-3.5 w-3.5" />
            Active chat
          </span>
        )}
      </div>
      <div className="min-h-0 flex-1">
        <TelegramChat darkMode={darkMode} clean embedded initialTarget={initialTarget} />
      </div>
    </div>
  );
};

export default MessagingTab;
