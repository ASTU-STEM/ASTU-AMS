import React from 'react';
import {
  BarChart3,
  Layers,
  FileBarChart2,
  UserCog,
  Key,
  BarChart,
  FileText,
  Briefcase,
  GraduationCap,
  Bell,
  Activity,
  Shield,
  Settings,
  CalendarDays,
  HeartHandshake,
  MessageSquareText,
  ClipboardCheck,
  Image as ImageIcon,
  Globe,
  Users,
  Newspaper,
  Building2,
  ClipboardList,
  ShieldCheck,
  Clock3,
} from 'lucide-react';
import type { AdminPageHeaderProps } from '../types/admin.types';
import AdminStatGrid from './AdminStatGrid';

const getHeaderIcon = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes('dashboard')) return BarChart3;
  if (t.includes('module')) return Layers;
  if (t.includes('report')) return FileBarChart2;
  if (t.includes('user') || t.includes('member')) return UserCog;
  if (t.includes('role') || t.includes('permission')) return Key;
  if (t.includes('analytics') || t.includes('statistic')) return BarChart;
  if (t.includes('survey') || t.includes('questionnaire') || t.includes('tracer')) return ClipboardList;
  if (t.includes('job') || t.includes('placement') || t.includes('career')) return Briefcase;
  if (t.includes('event') || t.includes('workshop')) return CalendarDays;
  if (t.includes('donation') || t.includes('giving') || t.includes('fundrais')) return HeartHandshake;
  if (t.includes('message') || t.includes('chat') || t.includes('inbox')) return MessageSquareText;
  if (t.includes('registration') || t.includes('roster')) return ClipboardCheck;
  if (t.includes('media') || t.includes('gallery')) return ImageIcon;
  if (t.includes('homepage') || t.includes('pages &')) return Layers;
  if (t.includes('seo') || t.includes('search engine')) return Globe;
  if (t.includes('partner') || t.includes('employer')) return Building2;
  if (t.includes('community')) return Users;
  if (t.includes('announcement') || t.includes('content') || t.includes('news')) return Newspaper;
  if (t.includes('approval') || t.includes('governance') || t.includes('workflow')) return ShieldCheck;
  if (t.includes('template')) return FileText;
  if (t.includes('department')) return GraduationCap;
  if (t.includes('notification') || t.includes('alert')) return Bell;
  if (t.includes('log') || t.includes('audit')) return Activity;
  if (t.includes('backup') || t.includes('security')) return Shield;
  if (t.includes('settings') || t.includes('configuration')) return Settings;
  return Settings;
};

export default function AdminPageHeader({
  title,
  subtitle,
  breadcrumb = [],
  breadcrumbs = [],
  actions,
  className = '',
  children,
  stats,
  statsCols = 4,
  lastSynced,
}: AdminPageHeaderProps) {
  const items = breadcrumbs.length > 0 ? breadcrumbs : breadcrumb;
  const categoryText = items.length > 0 ? items[items.length - 1].label : 'Alumni Office';
  const Icon = getHeaderIcon(title);

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        className="relative overflow-hidden rounded-2xl shadow-sm"
        style={{
          background: 'linear-gradient(135deg, #001F4D 0%, #003366 50%, #004080 100%)',
        }}
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute right-24 -bottom-12 h-36 w-36 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -left-8 bottom-0 h-24 w-24 rounded-full bg-[#FFCC00]/10" />

        <div className="relative z-10 px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="max-w-3xl space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-block rounded-sm text-[10px] font-bold uppercase tracking-[0.2em] text-[#FFCC00]">
                  {categoryText}
                </span>
                {lastSynced && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/70">
                    <Clock3 className="h-3 w-3 text-[#FFCC00]" />
                    Synced {lastSynced}
                  </span>
                )}
              </div>
              <h1 className="text-xl font-extrabold leading-tight tracking-tight text-white md:text-2xl">
                {title}
              </h1>
              {subtitle && (
                <p className="max-w-2xl text-xs font-medium leading-relaxed text-slate-200/90 line-clamp-2 md:line-clamp-none">
                  {subtitle}
                </p>
              )}
            </div>

            <div className="flex flex-shrink-0 items-center gap-3 self-start md:self-auto">
              {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
              <div
                className="hidden h-10 w-10 items-center justify-center rounded-lg border border-white/20 bg-white/10 shadow-inner backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-white/20 active:scale-95 sm:flex"
                title={`${title} module`}
              >
                <Icon className="h-5 w-5 text-[#FFCC00]" />
              </div>
            </div>
          </div>

          {children && <div className="mt-4 border-t border-white/10 pt-3">{children}</div>}
        </div>
      </div>

      {stats && stats.length > 0 && (
        <AdminStatGrid stats={stats} cols={statsCols} compact />
      )}
    </div>
  );
}
