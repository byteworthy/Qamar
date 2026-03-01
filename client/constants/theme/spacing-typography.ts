import { Platform, PixelRatio } from "react-native";

// ----------------------------------------------------------------------------
// SPACING TOKENS
// ----------------------------------------------------------------------------

export const Spacing = {
  // Base scale
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  "6xl": 64,

  // Component-specific
  inputHeight: 52,
  buttonHeight: 56,

  // Layout (migrated from layout.ts)
  screenPadding: 16,
  cardPadding: 14,

  // Vertical rhythm
  sectionGap: 24,
  itemGap: 12,
};

// ----------------------------------------------------------------------------
// COMPONENT PADDING TOKENS (standardized internal padding)
// ----------------------------------------------------------------------------

/**
 * ComponentPadding: Standardized internal padding for UI components
 * These ensure visual consistency across the app without hardcoding values.
 *
 * MIGRATION GUIDE:
 * Replace hardcoded padding values with ComponentPadding tokens:
 *
 * Before: padding: 16
 * After:  padding: ComponentPadding.card.all
 *
 * Before: paddingHorizontal: 24
 * After:  paddingHorizontal: ComponentPadding.button.horizontal
 *
 * Before: padding: Spacing.lg (in component, not theme)
 * After:  padding: ComponentPadding.input.all
 *
 * Components to migrate (future work):
 * - ExitConfirmationModal.tsx -> ComponentPadding.modal
 * - HistoryScreen list items -> ComponentPadding.listItem
 * - ThoughtCaptureScreen inputs -> ComponentPadding.input
 *
 * @see Button.tsx, GlassCard.tsx for reference implementations
 *
 * Usage: import { ComponentPadding } from '@/constants/theme';
 * Example: padding: ComponentPadding.button.horizontal
 */
export const ComponentPadding = {
  // Button padding (derived from Button.tsx line 145)
  button: {
    horizontal: Spacing["2xl"], // 24 - matches existing Button.tsx
    vertical: Spacing.lg, // 16 - implicit via buttonHeight
  },

  // Card padding (derived from GlassCard.tsx)
  card: {
    all: Spacing.lg, // 16 - matches existing GlassCard.tsx
    horizontal: Spacing.lg, // 16
    vertical: Spacing.lg, // 16
  },

  // Input padding (for AnimatedInput and similar components)
  input: {
    horizontal: Spacing.lg, // 16
    vertical: Spacing.md, // 12
    all: Spacing.lg, // 16 (for single padding value)
  },

  // Modal padding (for AnimatedModal and dialogs)
  modal: {
    horizontal: Spacing.xl, // 20
    vertical: Spacing.xl, // 20
    all: Spacing.xl, // 20
  },

  // List item padding (for HistoryScreen items, etc.)
  listItem: {
    horizontal: Spacing.lg, // 16
    vertical: Spacing.md, // 12
  },

  // Section padding (for screen sections)
  section: {
    horizontal: Spacing.lg, // 16 (matches screenPadding)
    vertical: Spacing.xl, // 20
    gap: Spacing.sectionGap, // 24
  },
};

// ----------------------------------------------------------------------------
// BORDER RADIUS TOKENS
// ----------------------------------------------------------------------------

export const BorderRadius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  full: 9999,
};

// ----------------------------------------------------------------------------
// RESPONSIVE TYPOGRAPHY HELPERS
// ----------------------------------------------------------------------------

/**
 * Get dynamic font size that respects user's system font size preferences
 * Caps at 130% to maintain design integrity
 * @param baseSize - Base font size in pixels
 * @returns Scaled font size respecting accessibility settings
 */
export function getDynamicFontSize(baseSize: number): number {
  const scale = PixelRatio.getFontScale();
  return Math.round(baseSize * Math.min(scale, 1.3));
}

/**
 * Get dynamic line height that scales with font size
 * @param baseLineHeight - Base line height in pixels
 * @returns Scaled line height
 */
export function getDynamicLineHeight(baseLineHeight: number): number {
  const scale = PixelRatio.getFontScale();
  return Math.round(baseLineHeight * Math.min(scale, 1.3));
}

// ----------------------------------------------------------------------------
// TYPOGRAPHY TOKENS
// ----------------------------------------------------------------------------

