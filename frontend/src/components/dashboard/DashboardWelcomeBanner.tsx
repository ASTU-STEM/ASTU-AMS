import React from 'react';
import { ArrowRight } from 'lucide-react';

export interface DashboardWelcomeAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

export interface DashboardWelcomeBannerProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: DashboardWelcomeAction[];
  meta?: React.ReactNode;
  /** Extra content below the title row (progress, signal chips, etc.) */
  children?: React.ReactNode;
  className?: string;
}

const actionClass: Record<NonNullable<DashboardWelcomeAction['variant']>, string> = {
  primary:
    'bg-white text-[#003580] hover:bg-white/90 shadow-sm',
  secondary:
    'bg-white/10 text-white border border-white/25 hover:bg-white/20 backdrop-blur-sm',
  danger:
    'bg-[#E24B4A] text-white hover:bg-[#c94140] shadow-sm',
};

/**
 * Shared role-dashboard hero banner (Registrar / Employer / Department / Alumni).
 */
export function DashboardWelcomeBanner({
  eyebrow = 'ASTU Alumni Management System',
  title,
  description,
  actions = [],
  meta,
  children,
  className = '',
}: DashboardWelcomeBannerProps) {
  return (
    <section
      className={`relative overflow-hidden rounded-2xl border border-[#003580]/20 p-5 text-white shadow-sm md:p-6 ${className}`}
      style={{
        background: 'linear-gradient(135deg, #001F4D 0%, #003580 48%, #0B6E4F 100%)',
      }}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute right-20 -bottom-14 h-36 w-36 rounded-full bg-[#FFCC00]/10" />
      <div className="pointer-events-none absolute -left-10 bottom-0 h-24 w-24 rounded-full bg-emerald-400/10" />

      <div className="relative z-10 space-y-5">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="max-w-2xl space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#FFCC00]">
                {eyebrow}
              </span>
              {meta}
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">{title}</h2>
            {description && (
              <p className="text-sm leading-relaxed text-white/85 md:line-clamp-none line-clamp-3">
                {description}
              </p>
            )}
          </div>

          {actions.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
              {actions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={action.onClick}
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold tracking-wide transition-all ${actionClass[action.variant || 'secondary']}`}
                >
                  {action.label}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}

export default DashboardWelcomeBanner;
