import React, { useEffect, useState } from 'react';
import AdminPageHeader from '../components/AdminPageHeader';
import { TelegramChat } from '../../../components/TelegramChat';

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
    <div className="space-y-4">
      <AdminPageHeader
        title="Messages"
        subtitle="Real-time messaging for Alumni Office officers with alumni, recruiters, registrar, departments, and admins."
        breadcrumbs={[{ label: 'Alumni Office' }, { label: 'Messages' }]}
      />
      <TelegramChat darkMode={isDark} />
    </div>
  );
}
