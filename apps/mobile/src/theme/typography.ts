import type { TextStyle } from 'react-native';

import { colors } from './colors';

/**
 * Font family names as registered by `useFonts` in `src/app/_layout.tsx`.
 * React Native can't synthesise weights from one file, so every weight is its own family.
 */
export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  mono: 'JetBrainsMono_400Regular',
  monoMedium: 'JetBrainsMono_500Medium',
} as const;

/** Font sizes used in the Figma mobile frames. */
export const fontSizes = {
  /** File-type tile label ("PDF"). */
  tag: 9,
  xxs: 10,
  xs: 11,
  sm: 12,
  md: 13,
  base: 14,
  /** Option card titles ("Driver", "Mechanic"). */
  option: 15,
  lg: 16,
  xl: 18,
  xxl: 20,
  display: 22,
  title: 24,
  headline: 26,
  hero: 28,
} as const;

/**
 * Text styles from the Figma type scale and the mobile frames
 * (Driver — Home, Mechanic — Queue, Trip details app bar).
 */
export const typography = {
  /** Screen greeting / title — "Good morning, Kasun", "Maintenance queue". */
  screenTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.display,
    lineHeight: 28,
    letterSpacing: -0.22,
    color: colors.text,
  },
  /** Large page title on auth screens — "Sign in". */
  hero: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.hero,
    lineHeight: 34,
    letterSpacing: -0.28,
    color: colors.text,
  },
  /** Centered result title — "Request sent". */
  headline: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.headline,
    lineHeight: 32,
    letterSpacing: -0.26,
    color: colors.text,
  },
  /** Title next to a result icon — "Request approved". */
  title: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.title,
    lineHeight: 30,
    color: colors.text,
  },
  /** Big number on a stat tile — "2 Driver issues". */
  statValue: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.xxl,
    color: colors.text,
  },
  /** App bar / header title — "Proof of delivery". */
  headerTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.xl,
    color: colors.text,
  },
  /** Card title — "Colombo Pharma, Colombo 10". */
  cardTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.lg,
    lineHeight: 24,
    color: colors.text,
  },
  /** Body text. */
  body: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.base,
    lineHeight: 22,
    color: colors.text,
  },
  /** Emphasised body — list item titles, stop names. */
  bodyStrong: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.base,
    color: colors.text,
  },
  /** Small body — banner and empty-state messages. */
  bodySmall: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.md,
    lineHeight: 20,
    color: colors.text,
  },
  /** Form label — "Vehicle number". */
  label: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.md,
    lineHeight: 20,
    color: colors.text,
  },
  /** Caption / metadata — "Monday, 19 Oct · DRV-014". */
  caption: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    lineHeight: 16,
    color: colors.muted,
  },
  /** Section label — "TODAY", "UPCOMING". Render the text in uppercase. */
  sectionLabel: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.xs,
    letterSpacing: 0.66,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  /** Inline text link — "Forgot password?", "Sign in". */
  link: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.md,
    color: colors.accent,
  },
  /** Smallest metadata — step dates "17 Oct". */
  tiny: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.xxs,
    color: colors.muted,
  },
  /** Tiny field label inside tiles — "Pickup", "Vehicle". */
  micro: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.xs,
    color: colors.muted,
  },
  /** Bottom tab label (colour is set by the tab bar). */
  tabLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.xs,
  },
  /** Status badge label. */
  badge: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.sm,
    lineHeight: 16,
  },
  /** Button label. */
  button: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.base,
    lineHeight: 20,
  },
  /** Chip label. */
  chip: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.md,
  },
  /** Avatar initials. */
  avatar: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.base,
    color: colors.accent,
  },
  /** Data / mono — "WP LB-7702", "09:30". */
  mono: {
    fontFamily: fonts.monoMedium,
    fontSize: fontSizes.md,
    color: colors.text,
  },
  /** Mono for IDs in titles — "TRP-2208". */
  monoLarge: {
    fontFamily: fonts.monoMedium,
    fontSize: fontSizes.lg,
    color: colors.text,
  },
  /** Mono value typed into a text field. */
  monoInput: {
    fontFamily: fonts.mono,
    fontSize: fontSizes.base,
    color: colors.text,
  },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
