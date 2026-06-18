import React from 'react';
import { ChevronRight, Home, Sparkles } from 'lucide-react';
import type { AdminPageHeaderProps } from '../types/admin.types';

export default function AdminPageHeader({
  title,
  subtitle,
  breadcrumb = [],
  breadcrumbs = [],
  actions,
  className = '',
}: AdminPageHeaderProps) {
  const items = breadcrumbs.length > 0 ? breadcrumbs : breadcrumb;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-8 ${className}`}
      style={{
        background: 'linear-gradient(135deg, #001f4d 0%, #003580 50%, #00508a 100%)',
        boxShadow: '0 12px 48px rgba(0,53,128,0.40)',
      }}
    >
      {/* Green glow top-right */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 85% -5%, rgba(29,158,117,0.30), transparent)' }}
      />
      {/* Gold glow bottom-left */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 50% 70% at -5% 70%, rgba(232,160,32,0.12), transparent)' }}
      />
      {/* Subtle light sheen */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 45%)' }}
      />
      {/* Glowing orbs */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(29,158,117,0.18)' }} />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(232,160,32,0.10)' }} />
      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3 min-w-0">
          {/* Badge + breadcrumb row */}
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
              style={{
                color: '#ffffff',
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.22)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Sparkles className="h-3 w-3" style={{ color: '#E8A020' }} />
              CMS
            </span>
            {items.length > 0 && (
              <nav className="flex flex-wrap items-center gap-1" aria-label="Breadcrumb">
                <a
                  href="/cms/dashboard"
                  className="inline-flex items-center gap-1 transition-opacity hover:opacity-100"
                  style={{ color: 'rgba(255,255,255,0.55)' }}
                >
                  <Home className="h-3 w-3" />
                </a>
                {items.map((item, index) => (
                  <React.Fragment key={`${item.label}-${index}`}>
                    <ChevronRight className="h-3 w-3" style={{ color: 'rgba(255,255,255,0.28)' }} />
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-[11px] font-semibold transition-opacity hover:opacity-100"
                        style={{ color: 'rgba(255,255,255,0.65)' }}
                      >
                        {item.label}
                      </a>
                    ) : (
                      <span className="text-[11px] font-bold" style={{ color: 'rgba(255,255,255,0.88)' }}>
                        {item.label}
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </nav>
            )}
          </div>

          {/* Title + subtitle */}
          <div>
            <h1
              className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight"
              style={{
                color: '#ffffff',
                textShadow: '0 2px 12px rgba(0,0,0,0.35)',
              }}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                className="mt-2 max-w-2xl text-sm leading-relaxed font-medium"
                style={{ color: 'rgba(255,255,255,0.80)' }}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
