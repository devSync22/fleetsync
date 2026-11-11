import { Image, type ImageSource } from 'expo-image'

type IconProps = {
  /** A local SVG from assets/icons, e.g. require('@/assets/icons/back.svg'). */
  source: ImageSource | number
  size: number
  /**
   * Recolours the icon (e.g. grey vs accent for selected states). Each SVG
   * already has its Figma colour, so only pass this when it must change.
   */
  tintColor?: string
}

/** Decorative icon from the Figma exports, rendered with expo-image (supports SVG). */
export function Icon({ source, size, tintColor }: IconProps) {
  return (
    <Image
      source={source}
      style={{ width: size, height: size }}
      contentFit="contain"
      tintColor={tintColor}
      // Icons are decorative; the text next to them carries the meaning.
      accessible={false}
    />
  )
}
