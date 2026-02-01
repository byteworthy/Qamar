import { Platform, PixelRatio } from "react-native";

// ============================================================================
// NOOR DESIGN SYSTEM — SINGLE SOURCE OF TRUTH
// Phase 1: Token definitions only. Visual adjustments deferred to Phase 2.
// ============================================================================

// ----------------------------------------------------------------------------
// RAW COLOR PALETTES (internal use — prefer semantic tokens below)
// ----------------------------------------------------------------------------

/**
 * NoorColors: Dark theme palette - "Light in Darkness"
 * Deep twilight blues, indigo night sky, with gold light accents
 * Evokes: Stars emerging at dusk, lanterns in the night, contemplative prayer time
 */
export const NoorColors = {
  // Night sky foundations
  background: "#0f1419", // Deep twilight blue
  backgroundLight: "#1a2332", // Midnight blue
  backgroundCard: "#242f42", // Deeper card surface
  backgroundCardLight: "#2d3a52", // Elevated card surface

  // Light/text colors (soft, not harsh)
  moonlight: "#e8f0f8", // Soft white-blue (moonlight)
  moonlightDim: "#c5d5e6", // Dimmer moonlight
  moonlightMuted: "#9fb3c9", // Muted moonlight for secondary text

  // Accent colors - "Noor" (light) theme
  gold: "#D4AF37", // Your brand gold (light/illumination)
  goldLight: "#f0d473", // Brighter gold (dawn light)
  goldDim: "#b8944d", // Subdued gold
  accent: "#f0d473", // Alias for goldLight (backward compat)

  // Islamic green (kept but cooler tone)
  emerald: "#009688", // Your brand green
  emeraldLight: "#4db6ac", // Lighter emerald
  emeraldDark: "#00695c", // Darker emerald

  // Deep blue (contemplation, depth)
  indigo: "#1A237E", // Your brand blue
  indigoLight: "#3f51b5", // Lighter indigo
  indigoDark: "#0d1642", // Deeper indigo

  // Purple undertones (spiritual, mystical)
  twilight: "#4a3f6e", // Purple-blue twilight
  twilightLight: "#6558a0", // Lighter twilight
};

/**
 * DawnColors: Light theme palette - "Emerging Light"
 * Soft dawn colors, lavender morning sky, with gold sunrise accents
 * Evokes: Fajr prayer, first light, peaceful awakening
 */
export const DawnColors = {
  // Dawn sky foundations
  sky: "#e8eef5", // Soft dawn sky
  skyLight: "#f5f8fb", // Brightest sky
  skyDim: "#d5e1ed", // Dimmer sky

  // Lavender/purple dawn hues
  lavender: "#c7d3e8", // Soft lavender
  lavenderLight: "#dce4f2", // Light lavender
  lavenderDark: "#a8b8d6", // Deeper lavender

  // Gold sunrise accents
  sunrise: "#f0d473", // Warm sunrise gold
  sunriseLight: "#f5e29d", // Bright sunrise
  sunriseDark: "#D4AF37", // Deep golden hour

  // Blue-gray for text (readable, not harsh)
  slate: "#2c3e50", // Deep blue-gray for primary text
  slateLight: "#546e7a", // Medium blue-gray
  slateDark: "#1a252f", // Darkest text

  // Soft emerald (cooler than warm green)
  emerald: "#4A6B5C", // Muted emerald
  emeraldLight: "#6a8b7c", // Light emerald
  emeraldDark: "#3a564a", // Dark emerald

  // Indigo accents
  indigo: "#5c6bc0", // Soft indigo
  indigoLight: "#7986cb", // Light indigo
  indigoDark: "#3f51b5", // Deep indigo
};

// ----------------------------------------------------------------------------
// SEMANTIC COLOR TOKENS (use these in components)
// ----------------------------------------------------------------------------

