/**
 * Shared ASTU Alumni dashboard UI tokens.
 * Prefer CSS variables so light/dark mode stay consistent across tabs.
 */

export const alumniLabelClass =
  'block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.12em] mb-1.5';

export const alumniFieldHintClass = 'mt-1 text-[11px] leading-relaxed text-[var(--text-muted)]';

export const alumniVerifiedBadgeClass =
  'inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 ' +
  'text-[10px] font-bold tracking-wide text-slate-600 ' +
  'dark:border-white/10 dark:bg-white/5 dark:text-slate-300';

export const alumniLockedInputClass =
  'opacity-80 cursor-not-allowed bg-slate-50 dark:bg-slate-800/50 border-dashed';

export const alumniInputClass =
  'w-full text-sm px-3.5 py-2.5 bg-[var(--bg-page)] border border-[var(--border-color)] rounded-xl ' +
  'text-[var(--text-primary)] placeholder:text-[var(--text-muted)] ' +
  'focus:ring-2 focus:ring-[#003366]/20 focus:outline-none focus:border-[#003366] focus:bg-[var(--bg-card)] ' +
  'transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-800/60';

export const alumniTextareaClass = `${alumniInputClass} min-h-[96px] resize-y`;

export const alumniSelectClass = alumniInputClass;

export const alumniCardClass =
  'rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs';

export const alumniPanelClass = `${alumniCardClass} p-5 sm:p-6`;

export const alumniSectionTitleClass =
  'text-lg font-bold tracking-tight text-[var(--text-primary)]';

export const alumniMutedClass = 'text-sm text-[var(--text-secondary)]';

export const alumniPrimaryBtnClass =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-[#003366] px-4 py-2.5 text-sm font-bold text-white ' +
  'shadow-sm transition hover:bg-[#002244] focus:outline-none focus:ring-2 focus:ring-[#003366]/30 disabled:opacity-60';

export const alumniSecondaryBtnClass =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] ' +
  'px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-black/5 dark:hover:bg-white/5';

export const alumniGhostBtnClass =
  'inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ' +
  'text-[var(--text-secondary)] transition hover:bg-black/5 hover:text-[var(--text-primary)] dark:hover:bg-white/5';

export const alumniTableWrapClass =
  'overflow-x-auto rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs';

export const alumniTableClass = 'w-full min-w-[640px] text-left text-sm';

export const alumniThClass =
  'px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--text-secondary)] ' +
  'bg-[var(--bg-page)] border-b border-[var(--border-color)] whitespace-nowrap';

export const alumniTdClass =
  'px-4 py-3.5 border-b border-[var(--border-color)] text-[var(--text-primary)] align-middle';

export const alumniBadgeBase =
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide border';

export const alumniStatusBadge = {
  success: `${alumniBadgeBase} bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20`,
  warning: `${alumniBadgeBase} bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20`,
  danger: `${alumniBadgeBase} bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20`,
  info: `${alumniBadgeBase} bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20`,
  neutral: `${alumniBadgeBase} bg-slate-100 text-slate-600 border-slate-200 dark:bg-white/5 dark:text-slate-300 dark:border-white/10`,
  brand: `${alumniBadgeBase} bg-[#003366]/10 text-[#003366] border-[#003366]/20 dark:bg-[#003366]/30 dark:text-[#FFD700] dark:border-[#FFCC00]/20`,
} as const;

export const alumniFilterBarClass =
  'rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 sm:p-5 shadow-xs space-y-3 sm:space-y-4';

export const alumniTabRailClass =
  'flex p-1.5 gap-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs overflow-x-auto';

export const alumniTabBtn = (active: boolean) =>
  `flex-1 min-w-[7rem] py-2.5 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
    active
      ? 'bg-[#003366] text-white shadow-md'
      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5'
  }`;

export const alumniPageClass = 'space-y-6 sm:space-y-8 text-[var(--text-primary)]';
