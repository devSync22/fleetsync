import { CircleCheck, CircleX, Info, TriangleAlert, type LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { radii, sizes, spacing, toneColors, typography } from '@/theme';

type BannerTone = 'danger' | 'pending' | 'info' | 'success';

type InfoBannerProps = {
  title: string;
  message?: string;
  tone?: BannerTone;
  /** Replaces the tone's default icon (e.g. a clock for the late-start banner). */
  icon?: LucideIcon;
  /**
   * md = form/system banners (14 px title, body-colour message);
   * sm = compact in-screen notice, both lines in the tone colour (Driver — Home late-start banner).
   */
  size?: 'md' | 'sm';
};

const toneIcons: Record<BannerTone, LucideIcon> = {
  danger: CircleX,
  pending: TriangleAlert,
  info: Info,
  success: CircleCheck,
};

/** Inline error / warning / info / success message (Style Guide → Banner). */
export function InfoBanner({ title, message, tone = 'info', icon, size = 'md' }: InfoBannerProps) {
  const { strong, soft } = toneColors[tone];
  const Icon = icon ?? toneIcons[tone];
  const isSmall = size === 'sm';

  return (
    <View
      style={[styles.banner, isSmall && styles.small, { backgroundColor: soft }]}
      accessibilityRole={tone === 'danger' ? 'alert' : undefined}>
      <View style={styles.icon}>
        <Icon size={sizes.iconMd} color={strong} />
      </View>
      <View style={styles.text}>
        <Text style={[isSmall ? typography.bodySmallStrong : typography.bodyStrong, { color: strong }]}>{title}</Text>
        {message ? (
          <Text style={isSmall ? [typography.caption, { color: strong }] : typography.bodySmall}>{message}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xl,
    borderRadius: radii.panel,
    alignSelf: 'stretch',
  },
  small: {
    gap: spacing.ml,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  icon: {
    paddingTop: 1,
  },
  text: {
    flex: 1,
    gap: spacing.xxs,
  },
});

export type { BannerTone };
