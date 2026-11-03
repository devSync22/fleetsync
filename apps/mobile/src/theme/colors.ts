/**
 * FleetSync colour tokens — Figma "FMS Colours" (Style Guide → FMS — Design System v2).
 * These are the only colours allowed in the app. Light theme only.
 */
export const colors = {
  background: '#F4F5F7',
  surface: '#FFFFFF',
  border: '#E3E6EB',
  line: '#D1D5DB',
  text: '#111827',
  muted: '#6B7280',
  faint: '#9CA3AF',
  accent: '#4F46E5',
  accentSoft: '#E0E7FF',
  greySoft: '#F3F4F6',
  pending: '#B45309',
  pendingSoft: '#FEF3C7',
  info: '#1D4ED8',
  infoSoft: '#DBEAFE',
  success: '#15803D',
  successSoft: '#DCFCE7',
  danger: '#B91C1C',
  dangerSoft: '#FEE2E2',
} as const;

/** Colours used only inside the FleetSync logo / wordmark — never as UI colours. */
export const logoColors = {
  sync: '#217A3E',
} as const;

export type ColorToken = keyof typeof colors;

/** The six status tones from the Figma "Status colour map". */
export type Tone = 'neutral' | 'pending' | 'accent' | 'info' | 'success' | 'danger';

/** Strong colour (label/icon) and soft colour (background) for each tone. */
export const toneColors: Record<Tone, { strong: string; soft: string }> = {
  neutral: { strong: colors.text, soft: colors.greySoft },
  pending: { strong: colors.pending, soft: colors.pendingSoft },
  accent: { strong: colors.accent, soft: colors.accentSoft },
  info: { strong: colors.info, soft: colors.infoSoft },
  success: { strong: colors.success, soft: colors.successSoft },
  danger: { strong: colors.danger, soft: colors.dangerSoft },
};
