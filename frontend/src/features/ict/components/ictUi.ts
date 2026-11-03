/**
 * ASTU ICT Systems Directorate — Operations Console
 * Shared presentation tokens. Presentation ONLY: no data, no behaviour.
 *
 * Every module in the ICT portal composes from this file so the console reads
 * as one product. Radii are a deliberately compact enterprise scale:
 *   card 8px · tile 6px · chip/control 4px  (never pill-shaped)
 *
 * Surfaces use semantic CSS variables so Light + Dark share one component set.
 */

/* ── Surfaces ──────────────────────────────────────────────────────── */

export const ictCard =
  'ict-card';

export const ictCardPad = 'ict-card p-4 sm:p-5';

/** Inset panel used for grouped content inside a card */
export const ictTile =
  'ict-tile';

/** Recessed surface (code blocks, table headers, filter rows) */
export const ictInset =
  'ict-inset';

/** Surface for a selected / focused row */
export const ictSurfaceActive =
  'border-[var(--ict-accent)] bg-[var(--ict-accent-soft)]';

/* ── Typography ────────────────────────────────────────────────────── */

export const ictSectionTitle =
  'text-[10px] font-extrabold uppercase tracking-[0.08em] text-[var(--text-muted)]';

/** Small caps label used above fields, in table heads and metadata */
export const ictLabel =
  'text-[10px] font-bold uppercase tracking-[0.06em] text-[var(--text-muted)]';

/** Mono treatment for technical values: IDs, routes, IPs, latencies */
export const ictMono =
  'ict-mono ict-num text-[11px] leading-5';

/** Tabular figures for metrics */
export const ictNum = 'ict-num';

/* ── Buttons ───────────────────────────────────────────────────────── */

const ictBtnBase =
  'inline-flex select-none items-center justify-center gap-1.5 whitespace-nowrap font-bold transition-[background-color,border-color,color,box-shadow,transform] duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-45 cursor-pointer';

export const ictBtnPrimary = `${ictBtnBase} rounded-md bg-[var(--ict-accent)] px-3 py-1.5 text-xs text-white shadow-xs hover:bg-[var(--ict-accent-strong)] ict-focus`;

export const ictBtnSecondary = `${ictBtnBase} ict-tile ict-bg-transparent ict-hover-accent ict-hover-accent-soft rounded-md px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--ict-accent-text)] ict-focus`;

export const ictBtnDanger = `${ictBtnBase} rounded-md bg-[var(--ict-crit)] px-3 py-1.5 text-xs text-white shadow-xs hover:opacity-90 ict-focus`;

export const ictBtnSuccess = `${ictBtnBase} rounded-md bg-[var(--ict-ok)] px-3 py-1.5 text-xs text-white shadow-xs hover:opacity-90 ict-focus`;

export const ictBtnWarning = `${ictBtnBase} rounded-md bg-[var(--ict-warn)] px-3 py-1.5 text-xs text-[#0f1720] shadow-xs hover:opacity-90 ict-focus`;

export const ictBtnGhost = `${ictBtnBase} rounded-md px-2.5 py-1.5 text-xs text-[var(--text-muted)] hover:bg-[var(--bg-page)] hover:text-[var(--text-primary)] ict-focus`;

export const ictBtnDangerGhost = `${ictBtnBase} rounded-md px-2.5 py-1.5 text-xs text-[var(--ict-crit)] hover:bg-[var(--ict-crit-bg)] hover:text-[var(--ict-crit)] ict-focus`;

/** Compact button for dense table toolbars and row actions */
export const ictBtnXs = `${ictBtnBase} ict-tile ict-hover-accent ict-hover-accent-soft px-2 py-1 text-[11px] text-[var(--text-secondary)] hover:text-[var(--ict-accent-text)] ict-focus`;

/** Square icon-only button — always pair with an aria-label / title */
export const ictBtnIcon = `${ictBtnBase} ict-tile ict-hover-accent ict-hover-accent-soft h-7 w-7 rounded-md text-[var(--text-muted)] hover:text-[var(--ict-accent-text)] ict-focus`;

/** Small segmented control used for tabs and filters */
export const ictBtnSegment = `${ictBtnBase} rounded-[3px] px-2.5 py-1.5 text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] ict-focus`;

/* ── Form controls ─────────────────────────────────────────────────── */

export const ictInput =
  'ict-tile ict-bg-inset w-full rounded-md px-2.5 py-1.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-colors duration-150 ict-focus';

export const ictTextarea = `${ictInput} leading-relaxed`;

export const ictSelect = ictInput;

export const ictLabelField =
  'mb-1 block text-[10px] font-bold uppercase tracking-[0.06em] text-[var(--text-muted)]';

/* ── Tables ────────────────────────────────────────────────────────── */

export const ictTableWrap = 'ict-card overflow-hidden';

export const ictTable =
  'ict-table w-full min-w-[680px] border-collapse bg-[var(--ict-surface)] text-left text-xs';

export const ictTh =
  'ict-label bg-[var(--ict-surface-inset)] whitespace-nowrap border-b border-[var(--ict-hairline)] px-3 py-2.5 text-[var(--text-secondary)]';

export const ictTd =
  'border-b border-[var(--ict-hairline)] px-3 py-2.5 align-middle text-[var(--text-secondary)] last:border-b-0';

export const ictTrHover =
  'transition-colors duration-100 hover:bg-[var(--ict-accent-soft)]';

/** Wrapper that keeps wide operational tables usable on small screens */
export const ictTableScroll = 'ict-scroll w-full overflow-x-auto';

