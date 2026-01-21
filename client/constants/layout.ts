// ============================================================================
// LAYOUT CONSTRAINTS — Non-design structural values
// NOTE: Visual tokens should migrate to theme.ts in Phase 2.
// Phase 1 preserves existing values to prevent visual change.
// ============================================================================

export const Layout = {
  /**
   * @deprecated Phase 2: Migrate to Spacing from theme.ts
   * Preserved with original values to prevent visual change in Phase 1.
   */
  spacing: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
    xxl: 32,
  },

  /**
   * @deprecated Phase 2: Migrate to BorderRadius from theme.ts
   * Preserved with original values to prevent visual change in Phase 1.
   */
  radii: {
    sm: 12,
    md: 16,
    lg: 20,
  },

  /**
   * Container constraints — NOT deprecated
   * These are structural layout values, not design tokens.
   */
  container: {
    maxWidth: 420,
    screenPad: 16,
    cardPad: 14,
  },

  /**
   * @deprecated Phase 2: Migrate to Typography from theme.ts
   * Preserved with original values to prevent visual change in Phase 1.
   */
  typeScale: {
    title: 22,
    h2: 18,
    body: 14,
    small: 12,
  },

  /**
   * Hit target constraints — NOT deprecated
   * These are accessibility/UX constraints, not design tokens.
   */
  hitTargets: {
    minRowHeight: 56,
    minCardHeight: 64,
  },
};
