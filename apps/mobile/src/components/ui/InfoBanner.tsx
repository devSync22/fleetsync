import { CircleCheck, CircleX, Info, TriangleAlert, type LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { radii, sizes, spacing, toneColors, typography } from '@/theme';

type BannerTone = 'danger' | 'pending' | 'info' | 'success';

type InfoBannerProps = {
  title: string;
  message?: string;
  tone?: BannerTone;
};

const toneIcons: Record<BannerTone, LucideIcon> = {
  danger: CircleX,
  pending: TriangleAlert,
  info: Info,
  success: CircleCheck,
};

/** Inline error / warning / info / success message (Style Guide → Banner). */
export function InfoBanner({ title, message, tone = 'info' }: InfoBannerProps) {
  const { strong, soft } = toneColors[tone];
  const Icon = toneIcons[tone];

  return (
    <View
      style={[styles.banner, { backgroundColor: soft }]}
      accessibilityRole={tone === 'danger' ? 'alert' : undefined}>
      <View style={styles.icon}>
        <Icon size={sizes.iconMd} color={strong} />
      </View>
      <View style={styles.text}>
        <Text style={[typography.bodyStrong, { color: strong }]}>{title}</Text>
        {message ? <Text style={typography.bodySmall}>{message}</Text> : null}
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
  icon: {
    paddingTop: 1,
  },
  text: {
    flex: 1,
    gap: spacing.xxs,
  },
});

export type { BannerTone };
