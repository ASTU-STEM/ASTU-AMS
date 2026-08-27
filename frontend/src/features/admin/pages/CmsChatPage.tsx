import React from 'react';
import { TelegramChat } from '../../../components/TelegramChat';

export default function CmsChatPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">ASTU_AMS Hub & Direct Messages</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Real-time direct messaging center for CMS Content Managers with Alumni Candidates, Corporate Recruiters, Registrar, Departments, and Admins.
          </p>
        </div>
      </div>
      <TelegramChat darkMode={false} />
    </div>
  );
}
