/** Spacing scale used by the Figma mobile frames (px). */
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 6,
  md: 8,
  ml: 10,
  lg: 12,
  xl: 14,
  xxl: 16,
  xxxl: 20,
  huge: 24,
  giant: 32,
} as const;

/** Corner radii from the Style Guide components. */
export const radii = {
  /** Status badge. */
  badge: 6,
  /** Buttons, inputs, inner tiles. */
  control: 8,
  /** Small stat tiles. */
  tile: 10,
  /** Banners, stat cards, empty state. */
  panel: 12,
  /** Mobile cards (trip card, queue job). */
  card: 14,
  /** Chips, count pills, avatars. */
  pill: 999,
  /** Chat bubble corner on the sender's side (Driver — Chat). */
  bubbleTail: 4,
} as const;

/** Fixed component sizes from Figma. */
export const sizes = {
  /** Minimum touch target. */
  touchTarget: 44,
  /** Avatar / round icon button. */
  avatar: 40,
  /** Small avatar / round icon button inside cards (call, chat). */
  iconButton: 36,
  /** Empty-state icon circle. */
  emptyIconCircle: 56,
  /** Bottom tab bar height, excluding the bottom safe area. */
  tabBar: 64,
  /** Primary button height on mobile. */
  button: 46,
  iconXs: 14,
  iconSm: 16,
  iconMd: 18,
  iconLg: 22,
  iconXl: 24,
  /** Border widths. */
  hairline: 1,
  /** Selected choice chip, dashed "Add photo" tile. */
  selectedBorder: 1.5,
  focusBorder: 2,
  /** Delivery photo tile (Driver — Proof of delivery). */
  photoTile: 112,
  /** Receiver signature pad height. */
  signaturePad: 132,
  /** Pen width inside the signature pad. */
  signatureStroke: 2.5,
  /** Minimum height of a multi-line text field (notes). */
  textArea: 88,
  /** Step circle on the trip progress card (Driver — Active trip). */
  progressDot: 20,
  /** Filled centre of the current step's circle. */
  progressDotCore: 8,
  /** Connector line between progress steps. */
  progressLine: 2,
  /** Text cursor next to the big odometer value. */
  odometerCursor: 30,
  /** Initials circle inside a chat participant chip. */
  chipAvatar: 26,
  /** Round Send button next to the chat composer. */
  sendButton: 40,
  /** Unread count pill on a chat room card. */
  countPill: 18,
  /** Tallest the chat composer grows before it scrolls. */
  composerMaxHeight: 100,
} as const;
