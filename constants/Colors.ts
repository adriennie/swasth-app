const primary = '#1d4ed8'; // A deep, trustworthy blue
const primaryMuted = '#3b82f6'; // A slightly lighter blue for accents
const background = '#f1f5f9'; // A very light gray for backgrounds (slate-100)
const surface = '#ffffff'; // White for card backgrounds, etc.
const textPrimary = '#1e293b'; // A dark slate for primary text (slate-800)
const textSecondary = '#64748b'; // A lighter slate for secondary text (slate-500)
const iconDefault = '#94a3b8'; // A medium slate for icons (slate-400)
const success = '#16a34a'; // Green for success states
const warning = '#f97316'; // Orange for warnings
const error = '#dc2626'; // Red for errors

export const Colors = {
  light: {
    text: textPrimary,
    background: background,
    tint: primary,
    icon: iconDefault,
    tabIconDefault: iconDefault,
    tabIconSelected: primary,
    primary: primary,
    primaryMuted: primaryMuted,
    surface: surface,
    textSecondary: textSecondary,
    success: success,
    warning: warning,
    error: error,
  },
  dark: {
    text: '#F8FAFC',
    background: '#0B1020',
    tint: '#FF6BBA', // Keeping the old dark theme for now
    icon: '#A8B1C7',
    tabIconDefault: '#A8B1C7',
    tabIconSelected: '#FF6BBA',
    primary: primary,
    primaryMuted: primaryMuted,
    surface: '#1e293b',
    textSecondary: '#94a3b8',
    success: success,
    warning: warning,
    error: error,
  },
};
