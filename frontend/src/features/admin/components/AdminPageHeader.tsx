import React from 'react';
import { 
  BarChart3, Layers, FileBarChart2, 
  UserCog, Key, BarChart, FileText, Briefcase, 
  GraduationCap, Bell, Activity, Shield, Settings 
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
      {/* Hero Banner Card styled like SurveyManagement but with ASTU Blue gradient */}
      <div className="relative overflow-hidden rounded-[14px] shadow-sm" style={{
        background: 'linear-gradient(135deg, #001F4D 0%, #003366 50%, #004080 100%)',
      }}>
        {/* Decorative background circles */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -right-8 top-8 h-40 w-40 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-24 -bottom-12 h-48 w-48 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative px-8 pt-8 pb-8 z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <span className="mb-2 inline-block rounded-sm text-[11px] font-bold uppercase tracking-[0.25em] text-[#FFCC00]">
                {categoryText}
              </span>
              <h1 className="mb-1 text-3xl font-bold text-white tracking-tight leading-tight">{title}</h1>
              {subtitle && (
                <p className="max-w-2xl text-sm leading-relaxed text-slate-200/90 font-medium">
                  {subtitle}
                </p>
              )}
            </div>
            
            <div className="flex-shrink-0 flex items-center gap-4 self-start md:self-auto">
              {actions && <div className="flex items-center gap-3">{actions}</div>}
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 border border-white/20 shadow-inner backdrop-blur-sm transition-all duration-200 hover:bg-white/20 hover:border-white/30 hover:scale-105 active:scale-95 cursor-pointer" title={`${title} Module Icon`}>
                <Icon className="h-6 w-6 text-[#FFCC00]" />
              </div>
            </div>
          </div>

          {children && (
            <div className="mt-6 pt-5 border-t border-white/10">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
