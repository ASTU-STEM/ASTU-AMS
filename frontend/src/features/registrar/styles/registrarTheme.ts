/**
 * ASTU-AMS Registrar Management Hub — Dark Design System Tokens
 * Keep in sync with frontend/src/theme/enterpriseTheme.ts and global.css.
 */

import { enterpriseTheme } from '../../../theme/enterpriseTheme';

export const registrarTheme = {
  colors: {
    ...enterpriseTheme.colors,
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
  },
} as const;

export default registrarTheme;