/** Table footer strip (pagination, record counts) */
export const ictTableFooter =
  'flex flex-wrap items-center justify-between gap-2 border-t border-[var(--ict-hairline)] bg-[var(--ict-surface-inset)] px-3 py-2 text-[11px] text-[var(--text-muted)]';

/* ── Tabs ──────────────────────────────────────────────────────────── */

export const ictTabList =
  'inline-flex flex-wrap items-center gap-0.5 rounded-[7px] border border-[var(--ict-hairline)] bg-[var(--ict-surface-inset)] p-0.5';

/** Soft selected state — light blue wash, not a filled dark button */
export const ictTabActive =
  'ict-btn-segment rounded-[5px] bg-[var(--ict-surface)] font-bold text-[var(--ict-accent-text)] shadow-sm ring-1 ring-inset ring-[var(--ict-accent)]/20 hover:text-[var(--ict-accent-text)]';

export const ictTabIdle = `${ictBtnSegment} rounded-[5px] hover:bg-[var(--ict-surface)]/80`;

/** Underline tab strip — used where tabs act as primary page navigation */
export const ictTabUnderlineList =
  'flex items-center gap-1 overflow-x-auto border-b border-[var(--ict-hairline)] ict-scroll';

export const ictTabUnderlineActive =
  'relative whitespace-nowrap px-3 py-2 text-xs font-bold text-[var(--ict-accent-text)] after:absolute after:inset-x-1.5 after:-bottom-px after:h-0.5 after:rounded-full after:bg-[var(--ict-accent)] ict-focus';

export const ictTabUnderlineIdle =
  'relative whitespace-nowrap rounded-none px-3 py-2 text-xs font-semibold text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)] after:absolute after:inset-x-1.5 after:-bottom-px after:h-0.5 after:rounded-full after:bg-transparent hover:after:bg-[var(--border-color)] ict-focus';

/* ── Status language ───────────────────────────────────────────────── */

/**
 * Canonical tone → colour set. One source of truth so HEALTHY/DEGRADED/DOWN
 * look identical in every module. Text always accompanies the colour.
 */
export const ictTone: Record<
  'success' | 'info' | 'warning' | 'danger' | 'neutral' | 'ai',
  { fg: string; bg: string; ring: string; dot: string }
> = {
  success: {
    fg: 'text-[var(--ict-ok)]',
    bg: 'bg-[var(--ict-ok-bg)]',
    ring: 'ring-[var(--ict-ok-line)]',
    dot: 'bg-[var(--ict-ok)]',
  },
  info: {
    fg: 'text-[var(--ict-info)]',
    bg: 'bg-[var(--ict-info-bg)]',
    ring: 'ring-[var(--ict-info-line)]',
    dot: 'bg-[var(--ict-info)]',
  },
  warning: {
    fg: 'text-[var(--ict-warn)]',
    bg: 'bg-[var(--ict-warn-bg)]',
    ring: 'ring-[var(--ict-warn-line)]',
    dot: 'bg-[var(--ict-warn)]',
  },
  danger: {
    fg: 'text-[var(--ict-crit)]',
    bg: 'bg-[var(--ict-crit-bg)]',
    ring: 'ring-[var(--ict-crit-line)]',
    dot: 'bg-[var(--ict-crit)]',
  },
  neutral: {
    fg: 'text-[var(--ict-mute)]',
    bg: 'bg-[var(--ict-mute-bg)]',
    ring: 'ring-[var(--ict-mute-line)]',
    dot: 'bg-[var(--ict-mute)]',
  },
  ai: {
    fg: 'text-[var(--ict-ai)]',
    bg: 'bg-[var(--ict-ai-bg)]',
    ring: 'ring-[var(--ict-ai-line)]',
    dot: 'bg-[var(--ict-ai)]',
  },
};

/** Badge shell — consistent sizing and casing across the whole console */
export const ictBadgeBase =
  'inline-flex max-w-full items-center gap-1.5 whitespace-nowrap rounded-[4px] px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.05em] ring-1 ring-inset';

/* ── Misc primitives ───────────────────────────────────────────────── */

/** Vertical status rail on the left edge of a card (down / degraded / ok) */
export const ictRailDanger =
  'before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:rounded-l-[8px] before:bg-[var(--ict-crit)]';
export const ictRailWarning =
  'before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:rounded-l-[8px] before:bg-[var(--ict-warn)]';
export const ictRailSuccess =
  'before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:rounded-l-[8px] before:bg-[var(--ict-ok)]';
export const ictRailInfo =
  'before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:rounded-l-[8px] before:bg-[var(--ict-info)]';

/** Terminal / JSON presentation */
export const ictCodeBlock =
  'ict-mono ict-scroll overflow-auto rounded-md border border-[var(--ict-hairline)] bg-[var(--ict-surface-inset)] p-3 text-[11px] leading-[1.65] text-[var(--text-secondary)]';

/** Meter track + fill (status distributions, rollout, capacity) */
export const ictMeterTrack =
  'ict-scroll flex h-1.5 w-full overflow-hidden rounded-full bg-[var(--ict-surface-inset)]';

/** Keyboard hint — looks like a physical keycap */
export const ictKbd =
  'ict-mono inline-flex items-center rounded-[4px] border border-[var(--ict-hairline)] bg-[var(--ict-surface-inset)] px-1.5 py-0.5 text-[10px] font-bold leading-none text-[var(--text-muted)] shadow-[inset_0_-1px_0_rgba(15,23,42,0.06)]';
