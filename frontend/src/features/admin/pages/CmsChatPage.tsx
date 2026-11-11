import React, { useEffect, useState } from 'react';
import { TelegramChat } from '../../../components/TelegramChat';
import AdminPageHeader from '../components/AdminPageHeader';

export default function CmsChatPage() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="ASTU_AMS Hub & Direct Messages"
        subtitle="Real-time direct messaging center for CMS Content Managers with Alumni Candidates, Corporate Recruiters, Registrar, Departments, and Admins."
        breadcrumbs={[{ label: 'Alumni Office' }, { label: 'Communications Hub' }]}
      />
      <TelegramChat darkMode={isDark} />
    </div>
  );
}
