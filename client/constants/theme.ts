import { Platform } from "react-native";

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

export const Colors = {
  light: {
    text: SiraatColors.charcoal,
    textSecondary: SiraatColors.warmGray,
    buttonText: SiraatColors.warmWhite,
    tabIconDefault: SiraatColors.warmGray,
    tabIconSelected: SiraatColors.clay,
    link: SiraatColors.indigo,
    backgroundRoot: SiraatColors.warmWhite,
    backgroundDefault: SiraatColors.cream,
    backgroundSecondary: SiraatColors.sandLight,
    backgroundTertiary: SiraatColors.sand,
    primary: SiraatColors.clay,
    primaryLight: SiraatColors.clayLight,
    primaryDark: SiraatColors.clayDark,
    accent: SiraatColors.emerald,
    accentLight: SiraatColors.emeraldLight,
    accentDark: SiraatColors.emeraldDark,
    border: SiraatColors.sand,
    cardBackground: SiraatColors.warmWhite,
    inputBackground: SiraatColors.cream,
    success: SiraatColors.emerald,
    error: "#B85C5C",
  },
  dark: {
    text: SiraatColors.cream,
    textSecondary: SiraatColors.warmGray,
    buttonText: SiraatColors.cream,
    tabIconDefault: SiraatColors.warmGray,
    tabIconSelected: SiraatColors.sandLight,
    link: SiraatColors.sandLight,
    backgroundRoot: SiraatColors.charcoalDark,
    backgroundDefault: SiraatColors.charcoal,
    backgroundSecondary: SiraatColors.charcoalLight,
    backgroundTertiary: SiraatColors.indigoDark,
    primary: SiraatColors.clay,
    primaryLight: SiraatColors.clayLight,
    primaryDark: SiraatColors.clayDark,
    accent: SiraatColors.emeraldLight,
    accentLight: SiraatColors.emerald,
    accentDark: SiraatColors.emeraldDark,
    border: SiraatColors.charcoalLight,
    cardBackground: SiraatColors.charcoal,
    inputBackground: SiraatColors.charcoalLight,
    success: SiraatColors.emeraldLight,
    error: "#D4756B",
  },
};

export const Spacing = {
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
  inputHeight: 52,
  buttonHeight: 56,
};

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

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: "600" as const,
    fontFamily: "serif" as const,
  },
  h2: {
    fontSize: 28,
    fontWeight: "600" as const,
    fontFamily: "serif" as const,
  },
  h3: {
    fontSize: 24,
    fontWeight: "500" as const,
    fontFamily: "serif" as const,
  },
  h4: {
    fontSize: 20,
    fontWeight: "500" as const,
    fontFamily: "serif" as const,
  },
  body: {
    fontSize: 17,
    fontWeight: "400" as const,
  },
  bodyLarge: {
    fontSize: 19,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 15,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 13,
    fontWeight: "400" as const,
  },
  link: {
    fontSize: 17,
    fontWeight: "500" as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "Georgia",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
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

export const Shadows = {
  soft: {
    shadowColor: SiraatColors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: SiraatColors.charcoal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
};
