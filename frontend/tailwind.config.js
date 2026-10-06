/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'on-secondary-container': '#fffbff',
        'surface-container-high': '#e6e8ea',
        'on-tertiary-fixed': '#00210b',
        'tertiary-fixed-dim': '#6cdd8a',
        'on-primary-container': '#8da9e5',
        'on-secondary-fixed': '#410002',
        'on-error-container': '#93000a',
        'on-primary': '#ffffff',
        'primary-fixed': '#d8e2ff',
        error: '#ba1a1a',
        'surface-tint': '#415e95',
        'on-secondary-fixed-variant': '#93000d',
        'tertiary-container': '#004920',
        surface: '#f7f9fb',
        secondary: '#bb0014',
        'tertiary-fixed': '#89faa4',
        'on-tertiary-container': '#4ebf70',
        'on-primary-fixed-variant': '#27467b',
        'inverse-on-surface': '#eff1f3',
        'surface-variant': '#e0e3e5',
        'on-background': '#191c1e',
        'astu-green': '#008C44',
        'surface-bright': '#f7f9fb',
        'inverse-primary': '#adc6ff',
        'surface-container-lowest': '#ffffff',
        'inverse-surface': '#2d3133',
        primary: '#002759',
        'on-surface-variant': '#43474f',
        'astu-blue-light': '#4B74B4',
        'on-primary-fixed': '#001a41',
        'primary-container': '#003366',
        'secondary-fixed': '#ffdad6',
        'surface-container-highest': '#e0e3e5',
        'on-tertiary-fixed-variant': '#005225',
        'on-error': '#ffffff',
        outline: '#747780',
        'surface-dim': '#d8dadc',
        'on-tertiary': '#ffffff',
        'surface-container-low': '#f2f4f6',
        'astu-navy': '#003366',
        'on-surface': '#191c1e',
        'surface-container': '#eceef0',
        'secondary-fixed-dim': '#ffb4ab',
        background: '#f7f9fb',
        'secondary-container': '#e41f25',
        'error-container': '#ffdad6',
        'on-secondary': '#ffffff',
        'primary-fixed-dim': '#adc6ff',
        'outline-variant': '#c4c6d1',
        'astu-red': '#E31E24',
        tertiary: '#003013',
        // Tailwind's gray/slate scales jump 200 -> 300, but the codebase uses
        // in-between tints for dividers and table rules. Without these the
        // class compiles to nothing and the divider silently disappears.
        gray: { 150: '#d7dce3', 250: '#c3c8d1' },
        slate: { 250: '#cbd5e1' }
      },
      // `shadow-xs` and `shadow-2xs` do not exist in Tailwind 3's default
      // scale (they arrived in v4). The codebase relies on them for every card
      // elevation, and dark-mode.css overrides `.shadow-xs` for dark mode, so
      // both need real values.
      boxShadow: {
        '2xs': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
      },
      borderWidth: {
        3: '3px'
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        xs: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
        full: '0.75rem'
      },
      spacing: {
        gutter: '24px',
        base: '8px',
        'container-max': '1280px',
        'margin-mobile': '16px',
        'margin-desktop': '40px',
        // h-4.5 / w-4.5 are used by every icon toggle; the default scale has
        // no half-steps so these compiled to nothing.
        '4.5': '1.125rem'
      },
      fontFamily: {
        'body-lg': ['Hanken Grotesk'],
        'label-sm': ['JetBrains Mono'],
        'headline-md': ['Hanken Grotesk'],
        'headline-lg': ['Hanken Grotesk'],
        'headline-lg-mobile': ['Hanken Grotesk'],
        'display-lg': ['Hanken Grotesk'],
        'body-md': ['Hanken Grotesk'],
        'label-md': ['JetBrains Mono']
      },
      fontSize: {
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'label-sm': ['12px', { lineHeight: '16px', fontWeight: '500' }],
        'headline-md': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'headline-lg': ['32px', { lineHeight: '40px', fontWeight: '600' }],
        'headline-lg-mobile': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'display-lg': ['48px', { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'label-md': ['14px', { lineHeight: '20px', letterSpacing: '0.01em', fontWeight: '500' }]
      }
    }
  }
};