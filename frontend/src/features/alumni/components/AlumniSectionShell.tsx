import React from 'react';
import { BrandMark } from './BrandMark';
import { alumniPageClass } from './alumniUi';

export interface AlumniMetric {
  value: React.ReactNode;
  label: string;
  accent?: 'gold' | 'white' | 'green';
}

interface AlumniSectionShellProps {
  eyebrow?: string;
  title: string;
  description?: string;
  metrics?: AlumniMetric[];
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const accentClass: Record<NonNullable<AlumniMetric['accent']>, string> = {
  gold: 'text-[#FFCC00]',
  white: 'text-white',
  green: 'text-emerald-300',
};

/**
 * Standard page chrome for alumni dashboard tabs:
 * navy/gold hero + consistent page spacing.
 */
export const AlumniSectionShell: React.FC<AlumniSectionShellProps> = ({
  eyebrow,
  title,
  description,
  metrics,
  actions,
  children,
  className = '',
}) => {
  return (
    <div className={`${alumniPageClass} ${className}`}>
      <section
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 text-white shadow-xl"
        style={{ background: 'linear-gradient(135deg, #003366 0%, #001a33 50%, #0d2b4d 100%)' }}
      >
        <div className="pointer-events-none absolute -mr-20 -mt-20 top-0 right-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-48 w-48 rounded-full bg-[#FFCC00]/5 blur-2xl" />

        <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <BrandMark className="h-14 w-14 shrink-0 object-contain scale-110 rounded-xl" tone="dark" />
            <div className="space-y-2 min-w-0">
              {eyebrow && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FFCC00]/30 bg-[#FFCC00]/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#FFD700]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FFCC00] animate-pulse" />
                  {eyebrow}
                </span>
              )}
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h2>
              {description && (
                <p className="max-w-2xl text-sm sm:text-base leading-relaxed text-white/70">{description}</p>
              )}
              {actions && <div className="pt-2 flex flex-wrap gap-3">{actions}</div>}
            </div>
          </div>

          {metrics && metrics.length > 0 && (
            <div className="flex flex-wrap gap-4 self-start md:self-center">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="min-w-[88px] rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-center backdrop-blur-sm"
                >
                  <div className={`text-2xl font-extrabold ${accentClass[metric.accent || 'gold']}`}>
                    {metric.value}
                  </div>
                  <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-white/60">
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {children}
    </div>
  );
};

export default AlumniSectionShell;
