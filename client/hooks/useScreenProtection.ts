/**
 * useScreenProtection Hook
 *
 * Prevents screenshots and screen recording on sensitive screens.
 * Use this hook in screens that display:
 * - Journal entries
 * - Personal reflections
 * - Mental health data
 * - History/insights
 *
 * The protection is automatically enabled when the component mounts
 * and disabled when it unmounts.
 */

import { useEffect } from 'react';
import * as ScreenCapture from 'expo-screen-capture';
import { Platform } from 'react-native';

interface ScreenProtectionOptions {
  /**
   * Whether to enable screenshot prevention
   * Default: true
   */
  preventScreenCapture?: boolean;

  /**
   * Whether to blur the screen when app is backgrounded
   * Note: This is handled separately by React Native Security
   * Default: false (not implemented in this hook)
   */
  blurOnBackground?: boolean;
}

/**
 * Hook to protect sensitive screens from screenshots/screen recording
 *
 * @param options - Configuration options for screen protection
 * @returns void
 *
 * @example
 * ```tsx
 * function JournalScreen() {
 *   useScreenProtection({ preventScreenCapture: true });
 *
 *   return <View>...</View>;
 * }
 * ```
 */
export function useScreenProtection(options: ScreenProtectionOptions = {}) {
  const { preventScreenCapture = true } = options;

  useEffect(() => {
    let subscription: { remove: () => void } | null = null;

    async function enableProtection() {
      if (!preventScreenCapture) {
        return;
      }

      try {
        if (Platform.OS === 'web') {
          // Web doesn't support screenshot prevention
          if (__DEV__) {
            console.warn('[ScreenProtection] Screenshot prevention not available on web');
          }
          return;
        }

        // Prevent screenshots and screen recording
        await ScreenCapture.preventScreenCaptureAsync();

        // Create a cleanup subscription
        subscription = {
          remove: async () => {
            await ScreenCapture.allowScreenCaptureAsync();
          },
        };

        if (__DEV__) {
          console.log('[ScreenProtection] Screen capture prevention enabled');
        }
      } catch (error) {
        console.error('[ScreenProtection] Failed to enable protection:', error);
      }
    }

    async function disableProtection() {
      if (subscription) {
        try {
          await subscription.remove();
          if (__DEV__) {
            console.log('[ScreenProtection] Screen capture prevention disabled');
          }
        } catch (error) {
          console.error('[ScreenProtection] Failed to disable protection:', error);
        }
      }
    }

    enableProtection();

    // Cleanup: Re-enable screenshots when leaving this screen
    return () => {
      disableProtection();
    };
  }, [preventScreenCapture]);
}

/**
 * Utility function to temporarily allow screen capture
 * Useful for user-initiated actions like "Share Screenshot"
 *
 * @returns Promise that resolves when screen capture is allowed
 */
export async function allowScreenCapture(): Promise<void> {
  try {
    await ScreenCapture.allowScreenCaptureAsync();
    if (__DEV__) {
      console.log('[ScreenProtection] Screen capture temporarily allowed');
    }
  } catch (error) {
    console.error('[ScreenProtection] Failed to allow screen capture:', error);
  }
}

/**
 * Utility function to prevent screen capture globally
 * Use sparingly - prefer the useScreenProtection hook in components
 *
 * @returns Promise that resolves when screen capture is prevented
 */
export async function preventScreenCapture(): Promise<void> {
  try {
    await ScreenCapture.preventScreenCaptureAsync();
    if (__DEV__) {
      console.log('[ScreenProtection] Screen capture prevented globally');
    }
  } catch (error) {
    console.error('[ScreenProtection] Failed to prevent screen capture:', error);
  }
}
