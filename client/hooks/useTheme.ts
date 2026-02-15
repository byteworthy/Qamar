import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/useColorScheme";

/**
 * Type representing the theme object with all color tokens
 */
export type Theme = typeof Colors.light | typeof Colors.dark;

/**
 * Hook to access the current theme based on color scheme
 * @returns Object containing the theme and isDark flag
 */
export function useTheme(): { theme: Theme; isDark: boolean } {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const scheme = colorScheme === "dark" ? "dark" : "light";
  const theme = Colors[scheme];

  return {
    theme,
    isDark,
  };
}
