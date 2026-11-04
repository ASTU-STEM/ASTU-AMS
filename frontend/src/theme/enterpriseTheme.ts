/**
 * ASTU-AMS Enterprise Dark Design System Tokens
 * Unified design system across all 5 actors:
 * 1. Registrar
 * 2. Alumni
 * 3. Employer
 * 4. Department Head
 * 5. Admin / Super Admin
 *
 * Hex values mirror CSS vars in global.css (.dark). Prefer var(--*) in
 * components so light/dark both work; these constants are for JS/charts.
 */

export const enterpriseTheme = {
  colors: {
    // Layout Surfaces (official ASTU-AMS dark palette)
    appBg: '#0B0F19',
    chromeBg: '#101725',
    sidebarBg: '#080D18',
    topNavBg: '#101725',
    panelBg: '#151D2B',
    secondaryPanelBg: '#1B2636',

    // Table & List Surfaces
    tableBg: '#151D2B',
    tableAltBg: '#1B2636',
    tableHoverBg: '#1B2636',
    tableHeaderBg: '#101725',

    // Text & Typography
    textPrimary: '#F1F5F9',
    textSecondary: '#B0BDCE',
    textMuted: '#8493A8',

    // Semantic Accents
    primaryBlue: '#2196F3',
    primaryBlueHover: '#1E88E5',
    cyanAccent: '#22D3EE',
    successGreen: '#22C55E',
    warningAmber: '#F59E0B',
    errorRed: '#EF4444',

    // Structural Borders
    border: '#2A3749',
    borderLight: '#37475E',

    // Status Badges
    badges: {
      duplicate: {
        bg: '#3B1A22',
        text: '#F87171',
        border: '#71313A',
      },
      valid: {
        bg: '#0F3323',
        text: '#4ADE80',
        border: '#166534',
      },
      warning: {
        bg: '#3D2808',
        text: '#FBBF24',
        border: '#78350F',
      },
      pending: {
        bg: '#0E2A47',
        text: '#38BDF8',
        border: '#1E40AF',
      },
      neutral: {
        bg: '#1B2636',
        text: '#B0BDCE',
        border: '#2A3749',
      },
    },
  },
  classes: {
    appShell:
      "min-h-screen bg-[var(--bg-page)] font-['Inter',sans-serif] text-[var(--text-primary)] antialiased",
    // sidebar + topNav both resolve to --bg-chrome via CSS vars
    sidebar: 'bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] text-[var(--text-primary)]',
    topNav: 'bg-[var(--bg-navbar)] border-b border-[var(--border-color)] text-[var(--text-primary)]',
    chrome: 'bg-[var(--bg-chrome)] border-[var(--border-color)] text-[var(--text-primary)]',
    card: 'bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-sm text-[var(--text-primary)]',
    cardSecondary:
      'bg-[var(--bg-card-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)]',
    searchInput:
      'w-full pl-10 pr-4 py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors',
    navItemActive: 'bg-[var(--brand-primary)] text-white font-bold shadow-md',
    navItemInactive:
      'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors',
    iconContainerActive: 'bg-white/20 text-white',
    iconContainerInactive:
      'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--accent-cyan)] group-hover:text-white group-hover:border-[var(--brand-primary)]',
  },
} as const;

export default enterpriseTheme;
