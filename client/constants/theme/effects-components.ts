import { DawnColors, QamarColors } from "./colors";
import { Spacing, BorderRadius } from "./spacing-typography";

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
      colors: [
        "transparent",
        "rgba(92, 107, 192, 0.02)",
        "rgba(92, 107, 192, 0.05)",
      ] as const,
      locations: [0, 0.7, 1] as const,
      start: { x: 0.5, y: 0.5 },
      end: { x: 0.5, y: 1 },
    },
    // Premium gradients for components
    cardGradient: {
      colors: [
        "rgba(245, 248, 251, 0.95)",
        "rgba(232, 238, 245, 0.98)",
      ] as const,
      locations: [0, 1] as const,
      start: { x: 0, y: 0 },
      end: { x: 0, y: 1 },
    },
    buttonGradient: {
      colors: ["#f0d473", "#D4AF37"] as const, // Gold sunrise gradient (Qamar theme)
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
      colors: [
        "transparent",
        "rgba(212, 175, 55, 0.08)",
        "rgba(212, 175, 55, 0.15)",
      ] as const,
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
      colors: ["#f0d473", "#D4AF37"] as const, // Gold gradient (Qamar/light theme)
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
    base: QamarColors.background, // Root background
    layer1: QamarColors.backgroundCard, // Default content background
    layer2: QamarColors.backgroundCardLight, // Secondary elevation
    layer3: QamarColors.backgroundLight, // Tertiary elevation
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
 * @deprecated Use QamarColors instead - this alias maintained for backward compatibility
 */
export const NiyyahColors = QamarColors;
