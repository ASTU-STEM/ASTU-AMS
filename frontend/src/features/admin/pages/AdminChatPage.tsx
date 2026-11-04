import React from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { MessageSquareText } from 'lucide-react';
import { TelegramChat } from '../../../components/TelegramChat';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminBadge from '../components/AdminBadge';
import AdminSectionCard from '../components/AdminSectionCard';

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
    <div className="space-y-6">
      <AdminPageHeader
        title="Messages"
        subtitle="Real-time direct messaging with alumni candidates, recruiters, registrar, and department chairs."
        breadcrumbs={[{ label: 'Admin' }, { label: 'Messages' }]}
        actions={
          <div className="flex items-center gap-2">
            <AdminBadge variant="success">Live Hub</AdminBadge>
            <span className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-[#FFCC00]">
              <MessageSquareText className="h-5 w-5" />
            </span>
          </div>
        }
      />

      <AdminSectionCard
        title="ASTU_AMS Hub"
        subtitle="Continue conversations, hand off leads, and keep institutional messaging in one place."
        bodyClassName="-mx-1"
      >
        <div className="overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)]">
          <TelegramChat darkMode={false} initialTarget={initialTarget} />
        </div>
      </AdminSectionCard>
    </div>
  );
}
