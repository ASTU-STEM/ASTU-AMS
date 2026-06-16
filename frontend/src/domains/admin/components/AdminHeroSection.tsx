import React from 'react';

interface AdminHeroSectionProps {
  category: string;
  title: string;
  description: string;
  gradientFrom?: string;
  gradientTo?: string;
  accentColor?: string;
}

export default function AdminHeroSection({
  category,
  title,
  description,
  gradientFrom = '#003580',
  gradientTo = '#1D9E75',
  accentColor = '#FFD700',
}: AdminHeroSectionProps) {
  return (
    <section className="space-y-6 p-4 md:p-6">
      <div className="relative overflow-hidden rounded-[20px] border border-[var(--border-color)] bg-[linear-gradient(135deg,var(--hero-from),var(--hero-to)_right)] p-5 text-white md:p-6"
        style={{
          '--hero-from': gradientFrom,
          '--hero-to': gradientTo,
        } as React.CSSProperties}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full -translate-y-1/3 -translate-x-1/4"
          style={{ backgroundColor: `${accentColor}10` }} />
        <div className="relative z-10 max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">{category}</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/85">{description}</p>
        </div>
      </div>
    </section>
  );
}
