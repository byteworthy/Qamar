import { Platform } from "react-native";

// ============================================================================
// NOOR DESIGN SYSTEM — SINGLE SOURCE OF TRUTH
// Phase 1: Token definitions only. Visual adjustments deferred to Phase 2.
// ============================================================================

// ----------------------------------------------------------------------------
// RAW COLOR PALETTES (internal use — prefer semantic tokens below)
// ----------------------------------------------------------------------------

/**
 * NiyyahColors: Dark theme palette
 * Earth tones, cream text, teal/gold accents
 */
export const NiyyahColors = {
  background: "#1a1612",
  backgroundLight: "#221e19",
  backgroundCard: "#2d2820",
  backgroundCardLight: "#3a3328",
  cream: "#f5f0e8",
  creamDark: "#d4c9b8",
  creamMuted: "#a89d8a",
  accent: "#4fd1a8",
  accentDark: "#3bb890",
  gold: "#c9a855",
  goldLight: "#e0c06a",
  clay: "#9b7b5c",
  clayLight: "#b89a7a",
  emerald: "#4a8a72",
  indigo: "#4a6888",
};

/**
 * SiraatColors: Light theme palette
 * Warm sand, clay, indigo, emerald
 */
export const SiraatColors = {
  sand: "#D4C4A8",
  sandLight: "#E8DCC8",
  sandDark: "#BFA87A",
  clay: "#9B6B4B",
  clayLight: "#B88A6A",
  clayDark: "#7A4E2C",
  indigo: "#283848",
  indigoLight: "#2F4457",
  indigoDark: "#182028",
  emerald: "#4A6B5C",
  emeraldLight: "#6A8B7A",
  emeraldDark: "#3A4A42",
  charcoal: "#252525",
  charcoalLight: "#3A3A3A",
  charcoalDark: "#151515",
  cream: "#F2EDE3",
  warmWhite: "#F8F5F0",
  warmGray: "#8A8478",
};

// ----------------------------------------------------------------------------
// SEMANTIC COLOR TOKENS (use these in components)
// ----------------------------------------------------------------------------

export const Colors = {
  light: {
    // Text
    text: SiraatColors.charcoal,
    textSecondary: SiraatColors.warmGray,
    buttonText: SiraatColors.warmWhite,

    // Navigation
    tabIconDefault: SiraatColors.warmGray,
    tabIconSelected: SiraatColors.clay,
    link: SiraatColors.indigo,

    // Backgrounds
    backgroundRoot: SiraatColors.warmWhite,
    backgroundDefault: SiraatColors.cream,
    backgroundSecondary: SiraatColors.sandLight,
    backgroundTertiary: SiraatColors.sand,

    // Primary action color
    primary: SiraatColors.clay,
    primaryLight: SiraatColors.clayLight,
    primaryDark: SiraatColors.clayDark,

    // Accent color
    accent: SiraatColors.emerald,
    accentLight: SiraatColors.emeraldLight,
    accentDark: SiraatColors.emeraldDark,

    // Structural
    border: SiraatColors.sand,
    divider: SiraatColors.sandLight,

    // Surfaces
    cardBackground: SiraatColors.warmWhite,
    cardSurface: SiraatColors.cream,
    elevatedSurface: SiraatColors.warmWhite,
    inputBackground: SiraatColors.cream,

    // Feedback
    success: SiraatColors.emerald,
    warning: "#C4A35A", // Muted amber, not red
    error: "#B85C5C",

    // On-color tokens (text/icons on colored backgrounds)
    onPrimary: SiraatColors.warmWhite,
    onAccent: SiraatColors.warmWhite,
    onSuccess: SiraatColors.warmWhite,

    // Overlay and transparency
    overlayLight: "rgba(0,0,0,0.05)",
    overlayMedium: "rgba(0,0,0,0.15)",
    textOnBanner: "rgba(255,255,255,0.85)",

    // Semantic surface colors (for feature-specific use)
    bannerBackground: SiraatColors.indigoLight,
    intensityMild: SiraatColors.emerald,
    intensityModerate: SiraatColors.sand,
    intensityHeavy: SiraatColors.clay,
    intensityIntense: SiraatColors.clayDark,
    pillBackground: SiraatColors.indigo,
    highlightAccent: SiraatColors.emerald,
    highlightAccentSubtle: SiraatColors.emerald + "15",
  },
  dark: {
    // Text
    text: NiyyahColors.cream,
    textSecondary: NiyyahColors.creamMuted,
    buttonText: NiyyahColors.cream,

    // Navigation
    tabIconDefault: NiyyahColors.creamMuted,
    tabIconSelected: NiyyahColors.cream,
    link: NiyyahColors.accent,

    // Backgrounds
    backgroundRoot: NiyyahColors.background,
    backgroundDefault: NiyyahColors.backgroundCard,
    backgroundSecondary: NiyyahColors.backgroundCardLight,
    backgroundTertiary: NiyyahColors.backgroundLight,

    // Primary action color
    primary: NiyyahColors.accent,
    primaryLight: NiyyahColors.accentDark,
    primaryDark: NiyyahColors.emerald,

    // Accent color
    accent: NiyyahColors.gold,
    accentLight: NiyyahColors.goldLight,
    accentDark: NiyyahColors.clay,

    // Structural
    border: NiyyahColors.backgroundCardLight,
    divider: NiyyahColors.backgroundCardLight,

    // Surfaces
    cardBackground: NiyyahColors.backgroundCard,
    cardSurface: NiyyahColors.backgroundCardLight,
    elevatedSurface: NiyyahColors.backgroundCardLight,
    inputBackground: NiyyahColors.backgroundCardLight,

    // Feedback
    success: NiyyahColors.accent,
    warning: "#D4A85A", // Muted amber, not red
    error: "#D4756B",

    // On-color tokens (text/icons on colored backgrounds)
    onPrimary: NiyyahColors.background,
    onAccent: NiyyahColors.background,
    onSuccess: NiyyahColors.background,

    // Overlay and transparency
    overlayLight: "rgba(255,255,255,0.05)",
    overlayMedium: "rgba(255,255,255,0.15)",
    textOnBanner: "rgba(255,255,255,0.85)",

    // Semantic surface colors (for feature-specific use)
    bannerBackground: NiyyahColors.indigo,
    intensityMild: NiyyahColors.emerald,
    intensityModerate: NiyyahColors.gold,
    intensityHeavy: NiyyahColors.clay,
    intensityIntense: NiyyahColors.clayLight,
    pillBackground: NiyyahColors.indigo,
    highlightAccent: NiyyahColors.accent,
    highlightAccentSubtle: NiyyahColors.accent + "15",
  },
};

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
// FONT FAMILY TOKENS (system fonts only — no custom loading in Phase 1)
// ----------------------------------------------------------------------------

