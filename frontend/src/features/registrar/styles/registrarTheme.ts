/**
 * ASTU-AMS Registrar Management Hub — Dark Design System Tokens
 * Strict enterprise-level color system for maximum visibility, high contrast,
 * and professional dark UI/UX.
 */

export const registrarTheme = {
  colors: {
    // Layout Backgrounds
    appBg: '#0B0F19',
    sidebarBg: '#080D18',
    topNavBg: '#101725',
    panelBg: '#151D2B',
    secondaryPanelBg: '#1B2636',

    // Table Surfaces
    tableBg: '#141D2B',
    tableAltBg: '#172131',
    tableHoverBg: '#202E40',
    tableHeaderBg: '#1B2636',

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
    errorRed: '#F87171',

    // Structural Borders
    border: '#2A3749',
    borderLight: '#37475E',

    // Validation Alert Box
    valAlert: {
      bg: '#29171D',
      border: '#71313A',
      heading: '#FCA5A5',
      text: '#F1D5D8',
      entryBg: '#361B24',
      badgeBg: '#4D1B24',
      badgeText: '#FCA5A5',
    },

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
    },
  },
} as const;

export default registrarTheme;
