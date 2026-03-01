/**
 * Screenshot Prevention Hook
 *
 * Prevents screenshots and screen recordings on sensitive screens
 * to protect user's personal reflection entries.
 *
 * Usage:
 * ```ts
 * import { useScreenshotPrevention } from '@/hooks/useScreenshotPrevention';
 *
 * function MyScreen() {
 *   useScreenshotPrevention();
 *   // ... rest of component
 * }
 * ```
 */
import { useEffect } from "react";
import * as ScreenCapture from "expo-screen-capture";

/**
 * Hook to prevent screenshots and screen recordings on the current screen
 *
 * Automatically prevents screenshots when component mounts and
 * re-enables when component unmounts.
 */
export function useScreenshotPrevention() {
  useEffect(() => {
    let subscription: { remove: () => void } | null = null;

    async function preventScreenshots() {
      try {
        // Prevent screenshots
        await ScreenCapture.preventScreenCaptureAsync();

        if (__DEV__) {
          console.log("[ScreenshotPrevention] Screenshots prevented");
        }
      } catch (error) {
        console.error(
          "[ScreenshotPrevention] Failed to prevent screenshots:",
          error,
        );
      }
    }

    async function allowScreenshots() {
      try {
        // Re-enable screenshots when leaving this screen
        await ScreenCapture.allowScreenCaptureAsync();

        if (__DEV__) {
          console.log("[ScreenshotPrevention] Screenshots allowed");
        }
      } catch (error) {
        console.error(
          "[ScreenshotPrevention] Failed to allow screenshots:",
          error,
        );
      }
    }

    preventScreenshots();

    // Cleanup: Re-enable screenshots when component unmounts
    return () => {
      allowScreenshots();
    };
  }, []);
}
