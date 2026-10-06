import React from 'react';
import { TelegramChat } from '../../../components/TelegramChat';

interface MessagingTabProps {
  darkMode: boolean;
}

export const MessagingTab: React.FC<MessagingTabProps> = ({ darkMode }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-[var(--text-primary)] dark:text-white tracking-tight">ASTU_AMS Hub & Direct Messages</h2>
          <p className="text-xs text-[var(--text-muted)] dark:text-slate-400 font-medium">
            Real-time direct messaging center for Office of Registrar with Alumni Candidates, Corporate Recruiters, Departments, and Admins.
          </p>
        </div>
      </div>
      <TelegramChat darkMode={darkMode} />
    </div>
  );
};
