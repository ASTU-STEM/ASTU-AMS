import React from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { TelegramChat } from '../../../components/TelegramChat';

export default function AdminChatPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const stateTarget = location.state?.target;
  const paramName = searchParams.get('name');
  const paramEmail = searchParams.get('email');
  const paramUserId = searchParams.get('userId');
  const paramRole = searchParams.get('role');
  const paramJobTitle = searchParams.get('jobTitle');

  const initialTarget = stateTarget || (paramName || paramEmail ? {
    name: paramName || 'Alumni Candidate',
    email: paramEmail || '',
    userId: paramUserId || '',
    role: paramRole || 'ALUMNI',
    roleLabel: 'ASTU Alumni Candidate',
    department: paramJobTitle ? `Applied for: ${paramJobTitle}` : undefined,
  } : null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">ASTU_AMS Hub & Direct Messages</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Real-time direct messaging center with Alumni Candidates, Corporate Recruiters, Registrar, and Department Chairs.
          </p>
        </div>
      </div>
      <TelegramChat darkMode={false} initialTarget={initialTarget} />
    </div>
  );
}
