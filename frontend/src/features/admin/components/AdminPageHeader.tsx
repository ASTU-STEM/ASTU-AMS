import React from 'react';
import { 
  BarChart3, Layers, FileBarChart2, 
  UserCog, Key, BarChart, FileText, Briefcase, 
  GraduationCap, Bell, Activity, Shield, Settings,
  Heart, MessageSquare
} from 'lucide-react';
import type { AdminPageHeaderProps } from '../types/admin.types';

const getHeaderIcon = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes('dashboard')) return BarChart3;
  if (t.includes('module')) return Layers;
  if (t.includes('report')) return FileBarChart2;
  if (t.includes('user')) return UserCog;
  if (t.includes('role') || t.includes('permission')) return Key;
  if (t.includes('analytics') || t.includes('statistic')) return BarChart;
  if (t.includes('survey') || t.includes('questionnaire')) return FileText;
  if (t.includes('job') || t.includes('placement') || t.includes('career')) return Briefcase;
  if (t.includes('donat') || t.includes('giving')) return Heart;
  if (t.includes('message') || t.includes('chat')) return MessageSquare;
  if (t.includes('department')) return GraduationCap;
  if (t.includes('notification') || t.includes('alert')) return Bell;
  if (t.includes('log') || t.includes('audit')) return Activity;
  if (t.includes('backup') || t.includes('security')) return Shield;
  if (t.includes('settings') || t.includes('configuration')) return Settings;
  return Settings; // Default fallback icon
};

export default function AdminPageHeader({
  title,
  subtitle,
  breadcrumb = [],
  breadcrumbs = [],
  actions,
  className = '',
  children,
}: AdminPageHeaderProps) {
  const items = breadcrumbs.length > 0 ? breadcrumbs : breadcrumb;
  const categoryText = items.length > 0 ? items[items.length - 1].label : 'Admin Portal';
  const Icon = getHeaderIcon(title);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Hero Banner Card - Executive & Prominent */}
      <div className="relative overflow-hidden rounded-2xl shadow-md" style={{
        background: 'linear-gradient(135deg, #001F4D 0%, #003366 50%, #004080 100%)',
      }}>
        {/* Decorative background circles */}
        <div className="absolute -right-14 -top-14 h-56 w-56 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-28 -bottom-14 h-44 w-44 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative px-7 py-7 sm:px-9 sm:py-9 z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-1.5 max-w-3xl">
              <span className="inline-block rounded-sm text-xs font-bold uppercase tracking-[0.2em] text-[#FFCC00]">
                {categoryText}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">{title}</h1>
              {subtitle && (
                <p className="max-w-3xl text-sm leading-relaxed text-slate-200/90 font-medium line-clamp-2 md:line-clamp-none">
                  {subtitle}
                </p>
              )}
            </div>
            
            <div className="flex-shrink-0 flex items-center gap-3.5 self-start md:self-auto">
              {actions && <div className="flex items-center gap-2.5 flex-wrap">{actions}</div>}
              <div className="hidden sm:flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 border border-white/20 shadow-inner backdrop-blur-sm transition-all duration-200 hover:bg-white/20 hover:scale-105 active:scale-95 cursor-pointer" title={`${title} Module Icon`}>
                <Icon className="h-7 w-7 text-[#FFCC00]" />
              </div>
            </div>
          </div>

          {children && (
            <div className="mt-5 pt-4 border-t border-white/10">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