export const Fonts = Platform.select({
  ios: {
    sans: "System",
    serif: "Georgia",
    rounded: "System",
    mono: "Menlo",
  },
  android: {
    sans: "Roboto",
    serif: "serif",
    rounded: "Roboto",
    mono: "monospace",
  },
  default: {
    sans: "System",
    serif: "serif",
    rounded: "System",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// ----------------------------------------------------------------------------
// SHADOW TOKENS
// ----------------------------------------------------------------------------

export const Shadows = {
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  soft: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  lifted: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
};

// ----------------------------------------------------------------------------
// COMPONENT SPEC TOKENS (Phase 1: definitions only, no refactors)
// ----------------------------------------------------------------------------

/**
 * Card component specifications
 * These define the target design; components adopt in Phase 2
 */
export const CardSpec = {
  radius: BorderRadius.lg,
  padding: Spacing.lg,
  // Surface colors come from Colors[scheme].cardBackground / cardSurface
  elevation: Shadows.soft,
  // States (for Phase 2 implementation)
  states: {
    rest: { scale: 1, elevation: Shadows.soft },
    focus: { scale: 1, elevation: Shadows.medium },
    active: { scale: 0.98, elevation: Shadows.soft },
  },
};

/**
 * Button component specifications
 * Three tiers: primary, secondary, tertiary
 */
export const ButtonSpec = {
  height: Spacing.buttonHeight,
  radius: BorderRadius.lg,
  paddingHorizontal: Spacing["2xl"],

  // Tier specs
  primary: {
    // Solid, grounded — one per screen
    // Background: theme.primary, Text: theme.buttonText
  },
  secondary: {
    // Outlined or soft fill
    // Background: theme.backgroundSecondary, Text: theme.text
  },
  tertiary: {
    // Text only, no background
    // Text: theme.primary
  },
};

/**
 * Input component specifications
 */
export const InputSpec = {
  height: Spacing.inputHeight,
  radius: BorderRadius.md,
  padding: Spacing.lg,
  // Background: theme.inputBackground
  // Focus: slightly brighter background (elevatedSurface)
};

/**
 * Slider/selector component specifications
 */
export const SliderSpec = {
  touchTargetHeight: 56, // Minimum touch target
  trackHeight: 6,
  thumbSize: 24,
  // Active state: accent color
  // Inactive state: border color
};

// ----------------------------------------------------------------------------
// LAYOUT CONSTRAINTS (non-design, structural)
// Preserved from layout.ts for container/hit-target sizing
// ----------------------------------------------------------------------------

export const LayoutConstraints = {
  container: {
    maxWidth: 420,
    screenPad: 16,
    cardPad: 14,
  },
  hitTargets: {
    minRowHeight: 56,
    minCardHeight: 64,
  },
};
