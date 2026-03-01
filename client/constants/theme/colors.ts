// ============================================================================
// QAMAR DESIGN SYSTEM — COLOR TOKENS
// ============================================================================

// ----------------------------------------------------------------------------
// RAW COLOR PALETTES (internal use — prefer semantic tokens below)
// ----------------------------------------------------------------------------

/**
 * QamarColors: Dark theme palette - "Light in Darkness"
 * Deep twilight blues, indigo night sky, with gold light accents
 * Evokes: Stars emerging at dusk, lanterns in the night, contemplative prayer time
 */
export const QamarColors = {
  // Night sky foundations
  background: "#0f1419", // Deep twilight blue
  backgroundLight: "#1a2332", // Midnight blue
  backgroundCard: "#242f42", // Deeper card surface
  backgroundCardLight: "#2d3a52", // Elevated card surface

  // Light/text colors (soft, not harsh)
  moonlight: "#e8f0f8", // Soft white-blue (moonlight)
  moonlightDim: "#c5d5e6", // Dimmer moonlight
  moonlightMuted: "#9fb3c9", // Muted moonlight for secondary text

  // Accent colors - "Qamar" (moon) theme
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
    tabIconSelected: DawnColors.sunrise, // Gold highlight (Qamar theme)
    link: DawnColors.indigo,

    // Backgrounds - Soft dawn sky tones
    backgroundRoot: DawnColors.skyLight,
    backgroundDefault: DawnColors.sky,
    backgroundSecondary: DawnColors.lavenderLight,
    backgroundTertiary: DawnColors.lavender,

    // Primary action color - Gold (Qamar/moon theme)
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
    glassStroke: "rgba(212, 175, 55, 0.15)", // Gold stroke (Qamar theme)
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
    text: QamarColors.moonlight,
    textSecondary: QamarColors.moonlightMuted,
    buttonText: QamarColors.moonlight,

    // Navigation - Gold highlights (light emerging in darkness)
    tabIconDefault: QamarColors.moonlightMuted,
    tabIconSelected: QamarColors.goldLight, // Gold = Qamar theme
    link: QamarColors.goldLight,

    // Backgrounds - Deep twilight/night sky
    backgroundRoot: QamarColors.background,
    backgroundDefault: QamarColors.backgroundCard,
    backgroundSecondary: QamarColors.backgroundCardLight,
    backgroundTertiary: QamarColors.backgroundLight,

    // Primary action color - Gold (moonlight/Qamar emerging)
    primary: QamarColors.gold,
    primaryLight: QamarColors.goldLight,
    primaryDark: QamarColors.goldDim,

    // Accent color - Emerald (Islamic green, but cooler tone)
    accent: QamarColors.emerald,
    accentLight: QamarColors.emeraldLight,
    accentDark: QamarColors.emeraldDark,

    // Structural - Subtle dark blues
    border: QamarColors.backgroundCardLight,
    divider: QamarColors.backgroundCardLight,

    // Surfaces - Layered night sky
    cardBackground: QamarColors.backgroundCard,
    cardSurface: QamarColors.backgroundCardLight,
    elevatedSurface: QamarColors.backgroundCardLight,
    inputBackground: QamarColors.backgroundCardLight,

    // Feedback
    success: QamarColors.emerald,
    warning: "#D4A85A", // Muted amber, not red
    error: "#D4756B",

    // On-color tokens (text/icons on colored backgrounds)
    onPrimary: QamarColors.background,
    onAccent: QamarColors.moonlight,
    onSuccess: QamarColors.background,

    // Overlay and transparency - Blue-tinted overlays
    overlayLight: "rgba(212, 175, 55, 0.05)", // Gold-tinted overlay (light in dark)
    overlayMedium: "rgba(212, 175, 55, 0.12)",
    textOnBanner: "rgba(232, 240, 248, 0.95)",

    // Glassmorphism (lantern in darkness - light emanating)
    glassSurface: "rgba(36, 47, 66, 0.65)", // Deeper blue, more luminous
    glassStroke: "rgba(212, 175, 55, 0.2)", // Gold stroke (light border)
    subtleGlow: "rgba(212, 175, 55, 0.18)", // Gold inner glow (lantern effect)

    // Semantic surface colors (for feature-specific use)
    bannerBackground: QamarColors.indigo,
    intensityMild: QamarColors.emerald,
    intensityModerate: QamarColors.twilight,
    intensityHeavy: QamarColors.gold,
    intensityIntense: QamarColors.goldLight,
    pillBackground: QamarColors.indigo,
    highlightAccent: QamarColors.gold,
    highlightAccentSubtle: QamarColors.gold + "15",
  },
};
