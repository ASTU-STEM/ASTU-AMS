/**
 * Shared ASTU Alumni dashboard UI tokens.
 * Prefer CSS variables so light/dark mode stay consistent across tabs.
 */

export const alumniLabelClass =
  'block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.12em] mb-1.5';

export const alumniFieldHintClass = 'mt-1 text-[11px] leading-relaxed text-[var(--text-muted)]';

export const alumniVerifiedBadgeClass =
  'inline-flex items-center gap-1 rounded-md border border-[var(--border-color)] bg-[var(--bg-card-secondary)] px-2 py-0.5 ' +
  'text-[10px] font-bold tracking-wide text-[var(--text-secondary)]';

export const alumniLockedInputClass =
  'opacity-80 cursor-not-allowed bg-[var(--bg-card-secondary)] border-dashed';

export const alumniInputClass =
  'w-full text-sm px-3.5 py-2.5 h-11 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl ' +
  'text-[var(--text-primary)] placeholder:text-[var(--text-muted)] ' +
  'focus:ring-2 focus:ring-[var(--brand-primary)]/25 focus:outline-none focus:border-[var(--brand-primary)] ' +
  'transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:bg-[var(--bg-card-secondary)]';

export const alumniTextareaClass = `${alumniInputClass} min-h-[96px] h-auto resize-y`;

export const alumniSelectClass =
  `${alumniInputClass} appearance-none pr-10 cursor-pointer bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394A3B8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")] bg-[length:1.1rem] bg-[right_0.75rem_center] bg-no-repeat`;

export const alumniCardClass =
  'rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs';

export const alumniPanelClass = `${alumniCardClass} p-5 sm:p-6`;

export const alumniSectionTitleClass =
  'text-lg font-bold tracking-tight text-[var(--text-primary)]';

export const alumniMutedClass = 'text-sm text-[var(--text-secondary)]';

export const alumniPrimaryBtnClass =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-bold text-white ' +
  'shadow-sm transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/30 disabled:opacity-60';

export const alumniSecondaryBtnClass =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] ' +
  'px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--bg-hover)]';

export const alumniGhostBtnClass =
  'inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ' +
  'text-[var(--text-secondary)] transition hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]';

export const alumniTableWrapClass =
  'overflow-x-auto rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs';

export const alumniTableClass = 'w-full min-w-[640px] text-left text-sm';

export const alumniThClass =
  'px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--text-secondary)] ' +
  'bg-[var(--bg-card-secondary)] border-b border-[var(--border-color)] whitespace-nowrap';

export const alumniTdClass =
  'px-4 py-3.5 border-b border-[var(--border-color)] text-[var(--text-primary)] align-middle';

export const alumniBadgeBase =
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide border';

export const alumniStatusBadge = {
  success: `${alumniBadgeBase} bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-[#0F3323] dark:text-[#4ADE80] dark:border-[#166534]`,
  warning: `${alumniBadgeBase} bg-amber-50 text-amber-700 border-amber-200 dark:bg-[#3D2808] dark:text-[#FBBF24] dark:border-[#78350F]`,
  danger: `${alumniBadgeBase} bg-rose-50 text-rose-700 border-rose-200 dark:bg-[#3B1A22] dark:text-[#F87171] dark:border-[#71313A]`,
  info: `${alumniBadgeBase} bg-blue-50 text-blue-700 border-blue-200 dark:bg-[#0E2A47] dark:text-[#38BDF8] dark:border-[#1E40AF]`,
  neutral: `${alumniBadgeBase} bg-[var(--bg-card-secondary)] text-[var(--text-secondary)] border-[var(--border-color)]`,
  brand: `${alumniBadgeBase} bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] border-[var(--brand-primary)]/25`,
} as const;

export const alumniFilterBarClass =
  'rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 sm:p-5 shadow-xs space-y-3 sm:space-y-4';

export const alumniTabRailClass =
  'flex p-1.5 gap-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs overflow-x-auto';

export const alumniTabBtn = (active: boolean) =>
  `flex-1 min-w-[7rem] py-2.5 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]/40 ${
    active
      ? 'bg-[var(--brand-primary)] text-white shadow-md'
      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
  }`;

export const alumniPageClass = 'space-y-6 sm:space-y-8 text-[var(--text-primary)]';