export const Colors = {
  light: {
    // Text - Readable blue-grays instead of charcoal/brown
    text: DawnColors.slate,
    textSecondary: DawnColors.slateLight,
    buttonText: DawnColors.skyLight,

    // Navigation - Lavender/indigo theme
    tabIconDefault: DawnColors.slateLight,
    tabIconSelected: DawnColors.sunrise, // Gold highlight (Noor theme)
    link: DawnColors.indigo,

    // Backgrounds - Soft dawn sky tones
    backgroundRoot: DawnColors.skyLight,
    backgroundDefault: DawnColors.sky,
    backgroundSecondary: DawnColors.lavenderLight,
    backgroundTertiary: DawnColors.lavender,

    // Primary action color - Gold (Noor/light theme)
    primary: DawnColors.sunrise,
    primaryLight: DawnColors.sunriseLight,
    primaryDark: DawnColors.sunriseDark,

    // Accent color - Soft emerald (Islamic green)
    accent: DawnColors.emerald,
    accentLight: DawnColors.emeraldLight,
    accentDark: DawnColors.emeraldDark,

    // Structural - Subtle lavender tones
    border: DawnColors.lavender,
    divider: DawnColors.lavenderLight,

    // Surfaces - Layered dawn sky
    cardBackground: DawnColors.skyLight,
    cardSurface: DawnColors.sky,
    elevatedSurface: DawnColors.skyLight,
    inputBackground: DawnColors.sky,

    // Feedback
    success: DawnColors.emerald,
    warning: "#C4A35A", // Muted amber, not red
    error: "#B85C5C",

    // On-color tokens (text/icons on colored backgrounds)
    onPrimary: DawnColors.slate,
    onAccent: DawnColors.skyLight,
    onSuccess: DawnColors.skyLight,

    // Overlay and transparency
    overlayLight: "rgba(15, 20, 40, 0.05)", // Blue-tinted overlay
    overlayMedium: "rgba(15, 20, 40, 0.15)",
    textOnBanner: "rgba(232, 240, 248, 0.95)", // Moonlight on banners

    // Glassmorphism (lantern effect - light emanating from within)
    glassSurface: "rgba(245, 248, 251, 0.75)", // Brighter, more luminous
    glassStroke: "rgba(212, 175, 55, 0.15)", // Gold stroke (Noor theme)
    subtleGlow: "rgba(240, 212, 115, 0.12)", // Gold inner glow

    // Semantic surface colors (for feature-specific use)
    bannerBackground: DawnColors.indigo,
    intensityMild: DawnColors.emerald,
    intensityModerate: DawnColors.lavender,
    intensityHeavy: DawnColors.sunrise,
    intensityIntense: DawnColors.sunriseDark,
    pillBackground: DawnColors.indigo,
    highlightAccent: DawnColors.emerald,
    highlightAccentSubtle: DawnColors.emerald + "15",
  },
  dark: {
    // Text - Soft moonlight, not harsh white
    text: NoorColors.moonlight,
    textSecondary: NoorColors.moonlightMuted,
    buttonText: NoorColors.moonlight,

    // Navigation - Gold highlights (light emerging in darkness)
    tabIconDefault: NoorColors.moonlightMuted,
    tabIconSelected: NoorColors.goldLight, // Gold = light/Noor theme
    link: NoorColors.goldLight,

    // Backgrounds - Deep twilight/night sky
    backgroundRoot: NoorColors.background,
    backgroundDefault: NoorColors.backgroundCard,
    backgroundSecondary: NoorColors.backgroundCardLight,
    backgroundTertiary: NoorColors.backgroundLight,

    // Primary action color - Gold (light/Noor emerging)
    primary: NoorColors.gold,
    primaryLight: NoorColors.goldLight,
    primaryDark: NoorColors.goldDim,

    // Accent color - Emerald (Islamic green, but cooler tone)
    accent: NoorColors.emerald,
    accentLight: NoorColors.emeraldLight,
    accentDark: NoorColors.emeraldDark,

    // Structural - Subtle dark blues
    border: NoorColors.backgroundCardLight,
    divider: NoorColors.backgroundCardLight,

    // Surfaces - Layered night sky
    cardBackground: NoorColors.backgroundCard,
    cardSurface: NoorColors.backgroundCardLight,
    elevatedSurface: NoorColors.backgroundCardLight,
    inputBackground: NoorColors.backgroundCardLight,

    // Feedback
    success: NoorColors.emerald,
    warning: "#D4A85A", // Muted amber, not red
    error: "#D4756B",

    // On-color tokens (text/icons on colored backgrounds)
    onPrimary: NoorColors.background,
    onAccent: NoorColors.moonlight,
    onSuccess: NoorColors.background,

    // Overlay and transparency - Blue-tinted overlays
    overlayLight: "rgba(212, 175, 55, 0.05)", // Gold-tinted overlay (light in dark)
    overlayMedium: "rgba(212, 175, 55, 0.12)",
    textOnBanner: "rgba(232, 240, 248, 0.95)",

    // Glassmorphism (lantern in darkness - light emanating)
    glassSurface: "rgba(36, 47, 66, 0.65)", // Deeper blue, more luminous
    glassStroke: "rgba(212, 175, 55, 0.2)", // Gold stroke (light border)
    subtleGlow: "rgba(212, 175, 55, 0.18)", // Gold inner glow (lantern effect)

    // Semantic surface colors (for feature-specific use)
    bannerBackground: NoorColors.indigo,
    intensityMild: NoorColors.emerald,
    intensityModerate: NoorColors.twilight,
    intensityHeavy: NoorColors.gold,
    intensityIntense: NoorColors.goldLight,
    pillBackground: NoorColors.indigo,
    highlightAccent: NoorColors.gold,
    highlightAccentSubtle: NoorColors.gold + "15",
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
    horizontal: Spacing["2xl"],  // 24 - matches existing Button.tsx
    vertical: Spacing.lg,        // 16 - implicit via buttonHeight
  },

  // Card padding (derived from GlassCard.tsx)
  card: {
    all: Spacing.lg,             // 16 - matches existing GlassCard.tsx
    horizontal: Spacing.lg,      // 16
    vertical: Spacing.lg,        // 16
  },

  // Input padding (for AnimatedInput and similar components)
  input: {
    horizontal: Spacing.lg,      // 16
    vertical: Spacing.md,        // 12
    all: Spacing.lg,             // 16 (for single padding value)
  },

  // Modal padding (for AnimatedModal and dialogs)
  modal: {
    horizontal: Spacing.xl,      // 20
    vertical: Spacing.xl,        // 20
    all: Spacing.xl,             // 20
  },

  // List item padding (for HistoryScreen items, etc.)
  listItem: {
    horizontal: Spacing.lg,      // 16
    vertical: Spacing.md,        // 12
  },

  // Section padding (for screen sections)
  section: {
    horizontal: Spacing.lg,      // 16 (matches screenPadding)
    vertical: Spacing.xl,        // 20
    gap: Spacing.sectionGap,     // 24
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

// ----------------------------------------------------------------------------
// SHADOW TOKENS (enhanced for depth and atmosphere)
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
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  lifted: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 8,
  },
  floating: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 12,
  },
  // Layered shadows for atmospheric depth
  layered: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
  // Glow effect for focus/active states
  glow: {
    shadowColor: "#4fd1a8", // Accent color
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  // Inner shadow effect (simulated via border)
  inner: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
};

