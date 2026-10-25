// Swasthya design tokens. See docs/ui_design_system.md.
// The base lavender and teal fail WCAG AA for body text, so text uses the *Text variants.
export const Palette = {
  lavender: '#8B75C9', // Brand accent: fills, large text, icons
  lavenderText: '#6B55A8', // Primary actions and lavender text (6.0:1 on white)
  lavenderDeep: '#4F3D85', // Pressed states and dark accents
  lavenderBorder: '#DCD3F0',
  lavenderSoft: '#F1EDFA', // Tinted surfaces and chips
  blush: '#F3C6D4', // Decorative only, never text
  blushSoft: '#FBEFF3',
  canvas: '#FAF8FC', // App background
  teal: '#3B9B92', // Operational accent: fills, icons
  tealText: '#2A7A73', // Teal text (5.1:1 on white)
  tealDeep: '#1F5C57',
  tealBorder: '#BFE3DE',
  tealSoft: '#E6F4F2',
  ink: '#292638', // Primary text
  surface: '#FFFFFF',
  navy: '#141226', // Dark theme background
  navySurface: '#211E38',
};

const textSecondary = '#64748b'; // A lighter slate for secondary text (slate-500)
const iconDefault = '#94a3b8'; // A medium slate for icons (slate-400)
const success = '#16a34a'; // Green for success states
const warning = '#f97316'; // Orange for warnings
const error = '#dc2626'; // Red for errors

export const Colors = {
  light: {
    text: Palette.ink,
    background: Palette.canvas,
    tint: Palette.lavenderText,
    icon: iconDefault,
    tabIconDefault: iconDefault,
    tabIconSelected: Palette.lavenderText,
    primary: Palette.lavenderText,
    primaryMuted: Palette.lavender,
    accent: Palette.tealText,
    surface: Palette.surface,
    textSecondary: textSecondary,
    success: success,
    warning: warning,
    error: error,
  },
  dark: {
    text: '#F4F2FA',
    background: Palette.navy,
    tint: '#B9A8E6',
    icon: '#A8A4BF',
    tabIconDefault: '#A8A4BF',
    tabIconSelected: '#B9A8E6',
    primary: '#B9A8E6',
    primaryMuted: Palette.lavender,
    accent: '#6CC3BA',
    surface: Palette.navySurface,
    textSecondary: '#A8A4BF',
    success: success,
    warning: warning,
    error: error,
  },
};

// Card radius: rounded for consumer screens, tighter for operational dashboards.
export const Radii = {
  consumer: 20,
  operational: 12,
} as const;