export const Typography = {
  // Headings (serif family)
  h1: {
    fontSize: 32,
    fontWeight: "600" as const,
    lineHeight: 40,
    fontFamily: "serif" as const,
  },
  h2: {
    fontSize: 28,
    fontWeight: "600" as const,
    lineHeight: 36,
    fontFamily: "serif" as const,
  },
  h3: {
    fontSize: 24,
    fontWeight: "500" as const,
    lineHeight: 32,
    fontFamily: "serif" as const,
  },
  h4: {
    fontSize: 20,
    fontWeight: "500" as const,
    lineHeight: 28,
    fontFamily: "serif" as const,
  },

  // Body (sans family)
  body: {
    fontSize: 17,
    fontWeight: "400" as const,
    lineHeight: 26,
  },
  bodyLarge: {
    fontSize: 19,
    fontWeight: "400" as const,
    lineHeight: 28,
  },
  small: {
    fontSize: 15,
    fontWeight: "400" as const,
    lineHeight: 22,
  },
  caption: {
    fontSize: 13,
    fontWeight: "400" as const,
    lineHeight: 18,
  },
  link: {
    fontSize: 17,
    fontWeight: "500" as const,
    lineHeight: 26,
  },
};

// ----------------------------------------------------------------------------
// FONT FAMILY TOKENS (custom fonts for distinctive branding)
// ----------------------------------------------------------------------------

/**
 * Font family definitions for distinctive typography
 * - Display/Serif: Cormorant Garamond (elegant, distinctive serif)
 * - Body/Sans: Inter (modern, highly legible)
 * - Spiritual: Amiri (Arabic-friendly, for Quranic elements)
 *
 * Fonts are loaded in App.tsx via expo-font
 * Fallback to system fonts if custom fonts fail to load
 */
export const Fonts = Platform.select({
  ios: {
    sans: "Inter-Regular",
    sansBold: "Inter-Bold",
    sansMedium: "Inter-Medium",
    serif: "CormorantGaramond-Regular",
    serifBold: "CormorantGaramond-Bold",
    serifMedium: "CormorantGaramond-SemiBold",
    spiritual: "Amiri-Regular",
    spiritualBold: "Amiri-Bold",
    rounded: "Inter-Regular",
    mono: "Menlo",
    // Fallbacks
    fallbackSans: "System",
    fallbackSerif: "Georgia",
  },
  android: {
    sans: "Inter-Regular",
    sansBold: "Inter-Bold",
    sansMedium: "Inter-Medium",
    serif: "CormorantGaramond-Regular",
    serifBold: "CormorantGaramond-Bold",
    serifMedium: "CormorantGaramond-SemiBold",
    spiritual: "Amiri-Regular",
    spiritualBold: "Amiri-Bold",
    rounded: "Inter-Regular",
    mono: "monospace",
    // Fallbacks
    fallbackSans: "Roboto",
    fallbackSerif: "serif",
  },
  default: {
    sans: "Inter-Regular",
    sansBold: "Inter-Bold",
    sansMedium: "Inter-Medium",
    serif: "CormorantGaramond-Regular",
    serifBold: "CormorantGaramond-Bold",
    serifMedium: "CormorantGaramond-SemiBold",
    spiritual: "Amiri-Regular",
    spiritualBold: "Amiri-Bold",
    rounded: "Inter-Regular",
    mono: "monospace",
    // Fallbacks
    fallbackSans: "System",
    fallbackSerif: "serif",
  },
  web: {
    sans: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    sansBold:
      "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    sansMedium:
      "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    serif: "'Cormorant Garamond', Georgia, 'Times New Roman', serif",
    serifBold: "'Cormorant Garamond', Georgia, 'Times New Roman', serif",
    serifMedium: "'Cormorant Garamond', Georgia, 'Times New Roman', serif",
    spiritual: "'Amiri', 'Times New Roman', serif",
    spiritualBold: "'Amiri', 'Times New Roman', serif",
    rounded: "'Inter', 'SF Pro Rounded', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace",
    // Fallbacks
    fallbackSans: "system-ui, sans-serif",
    fallbackSerif: "Georgia, serif",
  },
});