// ----------------------------------------------------------------------------
// GRADIENT DEFINITIONS (for atmospheric backgrounds)
// ----------------------------------------------------------------------------

export const Gradients = {
  light: {
    // Dawn sky atmospheric gradient - Soft lavender to golden sunrise
    atmospheric: {
      colors: ["#f5f8fb", "#dce4f2", "#f0d473"] as const, // Sky → Lavender → Gold sunrise
      locations: [0, 0.6, 1] as const,
      start: { x: 0, y: 0 },
      end: { x: 0, y: 1 },
    },
    // Radial glow for banners - Gold sunrise center
    radialGlow: {
      colors: ["#f5e29d", "#dce4f2"] as const, // Sunrise → Lavender
      locations: [0, 1] as const,
      start: { x: 0.5, y: 0 },
      end: { x: 0.5, y: 1 },
    },
    // Subtle mesh for backgrounds - Dawn sky layers
    mesh: {
      colors: ["#f5f8fb", "#e8eef5", "#dce4f2", "#f0d473"] as const,
      locations: [0, 0.33, 0.66, 1] as const,
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    // Soft vignette overlay - Blue-tinted
    vignette: {
      colors: ["transparent", "rgba(92, 107, 192, 0.02)", "rgba(92, 107, 192, 0.05)"] as const,
      locations: [0, 0.7, 1] as const,
      start: { x: 0.5, y: 0.5 },
      end: { x: 0.5, y: 1 },
    },
    // Premium gradients for components
    cardGradient: {
      colors: ["rgba(245, 248, 251, 0.95)", "rgba(232, 238, 245, 0.98)"] as const,
      locations: [0, 1] as const,
      start: { x: 0, y: 0 },
      end: { x: 0, y: 1 },
    },
    buttonGradient: {
      colors: ["#f0d473", "#D4AF37"] as const, // Gold sunrise gradient (Noor theme)
      locations: [0, 1] as const,
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    accentGradient: {
      colors: ["#6a8b7c", "#4A6B5C"] as const, // Soft emerald gradient
      locations: [0, 1] as const,
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
  },
  dark: {
    // Twilight night sky - Deep blues with purple undertones
    atmospheric: {
      colors: ["#0f1419", "#1a2332", "#2d3a52"] as const, // Deep twilight → Midnight → Elevated surface
      locations: [0, 0.5, 1] as const,
      start: { x: 0, y: 0 },
      end: { x: 0, y: 1 },
    },
    // Radial glow for banners - Gold light source in darkness
    radialGlow: {
      colors: ["#2d3a52", "#1a2332"] as const, // Elevated → Midnight
      locations: [0, 1] as const,
      start: { x: 0.5, y: 0 },
      end: { x: 0.5, y: 1 },
    },
    // Subtle mesh for backgrounds - Night sky layers with stars
    mesh: {
      colors: ["#0f1419", "#1a2332", "#2d3a52", "#0f1419"] as const,
      locations: [0, 0.33, 0.66, 1] as const,
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    // Soft vignette overlay - Gold-tinted (light emerging)
    vignette: {
      colors: ["transparent", "rgba(212, 175, 55, 0.08)", "rgba(212, 175, 55, 0.15)"] as const,
      locations: [0, 0.7, 1] as const,
      start: { x: 0.5, y: 0.5 },
      end: { x: 0.5, y: 1 },
    },
    // Premium gradients for components
    cardGradient: {
      colors: ["rgba(36, 47, 66, 0.95)", "rgba(26, 35, 50, 0.98)"] as const, // Deep blues
      locations: [0, 1] as const,
      start: { x: 0, y: 0 },
      end: { x: 0, y: 1 },
    },
    buttonGradient: {
      colors: ["#f0d473", "#D4AF37"] as const, // Gold gradient (Noor/light theme)
      locations: [0, 1] as const,
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    accentGradient: {
      colors: ["#4db6ac", "#009688"] as const, // Emerald gradient (Islamic green)
      locations: [0, 1] as const,
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
  },
};

// ----------------------------------------------------------------------------
// SURFACE LAYERING TOKENS (for atmospheric depth)
// ----------------------------------------------------------------------------

export const Surfaces = {
  light: {
    base: DawnColors.skyLight, // Root background
    layer1: DawnColors.sky, // Default content background
    layer2: DawnColors.lavenderLight, // Secondary elevation
    layer3: DawnColors.lavender, // Tertiary elevation
    overlay: "rgba(15, 20, 40, 0.05)", // Blue-tinted overlay
    overlayMedium: "rgba(15, 20, 40, 0.1)",
    overlayHeavy: "rgba(15, 20, 40, 0.15)",
  },
  dark: {
    base: NoorColors.background, // Root background
    layer1: NoorColors.backgroundCard, // Default content background
    layer2: NoorColors.backgroundCardLight, // Secondary elevation
    layer3: NoorColors.backgroundLight, // Tertiary elevation
    overlay: "rgba(212, 175, 55, 0.05)", // Gold-tinted overlay
    overlayMedium: "rgba(212, 175, 55, 0.08)",
    overlayHeavy: "rgba(212, 175, 55, 0.12)",
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

// ----------------------------------------------------------------------------
// BACKWARD COMPATIBILITY ALIASES (for gradual migration)
// ----------------------------------------------------------------------------

/**
 * @deprecated Use DawnColors instead - this alias maintained for backward compatibility
 */
export const SiraatColors = DawnColors;

/**
 * @deprecated Use NoorColors instead - this alias maintained for backward compatibility
 */
export const NiyyahColors = NoorColors;
