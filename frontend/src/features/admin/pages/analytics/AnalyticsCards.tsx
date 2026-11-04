import React from 'react';
import AdminSectionCard, { adminPanelClass } from '../../components/AdminSectionCard';

export function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <AdminSectionCard title={title} subtitle={subtitle}>
      {children}
    </AdminSectionCard>
  );
}

export function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`${adminPanelClass} p-4`}>
      <div className="mb-3">
        <h4 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h4>
        {subtitle && <p className="mt-1 text-xs text-[var(--text-secondary)]">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
