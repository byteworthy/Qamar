/**
 * Haptics utility for consistent tactile feedback
 *
 * Pattern usage:
 * - Light: selections, slider changes, toggles
 * - Medium: continue, confirm, primary button actions
 * - Success: session completion, reflection saved
 *
 * Rules:
 * - Never use on passive scroll
 * - Never fire repeatedly in tight loops
 * - Throttle for rapid-fire inputs like sliders
 */

import * as Haptics from "expo-haptics";

// Throttle state for preventing rapid haptic feedback
let lastHapticTime = 0;
const THROTTLE_MS = 50; // Minimum ms between haptic events

/**
 * Light haptic feedback - for selections, slider changes, toggles
 */
export function hapticLight() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

/**
 * Medium haptic feedback - for continue, confirm, primary actions
 */
export function hapticMedium() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

/**
 * Selection haptic feedback - for taps that change selection state
 */
export function hapticSelection() {
  Haptics.selectionAsync();
}

/**
 * Success haptic feedback - for completion moments
 */
export function hapticSuccess() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

/**
 * Throttled light haptic - for sliders and rapid inputs
 * Prevents machine-gun haptic feedback
 */
export function hapticLightThrottled() {
  const now = Date.now();
  if (now - lastHapticTime >= THROTTLE_MS) {
    lastHapticTime = now;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
}
