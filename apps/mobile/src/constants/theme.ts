/**
 * FleetSync design tokens, mirrored from the Figma variables (same values as
 * the web app's src/styles/tokens.css). The app is light-mode only for now,
 * because the mobile designs only have a light theme.
 */
export const Colors = {
  textDefault: '#111827',
  textMuted: '#6b7280',
  textFaint: '#9ca3af',

  surface: '#ffffff',
  /** Subtle grey fill (cards, document rows). */
  background: '#f4f5f7',
  border: '#e3e6eb',
  line: '#d1d5db',

  accent: '#4f46e5',
  accentSoft: '#e0e7ff',
  /** Dark green used for "Sync" in the wordmark on light backgrounds. */
  brandGreenDark: '#217a3e',

  danger: '#b91c1c',
  dangerSoft: '#fee2e2',
  info: '#1d4ed8',
  infoSoft: '#dbeafe',
  success: '#15803d',
  successSoft: '#dcfce7',
} as const

/**
 * Font family names registered in src/app/_layout.tsx. React Native picks a
 * weight by family name (not `fontWeight`), so each weight is its own family.
 */
export const Fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  /** For IDs and codes such as "APP-2026-0118" or "DRV-036". */
  mono: 'JetBrainsMono_500Medium',
} as const

export const Radius = {
  sm: 4,
  md: 8,
  lg: 10,
  xl: 12,
  xxl: 14,
} as const

/** Horizontal padding of every screen body in the designs. */
export const ScreenPadding = 24
